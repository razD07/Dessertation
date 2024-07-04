<template>
  <div>
    <Navbar />
    <v-container class="fill-height d-flex align-center justify-center">
      <v-card class="elevation-12" style="max-width: 600px; width: 100%">
        <v-card-title class="text-center">
          <h1>Welcome to GP Dashboard</h1>
        </v-card-title>
        <v-card-text>
          <p>Here you can manage your clinic's information and appointments.</p>
          <!-- Add more GP-specific content here -->
        </v-card-text>
      </v-card>
    </v-container>
  </div>
</template>

<script>
import Navbar from "@/components/navbar.vue"; // Adjust the path as needed
import { getUserNameFromToken } from "@/utils/auth";

export default {
  name: "WelcomeGP",
  components: {
    Navbar,
  },
  data() {
    return {
      userName: null,
    };
  },
  created() {
    const token = localStorage.getItem("token");
    this.userName = getUserNameFromToken(token);
  },
};
</script>

<style scoped>
.v-container {
  height: 100vh;
  background: url("@/assets/background.jpg") no-repeat center center fixed;
  background-size: cover;
}
.v-card {
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
}
</style>
