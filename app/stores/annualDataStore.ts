import { defineStore } from "pinia";
import { ref } from "vue";
import { collection, getDocs, query, where } from "firebase/firestore";

interface AnnualData {
  deduction: number;
  date: string;
  memo: string;
}

export const useAnnualDataStore = defineStore("annualData", () => {
  const annualData = ref<AnnualData[]>([]);

  const fetchAnnualData = async (userID: string) => {
    try {
      const db = useNuxtApp().$firestoreDb;
      if (!db) {
        throw new Error("Firestore 인스턴스가 없습니다.");
      }

      const annualCollection = collection(db, "annual");
      const q = query(annualCollection, where("user", "==", userID));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        annualData.value = querySnapshot.docs
          .map((doc) => {
            const data = doc.data();
            return {
              deduction: data.deduction || 0,
              date: data.date || "",
              memo: data.memo || "",
            };
          })
          .sort((a, b) => a.date.localeCompare(b.date));
      } else {
        console.warn("데이터를 찾을 수 없습니다.");
        annualData.value = [];
      }
    } catch (error) {
      console.error("Firestore Query Error:", error);
    }
  };

  const sumDeduction = () => {
    return annualData.value.reduce(
      (sum, item) => sum + (item.deduction || 0),
      0
    );
  };

  return {
    annualData,
    fetchAnnualData,
    sumDeduction,
  };
});
