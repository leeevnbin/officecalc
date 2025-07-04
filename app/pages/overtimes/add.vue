<script setup lang="ts">
import type { FormError } from "@nuxt/ui";
import { query, where, getDocs, addDoc, collection } from "firebase/firestore";
import { useFirebaseUser } from "~/composables/useFirebaseUser";

const { loading } = useFirebaseUser();

const { user } = useFirebaseUser();
const userID = user.value?.email || "";

const overtimeData = reactive({
  user: userID,
  date: "",
  hours: null,
  minutes: null,
  seconds: null,
  year: null,
  month: null,
  memo: "",
});

const maxLength = 15;

const router = useRouter();
const toast = useToast();

const validate = (overtimeData: any): FormError[] => {
  const errors = [];
  if (!overtimeData.date)
    errors.push({ name: "date", message: "날짜를 입력해주세요" });
  return errors;
};

const fetchAddOvertimeData = async () => {
  try {
    const db = useNuxtApp().$firestoreDb;
    if (!db) {
      throw new Error("Firestore 인스턴스가 없습니다.");
    }

    const overtimeCollection = collection(db, "overtimes");
    const overtimeQuery = query(
      overtimeCollection,
      where("date", "==", overtimeData.date),
      where("user", "==", overtimeData.user)
    );

    const querySnapshot = await getDocs(overtimeQuery);

    if (!querySnapshot.empty) {
      toast.add({
        title: "중복 오류",
        description: "이미 등록된 야근 데이터가 있습니다.",
        color: "error",
        duration: 2000,
      });
      return;
    }

    const dateObj = new Date(overtimeData.date);
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1;

    const formattedMonth = month.toString().padStart(2, "0");
    const formattedYear = year.toString();

    await addDoc(overtimeCollection, {
      user: overtimeData.user,
      date: overtimeData.date,
      hours: overtimeData.hours ?? 0,
      minutes: overtimeData.minutes ?? 0,
      seconds: overtimeData.seconds ?? 0,
      year: formattedYear,
      month: formattedMonth,
      memo: overtimeData.memo,
    });

    toast.add({
      title: "등록 완료",
      description: "야근을 추가하였습니다.",
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
        <div class="flex justify-between">
          <h1 class="page_title">야근 추가</h1>
          <UButton
            type="button"
            color="neutral"
            icon="i-lucide-undo-2"
            @click="router.back()"
          />
        </div>
        <UForm
          :state="overtimeData"
          :validate="validate"
          class="page_layout"
          @submit="fetchAddOvertimeData"
        >
          <UFormField label="날짜" name="date">
            <UInput v-model="overtimeData.date" type="date" variant="subtle" />
          </UFormField>
          <UFormField label="시간" name="hours">
            <UInput
              v-model="overtimeData.hours"
              type="number"
              variant="subtle"
            />
          </UFormField>
          <UFormField label="분" name="minutes">
            <UInput
              v-model="overtimeData.minutes"
              type="number"
              variant="subtle"
            />
          </UFormField>
          <UFormField label="초" name="seconds">
            <UInput
              v-model="overtimeData.seconds"
              type="number"
              variant="subtle"
            />
          </UFormField>
          <UFormField label="메모" name="memo">
            <div class="flex items-center gap-1">
              <UInput
                v-model="overtimeData.memo"
                :maxlength="maxLength"
                class="grow"
                variant="subtle"
              />
              {{ overtimeData.memo?.length }}/{{ maxLength }}
            </div>
          </UFormField>
          <UButton type="submit" label="야근 추가하기" class="w-fit" />
        </UForm>
      </div>
    </ClientOnly>
  </div>
</template>
