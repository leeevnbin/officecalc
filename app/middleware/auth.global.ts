export default defineNuxtRouteMiddleware(async (to) => {
  if (!import.meta.client) return;

  const { user, loading } = useFirebaseUser();

  while (loading.value) {
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  if (!(to.path === "/signin" || to.path === "/signup") && !user.value) {
    return navigateTo("/signin");
  }

  if ((to.path === "/signin" || to.path === "/signup") && user.value) {
    return navigateTo("/");
  }
});
