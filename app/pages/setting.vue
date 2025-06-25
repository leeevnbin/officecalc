<script setup lang="ts">
import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { useUserDataStore } from "~/stores/userDataStore";
import { commaFormat } from "~/utils/formattingFns";

const { loading } = useFirebaseUser();

const { user } = useFirebaseUser();
const userID = user.value?.email || "";

const userDataStore = useUserDataStore();

const userInfo = reactive({
  user: userID,
  name: "",
  startDate: "",
  salary: 0,
});

const router = useRouter();
const toast = useToast();

const fetchUpdateUserInfo = async () => {
  try {
    const db = useNuxtApp().$firestoreDb;
    if (!db) {
      throw new Error("Firestore 인스턴스가 없습니다.");
    }

    const usersCollection = collection(db, "users");
    const q = query(usersCollection, where("user", "==", userID));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];

      if (userDoc) {
        const userDocRef = doc(db, "users", userDoc.id);
        await updateDoc(userDocRef, {
          user: userInfo.user,
          name: userInfo.name,
          startDate: userInfo.startDate,
          salary: userInfo.salary * 10000,
        });

        toast.add({
          title: "등록 완료",
          description: "회원정보를 수정하였습니다.",
          color: "success",
          duration: 2000,
        });
        router.push("/");
      } else {
        throw new Error("사용자 문서를 찾을 수 없습니다.");
      }
    } else {
      throw new Error("사용자를 찾을 수 없습니다.");
    }
  } catch (error) {
    console.error("Firestore 오류:", error);
    toast.add({
      title: "Error",
      description: "데이터 수정 중 오류가 발생했습니다.",
      color: "error",
    });
  }
};

onMounted(async () => {
  await userDataStore.fetchUserData(userID);
  userInfo.name = userDataStore.userInfo?.name || "";
  userInfo.startDate = userDataStore.userInfo?.startDate || "";
  userInfo.salary = userDataStore.userInfo?.salary
    ? userDataStore.userInfo.salary / 10000
    : 0;
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
        <div class="flex justify-between">
          <div class="flex-btn">
            <UButton
              type="button"
              color="neutral"
              icon="i-lucide-house"
              to="/"
            />
            <h1 class="page_title">설정</h1>
          </div>
        </div>
        <div v-if="userDataStore.userInfo">
          <UForm
            :state="userInfo"
            class="page_layout"
            @submit="fetchUpdateUserInfo"
          >
            <UFormField label="이름" name="name">
              <UInput v-model="userInfo.name" variant="subtle" />
            </UFormField>
            <UFormField label="입사일" name="startDate">
              <UInput
                v-model="userInfo.startDate"
                type="date"
                variant="subtle"
              />
            </UFormField>
            <UFormField label="연봉" name="salary">
              <div class="flex items-end gap-1">
                <UInput
                  v-model="userInfo.salary"
                  :value="commaFormat(userInfo.salary)"
                  type="salary"
                  variant="subtle"
                />
                <span>만 원</span>
              </div>
            </UFormField>
            <UButton type="submit" label="정보 수정하기" class="w-fit" />
          </UForm>
        </div>
      </div>
    </ClientOnly>
  </div>
</template>
