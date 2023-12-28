<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
import Button from "@/components/Button.vue";
</script>

<template>
  <div class="wrapper">
    <nav>
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/about">About</RouterLink>
    </nav>
    <Button text="按钮" />
  </div>
  <RouterView />
</template>

<style scoped>
.wrapper {
  display: flex;
}
</style>
