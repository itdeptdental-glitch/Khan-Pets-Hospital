import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth/auth'
import { getPatientData } from '@/lib/patients/store'
import { PatientManager } from '@/components/patients/patient-manager'
export const dynamic='force-dynamic'
export default async function NewPatientPage(){const session=await getServerSession(authOptions);if(!session)redirect('/login');return <PatientManager canLoadDemo={(session.user as {role?:string})?.role==='ADMIN'} initialData={await getPatientData()} newPatient/>}

