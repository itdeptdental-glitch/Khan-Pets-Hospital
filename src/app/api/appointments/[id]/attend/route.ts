import { allocateBillNumber } from '@/lib/appointments/bill-number'
import { randomUUID } from 'node:crypto'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { attendanceInput } from '@/lib/appointments/validation'
import { getProcedureServices } from '@/lib/procedures/services'
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
 if(!await getServerSession(authOptions))return Response.json({error:'Please sign in.'},{status:401})
 let body;try{body=await request.json()}catch{return Response.json({error:'Invalid request.'},{status:400})}
 const parsed=attendanceInput.safeParse(body);if(!parsed.success)return Response.json({error:parsed.error.issues[0].message},{status:400})
 const {id}=await params;const input=parsed.data
 try{
 const services=await getProcedureServices()
 if(input.action==='attend'&&input.procedures.some(p=>!services.some(s=>s.name===p.name)))return Response.json({error:'A selected procedure has changed or was removed. Refresh the page and select it again.'},{status:400})
 const result=await prisma.$transaction(async tx=>{
 const appointment=await tx.appointment.findUnique({where:{id},include:{veterinarian:true,pet:{include:{owner:true}}}})
 if(!appointment)throw new Error('NOT_FOUND')
 if(input.action==='attend'){
 const attending=await tx.staff.findFirst({where:{id:input.veterinarianId,isActive:true,user:{role:'VETERINARIAN'}},select:{id:true,name:true}})
 if(!attending)throw new Error('DOCTOR_MISSING')
 const attendedAt=new Date()
 const billLines=[...input.procedures.map(p=>({...p,additional:false})),...input.extras.map(p=>({...p,additional:true}))]
 const subtotalCents=billLines.reduce((sum,p)=>sum+Math.round(p.fee!*100),0)
 const total=(subtotalCents-Math.round(input.discount*100))/100

 // Conditional update ensures simultaneous / repeated submissions cannot duplicate procedures.
 const claimed=await tx.appointment.updateMany({where:{id,status:{in:['SCHEDULED','CONFIRMED']}},data:{status:'COMPLETED',veterinarianId:attending.id,notes:[appointment.notes,input.notes].filter(Boolean).join('\n\n')||null}})
 if(!claimed.count)throw new Error('ALREADY_ATTENDED')
 await tx.petProcedure.createMany({data:billLines.map(p=>({petId:appointment.petId,name:p.name,category:p.additional?'Other':services.find(c=>c.name===p.name)!.category,date:attendedAt,status:'Completed',performedBy:attending.name,fee:p.fee,notes:['Appointment: '+id,input.notes].filter(Boolean).join('\n')}))})
 const billId=randomUUID()
 const billNumber=await allocateBillNumber(tx,attendedAt)
 const snapshot=JSON.stringify({petName:appointment.pet.name,registeredAt:appointment.pet.createdAt.toISOString(),species:appointment.pet.species,breed:appointment.pet.breed,ownerName:appointment.pet.owner.firstName+' '+appointment.pet.owner.lastName,ownerPhone:appointment.pet.owner.phone,doctorName:attending.name,scheduledDate:appointment.date.toISOString().slice(0,10),scheduledTime:appointment.time,attendedAt:attendedAt.toISOString(),procedures:billLines,subtotal:subtotalCents/100,discount:input.discount,notes:input.notes})
 await tx.$executeRaw`INSERT INTO AppointmentBill (id,billNumber,appointmentId,snapshot,total,paid,method,reference,createdAt) VALUES (${billId},${billNumber},${id},${snapshot},${total},${input.payment.paid},${input.payment.paid>0?input.payment.method??null:null},${input.payment.reference||null},${attendedAt})`
 }
 let nextId:string|undefined
 if(input.next){
 const next=input.next
 const doctor=await tx.staff.findFirst({where:{id:next.veterinarianId,isActive:true,user:{role:'VETERINARIAN'}},select:{id:true}})
 if(!doctor)throw new Error('DOCTOR_MISSING')
 if(await tx.appointment.findFirst({where:{petId:appointment.petId,date:new Date(next.date+'T00:00:00Z'),time:next.time,status:{in:['SCHEDULED','CONFIRMED']}}}))throw new Error('DUPLICATE_NEXT')
 const followup=await tx.appointment.create({data:{petId:appointment.petId,veterinarianId:doctor.id,date:new Date(next.date+'T00:00:00Z'),time:next.time,reason:next.reason,notes:'Follow-up to appointment: '+id,status:'SCHEDULED'}});nextId=followup.id
 }
 return {ok:true,nextId}
 })
 return Response.json(result)
 }catch(error){const message=error instanceof Error?error.message:'';const errors:Record<string,[number,string]>={NOT_FOUND:[404,'Appointment not found.'],ALREADY_ATTENDED:[409,'This appointment has already been attended or is no longer active.'],DOCTOR_MISSING:[400,'Select an active doctor.'],DUPLICATE_NEXT:[409,'This patient already has an appointment at that date and time.']};if(errors[message]){const [status,error]=errors[message];return Response.json({error},{status})}console.error('Attendance failed',error);return Response.json({error:'Unable to save attendance. No changes were saved.'},{status:500})}
}
