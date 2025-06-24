<script setup lang="ts">
import { doc, updateDoc } from "firebase/firestore";
import { useAnnualDataStore } from "~/stores/annualDataStore";

const { loading } = useFirebaseUser();

const { user } = useFirebaseUser();
const userID = user.value?.email || "";

const annualDataStore = useAnnualDataStore();

const route = useRoute();
const dataID = route.query.id as string;
let dateQuery = route.query.date as string;
if (dateQuery) {
  dateQuery = dateQuery.replace(/^(\d{4})(\d{2})(\d{2})$/, "$1-$2-$3");
}

const specificAnnual = reactive({
  user: userID,
  deduction: 1,
  date: "",
  memo: "",
});

const maxLength = 15;

const router = useRouter();
const toast = useToast();

const fetchUpdateAnnualData = async () => {
  if (!dataID) {
    console.error("유효한 dataID가 없습니다.");
    return;
  }
  if (!specificAnnual.date) {
    console.error("날짜가 유효하지 않습니다.");
    return;
  }

  try {
    const db = useNuxtApp().$firestoreDb;
    if (!db) {
      throw new Error("Firestore 인스턴스가 없습니다.");
    }

    const annualDocRef = doc(db, "annual", dataID);

    await updateDoc(annualDocRef, {
      user: specificAnnual.user,
      deduction: specificAnnual.deduction,
      date: specificAnnual.date,
      memo: specificAnnual.memo,
    });
    toast.add({
      title: "등록 완료",
      description: "연차를 수정하였습니다.",
      color: "success",
      duration: 1000,
    });
    router.push("/annual");
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
    await annualDataStore.fetchSpecificAnnual(userID, dateQuery);
    if (userID && dateQuery) {
      await annualDataStore.fetchSpecificAnnual(userID, dateQuery);

      specificAnnual.date = annualDataStore.specificAnnual?.date || "";

      specificAnnual.memo = annualDataStore.specificAnnual?.memo || "";
    }
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
      <div v-if="specificAnnual" class="page_layout">
        <div class="flex justify-between">
          <h1 class="page_title">연차 수정</h1>
          <UButton
            type="button"
            color="neutral"
            icon="i-lucide-undo-2"
            to="/annual"
          />
        </div>
        <UForm
          :state="specificAnnual"
          class="page_layout"
          @submit="fetchUpdateAnnualData"
        >
          <UFormField label="연차 날짜" name="date">
            <UInput
              v-model="specificAnnual.date"
              type="date"
              variant="subtle"
            />
          </UFormField>
          <UFormField label="메모" name="memo">
            <div class="flex items-center gap-1">
              <UInput
                v-model="specificAnnual.memo"
                :maxlength="maxLength"
                class="grow"
                variant="subtle"
              />
              {{ specificAnnual.memo?.length }}/{{ maxLength }}
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
