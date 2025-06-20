<script setup lang="ts">
import type { FormError } from "@nuxt/ui";
import { createUserWithEmailAndPassword, type Auth } from "firebase/auth";
import { addDoc, collection } from "firebase/firestore";

const { $firebaseAuth } = useNuxtApp();
const { loading } = useFirebaseUser();

const auth: Auth = $firebaseAuth as Auth;
const toast = useToast();

const userInfo = reactive({
  name: "",
  id: "",
  password: "",
  salary: null,
  startDate: "",
});

const validate = (userInfo: any): FormError[] => {
  const errors = [];
  if (!userInfo.name)
    errors.push({ name: "name", message: "이름을 입력해주세요" });
  if (!userInfo.id)
    errors.push({ name: "id", message: "아이디를 입력해주세요" });
  if (!userInfo.password)
    errors.push({ name: "password", message: "비밀번호를 입력해주세요" });
  if (!userInfo.salary)
    errors.push({ name: "salary", message: "연봉을 입력해주세요" });
  if (!userInfo.startDate)
    errors.push({ name: "startDate", message: "입사일을 입력해주세요" });
  return errors;
};

const fetchUser = async () => {
  try {
    const db = useNuxtApp().$firestoreDb;
    if (!db) {
      throw new Error("Firestore 인스턴스가 없습니다.");
    }
    const userCollection = collection(db, "users");
    await addDoc(userCollection, {
      user: userInfo.id + "@officecalc.kro.kr",
      name: userInfo.name,
      salary: userInfo.salary ? userInfo.salary * 10000 : 0,
      startDate: userInfo.startDate,
    });
    toast.add({
      title: "회원가입 완료",
      description: "가입되었습니다.",
      color: "success",
    });
  } catch (error) {
    console.error("Firestore 오류:", error);
    toast.add({
      title: "회원가입 실패",
      description: "다시 시도해주세요.",
      color: "error",
    });
  }
};

const join = async () => {
  try {
    await createUserWithEmailAndPassword(
      auth,
      userInfo.id + "@officecalc.kro.kr",
      userInfo.password
    );
    await nextTick();
    navigateTo("/");
  } catch (error) {
    console.error(error);
    toast.add({
      title: "회원가입 실패",
      description: "다시 시도해주세요.",
      color: "error",
    });

    userInfo.id = "";
    userInfo.password = "";

    nextTick(() => {
      const idInput = document.querySelector(
        "input[name='id']"
      ) as HTMLInputElement;
      idInput?.focus();
    });
  }
};

const signup = () => {
  fetchUser();
  join();
};
</script>

<template>
  <div>
    <div v-if="loading">
      <div>
        <img src="/loading.gif" width="240" height="240" class="absol-center">
      </div>
    </div>
    <div v-else>
      <div class="page_layout">
        <h1 class="page_title">회원가입</h1>
        <UForm
          :validate="validate"
          :state="userInfo"
          class="space-y-4"
          @submit="signup"
        >
          <UFormField label="이름" name="name">
            <UInput v-model="userInfo.name" variant="subtle" />
          </UFormField>
          <UFormField label="아이디" name="email">
            <UInput v-model="userInfo.id" variant="subtle" />
          </UFormField>
          <UFormField label="비밀번호" name="password">
            <UInput
              v-model="userInfo.password"
              type="password"
              variant="subtle"
            />
          </UFormField>
          <UFormField label="입사일" name="date">
            <UInput v-model="userInfo.startDate" type="date" variant="subtle" />
          </UFormField>
          <UFormField label="연봉" name="salary">
            <div class="flex items-end gap-1">
              <UInput
                v-model="userInfo.salary"
                type="number"
                min="0"
                variant="subtle"
              />
              <p>만 원</p>
            </div>
          </UFormField>
          <div class="flex gap-2">
            <UButton type="submit">가입</UButton>
            <UButton type="button" color="secondary" to="/signin"
              >로그인</UButton
            >
          </div>
        </UForm>
      </div>
    </div>
  </div>
</template>
