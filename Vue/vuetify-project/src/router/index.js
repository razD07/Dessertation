import { createRouter, createWebHistory } from "vue-router";
import LoginComponent from "@/components/login.vue";
import RegisterComponent from "@/components/Register.vue";
import WelcomeGPComponent from "@/components/welcomeGP.vue";
import WelcomePublicComponent from "@/components/welcomePublic.vue";
import { getUserNameFromToken } from "@/utils/auth";

const routes = [
  {
    path: "/",
    name: "Login",
    component: LoginComponent,
  },
  {
    path: "/register",
    name: "Register",
    component: RegisterComponent,
  },
  {
    path: "/welcome-gp",
    name: "WelcomeGP",
    component: WelcomeGPComponent,
  },
  {
    path: "/welcome-public",
    name: "WelcomePublic",
    component: WelcomePublicComponent,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

// Navigation guard to check authentication
router.beforeEach((to, from, next) => {
  const publicPages = ["/", "/register"];
  const authRequired = !publicPages.includes(to.path);
  const token = localStorage.getItem("token");

  if (authRequired && !token) {
    return next("/");
  }

  if (token) {
    try {
      const user = getUserNameFromToken(token);
      if (!user) {
        localStorage.removeItem("token");
        return next("/");
      }
    } catch (error) {
      localStorage.removeItem("token");
      return next("/");
    }
  }

  next();
});

export default router;
