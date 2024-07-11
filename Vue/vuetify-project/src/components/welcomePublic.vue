<template>
  <div>
    <navbar />
    <v-container class="fill-height d-flex align-center justify-center">
      <v-card class="elevation-12" style="max-width: 800px; width: 100%">
        <v-card-title class="text-left">
          <h1>Welcome to Public Dashboard</h1>
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="searchQuery"
            label="Search GPs by name or address"
            variant="outlined"
            @input="filterGPs"
          ></v-text-field>
          <v-list>
            <v-list-item
              v-for="gp in filteredGPs"
              :key="gp._id"
              @click="selectGP(gp)"
            >
              <v-list-item-title>{{ gp.name }}</v-list-item-title>
              <v-list-item-subtitle>{{ gp.clinicName }}</v-list-item-subtitle>
              <v-list-item-subtitle>{{ gp.address }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </v-container>

    <v-dialog v-model="dialog" persistent max-width="600px">
      <v-card>
        <v-card-title class="headline"
          >Register with {{ selectedGP?.name }}</v-card-title
        >
        <v-card-text>
          <p>Are you sure you want to register with {{ selectedGP?.name }}?</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="registerWithGP">Yes</v-btn>
          <v-btn @click="dialog = false">No</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
    };
  },
  created() {
    this.fetchGPs();
  },
  methods: {
    async fetchGPs() {
      try {
        const response = await axios.get("http://localhost:5038/api/gps");
        this.gps = response.data;
        this.filteredGPs = this.gps;
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
    },
    selectGP(gp) {
      this.selectedGP = gp;
      this.dialog = true;
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
      } catch (error) {
        console.error("Error registering with GP:", error);
        alert("Failed to register with GP.");
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
