<template>
  <v-container>
    <v-row>
      <v-col cols="4">
        <div v-if="registeredGP" class="registered-gp">
          <h2>Registered with: {{ registeredGP.name }}</h2>
          <vue3-star-ratings
            v-model="newReview.rating"
            :star-size="30"
            :show-rating="false"
            :read-only="false"
            :max-rating="5"
          />
          <v-textarea
            v-model="newReview.review"
            label="Write a review"
            outlined
          ></v-textarea>
          <v-btn
            @click="submitReview"
            :disabled="!newReview.rating || !newReview.review"
            >Submit Review</v-btn
          >
        </div>
      </v-col>
      <v-col cols="2"></v-col>
      <v-col cols="6">
        <h2>Reviews and Ratings</h2>
        <v-card>
          <v-card-text class="scrollable-reviews">
            <div v-if="reviews.length">
              <p>Average Rating: {{ averageRating.toFixed(2) }}</p>
              <v-list>
                <v-list-item
                  v-for="review in reviews"
                  :key="review.date"
                  class="review-item"
                >
                  <v-row>
                    <v-col>
                      <v-avatar size="40">
                        <img :src="defaultProfileIcon" />
                      </v-avatar>
                    </v-col>
                    <v-col style="align-content: center">
                      <v-list-item-title>{{
                        review.userName
                      }}</v-list-item-title>
                    </v-col>
                  </v-row>
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
                    <hr />
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </div>
            <div v-else>
              <p>No reviews yet.</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <h1 v-if="registeredGP">Reregister with another GP</h1>
      <h1 v-else="gp">Register with GP</h1>
      <v-col cols="12">
        <v-text-field
          v-model="search"
          label="Search GPs by name or address"
          outlined
        ></v-text-field>
        <v-list>
          <v-list-item
            v-for="gp in filteredGPs"
            :key="gp._id"
            class="gp-list-item"
            @click="openRegisterDialog(gp)"
          >
            <v-list-item-content>
              <v-list-item-title class="bold-title">{{
                gp.name
              }}</v-list-item-title>
              <v-list-item-subtitle>{{ gp.address }}</v-list-item-subtitle>
              <div v-if="gp.averageRating">
                <vue3-star-ratings
                  v-model="gp.averageRating"
                  :starSize="20"
                  starColor="#ff9800"
                  inactiveColor="#333333"
                  :numberOfStars="5"
                  :disableClick="true"
                />
                <span>({{ gp.averageRating.toFixed(2) }}/5)</span>
              </div>
              <div v-else>
                <span>No ratings yet</span>
              </div>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-col>
    </v-row>

    <!-- Register Confirmation Dialog -->
    <v-dialog v-model="registerDialog" max-width="500px">
      <v-card>
        <v-card-title>Confirm Registration</v-card-title>
        <v-card-text>
          Are you sure you want to register with {{ selectedGP?.name }}?
        </v-card-text>
        <v-card-actions>
          <v-btn color="blue darken-1" text @click="closeRegisterDialog"
            >Cancel</v-btn
          >
          <v-btn color="blue darken-1" text @click="confirmRegistration"
            >Confirm</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import axios from "axios";
import defaultProfileIcon from "@/assets/default-profile-icon.png";
import vue3StarRatings from "vue3-star-ratings";

export default {
  name: "GPs",
  components: {
    vue3StarRatings,
  },
  data() {
    return {
      search: "",
      gps: [],
      registeredGP: null,
      registeredGPId: null, // Add this to store registered GP's ID
      newReview: {
        rating: 0,
        review: "",
      },
      reviews: [],
      averageRating: 0,
      defaultProfileIcon,
      registerDialog: false,
      selectedGP: null,
    };
  },
  computed: {
    filteredGPs() {
      if (!this.search) {
        return this.gps.filter((gp) => gp._id !== this.registeredGPId);
      }
      return this.gps.filter((gp) => {
        return (
          (gp.name.toLowerCase().includes(this.search.toLowerCase()) ||
            gp.address.toLowerCase().includes(this.search.toLowerCase())) &&
          gp._id !== this.registeredGPId
        );
      });
    },
  },
  async created() {
    await this.fetchGPs();
    await this.fetchRegisteredGP();
  },
  methods: {
    async fetchGPs() {
      try {
        const response = await axios.get("http://localhost:5038/api/gps");
        this.gps = response.data;
        await Promise.all(
          this.gps.map(async (gp) => {
            const ratingResponse = await axios.get(
              `http://localhost:5038/api/gp/reviews/${gp._id}`
            );
            gp.averageRating = ratingResponse.data.averageRating || 0;
          })
        );
      } catch (error) {
        console.error("Error fetching GPs:", error);
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
        this.registeredGPId = response.data._id; // Store registered GP's ID
        await this.fetchReviews();
      } catch (error) {
        console.error("Error fetching registered GP:", error);
      }
    },
    openRegisterDialog(gp) {
      this.selectedGP = gp;
      this.registerDialog = true;
    },
    closeRegisterDialog() {
      this.registerDialog = false;
      this.selectedGP = null;
    },
    async confirmRegistration() {
      try {
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("token");
        await axios.post(
          "http://localhost:5038/api/registerWithGP",
          { publicUserId: userId, gpId: this.selectedGP._id },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        await this.fetchRegisteredGP();
        this.closeRegisterDialog();
      } catch (error) {
        console.error("Error registering with GP:", error);
      }
    },
    async fetchReviews() {
      try {
        const response = await axios.get(
          `http://localhost:5038/api/gp/reviews/${this.registeredGP._id}`
        );
        this.reviews = response.data.reviews;
        this.averageRating = response.data.averageRating;
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    },
    async submitReview() {
      try {
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("token");
        await axios.post(
          "http://localhost:5038/api/review",
          {
            userId,
            gpId: this.registeredGP._id,
            rating: this.newReview.rating,
            review: this.newReview.review,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        this.newReview.rating = 0;
        this.newReview.review = "";
        await this.fetchReviews();
      } catch (error) {
        console.error("Error submitting review:", error);
      }
    },
  },
};
</script>

<style scoped>
.registered-gp {
  margin-bottom: 20px;
}
.review-item {
  margin-bottom: 10px;
  display: flex;
  align-items: flex-start;
}
.review-item img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}
.scrollable-reviews {
  max-height: 300px;
  overflow-y: auto;
}
.bold-title {
  font-weight: bold;
}
</style>
