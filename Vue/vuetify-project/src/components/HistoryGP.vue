<template>
  <div>
    <h1>{{ historyTitle }}</h1>
  </div>
</template>

<script>
import { getUserTypeFromToken } from "@/utils/auth";

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
