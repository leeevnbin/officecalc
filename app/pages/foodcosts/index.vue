<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import { getPaginationRowModel } from "@tanstack/vue-table";
import { useFoodcostsDataStore } from "~/stores/foodcostsDataStore";
import { commaFormat } from "~/utils/formattingFns";

interface FoodcostsData {
  price: number;
  date: string;
  memo: string;
}

const { loading } = useFirebaseUser();

const { user } = useFirebaseUser();
const userID = user.value?.email || "";

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
];

const pagination = ref({
  pageIndex: 0,
  pageSize: 10,
});

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
          <h1 class="page_title">식비 관리</h1>
          <div class="flex-default">
            <UButton label="등록하기" to="/foodcosts/add" class="w-fit" />
            <UButton
              type="button"
              color="neutral"
              icon="i-lucide-house"
              to="/"
            />
          </div>
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
          />
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
