import { useState, useNuxtApp } from "#app";
import { onAuthStateChanged, type User } from "firebase/auth";

export const useFirebaseUser = () => {
  const user = useState<User | null>("firebaseUser", () => null);
  const loading = useState<boolean>("firebaseUserLoading", () => true);
  const initialized = useState<boolean>("firebaseUserInitialized", () => false);

  if (import.meta.client && !initialized.value) {
    initialized.value = true;

    const { $firebaseAuth } = useNuxtApp();

    onAuthStateChanged($firebaseAuth, (firebaseUser) => {
      user.value = firebaseUser;
      loading.value = false;
    });
  }

  return { user, loading };
};
