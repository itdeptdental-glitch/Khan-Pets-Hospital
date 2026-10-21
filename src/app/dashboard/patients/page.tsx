import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth/auth'
import { getPatientData } from '@/lib/patients/store'
import { PatientManager } from '@/components/patients/patient-manager'
export const dynamic='force-dynamic'
export default async function PatientsPage(){if(!await getServerSession(authOptions))redirect('/login');return <PatientManager initialData={await getPatientData()}/>}

