<script setup lang="ts">
import { doc, deleteDoc } from "firebase/firestore";
import type { DropdownMenuItem, TableColumn } from "@nuxt/ui";
import { getPaginationRowModel, type Row } from "@tanstack/vue-table";
import { useOvertimesDataStore } from "~/stores/overtimesDataStore";
import { useUserDataStore } from "~/stores/userDataStore";
import { commaFormat } from "~/utils/formattingFns";

const userDataStore = useUserDataStore();

interface OvertimesData {
  id: string;
  date: string;
  hours: number;
  minutes: number;
  memo: string;
}

const { loading } = useFirebaseUser();

const { user } = useFirebaseUser();
const userID = user.value?.email || "";

const route = useRoute();
const router = useRouter();

const toast = useToast();

const lastMonth = new Date().getMonth().toString().padStart(2, "0");
const thisMonth = (new Date().getMonth() + 1).toString().padStart(2, "0");
const nextMonth = (new Date().getMonth() + 2).toString().padStart(2, "0");

const period = (route.query.period as string) || "this";

let selectedMonth = thisMonth;
if (period === "last") selectedMonth = lastMonth;
else if (period === "next") selectedMonth = nextMonth;

const overtimesDataStore = useOvertimesDataStore();

const overtimesTable = useTemplateRef("overtimesTable");

const columns: TableColumn<OvertimesData>[] = [
  { header: "날짜", accessorKey: "date" },
  {
    header: "시간",
    cell: ({ row }: { row: Row<OvertimesData> }) => {
      const hours = row.original.hours ?? 0;
      const minutes = row.original.minutes ?? 0;

      return `${hours}시간 ${minutes}분`;
    },
  },
  {
    header: "수당",
    cell: ({ row }: { row: Row<OvertimesData> }) => {
      const hours = row.original.hours ? row.original.hours * 60 : 0;
      const minutes = row.original.minutes ?? 0;
      const times = hours + minutes;
      const salary = userDataStore.userInfo ? userDataStore.userInfo.salary : 0;
      const allowance = commaFormat(
        Math.round((salary / (209 * 12)) * 1.5 * (times / 60))
      );

      return `${allowance}원`;
    },
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
          router.push(`/overtimes/edit?id=${id}&date=${date}`);
        },
      },
      {
        label: "삭제",
        icon: "i-lucide-trash",
        color: "error",
        onSelect: () => {
          fetchDeleteOvertimeData(id);
        },
      },
    ],
  ];
};

const pagination = ref({
  pageIndex: 0,
  pageSize: 10,
});

const totalAllowance = (selectedMonth: string) => {
  const salary = userDataStore.userInfo ? userDataStore.userInfo.salary : 0;
  const totalTimes = overtimesDataStore.totalTimes(selectedMonth);
  const total = Math.round((salary / (209 * 12)) * 1.5 * (totalTimes / 60));

  return commaFormat(total);
};

const fetchDeleteOvertimeData = async (id: string) => {
  try {
    const db = useNuxtApp().$firestoreDb;
    if (!db) {
      throw new Error("Firestore 인스턴스가 없습니다.");
    }
    await deleteDoc(doc(db, "overtimes", id));

    toast.add({
      title: "삭제 완료",
      description: "야근을 삭제하였습니다.",
      color: "success",
      duration: 1000,
    });

    await overtimesDataStore.fetchOvertimesData(userID, selectedMonth);
  } catch (error) {
    console.error("Firestore 오류:", error);
    toast.add({
      title: "Error",
      description: "데이터 삭제 중 오류가 발생했습니다.",
      color: "error",
    });
  }
};

const overtimes = computed(
  () => overtimesDataStore.overtimesByMonth[selectedMonth] ?? []
);

onMounted(async () => {
  try {
    await overtimesDataStore.fetchOvertimesData(userID, selectedMonth);
    await userDataStore.fetchUserData(userID);
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
            <h1 class="page_title">야근 관리</h1>
          </div>
          <UButton label="등록하기" to="/overtimes/add" class="w-fit" />
        </div>
        <div class="flex flex-col gap-2">
          <div>
            <p>{{ selectedMonth }}월 야근 시간은?</p>
            <p class="text-orange-500 font-medium">
              {{ overtimesDataStore.formattingOvertimes(selectedMonth) }}
            </p>
          </div>
          <div>
            <p>{{ selectedMonth }}월 야근비는?</p>
            <p class="text-orange-500 font-medium">
              {{ totalAllowance(selectedMonth) }}원
            </p>
          </div>
        </div>
        <div v-if="overtimes.length > 0" class="w-full space-y-4 pb-4">
          <UTable
            ref="overtimesTable"
            v-model:pagination="pagination"
            sticky
            :data="overtimes"
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
                (overtimesTable?.tableApi?.getState().pagination.pageIndex ||
                  0) + 1
              "
              :items-per-page="
                overtimesTable?.tableApi?.getState().pagination.pageSize
              "
              :total="
                overtimesTable?.tableApi?.getFilteredRowModel().rows.length
              "
              @update:page="
                (p) => overtimesTable?.tableApi?.setPageIndex(p - 1)
              "
            />
          </div>
        </div>
      </div>
    </ClientOnly>
  </div>
</template>
