import { prisma } from '@/lib/db/prisma'
import { formatPatientAge } from '@/lib/patients/age'
import { reportTypes, type ReportType, type ReportResult } from './types'
const day=(date:Date|null)=>date?.toISOString().slice(0,10)??''
const ownerName=(owner:{firstName:string;lastName:string})=>owner.firstName+' '+owner.lastName
const limit=10001
export async function generateReport(type:ReportType, from?:string, to?:string):Promise<ReportResult>{
 const range={...(from?{gte:new Date(from+'T00:00:00Z')}:{}),...(to?{lt:new Date(new Date(to+'T00:00:00Z').getTime()+86400000)}:{})}
 const created={createdAt:range}
 const result:ReportResult={title:reportTypes[type],dateBasis:'Registration / creation date',columns:[],rows:[]}
 switch(type){
 case 'patients':{
 const records=await prisma.pet.findMany({where:created,include:{owner:true},orderBy:{createdAt:'desc'},take:limit})
 result.columns=['Patient','Species','Breed','Age','Date of birth','Gender','Weight (kg)','Owner','Owner phone','Registered']
 result.rows=records.map(p=>[p.name,p.species,p.breed??'',formatPatientAge(day(p.dateOfBirth)||null,p.age),day(p.dateOfBirth),p.gender,p.weight,ownerName(p.owner),p.owner.phone,day(p.createdAt)]);break}
 case 'owners':{
 const records=await prisma.owner.findMany({where:created,include:{_count:{select:{pets:true}}},orderBy:{createdAt:'desc'},take:limit})
 result.columns=['Owner','Phone','Email','Address','Emergency contact','Emergency phone','Patients','Registered']
 result.rows=records.map(o=>[ownerName(o),o.phone,o.email??'',o.address??'',o.emergencyContact??'',o.emergencyPhone??'',o._count.pets,day(o.createdAt)]);break}
 case 'appointments':{
 const records=await prisma.appointment.findMany({where:{date:range},include:{pet:{include:{owner:true}},veterinarian:true},orderBy:{date:'desc'},take:limit})
 result.dateBasis='Appointment date';result.columns=['Date','Time','Patient','Owner','Doctor','Status','Reason']
 result.rows=records.map(a=>[day(a.date),a.time,a.pet.name,ownerName(a.pet.owner),a.veterinarian.name,a.status,a.reason??'']);break}
 case 'doctors':case 'staff':{
 const records=await prisma.staff.findMany({where:{...created,...(type==='doctors'?{user:{role:'VETERINARIAN' as const}}:{})},select:{name:true,phone:true,specialty:true,department:true,isActive:true,createdAt:true,user:{select:{email:true,role:true}}},orderBy:{name:'asc'},take:limit})
 result.columns=['Name','Role','Email','Phone','Specialty','Department','Status','Registered']
 result.rows=records.map(s=>[s.name,s.user.role,s.user.email,s.phone??'',s.specialty??'',s.department??'',s.isActive?'Active':'Inactive',day(s.createdAt)]);break}
 case 'procedures':{
 const records=await prisma.petProcedure.findMany({where:{date:range},include:{pet:{include:{owner:true}}},orderBy:{date:'desc'},take:limit})
 result.dateBasis='Procedure date';result.columns=['Date','Procedure','Category','Patient','Owner','Performed by','Status','Fee']
 result.rows=records.map(p=>[day(p.date),p.name,p.category,p.pet.name,ownerName(p.pet.owner),p.performedBy??'',p.status,p.fee?.toFixed(2)??'']);break}
 case 'charges':{
 const [procedures,grooming]=await Promise.all([prisma.petProcedure.findMany({where:{date:range,fee:{not:null}},include:{pet:{include:{owner:true}}},orderBy:{date:'desc'},take:limit}),prisma.grooming.findMany({where:{date:range,price:{not:null}},include:{pet:{include:{owner:true}}},orderBy:{date:'desc'},take:limit})])
 result.dateBasis='Service date';result.columns=['Date','Service','Patient','Owner','Status','Recorded fee']
 result.rows=[...procedures.map(p=>[day(p.date),p.name,p.pet.name,ownerName(p.pet.owner),p.status,p.fee!.toFixed(2)]),...grooming.map(g=>[day(g.date),g.serviceType,g.pet.name,ownerName(g.pet.owner),g.status,g.price!.toFixed(2)])].sort((a,b)=>String(b[0]).localeCompare(String(a[0])))
 result.note='Recorded fees are service charges, not confirmed payments or revenue. Currency is not configured in this app.';break}
 case 'payments':result.dateBasis='Payment date';result.columns=['Date','Patient','Owner','Amount','Method','Status'];result.note='Payment transactions are not stored in this app yet. No payment totals can be generated. Use Service charges to review recorded procedure and grooming fees.';break
 case 'inventory':{
 const records=await prisma.inventoryItem.findMany({where:created,orderBy:{name:'asc'},take:limit})
 result.columns=['Item','Category','Brand','Quantity','Unit','Unit price','Stock value','Reorder level','Stock status','Expiry date','Created']
 result.rows=records.map(i=>[i.name,i.category,i.brand??'',i.quantity,i.unit,i.price?.toFixed(2)??'',i.price?.mul(i.quantity).toFixed(2)??'',i.reorderLevel,i.quantity===0?'Out of stock':i.quantity<=i.reorderLevel?'Low stock':'In stock',day(i.expiryDate),day(i.createdAt)])
 result.note='Current inventory snapshot, filtered by item creation date. Stock value uses current quantity and price; it is not historical stock movement.';break}
 case 'medical':{
 const records=await prisma.medicalRecord.findMany({where:{visitDate:range},include:{pet:{include:{owner:true}},veterinarian:true},orderBy:{visitDate:'desc'},take:limit})
 result.dateBasis='Visit date';result.columns=['Visit date','Patient','Owner','Doctor','Diagnosis','Treatment','Prescription']
 result.rows=records.map(r=>[day(r.visitDate),r.pet.name,ownerName(r.pet.owner),r.veterinarian.name,r.diagnosis,r.treatment??'',r.prescription??'']);break}
 case 'vaccinations':{
 const records=await prisma.vaccination.findMany({where:{dateAdministered:range},include:{pet:{include:{owner:true}},veterinarian:true},orderBy:{dateAdministered:'desc'},take:limit})
 result.dateBasis='Administration date';result.columns=['Date','Patient','Owner','Doctor','Vaccine','Type','Next due']
 result.rows=records.map(v=>[day(v.dateAdministered),v.pet.name,ownerName(v.pet.owner),v.veterinarian.name,v.vaccineName,v.vaccineType,day(v.nextDueDate)]);break}
 }
 result.truncated=result.rows.length>10000;result.rows=result.rows.slice(0,10000)
 return result
}
