import { prisma } from '@/lib/db/prisma'
export type BillSnapshot={demo?:boolean;kind?:'sale';saleItems?:{id:string;name:string;quantity:number;unit:string;unitPrice:number;total:number}[];subtotal?:number;discount?:number;registeredAt?:string;petName:string;species:string;breed:string|null;ownerName:string;ownerPhone:string;doctorName:string;scheduledDate:string;scheduledTime:string;attendedAt:string;procedures:{name:string;fee:number;additional?:boolean}[];notes:string}
export type Bill={billNumber:string|null;id:string;appointmentId:string;snapshot:BillSnapshot;total:number;paid:number;method:string|null;reference:string|null;createdAt:string}
export async function getBill(appointmentId:string):Promise<Bill|null>{
 const rows=await prisma.$queryRaw<{billNumber:string|null;id:string;appointmentId:string;snapshot:BillSnapshot|string;total:unknown;paid:unknown;method:string|null;reference:string|null;createdAt:Date}[]>`SELECT * FROM AppointmentBill WHERE appointmentId=${appointmentId}`
 const row=rows[0];if(!row)return null
 const snapshot:BillSnapshot=typeof row.snapshot==='string'?JSON.parse(row.snapshot):row.snapshot
 if(!snapshot.registeredAt){const appointment=await prisma.appointment.findUnique({where:{id:appointmentId},select:{pet:{select:{createdAt:true}}}});snapshot.registeredAt=appointment?.pet.createdAt.toISOString()}
 return {...row,snapshot,total:Number(row.total),paid:Number(row.paid),createdAt:row.createdAt.toISOString()}
}
