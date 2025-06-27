export default defineNuxtConfig({
  app: {
    head: {
      title: "오피스 계산기 | LEBCALC",
      htmlAttrs: {
        lang: "ko-KR",
      },
      charset: "UTF-8",
      viewport: "width=device-width, initial-scale=1.0",
      meta: [
        {
          name: "description",
          content:
            "입사일 기준으로 야근수당, 식비, 연차수당을 자동 계산하는 직장인 오피스 계산기 LEBCALC",
        },
        {
          name: "keywords",
          content:
            "오피스 계산기, LEBCALC, 야근수당 계산기, 식비 계산기, 연차수당 계산, 직장인 도구, 근속일 계산, 근태관리, 연봉관리",
        },
        { name: "author", content: "LEEEVNBIN" },
        { name: "robots", content: "index, follow" },
        { property: "og:title", content: "오피스 계산기 | LEBCALC" },
        {
          property: "og:description",
          content: "직장인을 위한 야근수당, 식비, 연차수당 자동 계산기 LEBCALC",
        },
        { property: "og:type", content: "website" },
        { property: "og:url", content: "https://lebcalc.netlify.app" },
        {
          property: "og:image",
          content: "https://lebcalc.netlify.app/og-image.png",
        },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: "오피스 계산기 | LEBCALC" },
        {
          name: "twitter:description",
          content: "입사일 기준 야근, 식비, 연차수당 자동 계산기 LEBCALC",
        },
        {
          name: "twitter:image",
          content: "https://lebcalc.netlify.app/og-image.png",
        },
      ],
      link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
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
