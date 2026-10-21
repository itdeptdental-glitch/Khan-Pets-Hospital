'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Patient {
  id: string
  firstName: string
  lastName: string
}

interface Doctor {
  id: string
  name: string
}

export default function NewMedicalRecordPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [patients, setPatients] = useState<Patient[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    diagnosis: '',
    symptoms: '',
    treatment: '',
    prescription: '',
    notes: '',
  })

  useEffect(() => {
    const fetchData = async () => {
    try {
      const [patientsRes, doctorsRes] = await Promise.all([
        fetch('/api/patients'),
        fetch('/api/doctors'),
      ])
      
      if (patientsRes.ok) {
        const patientsData = await patientsRes.json()
        setPatients(patientsData)
      }
      
      if (doctorsRes.ok) {
        const doctorsData = await doctorsRes.json()
        setDoctors(doctorsData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

    void fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/medical-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push('/dashboard/medical-records')
      } else {
        alert('Failed to add medical record')
      }
    } catch { alert('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Add Medical Record</h1>
        <p className="text-slate-600 mt-1">Document a patient&apos;s medical visit</p>
      </div>

      <Card className="border-0 shadow-lg bg-white">
        <CardHeader className="border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Medical Record Details</h3>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Selection */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Selection</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="patientId" className="block text-sm font-semibold text-slate-700 mb-2">Patient *
                  </label><select id="patientId"
                    name="patientId"
                    required
                    value={formData.patientId}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                  >
                    <option value="">Select Patient</option>
                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.firstName} {patient.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="doctorId" className="block text-sm font-semibold text-slate-700 mb-2">Doctor *
                  </label><select id="doctorId"
                    name="doctorId"
                    required
                    value={formData.doctorId}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                  >
                    <option value="">Select Doctor</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        {doctor.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Medical Information */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Medical Information</h4>
              <div className="space-y-6">
                <div>
                  <label htmlFor="diagnosis" className="block text-sm font-semibold text-slate-700 mb-2">Diagnosis *
                  </label><textarea id="diagnosis"
                    name="diagnosis"
                    required
                    value={formData.diagnosis}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Enter diagnosis"
                    className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900 placeholder-slate-400 resize-none"
                  />
                </div>
                <div>
                  <label htmlFor="symptoms" className="block text-sm font-semibold text-slate-700 mb-2">Symptoms
                  </label><textarea id="symptoms"
                    name="symptoms"
                    value={formData.symptoms}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Describe symptoms"
                    className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900 placeholder-slate-400 resize-none"
                  />
                </div>
                <div>
                  <label htmlFor="treatment" className="block text-sm font-semibold text-slate-700 mb-2">Treatment
                  </label><textarea id="treatment"
                    name="treatment"
                    value={formData.treatment}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Describe treatment plan"
                    className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900 placeholder-slate-400 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Prescription and Notes */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Prescription & Notes</h4>
              <div className="space-y-6">
                <div>
                  <label htmlFor="prescription" className="block text-sm font-semibold text-slate-700 mb-2">Prescription
                  </label><textarea id="prescription"
                    name="prescription"
                    value={formData.prescription}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Enter prescription details"
                    className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900 placeholder-slate-400 resize-none"
                  />
                </div>
                <div>
                  <label htmlFor="notes" className="block text-sm font-semibold text-slate-700 mb-2">Notes
                  </label><textarea id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Additional notes"
                    className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900 placeholder-slate-400 resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.back()}
                className="px-6 py-3"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {loading ? 'Adding...' : 'Add Medical Record'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}



