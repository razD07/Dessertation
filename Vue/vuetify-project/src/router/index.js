import { createRouter, createWebHistory } from "vue-router";
import LoginComponent from "@/components/login.vue";
import RegisterComponent from "@/components/Register.vue";
import WelcomeGPComponent from "@/components/welcomeGP.vue";
import WelcomePublicComponent from "@/components/welcomePublic.vue";

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

export default router;
