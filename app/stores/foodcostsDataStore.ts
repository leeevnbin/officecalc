import { defineStore } from "pinia";
import { collection, getDocs, query, where } from "firebase/firestore";

interface FoodcostsData {
  price: number;
  date: string;
  memo: string;
}

const thisYear = (new Date().getFullYear()).toString();
const thisMonth = (new Date().getMonth() + 1).toString().padStart(2, "0");

export const useFoodcostsDataStore = defineStore("foodcostsData", () => {
  const foodcostsData = ref<FoodcostsData[]>([]);

  const fetchFoodcostsData = async (userID: string) => {
    try {
      const db = useNuxtApp().$firestoreDb;
      if (!db) {
        throw new Error("Firestore 인스턴스가 없습니다.");
      }

      const annualCollection = collection(db, "foodcosts");
      const q = query(
        annualCollection,
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
              price: data.price || 0,
              date: data.date || "",
              memo: data.memo || "",
            };
          })
          .sort((a, b) => a.date.localeCompare(b.date));
      } else {
        console.warn("데이터를 찾을 수 없습니다.");
        foodcostsData.value = [];
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
    fetchFoodcostsData,
    totalPrice,
  };
});
