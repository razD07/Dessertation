import { createRouter, createWebHistory } from "vue-router";
import LoginComponent from "@/components/login.vue";
import RegisterComponent from "@/components/Register.vue";
import WelcomeGPComponent from "@/components/welcomeGP.vue";
import WelcomePublicComponent from "@/components/welcomePublic.vue";
import HomeGP from "@/components/HomeGP.vue";
import HomePublic from "@/components/HomePublic.vue";
import Appointments from "@/components/Appointments.vue";
import RegisteredPublicUsers from "@/components/RegisteredPublicUsers.vue";
import GPs from "@/components/GPs.vue";
import History from "@/components/History.vue";
import Uploads from "@/components/Uploads.vue";
import Settings from "@/components/Settings.vue";
import { getUserNameFromToken, getUserTypeFromToken } from "@/utils/auth";

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
    meta: { requiresAuth: true, userType: "GP" },
    children: [
      { path: "home", name: "HomeGP", component: HomeGP },
      { path: "appointments", name: "AppointmentsGP", component: Appointments },
      {
        path: "registered",
        name: "Registered",
        component: RegisteredPublicUsers,
      },
      { path: "history", name: "HistoryGP", component: History },
      { path: "uploads", name: "UploadsGP", component: Uploads },
      { path: "settings", name: "SettingsGP", component: Settings },
    ],
  },
  {
    path: "/welcome-public",
    redirect: { path: "/welcome-public/home" },
    name: "WelcomePublic",
    component: WelcomePublicComponent,
    meta: { requiresAuth: true, userType: "Public" },
    children: [
      { path: "home", name: "HomePublic", component: HomePublic },
      { path: "appointments", name: "AppointmentsPublic", component: Appointments },
      { path: "gps", name: "GPs", component: GPs },
      { path: "history", name: "HistoryPublic", component: History },
      { path: "uploads", name: "UploadsPublic", component: Uploads },
      { path: "settings", name: "SettingsPublic", component: Settings },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

// Navigation guard to check authentication and user type
router.beforeEach((to, from, next) => {
  const publicPages = ["/", "/register"];
  const authRequired = to.matched.some((record) => record.meta.requiresAuth);
  const token = localStorage.getItem("token");

  if (authRequired && !token) {
    return next("/");
  }

  if (token) {
    try {
      const userType = getUserTypeFromToken(token);
      const userName = getUserNameFromToken(token);
      if (!userName) {
        localStorage.removeItem("token");
        return next("/");
      }

      if (authRequired) {
        if (to.meta.userType && to.meta.userType !== userType) {
          return next(userType === "GP" ? "/welcome-gp" : "/welcome-public");
        }
      }
    } catch (error) {
      localStorage.removeItem("token");
      return next("/");
    }
  }

  next();
});

export default router;
