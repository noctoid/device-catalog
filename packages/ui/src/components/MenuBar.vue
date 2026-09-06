<script setup lang="ts">
const emit = defineEmits<{ action: [id: string] }>();

function trigger(id: string) {
  emit("action", id);
}
</script>

<template>
  <div class="menu-bar">
    <button type="button" class="menu-button" @click="trigger('open')">
      <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
        <path d="M1.5 4.5h4.5l1.5-1.5H13a1.5 1.5 0 0 1 1.5 1.5v7a1.5 1.5 0 0 1-1.5 1.5H3a1.5 1.5 0 0 1-1.5-1.5z" fill="none" stroke="#000" stroke-width="1" />
      </svg>
      <span>Open</span>
    </button>

    <button type="button" class="menu-button" @click="trigger('save')">
      <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
        <path d="M2.5 2.5h8l3 3v8h-11z" fill="none" stroke="#000" stroke-width="1" />
        <rect x="5.5" y="2.5" width="5" height="4" fill="#000" />
        <rect x="5.5" y="10" width="5" height="3.5" fill="none" stroke="#000" stroke-width="1" />
      </svg>
      <span>Save</span>
    </button>

    <button type="button" class="menu-button" @click="trigger('export-html')">
      <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
        <path d="M3 1.5h7l3 3v10H3z" fill="none" stroke="#000" stroke-width="1" />
        <path d="M5.5 7L4 8.5 5.5 10M10.5 7L12 8.5 10.5 10" fill="none" stroke="#000" stroke-width="1" />
      </svg>
      <span>Export HTML</span>
    </button>

    <button type="button" class="menu-button" @click="trigger('export-pdf')">
      <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
        <path d="M3 1.5h7l3 3v10H3z" fill="none" stroke="#000" stroke-width="1" />
        <path d="M5 7h6M5 9h6M5 11h3.5" fill="none" stroke="#000" stroke-width="1" />
      </svg>
      <span>Export PDF</span>
    </button>

    <button type="button" class="menu-button" @click="trigger('export-jpg')">
      <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
        <rect x="1.5" y="2.5" width="13" height="11" fill="none" stroke="#000" stroke-width="1" />
        <circle cx="5.5" cy="6" r="1.3" fill="#000" />
        <path d="M1.5 12l4-4 3 3 2.5-2.5L14.5 12" fill="none" stroke="#000" stroke-width="1" />
      </svg>
      <span>Export JPG</span>
    </button>

    <button type="button" class="menu-button" @click="trigger('help')">
      <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
        <circle cx="8" cy="8" r="6.5" fill="none" stroke="#000" stroke-width="1" />
        <path d="M6.2 6.2a2 2 0 1 1 2.8 1.9c-.5.3-.9.7-.9 1.4v.5" fill="none" stroke="#000" stroke-width="1" />
        <circle cx="8" cy="11.6" r="0.6" fill="#000" />
      </svg>
      <span>Help</span>
    </button>
  </div>
</template>

<style scoped>
.menu-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  padding: 2px 3px;
}

.menu-button {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  width: 56px;
  aspect-ratio: 1;
  min-width: 0;
  padding: 4px;
}

.menu-button span {
  font-size: 11px;
  line-height: 1.1;
  text-align: center;
}
</style>
