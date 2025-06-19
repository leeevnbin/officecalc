import { initializeApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();

  const firebaseConfig: Record<string, string> = {
    apiKey: config.public.FB_API_KEY as string,
    authDomain: config.public.FB_AUTH_DOMAIN as string,
    projectId: config.public.FB_PROJECT_ID as string,
    storageBucket: config.public.FB_STORAGE_BUCKET as string,
    messagingSenderId: config.public.FB_MESSAGING_SENDER_ID as string,
    appId: config.public.FB_APP_ID as string,
  };

  const app = initializeApp(firebaseConfig);
  const db: Firestore = getFirestore(app);
  const auth: Auth = getAuth(app);

  return {
    provide: {
      firebaseApp: app,
      firestoreDb: db,
      firebaseAuth: auth,
    },
  };
});
