<script setup lang="ts">
import { doc, updateDoc } from "firebase/firestore";
import { useOvertimesDataStore } from "~/stores/overtimesDataStore";

const { loading } = useFirebaseUser();

const { user } = useFirebaseUser();
const userID = user.value?.email || "";

const overtimesDataStore = useOvertimesDataStore();

const route = useRoute();
const dataID = route.query.id as string;
let dateQuery = route.query.date as string;
if (dateQuery) {
  dateQuery = dateQuery.replace(/^(\d{4})(\d{2})(\d{2})$/, "$1-$2-$3");
}

const specificOvertime = reactive({
  user: userID,
  date: "",
  hours: "",
  minutes: "",
  year: "",
  month: "",
  memo: "",
});

const maxLength = 15;

const toast = useToast();
const router = useRouter();

const fetchUpdateOvertimeData = async () => {
  if (!dataID) {
    console.error("유효한 dataID가 없습니다.");
    return;
  }
  if (!specificOvertime.date) {
    console.error("날짜가 유효하지 않습니다.");
    return;
  }

  try {
    const db = useNuxtApp().$firestoreDb;
    if (!db) {
      throw new Error("Firestore 인스턴스가 없습니다.");
    }

    const dateObj = new Date(specificOvertime.date);
    let year = dateObj.getFullYear();
    let month = dateObj.getMonth() + 1;
    const day = dateObj.getDate();

    if (day > 25) {
      month += 1;
      if (month > 12) {
        month = 1;
        year += 1;
      }
    }

    const formattedMonth = month.toString().padStart(2, "0");
    const formattedYear = year.toString();

    const overtimeDocRef = doc(db, "overtimes", dataID);

    await updateDoc(overtimeDocRef, {
      user: specificOvertime.user,
      date: specificOvertime.date,
      hours: specificOvertime.hours ?? 0,
      minutes: specificOvertime.minutes ?? 0,
      year: formattedYear,
      month: formattedMonth,
      memo: specificOvertime.memo,
    });
    toast.add({
      title: "등록 완료",
      description: "야근을 수정하였습니다.",
      color: "success",
      duration: 1000,
    });
    router.back();
  } catch (error) {
    console.error("Firestore 오류:", error);
    toast.add({
      title: "Error",
      description: "데이터 추가 중 오류가 발생했습니다.",
      color: "error",
    });
  }
};

onMounted(async () => {
  if (userID && dateQuery) {
    await overtimesDataStore.fetchSpecificOvertime(userID, dateQuery);
    specificOvertime.date = overtimesDataStore.specificOvertime?.date || "";
    specificOvertime.hours = overtimesDataStore.specificOvertime?.hours || "";
    specificOvertime.minutes =
      overtimesDataStore.specificOvertime?.minutes || "";
    specificOvertime.memo = overtimesDataStore.specificOvertime?.memo || "";
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
      <div v-if="specificOvertime" class="page_layout">
        <div class="flex justify-between">
          <h1 class="page_title">야근 수정</h1>
          <UButton
            type="button"
            color="neutral"
            icon="i-lucide-undo-2"
            @click="router.back()"
          />
        </div>
        <UForm
          :state="specificOvertime"
          class="page_layout"
          @submit="fetchUpdateOvertimeData"
        >
          <UFormField label="날짜" name="date">
            <UInput
              v-model="specificOvertime.date"
              type="date"
              variant="subtle"
            />
          </UFormField>
          <UFormField label="시간" name="hours">
            <UInput
              v-model="specificOvertime.hours"
              type="number"
              variant="subtle"
            />
          </UFormField>
          <UFormField label="분" name="minutes">
            <UInput
              v-model="specificOvertime.minutes"
              type="number"
              variant="subtle"
            />
          </UFormField>
          <UFormField label="메모" name="memo">
            <div class="flex items-center gap-1">
              <UInput
                v-model="specificOvertime.memo"
                :maxlength="maxLength"
                class="grow"
                variant="subtle"
              />
              {{ specificOvertime.memo?.length }}/{{ maxLength }}
            </div>
          </UFormField>
          <UButton type="submit" label="야근 수정하기" class="w-fit" />
        </UForm>
      </div>
      <div v-else>
        <p>해당하는 데이터가 없습니다.</p>
      </div>
    </ClientOnly>
  </div>
</template>
