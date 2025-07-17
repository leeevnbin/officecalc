<script setup lang="ts">
import { doc, updateDoc } from "firebase/firestore";
import { useFoodcostsDataStore } from "~/stores/foodcostsDataStore";

const { loading } = useFirebaseUser();

const { user } = useFirebaseUser();
const userID = user.value?.email || "";

const foodcostsDataStore = useFoodcostsDataStore();

const route = useRoute();
const dataID = route.query.id as string;
let dateQuery = route.query.date as string;
if (dateQuery) {
  dateQuery = dateQuery.replace(/^(\d{4})(\d{2})(\d{2})$/, "$1-$2-$3");
}

const specificFoodcost = reactive({
  user: userID,
  price: 0,
  date: "",
  memo: "",
  year: "",
  month: "",
});

const maxLength = 15;

const router = useRouter();
const toast = useToast();

const fetchUpdateFoodcostData = async () => {
  if (!dataID) {
    console.error("유효한 dataID가 없습니다.");
    return;
  }
  if (!specificFoodcost.date) {
    console.error("날짜가 유효하지 않습니다.");
    return;
  }

  try {
    const db = useNuxtApp().$firestoreDb;
    if (!db) {
      throw new Error("Firestore 인스턴스가 없습니다.");
    }

    const foodcostDocRef = doc(db, "foodcosts", dataID);

    await updateDoc(foodcostDocRef, {
      user: specificFoodcost.user,
      price: specificFoodcost.price ?? 0,
      date: specificFoodcost.date,
      memo: specificFoodcost.memo,
      year: specificFoodcost.date.split("-")[0],
      month: specificFoodcost.date.split("-")[1],
    });
    toast.add({
      title: "등록 완료",
      description: "식비를 수정하였습니다.",
      color: "success",
      duration: 1000,
    });
    router.push("/foodcosts");
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
    await foodcostsDataStore.fetchSpecificFoodcost(userID, dateQuery);
    specificFoodcost.date = foodcostsDataStore.specificFoodcost?.date || "";
    specificFoodcost.price = foodcostsDataStore.specificFoodcost?.price || 0;
    specificFoodcost.memo = foodcostsDataStore.specificFoodcost?.memo || "";
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
      <div v-if="specificFoodcost" class="page_layout">
        <div class="flex justify-between">
          <h1 class="page_title">식비 수정</h1>
          <UButton
            type="button"
            color="neutral"
            icon="i-lucide-undo-2"
            to="/foodcosts"
          />
        </div>
        <UForm
          :state="specificFoodcost"
          class="page_layout"
          @submit="fetchUpdateFoodcostData"
        >
          <UFormField label="날짜" name="date">
            <UInput
              v-model="specificFoodcost.date"
              type="date"
              variant="subtle"
            />
          </UFormField>
          <UFormField label="금액" name="price">
            <UInput
              v-model="specificFoodcost.price"
              type="number"
              variant="subtle"
            />
          </UFormField>
          <UFormField label="메모" name="memo">
            <div class="flex items-center gap-1">
              <UInput
                v-model="specificFoodcost.memo"
                :maxlength="maxLength"
                class="grow"
                variant="subtle"
              />
              {{ specificFoodcost.memo?.length }}/{{ maxLength }}
            </div>
          </UFormField>
          <UButton type="submit" label="식비 수정하기" class="w-fit" />
        </UForm>
      </div>
      <div v-else>
        <p>해당하는 데이터가 없습니다.</p>
      </div>
    </ClientOnly>
  </div>
</template>
