import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth/auth'
import { getMedicalHistory } from '@/lib/medical-records/store'
import { MedicalHistory } from '@/components/medical-records/medical-history'
export const dynamic='force-dynamic'
export default async function MedicalRecordsPage(){if(!await getServerSession(authOptions))redirect('/login');return <MedicalHistory visits={await getMedicalHistory()}/>}
