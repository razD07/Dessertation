<template>
  <div>
    <v-container class="fill-height d-flex align-center justify-center">
      <v-row justify="center">
        <v-col cols="12" md="8">
          <v-card class="elevation-12 welcome-card">
            <v-card-title class="text-center">
              <h1>Welcome Home, Dr.{{ userName }}</h1>
            </v-card-title>
          </v-card>
        </v-col>

        <v-col cols="12" md="8">
          <v-card class="elevation-12 info-card">
            <v-card-title>Upcoming Appointments</v-card-title>
            <v-card-text>
              <v-list>
                <v-list-item
                  v-for="appointment in upcomingAppointments"
                  :key="appointment._id"
                >
                  <v-list-item-content>
                    <v-list-item-title>
                      <strong
                        >{{ appointment.date }} at
                        {{ appointment.time }}</strong
                      >
                    </v-list-item-title>
                    <v-list-item-subtitle>
                      <strong>With Dr. {{ appointment.gpName }}</strong>
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
              <p v-if="!upcomingAppointments.length">
                No upcoming appointments.
              </p>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="8">
          <v-card class="elevation-12 info-card">
            <v-card-title>Clinic Information</v-card-title>
            <v-card-text>
              <p><strong>Name:</strong> {{ clinic.clinicName }}</p>
              <p><strong>Address:</strong> {{ clinic.address }}</p>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="8">
          <v-card class="elevation-12 info-card">
            <v-card-title>Average Rating</v-card-title>
            <v-card-text>
              <vue3-star-ratings
                v-model="averageRating"
                :starSize="20"
                starColor="#ff9800"
                inactiveColor="#333333"
                :numberOfStars="5"
                :disableClick="true"
              />
              <p>{{ averageRating.toFixed(2) }}/5</p>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="8">
          <v-card class="elevation-12 info-card">
            <v-card-title>Recent Reviews</v-card-title>
            <v-card-text>
              <v-list class="review-list">
                <v-list-item v-for="review in recentReviews" :key="review.date">
                  <v-list-item-title>{{ review.userName }}</v-list-item-title>
                  <v-list-item-subtitle>
                    <vue3-star-ratings
                      v-model="review.rating"
                      :starSize="20"
                      starColor="#ff9800"
                      inactiveColor="#333333"
                      :numberOfStars="5"
                      :disableClick="true"
                    />
                    <p>{{ review.review }}</p>
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
              <p v-if="!recentReviews.length">No reviews yet.</p>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="8">
          <v-card class="elevation-12 info-card">
            <v-card-title>Availability</v-card-title>
            <v-card-text>
              <v-list>
                <v-list-item v-for="(slots, day) in availability" :key="day">
                  <v-list-item-content>
                    <v-list-item-title
                      ><strong>{{ day }}</strong></v-list-item-title
                    >
                    <v-list-item-subtitle>{{
                      slots.join(", ")
                    }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
              <p v-if="!Object.keys(availability).length">
                No availability set.
              </p>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="8" class="text-center">
          <v-btn color="primary" class="ma-2" @click="goToAppointments"
            >View All Appointments</v-btn
          >
          <v-btn color="primary" class="ma-2" @click="goToClinicDetails"
            >Manage Clinic Details</v-btn
          >
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import axios from "axios";
import vue3StarRatings from "vue3-star-ratings";
import { getUserNameFromToken } from "@/utils/auth";

export default {
  name: "HomeGP",
  components: {
    vue3StarRatings,
  },
  data() {
    return {
      userName: "",
      clinic: {
        clinicName: "",
        address: "",
      },
      averageRating: 0,
      recentReviews: [],
      upcomingAppointments: [],
      availability: {},
    };
  },
  async created() {
    const token = localStorage.getItem("token");
    this.userName = getUserNameFromToken(token) || "Guest";
    await this.fetchUpcomingAppointments();
    await this.fetchReviews();
    await this.fetchAvailability();
    await this.fetchUserData();
  },
  methods: {
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
        this.clinic = response.data;
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    },
    async fetchReviews() {
      try {
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:5038/api/gp/reviews/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        this.recentReviews = response.data.reviews;
        this.averageRating = response.data.averageRating;
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    },
    async fetchAvailability() {
      try {
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:5038/api/getAvailability/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        this.clinic = response.data;
        this.availability = response.data.availability;
      } catch (error) {
        console.error("Error fetching availability:", error);
      }
    },
    goToAppointments() {
      this.$router.push("/appointments");
    },
    goToClinicDetails() {
      this.$router.push("/clinic-details");
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
  margin-bottom: 20px;
}
.v-list-item-title,
.v-list-item-subtitle,
p {
  margin: 0;
}
.review-list {
  max-height: 200px;
  overflow-y: auto;
}
</style>
