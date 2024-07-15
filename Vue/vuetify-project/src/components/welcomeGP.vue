<template>
  <div>
    <navbar />
    <v-container class="fill-height d-flex align-center justify-center">
      <v-card class="elevation-12" style="max-width: 800px; width: 100%">
        <v-card-title class="text-left">
          <h1>Welcome to GP Dashboard, {{ userName }}</h1>
        </v-card-title>
        <v-card-text>
          <p>Here you can manage your clinic's information and appointments.</p>
          <h2>Registered Public Users</h2>
          <template v-if="publicUsers.length > 0">
            <v-list>
              <v-list-item v-for="user in publicUsers" :key="user._id">
                <v-list-item-content>
                  <v-list-item-title>{{ user.name }}</v-list-item-title>
                  <v-list-item-subtitle>{{ user.email }}</v-list-item-subtitle>
                  <v-list-item-subtitle>{{
                    user.phoneNumber
                  }}</v-list-item-subtitle>
                  <v-list-item-subtitle>{{
                    user.address
                  }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </template>
          <template v-else>
            <p>No public users registered yet.</p>
          </template>
        </v-card-text>
      </v-card>
    </v-container>
  </div>
</template>

<script>
import Navbar from "@/components/navbar.vue";
import axios from "axios";
import { getUserNameFromToken } from "@/utils/auth";

export default {
  name: "WelcomeGP",
  components: {
    Navbar,
  },
  data() {
    return {
      userName: "Loading...", // Initialize with a default value
      publicUsers: [], // Store the list of registered public users
    };
  },
  created() {
    const token = localStorage.getItem("token");
    this.userName = getUserNameFromToken(token) || "Guest"; // Fallback to 'Guest' if no name found
    this.fetchPublicUsers(); // Fetch the list of registered public users
  },
  methods: {
    async fetchPublicUsers() {
      try {
        const gpId = localStorage.getItem("userId"); // Assuming the logged-in GP's ID is stored in localStorage
        if (!gpId) {
          alert("GP ID not found. Please log in again.");
          return;
        }
        const response = await axios.get(
          `http://localhost:5038/api/publicUsers/${gpId}`
        );
        this.publicUsers = response.data;
      } catch (error) {
        console.error("Error fetching public users:", error);
      }
    },
  },
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
