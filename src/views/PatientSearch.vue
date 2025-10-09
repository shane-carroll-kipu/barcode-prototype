<script setup>
import { ref, computed } from 'vue'
import { patients } from '../data/patients'

const searchQuery = ref('')
const selectedPatient = ref(null)

// Filter patients based on search query
const filteredPatients = computed(() => {
  if (!searchQuery.value) return patients
  
  const query = searchQuery.value.toLowerCase()
  return patients.filter(patient => 
    patient.name.toLowerCase().includes(query) ||
    patient.id.toLowerCase().includes(query) ||
    patient.barcode.toLowerCase().includes(query)
  )
})

// Get patient status color based on some criteria (using activity as status for now)
function getPatientStatusColor(patient) {
  const activity = patient.activity?.toLowerCase() || ''
  if (activity.includes('sleeping') || activity.includes('resting')) {
    return 'status-green' // Light green
  } else if (activity.includes('group') || activity.includes('therapy')) {
    return 'status-purple' // Light purple  
  } else {
    return 'status-red' // Red for other statuses
  }
}

// Get patient status icons (using activity as basis)
function getPatientIcons(patient) {
  const icons = []
  const activity = patient.activity?.toLowerCase() || ''
  
  if (activity.includes('group')) icons.push('G')
  if (activity.includes('therapy')) icons.push('T')
  if (activity.includes('walking')) icons.push('W')
  if (activity.includes('eating')) icons.push('E')
  
  return icons
}

function selectPatient(patient) {
  selectedPatient.value = patient
  // Future: could open patient details modal
}
</script>

<template>
  <main style="max-width: 1200px; margin: 0 auto; padding: 2rem;">
    <!-- Header Section -->
    <div style="display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 2rem;">
      <div>
        <h1 style="margin: 0; font-size: 2rem; font-weight: 700; color: #111827;">Patient Search</h1>
        <p style="margin: 0.5rem 0 0 0; color: #6b7280; font-size: 0.875rem;">
          Census {{ patients.length }} • Incoming 0 • Discharges 0
        </p>
      </div>
      <div style="display: flex; gap: 1rem; align-items: center;">
        <div style="position: relative;">
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Search patients..." 
            style="padding: 0.5rem 1rem 0.5rem 2.5rem; border: 1px solid #e5e7eb; border-radius: 6px; width: 250px; background: #fff;"
          />
          <span style="position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: #6b7280;">🔍</span>
        </div>
        <a href="/barcode-prototype/barcodes" target="_blank" rel="noopener" class="search-button">
          📋 Patient Barcodes
        </a>
      </div>
    </div>

    <!-- Patient Grid -->
    <div class="patient-grid">
      <div 
        v-for="patient in filteredPatients" 
        :key="patient.id"
        :class="['patient-card', getPatientStatusColor(patient)]"
        @click="selectPatient(patient)"
      >
        <!-- Top Icons -->
        <div class="card-top-icons">
          <div class="top-left-icon">r-</div>
          <div class="top-right-icon">
            <span class="bookmark-number">{{ Math.floor(Math.random() * 3) + 1 }}</span>
          </div>
        </div>
        
        <!-- Patient Photo -->
        <div class="patient-photo">
          <img :src="patient.photoUrl" :alt="patient.name" />
        </div>
        
        <!-- Status Icons (below photo) -->
        <div class="status-icons">
          <span 
            v-for="icon in getPatientIcons(patient)" 
            :key="icon"
            class="status-icon"
          >{{ icon }}</span>
        </div>
        
        <!-- Patient Info -->
        <div class="patient-info">
          <div class="patient-name">{{ patient.name }}</div>
          <div class="patient-id">{{ patient.id }}</div>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <div style="margin-top: 2rem;">
      <RouterLink to="/" class="back-button">← Back to Landing</RouterLink>
    </div>
  </main>
</template>

<style scoped>
.patient-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.patient-card {
  position: relative;
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #e5e7eb;
  min-height: 280px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.patient-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

/* Status Colors */
.status-green {
  background: #dcfce7;
  border-color: #bbf7d0;
}

.status-purple {
  background: #f3e8ff;
  border-color: #e9d5ff;
}

.status-red {
  background: #fef2f2;
  border-color: #fecaca;
}

.card-top-icons {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  right: 0.5rem;
  display: flex;
  justify-content: space-between;
  z-index: 1;
}

.top-left-icon {
  background: #6b7280;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.top-right-icon {
  background: #374151;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.bookmark-number {
  display: inline-block;
}

.patient-photo {
  margin-top: 2rem;
  margin-bottom: 0.5rem;
}

.patient-photo img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.status-icons {
  display: flex;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
}

.status-icon {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #374151;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
}

.patient-info {
  text-align: center;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.patient-name {
  font-weight: 600;
  font-size: 0.875rem;
  color: #111827;
  margin-bottom: 0.25rem;
  line-height: 1.2;
}

.patient-id {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
}

.search-button {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background: #6366f1;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s ease;
  border: 1px solid #6366f1;
}

.search-button:hover {
  background: #5a5fcf;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .patient-card {
    border-color: #374151;
  }
  
  .status-green {
    background: #064e3b;
    border-color: #065f46;
  }
  
  .status-purple {
    background: #581c87;
    border-color: #6b21a8;
  }
  
  .status-red {
    background: #7f1d1d;
    border-color: #991b1b;
  }
  
  .patient-name {
    color: #f9fafb;
  }
  
  .patient-id {
    color: #d1d5db;
  }
  
  .search-button {
    background: #818cf8;
    border-color: #818cf8;
  }
  
  .search-button:hover {
    background: #7c3aed;
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
  
  input[type="text"] {
    background: #374151;
    border-color: #4b5563;
    color: #f9fafb;
  }
}
</style>
