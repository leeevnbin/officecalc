export default defineNuxtConfig({
  app: {
    head: {
      title: "오피스계산기",
    },
    buildAssetsDir: "officecalc/",
    rootId: "officecalc",
  },

  devtools: { enabled: true },

  modules: ["@nuxt/ui", "@nuxt/eslint"],

  plugins: ["~/plugins/firebase.ts", "~/plugins/pinia.ts"],

  css: ["~/assets/css/main.css"],

  ui: {
    colorMode: false,
  },

  future: {
    compatibilityVersion: 4,
  },

  compatibilityDate: "2025-06-10",

  runtimeConfig: {
    public: {
      FB_API_KEY: process.env.FIREBASE_API_KEY,
      FB_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
      FB_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
      FB_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
      FB_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
      FB_APP_ID: process.env.FIREBASE_APP_ID,
    },
  },
});
