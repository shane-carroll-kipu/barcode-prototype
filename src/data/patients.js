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

function uid(prefix = 'PID', index = 0) {
  // Use a fixed seed based on index to ensure consistent barcodes
  const fixedSeeds = [
    'abc123', 'def456', 'ghi789', 'jkl012', 'mno345',
    'pqr678', 'stu901', 'vwx234', 'yza567', 'bcd890',
    'efg123', 'hij456', 'klm789', 'nop012', 'qrs345'
  ]
  const seed = fixedSeeds[index % fixedSeeds.length]
  const timestamp = 'mgfpt69c' // Fixed timestamp for consistency
  return `${prefix}-${seed}-${timestamp}`
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
  const barcode = uid('DM', idx) // unique 2D barcode string with consistent index
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
    // Check if cached patients have consistent barcodes (all end with mgfpt69c)
    const hasConsistentBarcodes = cached.every(p => p.barcode && p.barcode.endsWith('mgfpt69c'))
    if (hasConsistentBarcodes) {
      return cached
    }
  }
  // Generate new patients with consistent barcodes
  const generated = generatePatients()
  savePatients(generated)
  return generated
}

export const patients = initPatients()


