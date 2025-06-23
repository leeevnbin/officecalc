<script setup lang="ts">
import { CalendarDate } from "@internationalized/date";
import { addDoc, collection } from "firebase/firestore";
import { ref } from "vue";

const { loading } = useFirebaseUser();

const { user } = useFirebaseUser();
const userID = user.value?.email || "";

const annualData = reactive({
  user: userID,
  deduction: 1,
  date: "",
  memo: "",
});

const maxLength = 15;

const toast = useToast();

const dateRange = ref(
  new CalendarDate(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    new Date().getDate()
  )
);

const addAnnualData = async () => {
  try {
    const db = useNuxtApp().$firestoreDb;
    if (!db) {
      throw new Error("Firestore 인스턴스가 없습니다.");
    }
    const annualCollection = collection(db, "annual");
    await addDoc(annualCollection, {
      user: annualData.user,
      deduction: annualData.deduction,
      date: `${dateRange.value.year}-${dateRange.value.month
        .toString()
        .padStart(2, "0")}-${dateRange.value.day.toString().padStart(2, "0")}`,
      memo: annualData.memo,
    });
    toast.add({
      title: "연차 사용",
      description: "연차를 사용하였습니다.",
      color: "success",
      duration: 2000,
    });
    setTimeout(() => {
      navigateTo("/annual");
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
          <h1 class="page_title">연차 사용</h1>
          <UButton
            type="button"
            color="neutral"
            icon="i-lucide-undo-2"
            to="/annual"
          />
        </div>
        <UForm
          :state="annualData"
          class="page_layout"
          @submit.prevent="addAnnualData"
        >
          <UFormField label="연차 날짜" name="date">
            <UCalendar v-model="dateRange" />
          </UFormField>
          <UFormField label="메모">
            <div class="flex items-center gap-1">
              <UInput
                v-model="annualData.memo"
                :maxlength="maxLength"
                class="grow"
              />
              {{ annualData.memo?.length }}/{{ maxLength }}
            </div>
          </UFormField>
          <UButton type="submit" label="연차 사용하기" class="w-fit" />
        </UForm>
      </div>
    </ClientOnly>
  </div>
</template>
