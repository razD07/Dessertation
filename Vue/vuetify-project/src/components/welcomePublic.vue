<template>
  <div>
    <navbar />
    <v-container class="fill-height d-flex align-start">
      <v-navigation-drawer app>
        <v-list dense>
          <v-list-item @click="$router.push({ name: 'HomePublic' })">
            <v-list-item-title>Home</v-list-item-title>
          </v-list-item>
          <v-list-item @click="$router.push({ name: 'AppointmentsPublic' })">
            <v-list-item-title>Appointments</v-list-item-title>
          </v-list-item>
          <v-list-item @click="$router.push({ name: 'GPs' })">
            <v-list-item-title>GPs</v-list-item-title>
          </v-list-item>
          <v-list-item @click="$router.push({ name: 'HistoryPublic' })">
            <v-list-item-title>History</v-list-item-title>
          </v-list-item>
          <v-list-item @click="$router.push({ name: 'UploadsPublic' })">
            <v-list-item-title>Uploads</v-list-item-title>
          </v-list-item>
          <v-list-item @click="$router.push({ name: 'SettingsPublic' })">
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
import axios from "axios";

export default {
  name: "WelcomePublic",
  components: {
    Navbar,
  },
  data() {
    return {
      searchQuery: "",
      gps: [],
      filteredGPs: [],
      selectedGP: null,
      dialog: false,
      alreadyRegisteredDialog: false,
      registeredGP: null,
    };
  },
  created() {
    this.fetchGPs();
    this.checkRegisteredGP();
  },
  methods: {
    async fetchGPs() {
      try {
        const response = await axios.get("http://localhost:5038/api/gps");
        this.gps = response.data;
        this.filterGPs();
      } catch (error) {
        console.error("Error fetching GPs:", error);
      }
    },
    filterGPs() {
      const query = this.searchQuery.toLowerCase();
      this.filteredGPs = this.gps.filter(
        (gp) =>
          gp.name.toLowerCase().includes(query) ||
          gp.clinicName.toLowerCase().includes(query) ||
          gp.address.toLowerCase().includes(query)
      );
      // Remove the registered GP from the list
      if (this.registeredGP) {
        this.filteredGPs = this.filteredGPs.filter(
          (gp) => gp._id !== this.registeredGP._id
        );
      }
    },
    selectGP(gp) {
      if (this.registeredGP && this.registeredGP._id === gp._id) {
        this.alreadyRegisteredDialog = true;
      } else {
        this.selectedGP = gp;
        this.dialog = true;
      }
    },
    async registerWithGP() {
      try {
        const publicUserId = localStorage.getItem("userId"); // Assuming you store the logged-in public user's ID in localStorage
        if (!publicUserId) {
          alert("User ID not found. Please log in again.");
          return;
        }
        await axios.post(`http://localhost:5038/api/registerWithGP`, {
          publicUserId,
          gpId: this.selectedGP._id,
        });
        alert("Successfully registered with GP!");
        this.dialog = false;
        this.checkRegisteredGP(); // Refresh the registered GP information
      } catch (error) {
        console.error("Error registering with GP:", error);
        alert("Failed to register with GP.");
      }
    },
    async checkRegisteredGP() {
      try {
        const publicUserId = localStorage.getItem("userId"); // Assuming you store the logged-in public user's ID in localStorage
        if (!publicUserId) {
          alert("User ID not found. Please log in again.");
          return;
        }
        const response = await axios.get(
          `http://localhost:5038/api/registeredGP/${publicUserId}`
        );
        this.registeredGP = response.data;
        this.filterGPs(); // Update the filtered GP list
      } catch (error) {
        if (error.response && error.response.status === 404) {
          this.registeredGP = null; // No registered GP found
        } else {
          console.error("Error checking registered GP:", error);
        }
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
