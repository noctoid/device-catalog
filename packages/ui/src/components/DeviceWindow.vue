<script setup lang="ts">
import type { Device, Quantity, SpecValue } from "@device-catalog/core";
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

const props = defineProps<{
  device: Device;
  resolvePhoto?: (path: string) => string;
}>();
const emit = defineEmits<{ close: [] }>();

const WIDTH = 460;

const x = ref(0);
const y = ref(0);
const windowEl = ref<HTMLElement | null>(null);

onMounted(() => {
  x.value = Math.max(0, Math.round((window.innerWidth - WIDTH) / 2));
  y.value = 64;
});

const displayName = computed(
  () => props.device.nickname ?? props.device.name ?? props.device.identifier,
);

const specEntries = computed(() => Object.entries(props.device.specs));

function formatSpec(value: SpecValue): string {
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (Array.isArray(value)) return value.map(formatSpec).join(", ");
  if (typeof value === "object" && value !== null) {
    const obj = value as Record<string, unknown>;
    if ("value" in obj && "unit" in obj) {
      const q = value as Quantity;
      return `${q.value} ${q.unit}${q.type ? ` (${q.type})` : ""}`;
    }
    if ("width" in obj && "height" in obj) {
      const d = value as { width: number; height: number; unit?: string };
      return `${d.width} × ${d.height}${d.unit ? ` ${d.unit}` : ""}`;
    }
    return Object.entries(obj)
      .map(([k, v]) => `${k}: ${formatSpec(v as SpecValue)}`)
      .join(" · ");
  }
  return String(value);
}

function photoSrc(path: string): string {
  return props.resolvePhoto ? props.resolvePhoto(path) : path;
}

let dragging = false;
let offsetX = 0;
let offsetY = 0;

function onTitleMouseDown(event: MouseEvent) {
  dragging = true;
  offsetX = event.clientX - x.value;
  offsetY = event.clientY - y.value;
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);
}

function onMouseMove(event: MouseEvent) {
  if (!dragging) return;
  x.value = event.clientX - offsetX;
  y.value = event.clientY - offsetY;
  clampPosition();
}

function clampPosition() {
  const el = windowEl.value;
  if (!el) return;
  const width = el.offsetWidth;
  const height = el.offsetHeight;
  x.value = Math.min(Math.max(x.value, 0), Math.max(0, window.innerWidth - width));
  y.value = Math.min(Math.max(y.value, 0), Math.max(0, window.innerHeight - height));
}

function onMouseUp() {
  dragging = false;
  window.removeEventListener("mousemove", onMouseMove);
  window.removeEventListener("mouseup", onMouseUp);
}

onBeforeUnmount(() => {
  window.removeEventListener("mousemove", onMouseMove);
  window.removeEventListener("mouseup", onMouseUp);
});
</script>

<template>
  <div ref="windowEl" class="window detail-window" :style="{ left: x + 'px', top: y + 'px' }">
    <div class="title-bar" @mousedown.prevent="onTitleMouseDown">
      <div class="title-bar-text">{{ displayName }}</div>
      <div class="title-bar-controls" @mousedown.stop>
        <button aria-label="Minimize" disabled></button>
        <button aria-label="Maximize" disabled></button>
        <button aria-label="Close" @click="emit('close')"></button>
      </div>
    </div>

    <div class="window-body detail-body">
      <fieldset>
        <legend>General</legend>
        <div v-if="device.name" class="row"><span class="k">Name</span><span class="v">{{ device.name }}</span></div>
        <div v-if="device.nickname" class="row"><span class="k">Nickname</span><span class="v">{{ device.nickname }}</span></div>
        <div class="row"><span class="k">Identifier</span><span class="v">{{ device.identifier }}</span></div>
        <div v-if="device.chassis" class="row"><span class="k">Chassis</span><span class="v">{{ device.chassis }}</span></div>
        <div v-if="device.os.length" class="row"><span class="k">OS</span><span class="v">{{ device.os.join(", ") }}</span></div>
        <div v-if="device.purpose.length" class="row"><span class="k">Purpose</span><span class="v">{{ device.purpose.join(", ") }}</span></div>
        <div v-if="device.condition != null" class="row"><span class="k">Condition</span><span class="v">{{ Math.round(device.condition * 100) }}%</span></div>
        <div v-if="device.serial" class="row"><span class="k">Serial</span><span class="v">{{ device.serial }}</span></div>
        <div v-if="device.acquired" class="row"><span class="k">Acquired</span><span class="v">{{ device.acquired }}</span></div>
        <div v-if="device.notes" class="row"><span class="k">Notes</span><span class="v">{{ device.notes }}</span></div>
      </fieldset>

      <fieldset v-if="specEntries.length">
        <legend>Specs</legend>
        <div v-for="[key, value] in specEntries" :key="key" class="row">
          <span class="k">{{ key }}</span>
          <span class="v">{{ formatSpec(value) }}</span>
        </div>
      </fieldset>

      <fieldset v-if="device.keywords.length">
        <legend>Keywords</legend>
        <ul class="chips">
          <li v-for="kw in device.keywords" :key="kw" class="chip">{{ kw }}</li>
        </ul>
      </fieldset>

      <fieldset v-if="device.photos && device.photos.length">
        <legend>Photos</legend>
        <div class="photos">
          <img v-for="(p, i) in device.photos" :key="i" :src="photoSrc(p)" :alt="`${displayName} photo ${i + 1}`" />
        </div>
      </fieldset>
    </div>
  </div>
</template>

<style scoped>
.window.detail-window {
  position: fixed;
  z-index: 1000;
  width: 460px;
  height: auto;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.title-bar {
  user-select: none;
}

.detail-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.row {
  display: flex;
  gap: 12px;
  padding: 1px 0;
}

.row .k {
  flex: 0 0 88px;
  font-weight: bold;
}

.row .v {
  flex: 1;
  word-break: break-word;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  list-style: none;
  margin: 0;
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

.photos {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.photos img {
  max-width: 120px;
  max-height: 120px;
  border: 1px solid #808080;
}
</style>
