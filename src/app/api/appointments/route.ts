import { getRemovedIds, isRecordRemoved } from '@/lib/records/removal'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { appointmentInput } from '@/lib/appointments/validation'
export async function POST(request:Request){
 if(!await getServerSession(authOptions))return NextResponse.json({error:'Please sign in to schedule an appointment.'},{status:401})
 let body;try{body=await request.json()}catch{return NextResponse.json({error:'Invalid request.'},{status:400})}
 const parsed=appointmentInput.safeParse(body);if(!parsed.success)return NextResponse.json({error:parsed.error.issues[0].message},{status:400})
 try{
 const {petId,veterinarianId,date,time,reason,notes}=parsed.data
 const [pet,doctor]=await Promise.all([prisma.pet.findUnique({where:{id:petId},select:{id:true}}),prisma.staff.findFirst({where:{id:veterinarianId,isActive:true,user:{role:'VETERINARIAN'}},select:{id:true}})])
 if(!pet||await isRecordRemoved('patients',petId))return NextResponse.json({error:'Select an existing patient.'},{status:400})
 if(!doctor)return NextResponse.json({error:'Select an active veterinarian.'},{status:400})
 const appointment=await prisma.appointment.create({data:{petId,veterinarianId,date:new Date(date+'T00:00:00Z'),time,reason:reason||null,notes:notes||null,status:'SCHEDULED'}})
 return NextResponse.json(appointment,{status:201})
 }catch(error){console.error('Appointment scheduling failed',error);return NextResponse.json({error:'Unable to schedule the appointment. Please try again.'},{status:500})}
}
export async function GET(){
 if(!await getServerSession(authOptions))return NextResponse.json({error:'Please sign in to view appointments.'},{status:401})
 try{const removed=await getRemovedIds('appointments');return NextResponse.json(await prisma.appointment.findMany({where:{id:{notIn:removed}},include:{pet:true,veterinarian:true},orderBy:{date:'desc'}}))}catch(error){console.error('Appointment read failed',error);return NextResponse.json({error:'Unable to load appointments.'},{status:500})}
}
