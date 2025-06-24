import { collection, getDocs, query, where } from "firebase/firestore";
import { defineStore } from "pinia";
import { ref } from "vue";

interface OvertimesData {
  id: string;
  date: string;
  hours: number;
  minutes: number;
  memo: string;
}

export const useOvertimesDataStore = defineStore("overtimesData", () => {
  const overtimesByMonth = ref<Record<string, OvertimesData[]>>({});
  const specificOvertime = ref<OvertimesData | null>(null);

  const fetchOvertimesData = async (userID: string, referenceMonth: string) => {
    try {
      const db = useNuxtApp().$firestoreDb;
      if (!db) {
        throw new Error("Firestore 인스턴스가 없습니다.");
      }

      const overtimesCollection = collection(db, "overtimes");
      const q = query(
        overtimesCollection,
        where("user", "==", userID),
        where("month", "==", referenceMonth)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        overtimesByMonth.value[referenceMonth] = querySnapshot.docs
          .map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              date: data.date || "",
              hours: data.hours || 0,
              minutes: data.minutes || 0,
              memo: data.memo || "",
            };
          })
          .sort((a, b) => a.date.localeCompare(b.date));
      } else {
        console.warn(`${referenceMonth}월 데이터 없음`);
        overtimesByMonth.value[referenceMonth] = [];
      }
    } catch (error) {
      console.error("Firestore Query Error:", error);
    }
  };

  const fetchSpecificOvertime = async (userID: string, date: string) => {
    try {
      const db = useNuxtApp().$firestoreDb;
      if (!db) {
        throw new Error("Firestore 인스턴스가 없습니다.");
      }

      const overtimesCollection = collection(db, "overtimes");
      const q = query(
        overtimesCollection,
        where("user", "==", userID),
        where("date", "==", date)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const obertimeDoc = querySnapshot.docs[0];
        specificOvertime.value = obertimeDoc
          ? (obertimeDoc.data() as OvertimesData)
          : null;
      } else {
        console.warn(`특정 날짜(${date})에 대한 데이터 없음`);
        specificOvertime.value = null;
      }
    } catch (error) {
      console.error("Firestore Query Error:", error);
    }
  };

  const totalTimes = (month: string): number => {
    const data = overtimesByMonth.value[month] || [];
    return data.reduce(
      (total, item) => total + item.hours * 60 + item.minutes,
      0
    );
  };

  const formattingOvertimes = (month: string): string => {
    const total = totalTimes(month);
    const hours = Math.floor(total / 60);
    const minutes = total % 60;
    return `${hours}시간 ${minutes}분`;
  };

  return {
    overtimesByMonth,
    specificOvertime,
    fetchOvertimesData,
    fetchSpecificOvertime,
    totalTimes,
    formattingOvertimes,
  };
});
