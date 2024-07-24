<template>
  <div>
    <navbar />
    <v-container class="fill-height d-flex align-start">
      <v-navigation-drawer app>
        <v-list dense>
          <v-list-item @click="$router.push({ name: 'HomeGP' })">
            <v-list-item-title>Home</v-list-item-title>
          </v-list-item>
          <v-list-item @click="$router.push({ name: 'AppointmentsGP' })">
            <v-list-item-title>Appointments</v-list-item-title>
          </v-list-item>
          <v-list-item @click="$router.push({ name: 'Registered' })">
            <v-list-item-title>Registered</v-list-item-title>
          </v-list-item>
          <v-list-item @click="$router.push({ name: 'HistoryGP' })">
            <v-list-item-title>History</v-list-item-title>
          </v-list-item>
          <v-list-item @click="$router.push({ name: 'UploadsGP' })">
            <v-list-item-title>Uploads</v-list-item-title>
          </v-list-item>
          <v-list-item @click="$router.push({ name: 'SettingsGP' })">
            <v-list-item-title>Settings</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>
      <v-main>
        <router-view></router-view>
      </v-main>
    </v-container>
  </div>
</template>

<script>
import Navbar from "@/components/navbar.vue";
import { getUserNameFromToken } from "@/utils/auth";

export default {
  name: "WelcomeGP",
  components: {
    Navbar,
  },
  data() {
    return {};
  },
  created() {
    const token = localStorage.getItem("token");
    this.userName = getUserNameFromToken(token) || "Guest"; // Fallback to 'Guest' if no name found
  },
  methods: {},
};
</script>

<style scoped>
.v-container {
  height: 100vh;
  background-color: #fff; /* Plain white background */
}
.v-card {
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
}
</style>
