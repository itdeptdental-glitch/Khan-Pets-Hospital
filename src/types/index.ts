export interface Patient {
  id: string
  firstName: string
  lastName: string
  dateOfBirth: Date
  gender: string
  phone: string
  email?: string
  address?: string
  emergencyContact?: string
  emergencyPhone?: string
  bloodType?: string
  allergies?: string
  createdAt: Date
  updatedAt: Date
}

export interface Staff {
  id: string
  userId: string
  name: string
  specialty?: string
  phone?: string
  department?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Appointment {
  id: string
  patientId: string
  doctorId: string
  date: Date
  time: string
  status: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  reason?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface MedicalRecord {
  id: string
  patientId: string
  doctorId: string
  diagnosis: string
  symptoms?: string
  treatment?: string
  prescription?: string
  notes?: string
  visitDate: Date
  createdAt: Date
  updatedAt: Date
}
