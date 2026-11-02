import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import { authOptions } from '@/lib/auth/auth'
import { getBill } from '@/lib/appointments/bills'
import { AppointmentBillView } from '@/components/appointments/appointment-bill'
export const dynamic='force-dynamic'
export default async function BillPage({params}:{params:Promise<{id:string}>}){if(!await getServerSession(authOptions))redirect('/login');const {id}=await params;const bill=await getBill(id);if(!bill)notFound();return <AppointmentBillView bill={bill}/>}
