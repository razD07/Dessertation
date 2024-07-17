<template>
  <div>
    <navbar />
    <v-container class="fill-height d-flex align-center justify-center">
      <v-card class="elevation-12" style="max-width: 800px; width: 100%">
        <v-card-title class="text-left">
          <h1>Welcome to Home GP Dashboard, {{ userName }}</h1>
        </v-card-title>
        <v-card-text>
          <!-- <p>Here you can manage your clinic's information and appointments.</p> -->
        </v-card-text>
      </v-card>
    </v-container>
  </div>
</template>

<script>
import Navbar from "@/components/navbar.vue";
import { getUserNameFromToken } from "@/utils/auth";

export default {
  name: "HomeGP",
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
