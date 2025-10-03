<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { parseGs1 } from '../utils/gs1'

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
</script>

<template>
  <main style="max-width: 800px; margin: 0 auto; padding: 2rem;">
    <h1 style="margin-bottom: 1rem;">Medication Input</h1>
    <p style="margin-bottom: 1rem; color:#666;">Scan a GS1 DataMatrix barcode. Fields will auto-fill. You can also paste a raw GS1 string.</p>

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

    <div style="height:0; overflow:hidden;">
      <input ref="hiddenInput" type="text" aria-hidden="true" tabindex="-1" />
    </div>

    <div style="margin-top: 1.5rem;">
      <RouterLink to="/">← Back to Landing</RouterLink>
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
}
input[type="text"]:focus {
  outline: none;
  border-color: #646cff;
  box-shadow: 0 0 0 3px rgba(100,108,255,0.15);
}
</style>


