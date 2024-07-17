<template>
  <div>
    <v-app-bar color="primary" dark>
      <v-toolbar-title>GP Finder</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-btn text>{{ userName }}</v-btn>
        <v-menu offset-y>
          <template v-slot:activator="{ props }">
            <v-btn icon v-bind="props">
              <v-icon>mdi-account-circle</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item @click="logout">
              <v-list-item-title>Logout</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-toolbar-items>
    </v-app-bar>

    <v-navigation-drawer app>
      <v-list dense>
        <v-list-item
          @click="
            $router.push({
              name: userType === 'GP' ? 'HomeGP' : 'HomePublic',
            })
          "
        >
          <v-list-item-title>Home</v-list-item-title>
        </v-list-item>
        <v-list-item
          @click="
            $router.push({
              name: 'Appointments',
            })
          "
        >
          <v-list-item-title>Appointments</v-list-item-title>
        </v-list-item>
        <v-list-item
          v-if="userType === 'GP'"
          @click="$router.push({ name: 'Registered' })"
        >
          <v-list-item-title>Registered</v-list-item-title>
        </v-list-item>
        <v-list-item
          v-if="userType === 'Public'"
          @click="$router.push({ name: 'GPs' })"
        >
          <v-list-item-title>GPs</v-list-item-title>
        </v-list-item>
        <v-list-item @click="$router.push({ name: 'History' })">
          <v-list-item-title>History</v-list-item-title>
        </v-list-item>
        <v-list-item
          @click="
            $router.push({
              name: 'Uploads',
            })
          "
        >
          <v-list-item-title>Uploads</v-list-item-title>
        </v-list-item>
        <v-list-item
          @click="
            $router.push({
              name: 'Settings',
            })
          "
        >
          <v-list-item-title>Settings</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
  </div>
</template>

<script>
import { getUserNameFromToken, getUserTypeFromToken } from "@/utils/auth"; // Adjust the path as needed

export default {
  name: "Navbar",
  data() {
    return {
      userName: null,
      userType: null,
    };
  },
  created() {
    const token = localStorage.getItem("token");
    this.userName = getUserNameFromToken(token);
    this.userType = getUserTypeFromToken(token);
  },
  methods: {
    logout() {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("userType");
      this.$router.push({ name: "Login" });
    },
  },
};
</script>

<style scoped>
.v-app-bar {
  background-color: #1976d2; /* Customize the color as needed */
}
</style>
