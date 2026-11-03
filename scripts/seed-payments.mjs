import { PrismaClient } from '@prisma/client';
import { databaseUrl } from './database.mjs';
databaseUrl();
const prisma=new PrismaClient();
const note='DEMO PAYMENT — fictional transaction for demonstration; no money was received.';
const cases=[{subtotal:1500,discount:0,paid:1500,days:0,method:'Cash'},{subtotal:2500,discount:250,paid:1250,days:0,method:'Card'},{subtotal:1000,discount:0,paid:0,days:0,method:null},{subtotal:3200,discount:0,paid:3200,days:1,method:'Bank transfer'},{subtotal:1800,discount:0,paid:800,days:3,method:'Cash'},{subtotal:2800,discount:200,paid:2600,days:7,method:'Card'}];
const dateKey=date=>{const parts=new Intl.DateTimeFormat('en',{timeZone:'Asia/Karachi',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date);return ['year','month','day'].map(type=>parts.find(part=>part.type===type).value).join('-')};
try{
 const doctor=await prisma.staff.findFirst({where:{isActive:true,user:{role:'VETERINARIAN'}},orderBy:{id:'asc'}});
 if(!doctor)throw Error('Add an active veterinarian before loading demo payments.');
 let pets=await prisma.pet.findMany({where:{notes:{contains:'Fictional demo patient'}},include:{owner:true},orderBy:{id:'asc'},take:6});
 if(!pets.length)pets=await prisma.pet.findMany({include:{owner:true},orderBy:{id:'asc'},take:6});
 if(!pets.length)throw Error('Register a patient before loading demo payments.');
 const now=new Date(),today=dateKey(now),midnight=new Date(today+'T00:00:00+05:00');let added=0;
 for(const [index,entry] of cases.entries()){
 const id='demo-payment-v1-'+String(index+1).padStart(2,'0');const pet=pets[index%pets.length];
 await prisma.$transaction(async tx=>{
 const existing=await tx.$queryRaw`SELECT id FROM AppointmentBill WHERE id=${id}`;if(existing.length)return;
 const attendedAt=entry.days?new Date(midnight.getTime()-entry.days*86400000+10*3600000):new Date(Math.max(midnight.getTime(),now.getTime()-(index+1)*20*60000));
 const day=dateKey(attendedAt),time=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Karachi',hour:'2-digit',minute:'2-digit',hour12:false}).format(attendedAt);
 if(await tx.appointment.findUnique({where:{id},select:{id:true}}))throw Error('Demo appointment ID already exists; existing records were preserved.');
 await tx.appointment.create({data:{id,petId:pet.id,veterinarianId:doctor.id,date:new Date(day+'T00:00:00Z'),time,status:'COMPLETED',reason:'DEMO — sample consultation payment',notes:note,createdAt:attendedAt}});
 await tx.petProcedure.create({data:{id:id+'-procedure',petId:pet.id,name:'DEMO consultation and care',category:'Wellness',date:attendedAt,status:'Completed',performedBy:doctor.name,fee:entry.subtotal,notes:note+' Appointment: '+id,createdAt:attendedAt}});
 await tx.$executeRaw`INSERT INTO BillingSequence () VALUES ()`;const [seq]=await tx.$queryRaw`SELECT LAST_INSERT_ID() AS number`;
 const billNumber='DEMO-KPH-'+day.slice(0,4)+'-'+String(seq.number).padStart(6,'0');const total=entry.subtotal-entry.discount;
 const snapshot=JSON.stringify({demo:true,petName:pet.name,species:pet.species,breed:pet.breed,registeredAt:pet.createdAt.toISOString(),ownerName:pet.owner.firstName+' '+pet.owner.lastName,ownerPhone:pet.owner.phone,doctorName:doctor.name,scheduledDate:day,scheduledTime:time,attendedAt:attendedAt.toISOString(),procedures:[{name:'DEMO consultation and care',fee:entry.subtotal}],subtotal:entry.subtotal,discount:entry.discount,notes:note});
 await tx.$executeRaw`INSERT INTO AppointmentBill (id,appointmentId,billNumber,snapshot,total,paid,method,reference,createdAt) VALUES (${id},${id},${billNumber},${snapshot},${total},${entry.paid},${entry.method},'DEMO — not a real payment',${attendedAt})`;added++;
 });
 }
 console.log('Added '+added+' clearly marked demo payment bills for existing patients. Existing payments were preserved.');
 const [totals]=await prisma.$queryRaw`SELECT COUNT(*) AS count,SUM(total) AS billed,SUM(paid) AS paid,SUM(total-paid) AS balance FROM AppointmentBill WHERE id LIKE 'demo-payment-v1-%'`;
 console.log('Demo totals: '+totals.count+' bills; PKR '+totals.billed+' billed; PKR '+totals.paid+' sample collections; PKR '+totals.balance+' sample balance.');
}finally{await prisma.$disconnect()}
