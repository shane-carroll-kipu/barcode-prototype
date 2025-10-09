<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { parseGs1 } from '../utils/gs1'
import BarcodeScanner from '../components/BarcodeScanner.vue'

const gtin = ref('')
const sn = ref('')
const lot = ref('')
const exp = ref('')

const hiddenInput = ref(null)

function applyParsed(parsed) {
  if (parsed.gtin) gtin.value = parsed.gtin
  if (parsed.sn) sn.value = parsed.sn
  if (parsed.lot) lot.value = parsed.lot
  if (parsed.exp) exp.value = parsed.exp
}

let buffer = ''
let timer = null
const SCAN_TIMEOUT_MS = 40 // fast keyboard wedge typing bursts

function handleKeypress(e) {
  // Ignore modifier keys and when typing in other inputs (allow manual edits too)
  const targetTag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : ''
  const isTypingInField = targetTag === 'input' || targetTag === 'textarea'
  if (isTypingInField && e.target !== hiddenInput.value) return

  if (timer) clearTimeout(timer)
  buffer += e.key
  timer = setTimeout(() => {
    const cleaned = buffer
      .replace(/Enter$/i, '') // some scanners append Enter which arrives as the last key
    const parsed = parseGs1(cleaned)
    applyParsed(parsed)
    buffer = ''
  }, SCAN_TIMEOUT_MS)
}

onMounted(() => {
  window.addEventListener('keypress', handleKeypress)
  // Focus hidden input to capture scans without a click
  requestAnimationFrame(() => hiddenInput.value && hiddenInput.value.focus())
})

onBeforeUnmount(() => {
  window.removeEventListener('keypress', handleKeypress)
  if (timer) clearTimeout(timer)
})

function handleManualPaste(evt) {
  const value = evt.clipboardData?.getData('text') || ''
  const parsed = parseGs1(value)
  applyParsed(parsed)
}

function handleBarcodeDetected(barcode) {
  console.log('Camera detected barcode:', barcode)
  const parsed = parseGs1(barcode)
  applyParsed(parsed)
}

function handleScannerError(error) {
  console.error('Scanner error:', error)
  // You could show a toast notification here
}
</script>

<template>
  <main style="max-width: 800px; margin: 0 auto; padding: 2rem;">
    <h1 style="margin-bottom: 1rem;">Medication Input</h1>
    <p style="margin-bottom: 1rem; color:#666;">Scan a GS1 DataMatrix barcode using your camera or keyboard scanner. Fields will auto-fill. You can also paste a raw GS1 string.</p>
    
    <!-- Camera Scanner Section -->
    <div style="margin-bottom: 2rem;">
      <h2 style="margin-bottom: 1rem; font-size: 1.25rem; color: #374151;">📷 Camera Scanner</h2>
      <BarcodeScanner 
        @barcode-detected="handleBarcodeDetected"
        @error="handleScannerError"
      />
    </div>
    
    <!-- Divider -->
    <div style="margin: 2rem 0; text-align: center; color: #9ca3af;">
      <span style="background: white; padding: 0 1rem;">or use keyboard scanner below</span>
      <hr style="margin-top: -0.5rem; border: none; border-top: 1px solid #e5e7eb;">
    </div>

    <form style="display: grid; grid-template-columns: 1fr; gap: 1rem;">
      <label>
        <span>GTIN</span>
        <input type="text" v-model="gtin" placeholder="14-digit GTIN" />
      </label>
      <label>
        <span>SN</span>
        <input type="text" v-model="sn" placeholder="Serial Number" />
      </label>
      <label>
        <span>Lot</span>
        <input type="text" v-model="lot" placeholder="Lot Number" />
      </label>
      <label>
        <span>Exp</span>
        <input type="text" v-model="exp" placeholder="YYYY-MM-DD" />
      </label>
    </form>

    <div style="margin-top: 1.25rem; display:flex; gap:.5rem; align-items:center; color:#6b7280; font-size:.9rem;">
      <span>Tip: paste GS1 string here to test →</span>
      <input type="text" @paste.prevent="handleManualPaste" placeholder=")d2... or (01)..." style="flex:1;" />
    </div>
    
    <div style="margin-top: 1rem; padding: 1rem; background: #f3f4f6; border-radius: 6px; font-size: 0.875rem; color: #6b7280;">
      <strong>Scanning Options:</strong>
      <ul style="margin: 0.5rem 0 0 1rem; padding: 0;">
        <li>📷 <strong>Camera:</strong> Click "Start Camera Scan" above to use your device camera</li>
        <li>⌨️ <strong>Keyboard:</strong> Use a USB barcode scanner (auto-detects when you scan)</li>
        <li>📋 <strong>Paste:</strong> Copy and paste a GS1 string in the field above</li>
      </ul>
    </div>

    <div style="height:0; overflow:hidden;">
      <input ref="hiddenInput" type="text" aria-hidden="true" tabindex="-1" />
    </div>

    <div style="margin-top: 1.5rem;">
      <RouterLink to="/" class="back-button">← Back to Landing</RouterLink>
    </div>
  </main>
</template>

<style scoped>
label {
  display: grid;
  gap: .25rem;
}
input[type="text"] {
  padding: .5rem .625rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
  color: #111827;
}
input[type="text"]:focus {
  outline: none;
  border-color: #646cff;
  box-shadow: 0 0 0 3px rgba(100,108,255,0.15);
}

.back-button {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  color: #374151;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s ease;
  border: 1px solid #e5e7eb;
}

.back-button:hover {
  background: #e5e7eb;
  color: #111827;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

@media (prefers-color-scheme: dark) {
  input[type="text"] {
    background: #374151;
    border-color: #4b5563;
    color: #f9fafb;
  }
  input[type="text"]:focus {
    border-color: #818cf8;
    box-shadow: 0 0 0 3px rgba(129,140,248,0.15);
  }
  
  .back-button {
    background: #374151;
    color: #e5e7eb;
    border-color: #4b5563;
  }
  .back-button:hover {
    background: #4b5563;
    color: #f9fafb;
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
  }
}
</style>


