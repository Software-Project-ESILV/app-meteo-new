/**
 * Simple in-memory storage for hospital-related data used by /api/doctors.
 * Keeping it here prevents route files from managing shared state directly.
 */
const baseDoctors = [
  { id: 1, name: 'Dr. Sarah Lee', specialty: 'Cardiology' },
  { id: 2, name: 'Dr. Amir Khan', specialty: 'Pediatrics' }
]

export const doctors = baseDoctors.map(doc => ({ ...doc }))

export function listDoctors () {
  return doctors
}

export function addDoctor (name, specialty) {
  const nextId = doctors.length ? Math.max(...doctors.map(d => d.id)) + 1 : 1
  const newDoctor = { id: nextId, name, specialty }
  doctors.push(newDoctor)
  return newDoctor
}

export function resetDoctors () {
  doctors.splice(0, doctors.length, ...baseDoctors.map(doc => ({ ...doc })))
}
