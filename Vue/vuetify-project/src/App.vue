<template>
  <v-app :style="$vuetify.display.mdAndDown ? 'top: 12px;' : 'top: 0px;'">
    <router-view></router-view>
  </v-app>
</template>

<script>
export default {
  name: "App",
};
</script>

<style scoped></style>
