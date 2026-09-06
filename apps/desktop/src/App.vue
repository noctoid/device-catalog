<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { convertFileSrc } from "@tauri-apps/api/core";
import {
  deviceCount,
  normalizeCatalog,
  parseCatalog,
  type Catalog,
  type Device,
} from "@device-catalog/core";
import { DeviceGrid, DeviceWindow, MenuBar } from "@device-catalog/ui";
import { loadCatalogYaml, openCatalogFile } from "./storage";

const catalog = ref<Catalog>({});
const selectedDevice = ref<Device | undefined>();
const total = computed(() => deviceCount(catalog.value));
const categoryCount = computed(() => Object.keys(catalog.value).length);

onMounted(async () => {
  catalog.value = normalizeCatalog(parseCatalog(await loadCatalogYaml()));
});

async function handleAction(id: string) {
  if (id === "open") {
    const yaml = await openCatalogFile();
    if (yaml != null) {
      try {
        catalog.value = normalizeCatalog(parseCatalog(yaml));
      } catch (error) {
        console.error("Failed to load YAML:", error);
      }
    }
    return;
  }
  // Save/export/help are wired in later phases.
  console.log("menu action:", id);
}

function resolvePhoto(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  if (typeof window !== "undefined" && "__TAURI_INTERNALS__" in window) {
    return convertFileSrc(path);
  }
  return path;
}
</script>

<template>
  <div class="window">
    <div class="title-bar">
      <div class="title-bar-text">Device Catalog</div>
      <div class="title-bar-controls">
        <button aria-label="Minimize"></button>
        <button aria-label="Maximize"></button>
        <button aria-label="Close"></button>
      </div>
    </div>
    <MenuBar @action="handleAction" />
    <div class="window-body">
      <p class="subtitle">{{ total }} devices across {{ categoryCount }} categories</p>
      <DeviceGrid :catalog="catalog" @select="selectedDevice = $event" />
    </div>
    <div class="status-bar">
      <p class="status-bar-field">{{ total }} devices</p>
      <p class="status-bar-field">{{ categoryCount }} categories</p>
    </div>
  </div>

  <DeviceWindow
    v-if="selectedDevice"
    :device="selectedDevice"
    :resolve-photo="resolvePhoto"
    @close="selectedDevice = undefined"
  />
</template>

<style scoped>
.window {
  box-sizing: border-box;
  width: 100%;
  max-width: 800px;
  height: 80vh;
  display: flex;
  flex-direction: column;
}

.window-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  margin: 4px;
  padding-right: 12px;
}

.subtitle {
  margin: 0 0 0.5rem;
}
</style>
