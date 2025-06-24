import { defineStore } from "pinia";
import { ref } from "vue";
import { collection, getDocs, query, where } from "firebase/firestore";

interface AnnualData {
  id: string;
  deduction: number;
  date: string;
  memo: string;
}

export const useAnnualDataStore = defineStore("annualData", () => {
  const annualData = ref<AnnualData[]>([]);
  const specificAnnual = ref<AnnualData | null>(null);

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
              id: doc.id,
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

  const fetchSpecificAnnual = async (userID: string, date: string) => {
    try {
      const db = useNuxtApp().$firestoreDb;
      if (!db) {
        throw new Error("Firestore 인스턴스가 없습니다.");
      }

      const foodcostsCollection = collection(db, "annual");
      const q = query(
        foodcostsCollection,
        where("user", "==", userID),
        where("date", "==", date)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const foodcostDoc = querySnapshot.docs[0];
        specificAnnual.value = foodcostDoc
          ? (foodcostDoc.data() as AnnualData)
          : null;
      } else {
        console.warn(`특정 날짜(${date})에 대한 데이터 없음`);
        specificAnnual.value = null;
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
    specificAnnual,
    fetchAnnualData,
    fetchSpecificAnnual,
    sumDeduction,
  };
});
