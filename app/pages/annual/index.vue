<script setup lang="ts">
import { doc, deleteDoc } from "firebase/firestore";
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

const router = useRouter();
const toast = useToast();

const annualDataStore = useAnnualDataStore();
const userDataStore = useUserDataStore();

const annualTable = useTemplateRef("annualTable");

const columns: TableColumn<AnnualData>[] = [
  { header: "날짜", accessorKey: "date" },
  { header: "메모", accessorKey: "memo" },
  { id: "action" },
];

const getDropdownActions = (id: string, date: string): DropdownMenuItem[][] => {
  return [
    [
      {
        label: "수정",
        icon: "i-lucide-edit",
        onSelect: () => {
          router.replace(`/annual/edit?id=${id}&date=${date}`);
        },
      },
      {
        label: "삭제",
        icon: "i-lucide-trash",
        color: "error",
        onSelect: async () => {
          await fetchDeleteAnnualtData(id);
        },
      },
    ],
  ];
};

const pagination = ref({
  pageIndex: 0,
  pageSize: 10,
});

const fetchDeleteAnnualtData = async (id: string) => {
  try {
    const db = useNuxtApp().$firestoreDb;
    if (!db) {
      throw new Error("Firestore 인스턴스가 없습니다.");
    }
    await deleteDoc(doc(db, "annual", id));

    toast.add({
      title: "삭제 완료",
      description: "연차를 삭제하였습니다.",
      color: "success",
      duration: 1000,
    });

    await annualDataStore.fetchAnnualData(userID);
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
          <div class="flex items-center gap-3">
            <UButton
              type="button"
              color="neutral"
              icon="i-lucide-house"
              to="/"
            />
            <h1 class="page_title">연차 관리</h1>
          </div>
          <UButton label="등록하기" to="/annual/add" class="w-fit" />
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
