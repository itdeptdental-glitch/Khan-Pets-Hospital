import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import { authOptions } from '@/lib/auth/auth'
import { getInventorySale } from '@/lib/inventory/sales'
import { AppointmentBillView } from '@/components/appointments/appointment-bill'
export const dynamic='force-dynamic'
export default async function SaleBill({params}:{params:Promise<{id:string}>}){if(!await getServerSession(authOptions))redirect('/login');const bill=await getInventorySale((await params).id);if(!bill)notFound();return <AppointmentBillView bill={bill}/>}
