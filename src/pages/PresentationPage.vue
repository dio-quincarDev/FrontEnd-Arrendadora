<template>
  <q-page class="presentation-page window-height window-width row justify-center items-center">
    <div class="text-center q-pa-md">
      <div class="title-text q-mb-md animate-fade-in">DriveSync</div>
      <div
        class="text-h5 text-grey-4 q-mb-xl animate-fade-in-delay"
        style="font-weight: 300; letter-spacing: 0.5px"
      >
        La plataforma definitiva para administrar tu flota.
      </div>
      <q-btn
        to="/auth/login"
        label="Comenzar"
        size="lg"
        unelevated
        class="glass-button q-px-xl q-py-sm animate-scale-in"
      />
    </div>
  </q-page>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'PresentationPage',
})
</script>

<style scoped>
.presentation-page {
  background: linear-gradient(-45deg, #001e3c, #004d40, #001e3c, #004d40);
  background-size: 400% 400%;
  animation: gradientBG 18s ease infinite;
  overflow: hidden;
}

.title-text {
  font-size: 4.5rem;
  font-weight: 600;
  letter-spacing: -1px;
  background: -webkit-linear-gradient(45deg, #e0e0e0, #ffffff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.glass-button {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: white;
  font-weight: 500;
  transition:
    background 0.3s ease,
    transform 0.3s ease;
}

.glass-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

@keyframes gradientBG {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fade-in-delay {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  50% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-fade-in {
  animation: fade-in 1s ease-out forwards;
}

.animate-fade-in-delay {
  animation: fade-in-delay 1.5s ease-out forwards;
}

.animate-scale-in {
  animation: scale-in 1s ease-out 1s forwards;
  opacity: 0; /* Start hidden */
}
</style>
