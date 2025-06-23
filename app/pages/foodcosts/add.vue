<script setup lang="ts">
import type { FormError } from "@nuxt/ui";
import { addDoc, collection } from "firebase/firestore";
import { useFirebaseUser } from "~/composables/useFirebaseUser";

const { loading } = useFirebaseUser();

const { user } = useFirebaseUser();
const userID = user.value?.email || "";

const foodcostData = reactive({
  user: userID,
  price: null,
  date: "",
  memo: "",
  year: null,
  month: null,
});

const maxLength = 15;

const toast = useToast();

const validate = (foodcostData: any): FormError[] => {
  const errors = [];
  if (!foodcostData.price)
    errors.push({ name: "price", message: "금액을 입력해주세요" });
  if (!foodcostData.date)
    errors.push({ name: "date", message: "날짜를 입력해주세요" });
  return errors;
};

const fetchAddFoodcostData = async () => {
  try {
    const db = useNuxtApp().$firestoreDb;
    if (!db) {
      throw new Error("Firestore 인스턴스가 없습니다.");
    }
    const foodcostCollection = collection(db, "foodcosts");
    await addDoc(foodcostCollection, {
      user: foodcostData.user,
      price: foodcostData.price,
      date: foodcostData.date,
      memo: foodcostData.memo,
      year: foodcostData.date.split("-")[0],
      month: foodcostData.date.split("-")[1],
    });
    toast.add({
      title: "등록 완료",
      description: "식비를 추가하였습니다.",
      color: "success",
      duration: 2000,
    });
    setTimeout(() => {
      navigateTo("/foodcosts");
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
          <h1 class="page_title">식비 추가</h1>
          <UButton
            type="button"
            color="neutral"
            icon="i-lucide-undo-2"
            to="/foodcosts"
          />
        </div>
        <UForm
          :state="foodcostData"
          :validate="validate"
          class="page_layout"
          @submit="fetchAddFoodcostData"
        >
          <UFormField label="날짜" name="date">
            <UInput
              v-model="foodcostData.date"
              type="date"
              class="grow"
              variant="subtle"
            />
          </UFormField>
          <UFormField label="금액" name="price">
            <UInput
              v-model="foodcostData.price"
              type="number"
              class="grow"
              variant="subtle"
            />
          </UFormField>
          <UFormField label="메모" name="memo">
            <div class="flex items-center gap-1">
              <UInput
                v-model="foodcostData.memo"
                :maxlength="maxLength"
                class="grow"
                variant="subtle"
              />
              {{ foodcostData.memo?.length }}/{{ maxLength }}
            </div>
          </UFormField>
          <UButton type="submit" label="식비 추가하기" class="w-fit" />
        </UForm>
      </div>
    </ClientOnly>
  </div>
</template>
