<script setup lang="ts">
defineProps<{
  text: string;
}>();
</script>

<template>
  <div class="button">{{ text }}</div>
</template>

<style scoped></style>
