<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useCounterStore } from "@/stores/counter";

const { count, doubleCount } = storeToRefs(useCounterStore());
const { increment } = useCounterStore();
const handleClick = () => {
  increment();
};
</script>

<template>
  <div class="about">{{ count }}</div>
  <div class="about">{{ doubleCount }}</div>
  <div class="about" @click="handleClick">+</div>
</template>

<style scoped>
@media (min-width: 1024px) {
  .about {
    display: flex;
    align-items: center;
  }
}
</style>
