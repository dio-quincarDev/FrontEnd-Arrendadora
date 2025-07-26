import { computed } from 'vue';
import { date } from 'quasar';

export function useRentalCalculations(formData, selectedPricingInfo) {
  const rentalDuration = computed(() => {
    if (!formData.value.startDate || !formData.value.endDate) {
      return 0;
    }

    const startDateTime = date.extractDate(
      `${formData.value.startDate} ${formData.value.startTime}`,
      'YYYY-MM-DD HH:mm',
    );
    const endDateTime = date.extractDate(
      `${formData.value.endDate} ${formData.value.endTime}`,
      'YYYY-MM-DD HH:mm',
    );

    if (date.isSameDate(startDateTime, endDateTime, 'day')) {
      return 1;
    }

    const diff = date.getDateDiff(endDateTime, startDateTime, 'days');
    return diff > 0 ? diff : 1;
  });

  const totalPrice = computed(() => {
    if (!selectedPricingInfo.value) return 0;
    return selectedPricingInfo.value.price * rentalDuration.value;
  });

  return {
    rentalDuration,
    totalPrice,
  };
}
