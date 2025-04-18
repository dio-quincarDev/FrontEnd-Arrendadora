<template>
  <q-card>
    <q-card-section>
      <div class="row items-center">
        <q-icon :name="icon" size="md" color="primary" class="q-mr-sm" />
        <div>
          <div class="text-subtitle2">{{ title }}</div>
          <div class="text-h6">{{ formattedValue }}</div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: String,
  value: [Number, String, Object],
  icon: String,
  isCurrency: {
    type: Boolean,
    default: false,
  },
})

const formattedValue = computed(() => {
  if (props.isCurrency) {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(props.value || 0)
  }
  return props.value || 'N/A'
})
</script>
