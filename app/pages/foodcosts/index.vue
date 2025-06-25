<script setup lang="ts">
import { doc, deleteDoc } from "firebase/firestore";
import type { DropdownMenuItem, TableColumn } from "@nuxt/ui";
import { getPaginationRowModel } from "@tanstack/vue-table";
import { useFoodcostsDataStore } from "~/stores/foodcostsDataStore";
import { commaFormat } from "~/utils/formattingFns";

interface FoodcostsData {
  id: string;
  price: number;
  date: string;
  memo: string;
}

const { loading } = useFirebaseUser();

const { user } = useFirebaseUser();
const userID = user.value?.email || "";

const router = useRouter();

const toast = useToast();

const foodcostsDataStore = useFoodcostsDataStore();

const foodcostsTable = useTemplateRef("foodcostsTable");

const columns: TableColumn<FoodcostsData>[] = [
  { header: "날짜", accessorKey: "date" },
  {
    header: "금액",
    accessorKey: "price",
    cell: ({ row }) => commaFormat(row.getValue("price")),
  },
  { header: "메모", accessorKey: "memo" },
  {
    id: "action",
  },
];

const getDropdownActions = (id: string, date: string): DropdownMenuItem[][] => {
  return [
    [
      {
        label: "수정",
        icon: "i-lucide-edit",
        onSelect: () => {
          router.replace(`/foodcosts/edit?id=${id}&date=${date}`);
        },
      },
      {
        label: "삭제",
        icon: "i-lucide-trash",
        color: "error",
        onSelect: async () => {
          await fetchDeleteFoodcostData(id);
        },
      },
    ],
  ];
};

const pagination = ref({
  pageIndex: 0,
  pageSize: 10,
});

const fetchDeleteFoodcostData = async (id: string) => {
  try {
    const db = useNuxtApp().$firestoreDb;
    if (!db) {
      throw new Error("Firestore 인스턴스가 없습니다.");
    }
    await deleteDoc(doc(db, "foodcosts", id));

    toast.add({
      title: "삭제 완료",
      description: "식비를 삭제하였습니다.",
      color: "success",
      duration: 1000,
    });

    await foodcostsDataStore.fetchFoodcostsData(userID);
  } catch (error) {
    console.error("Firestore 오류:", error);
    toast.add({
      title: "Error",
      description: "데이터 삭제 중 오류가 발생했습니다.",
      color: "error",
    });
  }
};

onMounted(async () => {
  try {
    await foodcostsDataStore.fetchFoodcostsData(userID);
  } catch (error) {
    console.error("Error fetching foodcost data:", error);
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
      <div class="page_layout">
        <div class="flex justify-between">
          <div class="flex-btn">
            <UButton
              type="button"
              color="neutral"
              icon="i-lucide-house"
              to="/"
            />
            <h1 class="page_title">식비 관리</h1>
          </div>
          <UButton label="등록하기" to="/foodcosts/add" class="w-fit" />
        </div>
        <div>
          <p>이번 달 식비는?</p>
          <p class="text-orange-500 font-medium">
            {{ commaFormat(foodcostsDataStore.totalPrice()) }}원
          </p>
        </div>
        <div
          v-if="foodcostsDataStore.foodcostsData.length > 0"
          class="w-full space-y-4 pb-4"
        >
          <UTable
            ref="foodcostsTable"
            v-model:pagination="pagination"
            sticky
            :data="foodcostsDataStore.foodcostsData"
            :columns="columns"
            :pagination-options="{
              getPaginationRowModel: getPaginationRowModel(),
            }"
            class="flex-1"
          >
            <template #action-cell="{ row }">
              <UDropdownMenu
                :items="
                  getDropdownActions(
                    row.original.id,
                    row.original.date.replaceAll('-', '')
                  )
                "
              >
                <UButton
                  icon="i-lucide-ellipsis-vertical"
                  color="neutral"
                  variant="ghost"
                  aria-label="Actions"
                />
              </UDropdownMenu>
            </template>
          </UTable>
          <div class="flex justify-center border-t border-default pt-4">
            <UPagination
              :default-page="
                (foodcostsTable?.tableApi?.getState().pagination.pageIndex ||
                  0) + 1
              "
              :items-per-page="
                foodcostsTable?.tableApi?.getState().pagination.pageSize
              "
              :total="
                foodcostsTable?.tableApi?.getFilteredRowModel().rows.length
              "
              @update:page="
                (p) => foodcostsTable?.tableApi?.setPageIndex(p - 1)
              "
            />
          </div>
        </div>
      </div>
    </ClientOnly>
  </div>
</template>
