<template>
  <div>
    <v-container class="fill-height d-flex align-center justify-center">
      <v-card class="elevation-12" style="max-width: 800px; width: 100%">
        <v-card-title class="text-left">
          <h1>Registered Public Users</h1>
        </v-card-title>
        <v-card-text>
          <v-list>
            <v-list-item v-for="user in publicUsers" :key="user._id">
              <v-list-item-title>{{ user.name }}</v-list-item-title>
              <v-list-item-subtitle>{{ user.email }}</v-list-item-subtitle>
              <v-list-item-subtitle>{{
                user.phoneNumber
              }}</v-list-item-subtitle>
              <v-list-item-subtitle>{{ user.address }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </v-container>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "RegisteredPublicUsers",
  components: {},
  data() {
    return {
      publicUsers: [],
    };
  },
  created() {
    this.fetchPublicUsers();
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
  background-color: #fff;
}
.v-card {
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
}
</style>
