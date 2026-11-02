import { prisma } from '@/lib/db/prisma'
export type BillSnapshot={petName:string;species:string;breed:string|null;ownerName:string;ownerPhone:string;doctorName:string;scheduledDate:string;scheduledTime:string;attendedAt:string;procedures:{name:string;fee:number}[];notes:string}
export type Bill={id:string;appointmentId:string;snapshot:BillSnapshot;total:number;paid:number;method:string|null;reference:string|null;createdAt:string}
export async function getBill(appointmentId:string):Promise<Bill|null>{
 const rows=await prisma.$queryRaw<{id:string;appointmentId:string;snapshot:BillSnapshot|string;total:unknown;paid:unknown;method:string|null;reference:string|null;createdAt:Date}[]>`SELECT * FROM AppointmentBill WHERE appointmentId=${appointmentId}`
 const row=rows[0];return row?{...row,snapshot:typeof row.snapshot==='string'?JSON.parse(row.snapshot):row.snapshot,total:Number(row.total),paid:Number(row.paid),createdAt:row.createdAt.toISOString()}:null
}
