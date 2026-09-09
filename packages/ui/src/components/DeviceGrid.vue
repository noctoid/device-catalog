<script setup lang="ts">
import type { Catalog, Device } from "@device-catalog/core";
import { computed } from "vue";

const props = defineProps<{ catalog: Catalog }>();
const emit = defineEmits<{ select: [device: Device] }>();

const groups = computed(() => {
  const byType = new Map<string, Device[]>();
  for (const device of props.catalog) {
    const list = byType.get(device.deviceType) ?? [];
    list.push(device);
    byType.set(device.deviceType, list);
  }
  return [...byType.entries()].map(([type, devices]) => ({ type, devices }));
});
</script>

<template>
  <div class="catalog">
    <fieldset v-for="group in groups" :key="group.type" class="group">
      <legend>{{ group.type }} ({{ group.devices.length }})</legend>
      <div class="grid">
        <article v-for="device in group.devices" :key="device.identifier" class="card" @click="emit('select', device)">
          <div class="card-name">{{ device.nickname ?? device.name ?? device.identifier }}</div>
          <div v-if="device.nickname && device.name" class="card-product">{{ device.name }}</div>
          <code class="card-id">{{ device.identifier }}</code>
          <ul v-if="device.keywords.length" class="chips">
            <li v-for="keyword in device.keywords" :key="keyword" class="chip">{{ keyword }}</li>
          </ul>
        </article>
      </div>
    </fieldset>
  </div>
</template>

<style scoped>
.catalog {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.group {
  margin: 0;
}

legend {
  padding: 0 4px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
  gap: 0.5rem;
}

.card {
  background: #c0c0c0;
  box-shadow:
    inset -1px -1px #0a0a0a,
    inset 1px 1px #ffffff,
    inset -2px -2px #808080,
    inset 2px 2px #dfdfdf;
  padding: 0.5rem;
  cursor: pointer;
}

.card-name {
  font-weight: bold;
  font-size: 13px;
  font-family: "Pixelated MS Sans Serif", Arial;
  -webkit-font-smoothing: none;
}

.card-id {
  display: block;
  color: #444;
  font-size: 11px;
  margin-top: 0.25rem;
}

.card-product {
  display: block;
  color: #444;
  font-size: 11px;
  margin-top: 0.25rem;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  list-style: none;
  margin: 0.5rem 0 0;
  padding: 0;
}

.chip {
  background: #c0c0c0;
  box-shadow:
    inset -1px -1px #ffffff,
    inset 1px 1px #0a0a0a,
    inset -2px -2px #dfdfdf,
    inset 2px 2px #808080;
  font-size: 11px;
  padding: 0.1rem 0.5rem;
}
</style>
