import { createRouter, createWebHistory } from "vue-router";
import LoginComponent from "@/components/login.vue";
import RegisterComponent from "@/components/Register.vue";
import WelcomeGPComponent from "@/components/welcomeGP.vue";
import WelcomePublicComponent from "@/components/welcomePublic.vue";
import { getUserNameFromToken } from "@/utils/auth";
import RegisteredPublicUsers from "@/components/RegisteredPublicUsers.vue"; // New import
import HomeGP from "@/components/HomeGP.vue";
import HomePublic from "@/components/HomePublic.vue";
import Appointments from "@/components/Appointments.vue";
import GPs from "@/components/GPs.vue";
import History from "@/components/History.vue";
import Uploads from "@/components/Uploads.vue";
import Settings from "@/components/Settings.vue";

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
    redirect: { path: "/welcome-gp/home" },
    name: "WelcomeGP",
    component: WelcomeGPComponent,
    children: [
      { path: "home", name: "HomeGP", component: HomeGP },
      { path: "appointments", name: "Appointments", component: Appointments },
      {
        path: "registered",
        name: "Registered",
        component: RegisteredPublicUsers,
      },
      { path: "history", name: "History", component: History },
      { path: "uploads", name: "Uploads", component: Uploads },
      { path: "settings", name: "Settings", component: Settings },
    ],
  },
  {
    path: "/welcome-public",
    redirect: { path: "/welcome-public/home" },
    name: "WelcomePublic",
    component: WelcomePublicComponent,
    children: [
      { path: "home", name: "HomePublic", component: HomePublic },
      { path: "appointments", name: "Appointments", component: Appointments },
      { path: "gps", name: "GPs", component: GPs },
      { path: "history", name: "History", component: History },
      { path: "uploads", name: "Uploads", component: Uploads },
      { path: "settings", name: "Settings", component: Settings },
    ],
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
