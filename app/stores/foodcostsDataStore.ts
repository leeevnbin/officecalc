import { defineStore } from "pinia";
import { collection, getDocs, query, where } from "firebase/firestore";

interface FoodcostsData {
  id: string;
  price: number;
  date: string;
  memo: string;
}

const thisYear = new Date().getFullYear().toString();
const thisMonth = (new Date().getMonth() + 1).toString().padStart(2, "0");

export const useFoodcostsDataStore = defineStore("foodcostsData", () => {
  const foodcostsData = ref<FoodcostsData[]>([]);
  const specificFoodcost = ref<FoodcostsData | null>(null);

  const fetchFoodcostsData = async (userID: string) => {
    try {
      const db = useNuxtApp().$firestoreDb;
      if (!db) {
        throw new Error("Firestore 인스턴스가 없습니다.");
      }

      const foodcostsCollection = collection(db, "foodcosts");
      const q = query(
        foodcostsCollection,
        where("user", "==", userID),
        where("year", "==", thisYear),
        where("month", "==", thisMonth)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        foodcostsData.value = querySnapshot.docs
          .map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              price: data.price || 0,
              date: data.date || "",
              memo: data.memo || "",
            };
          })
          .sort((a, b) => a.date.localeCompare(b.date));
      } else {
        foodcostsData.value = [];
      }
    } catch (error) {
      console.error("Firestore Query Error:", error);
    }
  };

  const fetchSpecificFoodcost = async (userID: string, date: string) => {
    try {
      const db = useNuxtApp().$firestoreDb;
      if (!db) {
        throw new Error("Firestore 인스턴스가 없습니다.");
      }

      const foodcostsCollection = collection(db, "foodcosts");
      const q = query(
        foodcostsCollection,
        where("user", "==", userID),
        where("date", "==", date)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const foodcostDoc = querySnapshot.docs[0];
        specificFoodcost.value = foodcostDoc
          ? (foodcostDoc.data() as FoodcostsData)
          : null;
      } else {
        console.warn(`특정 날짜(${date})에 대한 데이터 없음`);
        specificFoodcost.value = null;
      }
    } catch (error) {
      console.error("Firestore Query Error:", error);
    }
  };

  const totalPrice = () => {
    return foodcostsData.value.reduce((total, item) => total + item.price, 0);
  };

  return {
    foodcostsData,
    specificFoodcost,
    fetchFoodcostsData,
    fetchSpecificFoodcost,
    totalPrice,
  };
});
