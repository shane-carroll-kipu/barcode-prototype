// Mock patients data for Rounds page
// Each entry includes a hidden unique 2D barcode string (not displayed yet)
// Persist to localStorage so all tabs share identical barcodes and updates.

const STORAGE_KEY = 'patients'

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return null
}

export function savePatients(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch {}
}

function randomPastMinutes(maxMinutes) {
  const now = Date.now()
  const delta = Math.floor(Math.random() * maxMinutes) * 60 * 1000
  return new Date(now - delta)
}

const activities = ['Sleeping', 'Eating', 'Watching TV', 'Reading', 'Walking', 'Group Therapy', 'Resting']
const locations = ['Living Room', 'Group Room', 'Bedroom', 'Garden', 'Dining Hall', 'Nurse Station']

function uid(prefix = 'PID') {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`
}

function generatePatients() {
  return [
  { id: 'p1', name: 'Alex Johnson' },
  { id: 'p2', name: 'Brianna Chen' },
  { id: 'p3', name: 'Carlos Martinez' },
  { id: 'p4', name: 'Diana Patel' },
  { id: 'p5', name: 'Ethan Wright' },
  { id: 'p6', name: 'Fatima Ali' },
  { id: 'p7', name: 'Gabriel Smith' },
  { id: 'p8', name: 'Hannah Lee' },
  { id: 'p9', name: 'Isabella Rossi' },
  { id: 'p10', name: 'Jamal Brown' },
  { id: 'p11', name: 'Keiko Tanaka' },
  { id: 'p12', name: 'Liam O’Connor' },
  { id: 'p13', name: 'Maya Singh' },
  { id: 'p14', name: 'Noah Davis' },
  { id: 'p15', name: 'Olivia Garcia' },
].map((base, idx) => {
  const lastObservedAt = randomPastMinutes(120)
  const activity = activities[idx % activities.length]
  const location = locations[(idx * 2) % locations.length]
  const barcode = uid('DM') // unique 2D barcode string placeholder
  // Use randomuser portraits (headshots). Alternate men/women using index.
  const gender = idx % 2 === 0 ? 'men' : 'women'
  const avatarIndex = (idx * 7) % 99 // spread across 0..98
  const photoUrl = `https://randomuser.me/api/portraits/${gender}/${avatarIndex}.jpg`
  return { ...base, lastObservedAt: lastObservedAt.toISOString(), activity, location, barcode, photoUrl }
})
}

function initPatients() {
  const cached = loadFromStorage()
  if (cached && Array.isArray(cached) && cached.length) {
    return cached
  }
  const generated = generatePatients()
  savePatients(generated)
  return generated
}

export const patients = initPatients()


