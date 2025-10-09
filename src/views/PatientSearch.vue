<script setup>
import { ref, computed } from 'vue'
import { patients } from '../data/patients'
import { parseGs1 } from '../utils/gs1'
import BarcodeScanner from '../components/BarcodeScanner.vue'

const searchQuery = ref('')
const selectedPatient = ref(null)
const showModal = ref(false)

// Filter patients based on search query
const filteredPatients = computed(() => {
  if (!searchQuery.value.trim()) {
    return patients
  }
  
  const query = searchQuery.value.toLowerCase()
  return patients.filter(patient => 
    patient.name.toLowerCase().includes(query) ||
    patient.id.toLowerCase().includes(query) ||
    (patient.barcode && patient.barcode.toLowerCase().includes(query))
  )
})

function openPatientModal(patient) {
  selectedPatient.value = patient
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  selectedPatient.value = null
}

function handleBarcodeDetected(barcode) {
  console.log('Camera detected barcode:', barcode)
  const scanned = barcode.trim()
  const patient = patients.find(p => (p.barcode || '').toLowerCase() === scanned.toLowerCase())
  if (patient) {
    openPatientModal(patient)
  }
}

function handleScannerError(error) {
  console.error('Scanner error:', error)
}
</script>

<template>
  <main style="max-width: 1200px; margin: 0 auto; padding: 2rem;">
    <div style="display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 2rem;">
      <h1>Patient Search</h1>
      <a href="/barcode-prototype/barcodes" target="_blank" rel="noopener" class="link">Open patient barcodes</a>
    </div>

    <!-- Camera Scanner Section -->
    <div style="margin-bottom: 2rem;">
      <h2 style="margin-bottom: 1rem; font-size: 1.25rem; color: #374151;">📷 Scan Patient Barcode</h2>
      <BarcodeScanner 
        @barcode-detected="handleBarcodeDetected"
        @error="handleScannerError"
      />
    </div>

    <!-- Search Section -->
    <div style="margin-bottom: 2rem;">
      <div style="position: relative; max-width: 400px;">
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="Search patients by name, ID, or barcode..."
          class="search-input"
        />
        <div class="search-icon">🔍</div>
      </div>
      <p style="margin-top: 0.5rem; color: #6b7280; font-size: 0.875rem;">
        {{ filteredPatients.length }} patient{{ filteredPatients.length !== 1 ? 's' : '' }} found
      </p>
    </div>

    <!-- Patient Grid -->
    <div class="patient-grid">
      <div 
        v-for="patient in filteredPatients" 
        :key="patient.id"
        class="patient-card"
        @click="openPatientModal(patient)"
      >
        <div class="patient-avatar">
          <img :src="patient.photoUrl" :alt="patient.name" />
        </div>
        <div class="patient-info">
          <h3 class="patient-name">{{ patient.name }}</h3>
          <p class="patient-id">ID: {{ patient.id }}</p>
          <p class="patient-barcode">{{ patient.barcode }}</p>
        </div>
        <div class="patient-status">
          <span class="status-badge" :class="{ 'status-active': patient.activity }">
            {{ patient.activity || 'No Activity' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Patient Detail Modal -->
    <div v-if="showModal && selectedPatient" class="modal-backdrop" @click.self="closeModal">
      <div class="modal">
        <header class="modal-header">
          <strong>Patient Details</strong>
          <button class="close" @click="closeModal">✕</button>
        </header>
        <section class="modal-body">
          <div class="modal-patient">
            <img :src="selectedPatient.photoUrl" class="avatar" alt="patient" />
            <div>
              <div class="name">{{ selectedPatient.name }}</div>
              <div class="since-sub">ID: {{ selectedPatient.id }}</div>
              <div class="since-sub">Barcode: {{ selectedPatient.barcode }}</div>
            </div>
          </div>
          <div class="patient-details">
            <div class="detail-row">
              <span class="detail-label">Last Activity:</span>
              <span class="detail-value">{{ selectedPatient.activity || 'None recorded' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Last Location:</span>
              <span class="detail-value">{{ selectedPatient.location || 'None recorded' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Last Observed:</span>
              <span class="detail-value">{{ new Date(selectedPatient.lastObservedAt).toLocaleString() }}</span>
            </div>
          </div>
        </section>
        <footer class="modal-footer">
          <button class="btn btn-secondary" @click="closeModal">Close</button>
        </footer>
      </div>
    </div>

    <!-- Navigation -->
    <div style="margin-top: 2rem;">
      <RouterLink to="/" class="back-button">← Back to Landing</RouterLink>
    </div>
  </main>
</template>

<style scoped>
.link { 
  color: #374151; 
  text-decoration: none; 
  font-size: 0.9rem; 
  padding: 0.5rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  transition: all 0.2s ease;
}
.link:hover { 
  text-decoration: none;
  background: #f3f4f6;
  border-color: #d1d5db;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  background: #fff;
  color: #111827;
}

.search-input:focus {
  outline: none;
  border-color: #646cff;
  box-shadow: 0 0 0 3px rgba(100, 108, 255, 0.15);
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1rem;
  color: #6b7280;
  pointer-events: none;
}

.patient-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.patient-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.patient-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
  border-color: #646cff;
}

.patient-avatar {
  display: flex;
  justify-content: center;
}

.patient-avatar img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
}

.patient-info {
  text-align: center;
}

.patient-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.5rem 0;
}

.patient-id {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 0.25rem 0;
}

.patient-barcode {
  font-size: 0.75rem;
  color: #9ca3af;
  font-family: monospace;
  margin: 0;
}

.patient-status {
  display: flex;
  justify-content: center;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 500;
  background: #f3f4f6;
  color: #6b7280;
}

.status-badge.status-active {
  background: #dbeafe;
  color: #1e40af;
}

/* Modal Styles */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: grid;
  place-items: center;
  z-index: 50;
}

.modal {
  width: 520px;
  max-width: calc(100vw - 2rem);
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-body {
  padding: 1rem;
  display: grid;
  gap: 1rem;
}

.modal-patient {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
}

.name {
  font-size: 1.05rem;
  color: #111827;
  font-weight: 600;
}

.since-sub {
  color: #6b7280;
  font-size: 0.85rem;
}

.patient-details {
  display: grid;
  gap: 0.75rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: 500;
  color: #374151;
}

.detail-value {
  color: #6b7280;
  text-align: right;
}

.modal-footer {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  padding: 0.75rem 1rem;
  border-top: 1px solid #e5e7eb;
}

.btn {
  padding: 0.5rem 0.8rem;
  border: 1px solid #6366f1;
  background: #6366f1;
  color: #fff;
  border-radius: 6px;
  cursor: pointer;
}

.btn.btn-secondary {
  border-color: #d1d5db;
  background: #fff;
  color: #111827;
}

.close {
  border: none;
  background: transparent;
  font-size: 1rem;
  cursor: pointer;
  color: #6b7280;
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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  .link {
    color: #e5e7eb;
    border-color: #374151;
  }
  .link:hover {
    background: #374151;
    border-color: #4b5563;
  }

  .search-input {
    background: #374151;
    border-color: #4b5563;
    color: #f9fafb;
  }
  .search-input:focus {
    border-color: #818cf8;
    box-shadow: 0 0 0 3px rgba(129, 140, 248, 0.15);
  }

  .patient-card {
    background: #1f2937;
    border-color: #374151;
  }
  .patient-card:hover {
    border-color: #818cf8;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  .patient-name {
    color: #f9fafb;
  }

  .patient-id {
    color: #9ca3af;
  }

  .patient-barcode {
    color: #6b7280;
  }

  .status-badge {
    background: #374151;
    color: #9ca3af;
  }

  .status-badge.status-active {
    background: #1e3a8a;
    color: #93c5fd;
  }

  .modal {
    background: #1f2937;
    border-color: #374151;
  }

  .modal-header {
    border-bottom-color: #374151;
  }

  .modal-footer {
    border-top-color: #374151;
  }

  .name {
    color: #f9fafb;
  }

  .detail-label {
    color: #e5e7eb;
  }

  .detail-value {
    color: #9ca3af;
  }

  .btn.btn-secondary {
    background: #374151;
    border-color: #4b5563;
    color: #f9fafb;
  }

  .close {
    color: #9ca3af;
  }

  .back-button {
    background: #374151;
    color: #e5e7eb;
    border-color: #4b5563;
  }
  .back-button:hover {
    background: #4b5563;
    color: #f9fafb;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }
}
</style>
