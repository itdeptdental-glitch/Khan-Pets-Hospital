'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Patient {
  id: string
  name: string
  species: string
  owner?: {firstName:string;lastName:string;phone:string}
}

interface Doctor {
  id: string
  name: string
  specialty?: string
}

export default function NewAppointmentPage() {
  const router = useRouter()
  const [error,setError]=useState('')
 const [loading, setLoading] = useState(false)
  const [patientSearch,setPatientSearch]=useState('')
  const [patients, setPatients] = useState<Patient[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [formData, setFormData] = useState({
    petId: '',
    veterinarianId: '',
    date: '',
    time: '',
    reason: '',
    notes: '',
  })

  useEffect(() => {
    const fetchData = async () => {
    try {
      const [patientsRes, doctorsRes] = await Promise.all([
        fetch('/api/patients'),
        fetch('/api/doctors'),
      ])
      
      if(!patientsRes.ok||!doctorsRes.ok)throw new Error('Unable to load patients and doctors. Refresh the page and try again.')
      if (patientsRes.ok) {
        const patientsData = await patientsRes.json()
        setPatients(patientsData)
      }
      
      if (doctorsRes.ok) {
        const doctorsData = await doctorsRes.json()
        setDoctors(doctorsData.filter((doctor:{user?:{role?:string}})=>doctor.user?.role==='VETERINARIAN'))
      }
    } catch (error) {
      setError(error instanceof Error?error.message:'Unable to load patients and doctors.')
    }
  }

    void fetchData()
  }, [])

  const normalizedSearch=patientSearch.trim().toLowerCase()
  const matchingPatients=patients.filter(patient=>[patient.name,patient.owner?.firstName,patient.owner?.lastName,patient.owner?patient.owner.firstName+' '+patient.owner.lastName:''].some(value=>value?.toLowerCase().includes(normalizedSearch)))
  const selectedPatient=patients.find(patient=>patient.id===formData.petId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          date: formData.date,
        }),
      })

      if (response.ok) {
        router.push('/dashboard/appointments')
        router.refresh()
      } else {
        const result=await response.json()
        setError(result.error||'Failed to schedule appointment')
      }
    } catch { setError('Unable to reach the server. Please try again.')
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
        <h1 className="text-3xl font-bold text-slate-900">Schedule Appointment</h1>
        <p className="text-slate-600 mt-1">Book a new appointment for a patient</p>
      </div>

      <Card className="border-0 shadow-lg bg-white">
        <CardHeader className="border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Appointment Details</h3>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {error&&<p role="alert" className="rounded-lg bg-red-50 text-red-700 p-4 text-sm">{error}</p>}
            {/* Appointment Selection */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Appointment Selection</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="patient-search" className="block text-sm font-semibold text-slate-700 mb-2">Search patient or owner</label><input id="patient-search" type="search" value={patientSearch} onChange={event=>{setPatientSearch(event.target.value);setFormData(previous=>({...previous,petId:''}))}} placeholder="Type pet name or owner name…" className="mb-3 w-full" aria-describedby="patient-search-help"/><p id="patient-search-help" className="text-xs text-slate-500 mb-3">{matchingPatients.length} matching patients. Select the pet below to book their appointment.</p>
                  <label htmlFor="petId" className="block text-sm font-semibold text-slate-700 mb-2">Patient *
                  </label><select id="petId"
                    name="petId"
                    required
                    value={formData.petId}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                  >
                    <option value="">Select Patient</option>
                    {matchingPatients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.name} ({patient.species}){patient.owner?' — '+patient.owner.firstName+' '+patient.owner.lastName:''}
                      </option>
                    ))}
                  </select>
                  {selectedPatient&&<p className="text-xs text-teal-700 mt-3">Selected: {selectedPatient.name}{selectedPatient.owner?' · Owner: '+selectedPatient.owner.firstName+' '+selectedPatient.owner.lastName+' · '+selectedPatient.owner.phone:''}</p>}
                  {!matchingPatients.length&&<p className="text-xs text-amber-700 mt-3">No patient matches this name. Clear the search or try the owner’s name.</p>}
                </div>
                <div>
                  <label htmlFor="veterinarianId" className="block text-sm font-semibold text-slate-700 mb-2">Doctor *
                  </label><select id="veterinarianId"
                    name="veterinarianId"
                    required
                    value={formData.veterinarianId}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                  >
                    <option value="">Select Doctor</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        {doctor.name} {doctor.specialty && `(${doctor.specialty})`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Date and Time */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Date and Time</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="date" className="block text-sm font-semibold text-slate-700 mb-2">Date *
                  </label><input id="date"
                    type="date"
                    name="date"
                    required
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                  />
                </div>
                <div>
                  <label htmlFor="time" className="block text-sm font-semibold text-slate-700 mb-2">Time *
                  </label><input id="time"
                    type="time"
                    name="time"
                    required
                    value={formData.time}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Additional Information</h4>
              <div className="space-y-6">
                <div>
                  <label htmlFor="reason" className="block text-sm font-semibold text-slate-700 mb-2">Reason
                  </label><input id="reason"
                    type="text"
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    placeholder="Reason for appointment"
                    className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900 placeholder-slate-400"
                  />
                </div>
                <div>
                  <label htmlFor="notes" className="block text-sm font-semibold text-slate-700 mb-2">Notes
                  </label><textarea id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Additional notes or instructions"
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
                {loading ? 'Scheduling...' : 'Schedule Appointment'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}



