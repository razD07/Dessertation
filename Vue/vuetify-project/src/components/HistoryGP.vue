<template>
  <div>
    <h1>{{ historyTitle }}</h1>
    <!-- Add content for registered users here -->
  </div>
</template>

<script>
import { getUserTypeFromToken } from "@/utils/auth"; // Adjust the path as needed

export default {
  name: "History",
  data() {
    return {
      userType: null,
    };
  },
  created() {
    const token = localStorage.getItem("token");
    this.userType = getUserTypeFromToken(token);
  },
  computed: {
    historyTitle() {
      return this.userType === "GP" ? "GP History" : "Public History";
    },
  },
};
</script>
