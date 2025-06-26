<script setup lang="ts">
import type { FormError } from "@nuxt/ui";
import {
  signInWithEmailAndPassword,
  type Auth,
  type User,
} from "firebase/auth";
import { reactive } from "vue";

const { $firebaseAuth } = useNuxtApp();
const { loading } = useFirebaseUser();

const auth: Auth = $firebaseAuth as Auth;
const toast = useToast();

if (!$firebaseAuth) {
  console.error("FirebaseAuth가 초기화되지 않았습니다.");
  throw new Error("FirebaseAuth is undefined");
}

const userInfo = reactive({
  id: "",
  password: "",
});

const validate = (userInfo: any): FormError[] => {
  const errors = [];
  if (!userInfo.id)
    errors.push({ name: "id", message: "아이디를 입력해주세요" });
  if (!userInfo.password)
    errors.push({ name: "password", message: "비밀번호를 입력해주세요" });
  return errors;
};

const signin = async () => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      userInfo.id + "@officecalc.leb",
      userInfo.password
    );

    const { user } = userCredential;
    const userInfoRef = useState<User | null>("firebaseUser");
    userInfoRef.value = user;

    await nextTick();

    navigateTo("/");
  } catch (error: any) {
    console.error(error);

    if (error.code === "auth/too-many-requests") {
      toast.add({
        title: "로그인 제한됨",
        description: "로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.",
        color: "warning",
      });
    } else {
      toast.add({
        title: "로그인 실패",
        description: "다시 시도해주세요.",
        color: "error",
      });
    }

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
</script>

<template>
  <div>
    <div v-if="loading">
      <div>
        <img
          src="/loading.gif"
          width="240"
          height="240"
          class="absol-center"
        >
      </div>
    </div>
    <div v-else>
      <ClientOnly>
        <div class="page_layout">
          <h1 class="page_title">로그인</h1>
          <UForm
            :validate="validate"
            :state="userInfo"
            class="space-y-4"
            @submit="signin"
          >
            <UFormField label="아이디" name="id">
              <UInput v-model="userInfo.id" variant="subtle" />
            </UFormField>
            <UFormField label="비밀번호" name="password">
              <UInput v-model="userInfo.password" type="password" variant="subtle" />
            </UFormField>
            <div class="flex gap-2">
              <UButton type="submit">로그인</UButton>
              <UButton type="button" color="secondary" to="/signup"
                >회원가입</UButton
              >
            </div>
          </UForm>
        </div>
      </ClientOnly>
    </div>
  </div>
</template>
