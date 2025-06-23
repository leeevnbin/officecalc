import { collection, getDocs, query, where } from "firebase/firestore";
import { defineStore } from "pinia";

interface UserInfo {
  name: string;
  startDate: string;
  salary: number;
}

export const useUserDataStore = defineStore("userData", () => {
  const userInfo = ref<UserInfo | null>(null);

  const fetchUserData = async (userID: string) => {
    try {
      const db = useNuxtApp().$firestoreDb;
      if (!db) {
        throw new Error("Firestore 인스턴스가 없습니다.");
      }

      const usersCollection = collection(db, "users");
      const q = query(usersCollection, where("user", "==", userID));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        userInfo.value = userDoc ? (userDoc.data() as UserInfo) : null;
      } else {
        console.warn("사용자를 찾을 수 없습니다.");
        userInfo.value = null;
      }
    } catch (error) {
      console.error("Firestore Query Error:", error);
    }
  };

  return {
    userInfo,
    fetchUserData,
  };
});
