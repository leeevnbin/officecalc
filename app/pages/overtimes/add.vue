<script setup lang="ts">
import type { FormError } from "@nuxt/ui";
import { addDoc, collection } from "firebase/firestore";
import { useFirebaseUser } from "~/composables/useFirebaseUser";

const { loading } = useFirebaseUser();

const { user } = useFirebaseUser();
const userID = user.value?.email || "";

const overtimeData = reactive({
  user: userID,
  date: "",
  hours: null,
  minutes: null,
  year: null,
  month: null,
});

const toast = useToast();

const validate = (overtimeData: any): FormError[] => {
  const errors = [];
  if (!overtimeData.date)
    errors.push({ name: "date", message: "날짜를 입력해주세요" });
  return errors;
};

const goBack = () => {
  window.history.back();
};

const fetchAddOvertimeData = async () => {
  try {
    const db = useNuxtApp().$firestoreDb;
    if (!db) {
      throw new Error("Firestore 인스턴스가 없습니다.");
    }

    const dateObj = new Date(overtimeData.date);
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

    const overtimeCollection = collection(db, "overtimes");
    await addDoc(overtimeCollection, {
      user: overtimeData.user,
      date: overtimeData.date,
      hours: overtimeData.hours ?? 0,
      minutes: overtimeData.minutes ?? 0,
      year: formattedYear,
      month: formattedMonth,
    });
    toast.add({
      title: "등록 완료",
      description: "야근을 추가하였습니다.",
      color: "success",
      duration: 2000,
    });
    setTimeout(() => {
      goBack();
    }, 2000);
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
            @click="goBack"
          />
        </div>
        <UForm
          :state="overtimeData"
          :validate="validate"
          class="page_layout"
          @submit="fetchAddOvertimeData"
        >
          <UFormField label="날짜" name="date">
            <UInput
              v-model="overtimeData.date"
              type="date"
              class="grow"
              variant="subtle"
            />
          </UFormField>
          <UFormField label="시간" name="hours">
            <UInput
              v-model="overtimeData.hours"
              type="number"
              class="grow"
              variant="subtle"
            />
          </UFormField>
          <UFormField label="분" name="minutes">
            <UInput
              v-model="overtimeData.minutes"
              type="number"
              class="grow"
              variant="subtle"
            />
          </UFormField>
          <UButton type="submit" label="야근 추가하기" class="w-fit" />
        </UForm>
      </div>
    </ClientOnly>
  </div>
</template>
