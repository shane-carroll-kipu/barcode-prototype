<script setup>
import { patients } from '../data/patients'
import QrcodeVue from 'qrcode.vue'
import { createScanBus } from '../utils/scanBus'

const bus = createScanBus(() => {})

function announce(value) {
  bus.send(value)
}
</script>

<template>
  <main style="max-width: 1100px; margin: 0 auto; padding: 2rem;">
    <h1 style="margin-bottom: 1rem;">Patient Barcodes</h1>
    <p style="margin-bottom: 1rem; color:#6b7280;">Prototype page to display each patient's identifier as a scannable QR code.</p>
    <div class="grid">
      <div v-for="p in patients" :key="p.id" class="card">
        <img :src="p.photoUrl" alt="patient" class="avatar" />
        <div class="meta">
          <strong class="name">{{ p.name }}</strong>
          <span class="code">Value: {{ p.barcode }}</span>
        </div>
        <QrcodeVue :value="p.barcode" :size="140" level="M"/>
        <button class="btn" @click="announce(p.barcode)">Simulate Scan</button>
      </div>
    </div>
    <div style="margin-top:1rem;">
      <RouterLink to="/rounds">← Back to Rounds</RouterLink>
    </div>
  </main>
</template>

<style scoped>
.grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem; }
.card { border:1px solid #e5e7eb; border-radius:10px; padding: 1rem; background:#fff; display:grid; justify-items:center; gap:.5rem; }
.avatar { width:64px; height:64px; border-radius:50%; }
.name { color:#111827; }
.code { color:#6b7280; font-size:.85rem; }
</style>


