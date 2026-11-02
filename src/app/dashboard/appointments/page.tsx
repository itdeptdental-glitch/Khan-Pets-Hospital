import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { AppointmentManager } from '@/components/appointments/appointment-manager'
export const dynamic='force-dynamic'
export default async function AppointmentsPage(){
 if(!await getServerSession(authOptions))redirect('/login')
 const [appointments,doctors,bills]=await Promise.all([prisma.appointment.findMany({include:{pet:{include:{owner:true}},veterinarian:true},orderBy:{date:'desc'}}),prisma.staff.findMany({where:{isActive:true,user:{role:'VETERINARIAN'}},select:{id:true,name:true},orderBy:{name:'asc'}}),prisma.$queryRaw<{appointmentId:string}[]>`SELECT appointmentId FROM AppointmentBill`])
 return <AppointmentManager appointments={appointments.map(a=>({hasBill:bills.some(b=>b.appointmentId===a.id),id:a.id,petName:a.pet.name,ownerName:a.pet.owner.firstName+' '+a.pet.owner.lastName,doctorName:a.veterinarian.name,veterinarianId:a.veterinarianId,date:a.date.toISOString().slice(0,10),time:a.time,status:a.status,reason:a.reason??'',notes:a.notes??''}))} doctors={doctors}/>
}
