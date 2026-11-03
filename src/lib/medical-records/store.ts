import { getRemovedIds } from '@/lib/records/removal'
import { prisma } from '@/lib/db/prisma'
import type { BillSnapshot } from '@/lib/appointments/bills'
import type { MedicalVisit } from './types'
export async function getMedicalHistory():Promise<MedicalVisit[]>{
 const removed=new Set(await getRemovedIds('medical-records'))
 const [appointments,bills]=await Promise.all([
 prisma.appointment.findMany({where:{status:'COMPLETED'},include:{pet:{include:{owner:true}},veterinarian:true},orderBy:{date:'desc'}}),
 prisma.$queryRaw<{appointmentId:string;billNumber:string|null;snapshot:string|BillSnapshot;total:unknown;paid:unknown;method:string|null;reference:string|null;createdAt:Date}[]>`SELECT appointmentId,billNumber,snapshot,total,paid,method,reference,createdAt FROM AppointmentBill`
 ])
 const billMap=new Map(bills.map(b=>[b.appointmentId,b]))
 const profile=(pet:(typeof appointments)[number]['pet'])=>({petId:pet.id,petName:pet.name,species:pet.species,breed:pet.breed??'',gender:pet.gender,age:pet.age,weight:pet.weight,birthDate:pet.dateOfBirth?.toISOString().slice(0,10)??null,registeredAt:pet.createdAt.toISOString(),allergies:pet.allergies??'',ownerName:pet.owner.firstName+' '+pet.owner.lastName,ownerPhone:pet.owner.phone,ownerEmail:pet.owner.email??''})
 const attended:MedicalVisit[]=appointments.map(a=>{
 const bill=billMap.get(a.id);const snapshot=bill?(typeof bill.snapshot==='string'?JSON.parse(bill.snapshot):bill.snapshot) as BillSnapshot:null
 return {id:'attendance-'+a.id,kind:'attendance',...profile(a.pet),doctor:snapshot?.doctorName??a.veterinarian.name,visitDate:snapshot?.attendedAt??bill?.createdAt.toISOString()??a.date.toISOString(),reason:a.reason??'Attended appointment',notes:snapshot?.notes||a.notes||'',demo:Boolean(snapshot?.demo),procedures:snapshot?.procedures??[],bill:bill?{number:bill.billNumber??'Unnumbered',url:'/dashboard/appointments/'+a.id+'/bill',subtotal:snapshot?.subtotal??Number(bill.total)+(snapshot?.discount??0),discount:snapshot?.discount??0,total:Number(bill.total),paid:Number(bill.paid),method:bill.method??'Not recorded',reference:bill.reference??''}:null}
 })
 return attended.filter(visit=>!removed.has(visit.id)).sort((a,b)=>b.visitDate.localeCompare(a.visitDate))
}
