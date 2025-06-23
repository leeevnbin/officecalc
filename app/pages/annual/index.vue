<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import { getPaginationRowModel } from "@tanstack/vue-table";
import { useAnnualDataStore } from "~/stores/annualDataStore";
import { useUserDataStore } from "~/stores/userDataStore";
import { calculateAnnualLeave } from "~/utils/calculateDaysFns";

interface AnnualData {
  date: string;
  memo: string;
}

const { loading } = useFirebaseUser();

const { user } = useFirebaseUser();
const userID = user.value?.email || "";

const annualDataStore = useAnnualDataStore();
const userDataStore = useUserDataStore();

const annualTable = useTemplateRef("annualTable");

const columns: TableColumn<AnnualData>[] = [
  { header: "날짜", accessorKey: "date" },
  { header: "메모", accessorKey: "memo" },
];

const pagination = ref({
  pageIndex: 0,
  pageSize: 10,
});

onMounted(async () => {
  try {
    await annualDataStore.fetchAnnualData(userID);
    await userDataStore.fetchUserData(userID);
  } catch (error) {
    console.error("Error fetching annual data:", error);
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
          <h1 class="page_title">연차 관리</h1>
          <div class="flex-default">
            <UButton label="등록하기" to="/annual/add" class="w-fit" />
            <UButton
              type="button"
              color="neutral"
              icon="i-lucide-house"
              to="/"
            />
          </div>
        </div>
        <div class="flex-default">
          <p>남은연차</p>
          <p class="text-orange-500 font-medium">
            {{
              userDataStore.userInfo
                ? calculateAnnualLeave(userDataStore.userInfo.startDate) -
                  annualDataStore.sumDeduction()
                : 0
            }}개
          </p>
          <p>사용연차</p>
          <p class="text-red-500 font-medium">
            {{ annualDataStore.sumDeduction() }}개
          </p>
        </div>
        <div
          v-if="annualDataStore.annualData.length > 0"
          class="w-full space-y-4 pb-4"
        >
          <UTable
            ref="annualTable"
            v-model:pagination="pagination"
            sticky
            :data="annualDataStore.annualData"
            :columns="columns"
            :pagination-options="{
              getPaginationRowModel: getPaginationRowModel(),
            }"
            class="flex-1"
          />
          <div class="flex justify-center border-t border-default pt-4">
            <UPagination
              :default-page="
                (annualTable?.tableApi?.getState().pagination.pageIndex || 0) +
                1
              "
              :items-per-page="
                annualTable?.tableApi?.getState().pagination.pageSize
              "
              :total="annualTable?.tableApi?.getFilteredRowModel().rows.length"
              @update:page="(p) => annualTable?.tableApi?.setPageIndex(p - 1)"
            />
          </div>
        </div>

        <div v-else>
          <p>연차 데이터가 없습니다.</p>
        </div>
      </div>
    </ClientOnly>
  </div>
</template>
