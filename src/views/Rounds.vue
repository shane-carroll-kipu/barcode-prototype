<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { patients as seedPatients, savePatients } from '../data/patients'
import { createScanBus } from '../utils/scanBus'

const patients = ref(seedPatients)

const now = ref(Date.now())
let tick = null
onMounted(() => {
  tick = setInterval(() => { now.value = Date.now() }, 1000)
})
onBeforeUnmount(() => { if (tick) clearInterval(tick) })

function formatSince(iso) {
  const last = new Date(iso).getTime()
  const diffMs = Math.max(0, now.value - last)
  const mins = Math.floor(diffMs / 60000)
  const secs = Math.floor((diffMs % 60000) / 1000)
  return `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`
}

function minutesSince(iso) {
  const last = new Date(iso).getTime()
  return Math.floor((now.value - last) / 60000)
}

const rows = computed(() => patients.value
  .slice()
  .sort((a, b) => minutesSince(b.lastObservedAt) - minutesSince(a.lastObservedAt))
  .map(p => ({
    ...p,
    since: formatSince(p.lastObservedAt),
    minutes: minutesSince(p.lastObservedAt)
  }))
)

// Scan capture + modal state
const hiddenInput = ref(null)
const isModalOpen = ref(false)
const selectedPatient = ref(null)
const activity = ref('')
const locationVal = ref('')
const activityOptions = ['Sleeping', 'Eating', 'Watching TV', 'Reading', 'Walking', 'Group Therapy', 'Resting']
const locationOptions = ['Living Room', 'Group Room', 'Bedroom', 'Garden', 'Dining Hall', 'Nurse Station']
const lastScanned = ref('')

let buffer = ''
let timer = null
const SCAN_TIMEOUT_MS = 250
let lastKeyTime = 0

function normalizeScan(text) {
  if (!text) return ''
  let s = text
  s = s.replace(/^[\]](?:Q3|q3|C1|D2|d2)/, '') // strip symbology identifiers
  s = s.replace(/[\r\n\t]/g, '')
  s = s.trim()
  return s
}

function openModalFor(patient) {
  selectedPatient.value = patient
  activity.value = patient.activity || ''
  locationVal.value = patient.location || ''
  isModalOpen.value = true
}

function submitModal() {
  if (!selectedPatient.value) return
  const idx = patients.value.findIndex(p => p.id === selectedPatient.value.id)
  if (idx !== -1) {
    patients.value[idx] = {
      ...patients.value[idx],
      activity: activity.value || patients.value[idx].activity,
      location: locationVal.value || patients.value[idx].location,
      lastObservedAt: new Date().toISOString(),
    }
    savePatients(patients.value)
  }
  isModalOpen.value = false
}

function handleKey(e) {
  if (isModalOpen.value) return // avoid capturing while in modal
  const targetTag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : ''
  const isTypingInField = targetTag === 'input' || targetTag === 'textarea' || targetTag === 'select'
  if (isTypingInField && e.target !== hiddenInput.value) return

  let toAppend = ''
  if (e.type === 'keypress') {
    if (e.key.length === 1) toAppend = e.key
  } else if (e.type === 'keydown') {
    if (e.key === 'Enter') toAppend = 'Enter'
    else return
  }
  if (!toAppend) return

  // Heuristic: fast keystrokes indicate a scanner. Prevent default during scan burst.
  const nowTs = performance.now()
  const delta = nowTs - lastKeyTime
  lastKeyTime = nowTs

  if (timer) clearTimeout(timer)
  buffer += toAppend
  e.preventDefault(); e.stopPropagation()

  timer = setTimeout(() => {
    const scanned = normalizeScan(buffer.replace(/Enter$/i, ''))
    buffer = ''
    lastScanned.value = scanned
    const scannedLower = scanned.toLowerCase()
    const patient = patients.value.find(p => (p.barcode || '').toLowerCase() === scannedLower)
    if (patient) {
      openModalFor(patient)
    }
  }, SCAN_TIMEOUT_MS)
}

onMounted(() => {
  const bus = createScanBus((value) => {
    const scanned = normalizeScan(String(value || ''))
    lastScanned.value = scanned
    const scannedLower = scanned.toLowerCase()
    const patient = patients.value.find(p => (p.barcode || '').toLowerCase() === scannedLower)
    if (patient) openModalFor(patient)
  })
  window.addEventListener('keydown', handleKey, { capture: true })
  window.addEventListener('keypress', handleKey, { capture: true })
  const refocus = () => {
    if (hiddenInput.value && typeof hiddenInput.value.focus === 'function') {
      try { hiddenInput.value.focus({ preventScroll: true }) } catch { hiddenInput.value.focus() }
    }
  }
  requestAnimationFrame(refocus)
  window.addEventListener('click', refocus)
  document.addEventListener('visibilitychange', refocus)
  onBeforeUnmount(() => {
    window.removeEventListener('click', refocus)
    document.removeEventListener('visibilitychange', refocus)
  })
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKey, { capture: true })
  window.removeEventListener('keypress', handleKey, { capture: true })
  if (timer) clearTimeout(timer)
})
</script>

