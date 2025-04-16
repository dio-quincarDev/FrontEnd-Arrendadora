<template>
  <q-card class="metric-card">
    <q-card-section>
      <div class="metric-value">
        <slot name="value"></slot>
      </div>
      <div class="metric-label">
        <slot name="label"></slot>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
// No se necesita lógica específica aquí por ahora
</script>

<style scoped>
.metric-card {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.metric-value {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 4px;
}

.metric-label {
  color: gray;
}
</style>
