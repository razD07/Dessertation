<template>
  <v-container>
    <h1>Settings</h1>
    <v-row>
      <v-col cols="4">
        <div class="profile-photo-container">
          {{ user.profilePhoto }}
          <v-avatar size="200">
            <img
              :src="user.profilePhoto || defaultProfileIcon"
              alt="Profile Photo"
            />
          </v-avatar>
          <v-btn icon class="edit-photo-btn" @click="openPhotoUpload">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <input
            type="file"
            ref="fileInput"
            style="display: none"
            @change="uploadPhoto"
          />
        </div>
      </v-col>
      <v-col cols="8">
        <div class="user-details">
          <v-btn icon class="edit-details-btn" @click="openEditDialog">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <div class="details-content">
            <p><strong>Name:</strong> {{ user.name }}</p>
            <p><strong>Email:</strong> {{ user.email }}</p>
            <p><strong>Phone Number:</strong> {{ user.phoneNumber }}</p>
            <p><strong>Address:</strong> {{ user.address }}</p>
            <p v-if="isGP">
              <strong>Clinic Name:</strong> {{ user.clinicName }}
            </p>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Edit User Details Dialog -->
    <v-dialog v-model="editDialog" max-width="600px">
      <v-card>
        <v-card-title>Edit User Details</v-card-title>
        <v-card-text>
          <v-form>
            <v-text-field v-model="editUser.name" label="Name"></v-text-field>
            <v-text-field v-model="editUser.email" label="Email"></v-text-field>
            <v-text-field
              v-model="editUser.phoneNumber"
              label="Phone Number"
            ></v-text-field>
            <v-text-field
              v-model="editUser.address"
              label="Address"
            ></v-text-field>
            <v-text-field
              v-if="isGP"
              v-model="editUser.clinicName"
              label="Clinic Name"
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn color="blue darken-1" text @click="closeEditDialog"
            >Cancel</v-btn
          >
          <v-btn color="blue darken-1" text @click="saveUserDetails"
            >Save</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import axios from "axios";
import defaultProfileIcon from "@/assets/default-profile-icon.png";

export default {
  name: "Settings",
  data() {
    return {
      user: {},
      editUser: {},
      editDialog: false,
      isGP: false,
      defaultProfileIcon,
    };
  },
  created() {
    this.fetchUserData();
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
        this.isGP = response.data.userType === "GP";
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    },
    openEditDialog() {
      this.editUser = { ...this.user, password: "" };
      this.editDialog = true;
    },
    closeEditDialog() {
      this.editDialog = false;
    },
    async saveUserDetails() {
      try {
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("token");
        await axios.put(
          `http://localhost:5038/api/user/${userId}`,
          this.editUser,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        this.user = { ...this.editUser };
        this.closeEditDialog();
      } catch (error) {
        console.error("Error updating user details:", error);
      }
    },
    openPhotoUpload() {
      this.$refs.fileInput.click();
    },
    async uploadPhoto(event) {
      const file = event.target.files[0];
      if (!file) return;
      const formData = new FormData();
      formData.append("profilePhoto", file);

      try {
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("token");
        const response = await axios.post(
          `http://localhost:5038/api/user/uploadPhoto/${userId}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        this.user.profilePhoto = response.data.profilePhotoUrl;
      } catch (error) {
        console.error("Error uploading profile photo:", error);
      }
    },
  },
};
</script>

<style scoped>
.profile-photo-container {
  position: relative;
  display: inline-block;
}
.edit-photo-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  opacity: 0;
  transition: opacity 0.2s;
}
.profile-photo-container:hover .edit-photo-btn {
  opacity: 1;
}
.user-details {
  position: relative;
}
.edit-details-btn {
  position: absolute;
  top: 10px;
  right: 10px;
}
.details-content {
  margin-top: 20px;
}
</style>