<template>
  <main style="max-width: 1100px; margin: 0 auto; padding: 2rem;">
    <div style="display:flex; align-items:center; justify-content:space-between; gap:1rem; margin-bottom:1rem;">
      <h1>Rounds</h1>
      <a href="/barcodes" target="_blank" rel="noopener" class="link">Open patient barcodes</a>
    </div>
    <div style="height:0; overflow:hidden; position:fixed; top:-10000px; left:-10000px;">
      <input ref="hiddenInput" type="text" aria-hidden="true" tabindex="-1" />
    </div>

    <div class="table">
      <div class="thead">
        <div class="th col-photo">Patient</div>
        <div class="th col-name"></div>
        <div class="th col-time">Last Observation</div>
        <div class="th col-activity">Last Activity</div>
        <div class="th col-location">Last Location</div>
        <div class="th col-action">Action</div>
      </div>
      <div class="tbody">
        <div class="tr" v-for="p in rows" :key="p.id" :class="{ stale: p.minutes > 30 }">
          <div class="td col-photo"><img :src="p.photoUrl" alt="patient" class="avatar" /></div>
          <div class="td col-name"><strong class="name">{{ p.name }}</strong></div>
          <div class="td col-time">
            <div class="since">{{ new Date(p.lastObservedAt).toLocaleTimeString() }}</div>
            <div class="since-sub">({{ p.since }})</div>
          </div>
          <div class="td col-activity"><span class="badge">{{ p.activity }}</span></div>
          <div class="td col-location"><span class="badge">{{ p.location }}</span></div>
          <div class="td col-action"><button class="btn-sm" @click="openModalFor(p)">Update</button></div>
        </div>
      </div>
    </div>

    <div style="margin-top: 1rem;">
      <RouterLink to="/">← Back to Landing</RouterLink>
      <span v-if="lastScanned" class="debug">Last scanned: {{ lastScanned }}</span>
    </div>

    <div v-if="isModalOpen" class="modal-backdrop" @click.self="isModalOpen=false">
      <div class="modal">
        <header class="modal-header">
          <strong>Update Observation</strong>
          <button class="close" @click="isModalOpen=false">✕</button>
        </header>
        <section class="modal-body" v-if="selectedPatient">
          <div class="modal-patient">
            <img :src="selectedPatient.photoUrl" class="avatar" alt="patient" />
            <div>
              <div class="name">{{ selectedPatient.name }}</div>
              <div class="since-sub">ID: {{ selectedPatient.id }}</div>
            </div>
          </div>
          <div class="form">
            <label>
              <span>Activity</span>
              <select v-model="activity">
                <option value="" disabled>Select activity</option>
                <option v-for="a in activityOptions" :key="a" :value="a">{{ a }}</option>
              </select>
            </label>
            <label>
              <span>Location</span>
              <select v-model="locationVal">
                <option value="" disabled>Select location</option>
                <option v-for="l in locationOptions" :key="l" :value="l">{{ l }}</option>
              </select>
            </label>
          </div>
        </section>
        <footer class="modal-footer">
          <button class="btn" @click="submitModal">Save</button>
          <button class="btn btn-secondary" @click="isModalOpen=false">Cancel</button>
        </footer>
      </div>
    </div>
  </main>
</template>

<style scoped>
.link { color:#374151; text-decoration: none; font-size:.9rem; }
.link:hover { text-decoration: underline; }
.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
}
.name { font-size: 1.05rem; color:#111827; }
.since { color:#111827; font-weight: 500; }
.since-sub { color:#6b7280; font-size:.85rem; }
.badge { background:#eef2ff; color:#3730a3; border-radius: 999px; padding: .2rem .55rem; font-size:.8rem; }

.table { border:1px solid #e5e7eb; border-radius:10px; overflow:hidden; background:#fff; }
.thead, .tr { display:grid; grid-template-columns: 90px 1fr 220px 200px 1fr 120px; align-items:center; }
.thead { background:#f9fafb; color:#374151; font-weight:600; font-size:.9rem; }
.th { padding:.75rem 1rem; border-bottom:1px solid #e5e7eb; }
.tbody .tr { border-bottom:1px solid #f3f4f6; }
.td { padding:.65rem 1rem; }
.tr.stale { background:#fff7f7; }
.tr.stale .since, .tr.stale .since-sub { color:#b91c1c; }

@media (max-width: 900px) {
  .thead { display: none; }
  .tr { grid-template-columns: 64px 1fr; grid-row-gap:.25rem; }
  .td.col-time, .td.col-activity, .td.col-location, .td.col-action { grid-column: span 2; }
}

.modal-backdrop {
  position: fixed; inset: 0; background: rgba(0,0,0,0.35);
  display: grid; place-items: center;
  z-index: 50;
}
.modal {
  width: 520px; max-width: calc(100vw - 2rem);
  background: #fff; border-radius: 12px; overflow: hidden;
  border: 1px solid #e5e7eb; box-shadow: 0 10px 30px rgba(0,0,0,.15);
}
.modal-header { display:flex; align-items:center; justify-content:space-between; padding: .75rem 1rem; border-bottom:1px solid #e5e7eb; }
.modal-body { padding: 1rem; display:grid; gap:1rem; }
.modal-patient { display:flex; gap:.75rem; align-items:center; }
.form { display:grid; gap:.75rem; }
.form label { display:grid; gap:.25rem; }
.form select { padding:.5rem .6rem; border:1px solid #e5e7eb; border-radius:6px; }
.modal-footer { display:flex; gap:.5rem; justify-content:flex-end; padding: .75rem 1rem; border-top:1px solid #e5e7eb; }
.btn { padding:.5rem .8rem; border:1px solid #6366f1; background:#6366f1; color:#fff; border-radius:6px; }
.btn.btn-secondary { border-color:#d1d5db; background:#fff; color:#111827; }
.close { border:none; background:transparent; font-size:1rem; cursor:pointer; }
.btn-sm { padding:.35rem .6rem; border:1px solid #d1d5db; background:#fff; color:#111827; border-radius:6px; }
.debug { margin-left: .75rem; color:#6b7280; font-size:.85rem; }
</style>


