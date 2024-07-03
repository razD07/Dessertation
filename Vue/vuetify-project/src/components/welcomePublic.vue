<template>
  <div class="welcome-container">
    <v-container>
      <v-card
        class="elevation-12"
        style="max-width: 550px; border-radius: 20px"
      >
        <v-card-title class="text-center">
          <h1>Welcome {{ userName }}!</h1>
        </v-card-title>
        <v-card-text>
          <p>You have successfully logged in as a public user.</p>
          <v-btn color="primary" @click="logout">Logout</v-btn>
        </v-card-text>
      </v-card>
    </v-container>
  </div>
</template>

<script>
import { getUserNameFromToken } from "../utils/auth";

export default {
  name: "WelcomePublic",
  data() {
    return {
      userName: null,
    };
  },
  created() {
    const token = localStorage.getItem("token");
    debugger;
    this.userName = getUserNameFromToken(token);
  },
  methods: {
    logout() {
      localStorage.removeItem("token");
      this.$router.push({ name: "Login" });
    },
  },
};
</script>

<style scoped>
.welcome-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
</style>
