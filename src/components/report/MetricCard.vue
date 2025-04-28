<template>
  <q-card>
    <q-card-section>
      <div class="row items-center">
        <q-icon :name="icon" size="md" color="primary" class="q-mr-sm" />
        <div>
          <div class="text-subtitle2">{{ title }}</div>
          <div class="text-h6">
            <template v-if="loading">
              <q-spinner size="sm" color="primary" class="q-mr-xs" />
              Cargando...
            </template>
            <template v-else>
              {{ formattedValue }}
            </template>
          </div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  value: {
    type: [Number, String, Object],
    required: false,
    default: 0,
  },
  icon: {
    type: String,
    required: true,
  },
  isCurrency: {
    type: Boolean,
    default: false,
  },
  currencyLocale: {
    type: String,
    default: 'en-US',
  },
  currencyCode: {
    type: String,
    default: 'USD',
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const formattedValue = computed(() => {
  if (props.isCurrency) {
    return new Intl.NumberFormat(props.currencyLocale, {
      style: 'currency',
      currency: props.currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(props.value) || 0)
  }

  if (props.value === null || props.value === undefined) {
    return 'N/A'
  }

  return typeof props.value === 'number' ? props.value.toString() : props.value
})
</script>
