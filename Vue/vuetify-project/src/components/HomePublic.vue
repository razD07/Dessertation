<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card class="pa-5 welcome-card">
          <v-row>
            <v-col cols="12">
              <v-avatar size="100" class="mx-auto">
                <img
                  :src="user.profilePhoto || defaultProfileIcon"
                  alt="Profile Photo"
                />
              </v-avatar>
            </v-col>
            <v-col cols="12" class="text-center">
              <h1>Welcome, {{ user.name }}!</h1>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <v-row justify="center" v-if="upcomingAppointments.length">
      <v-col cols="12" md="8">
        <v-card class="pa-5">
          <v-card-title>Upcoming Appointments</v-card-title>
          <v-list>
            <v-list-item
              v-for="appointment in upcomingAppointments"
              :key="appointment._id"
            >
              <v-list-item-title>
                <strong>{{ appointment.date }}</strong> at
                <strong>{{ appointment.time }}</strong>
              </v-list-item-title>
              <v-list-item-subtitle>
                With Dr. <strong>{{ registeredGP?.name }}</strong>
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>

    <v-row justify="center" v-else>
      <v-col cols="12" md="8">
        <v-card class="pa-5">
          <v-card-title>No Upcoming Appointments</v-card-title>
          <v-card-text>
            You have no upcoming appointments. Book one now!
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from "axios";
import defaultProfileIcon from "@/assets/default-profile-icon.png";

export default {
  name: "HomePublic",
  data() {
    return {
      user: {},
      upcomingAppointments: [],
      registeredGP: null,
      defaultProfileIcon,
    };
  },
  created() {
    this.fetchUserData();
    this.fetchUpcomingAppointments();
    this.fetchRegisteredGP();
  },
  methods: {
    async fetchUserData() {
      try {
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:5038/api/user/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        this.user = response.data;
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    },
    async fetchUpcomingAppointments() {
      try {
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:5038/api/upcomingAppointments/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        this.upcomingAppointments = response.data;
      } catch (error) {
        console.error("Error fetching upcoming appointments:", error);
      }
    },
    async fetchRegisteredGP() {
      try {
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:5038/api/registeredGP/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        this.registeredGP = response.data;
      } catch (error) {
        console.error("Error fetching registered GP:", error);
      }
    },
  },
};
</script>

<style scoped>
.welcome-card {
  text-align: center;
  background-color: #f5f5f5;
}
</style>
