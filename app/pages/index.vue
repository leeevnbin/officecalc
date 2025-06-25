<script setup lang="ts">
import type { Auth } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useFirebaseUser } from "~/composables/useFirebaseUser";
import { useAnnualDataStore } from "~/stores/annualDataStore";
import { useFoodcostsDataStore } from "~/stores/foodcostsDataStore";
import { useOvertimesDataStore } from "~/stores/overtimesDataStore";
import { dDay } from "~/utils/dateFns";
import { commaFormat } from "~/utils/formattingFns";
import { calculateAnnualLeave } from "~/utils/calculateDaysFns";

const { user } = useFirebaseUser();
const { $firebaseAuth } = useNuxtApp();
const { loading } = useFirebaseUser();
const auth: Auth = $firebaseAuth as Auth;
const annualDataStore = useAnnualDataStore();
const foodcostsDataStore = useFoodcostsDataStore();
const overtimesDataStore = useOvertimesDataStore();

interface UserInfo {
  name: string;
  startDate: string;
  salary: number;
}

const userID = user.value?.email || "";
const userInfo = ref<UserInfo | null>(null);

const today = new Date();
const twoMonthsAgo = (today.getMonth() - 1).toString().padStart(2, "0");
const lastMonth = today.getMonth().toString().padStart(2, "0");
const thisMonth = (today.getMonth() + 1).toString().padStart(2, "0");
const nextMonth = (today.getMonth() + 2).toString().padStart(2, "0");

const fetchUserData = async () => {
  const db = useNuxtApp().$firestoreDb;
  if (!db) throw new Error("Firestore 인스턴스가 없습니다.");

  const usersCollection = collection(db, "users");
  const q = query(usersCollection, where("user", "==", userID));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    userInfo.value = querySnapshot.docs[0]?.data() as UserInfo;
  } else {
    console.warn("사용자를 찾을 수 없습니다.");
    userInfo.value = null;
  }
};

const getOvertimePeriod = (month: string, previousMonth: string) => ({
  month,
  period: `${previousMonth}월 26일 ~ ${month}월 25일`,
});

const foodsPeriod = () => {
  const last = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const lastDay = last.getDate().toString().padStart(2, "0");

  return `${thisMonth}월 01일 ~ ${thisMonth}월 ${lastDay}일`;
};

const logout = async () => {
  try {
    await auth.signOut();
    navigateTo("/signin");
  } catch (error) {
    console.error("Logout failed:", error);
  }
};

onMounted(async () => {
  if (user.value) {
    await Promise.all([
      fetchUserData(),
      annualDataStore.fetchAnnualData(userID),
      foodcostsDataStore.fetchFoodcostsData(userID),
      overtimesDataStore.fetchOvertimesData(userID, lastMonth),
      overtimesDataStore.fetchOvertimesData(userID, thisMonth),
      overtimesDataStore.fetchOvertimesData(userID, nextMonth),
    ]);
  }
});
</script>

<template>
  <div v-if="loading">
    <div>
      <img src="/loading.gif" width="240" height="240" class="absol-center">
    </div>
  </div>
  <div v-else>
    <ClientOnly>
      <div class="page_layout">
        <h1 class="sr-only">대시보드</h1>
        <h2 class="sr-only">이름</h2>
        <div class="flex justify-between">
          <div class="flex items-center gap-2 text-orange-500">
            <UIcon name="i-lucide-dog" class="size-7" />
            <p class="text-lg font-medium">{{ userInfo?.name }}</p>
          </div>
          <div class="flex-btn">
            <UButton
              label="로그아웃"
              color="error"
              variant="link"
              @click="logout"
            />
            <UButton
              icon="i-lucide-settings"
              color="neutral"
              variant="link"
              to="/setting"
            />
          </div>
        </div>
        <div class="flex justify-between">
          <div class="flex-default">
            <h2>입사일</h2>
            <p>{{ userInfo?.startDate }}</p>
          </div>
          <div class="flex items-center text-secondary">
            <UBadge size="lg" color="info" variant="outline">
              + {{ userInfo ? dDay(userInfo.startDate) : 0 }}일
            </UBadge>
          </div>
        </div>
        <div class="flex-default flex-wrap">
          <ULink
            v-for="(period, index) in [
              { month: lastMonth, prevMonth: twoMonthsAgo },
              { month: thisMonth, prevMonth: lastMonth },
              { month: nextMonth, prevMonth: thisMonth },
            ]"
            :key="index"
            :to="{
              path: '/overtimes',
              query: {
                period: index === 0 ? 'last' : index === 1 ? 'this' : 'next',
              },
            }"
            class="grow w-80"
          >
            <UCard>
              <div class="flex justify-between">
                <h2>{{ period.month }}월 야근</h2>
                <p class="text-sm">
                  {{ getOvertimePeriod(period.month, period.prevMonth).period }}
                </p>
              </div>
              <div class="flex justify-between">
                <p class="text-orange-500">
                  {{ overtimesDataStore.formattingOvertimes(period.month) }}
                </p>
                <p>
                  {{
                    userInfo &&
                    commaFormat(
                      Math.round(
                        (userInfo.salary / (209 * 12)) *
                          1.5 *
                          (overtimesDataStore.totalTimes(period.month) / 60)
                      )
                    )
                  }}원
                </p>
              </div>
            </UCard>
          </ULink>
          <ULink to="/foodcosts" class="grow w-80">
            <UCard>
              <div class="flex justify-between">
                <h2>식비</h2>
                <p class="text-sm">{{ foodsPeriod() }}</p>
              </div>
              <div class="flex justify-between">
                <p class="text-orange-500">얼마나 먹은걸까?</p>
                <p>{{ commaFormat(foodcostsDataStore.totalPrice()) }}원</p>
              </div>
            </UCard>
          </ULink>
          <ULink to="/annual" class="grow w-80">
            <UCard>
              <h2>연차</h2>
              <div class="flex justify-between">
                <p class="text-orange-500">
                  {{
                    userInfo
                      ? calculateAnnualLeave(userInfo.startDate) -
                        annualDataStore.sumDeduction()
                      : 0
                  }}개
                </p>
                <p>
                  {{
                    userInfo &&
                    commaFormat(
                      Math.round((userInfo.salary / 209) *
                        (calculateAnnualLeave(userInfo.startDate) -
                          annualDataStore.sumDeduction()))
                    )
                  }}원
                </p>
              </div>
            </UCard>
          </ULink>
        </div>
      </div>
    </ClientOnly>
  </div>
</template>
