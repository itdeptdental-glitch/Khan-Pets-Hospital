import { getRemovedIds } from '@/lib/records/removal'
import { getProcedureServices } from '@/lib/procedures/services'
import { pakistanToday } from '@/lib/appointments/filters'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { AppointmentManager } from '@/components/appointments/appointment-manager'
export const dynamic='force-dynamic'
export default async function AppointmentsPage({searchParams}:{searchParams:Promise<{date?:string}>}){
 if(!await getServerSession(authOptions))redirect('/login')
 const params=await searchParams
 const searchDate=params.date&&/^\d{4}-\d{2}-\d{2}$/.test(params.date)?params.date:''
 const removed=await getRemovedIds('appointments')
 const [appointments,doctors,bills,services]=await Promise.all([prisma.appointment.findMany({where:{id:{notIn:removed}},include:{pet:{include:{owner:true}},veterinarian:true},orderBy:{date:'desc'}}),prisma.staff.findMany({where:{isActive:true,user:{role:'VETERINARIAN'}},select:{id:true,name:true},orderBy:{name:'asc'}}),prisma.$queryRaw<{appointmentId:string}[]>`SELECT appointmentId FROM AppointmentBill`,getProcedureServices()])
 return <AppointmentManager initialSearchDate={searchDate} services={services} initialToday={pakistanToday()} appointments={appointments.map(a=>({hasBill:bills.some(b=>b.appointmentId===a.id),id:a.id,petName:a.pet.name,registeredAt:a.pet.createdAt.toISOString(),ownerName:a.pet.owner.firstName+' '+a.pet.owner.lastName,doctorName:a.veterinarian.name,veterinarianId:a.veterinarianId,date:a.date.toISOString().slice(0,10),time:a.time,status:a.status,reason:a.reason??'',notes:a.notes??''}))} doctors={doctors}/>
}
