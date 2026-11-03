import { Prisma, type PrismaClient } from '@prisma/client'
import { prisma } from '@/lib/db/prisma'
export const removableKinds=['patients','appointments','inventory','medical-records'] as const
export type RemovableKind=(typeof removableKinds)[number]
type Reader=Pick<Prisma.TransactionClient,'$queryRaw'>
export async function getRemovedIds(kind:RemovableKind,db:Reader=prisma):Promise<string[]>{const rows=await db.$queryRaw<{recordId:string}[]>`SELECT recordId FROM RemovedRecord WHERE kind=${kind}`;return rows.map(row=>row.recordId)}
export async function isRecordRemoved(kind:RemovableKind,id:string,db:Reader=prisma):Promise<boolean>{const rows=await db.$queryRaw<{recordId:string}[]>`SELECT recordId FROM RemovedRecord WHERE kind=${kind} AND recordId=${id}`;return rows.length>0}
export async function removeRecord(kind:RemovableKind,id:string,removedBy:string,db:PrismaClient=prisma){
 return db.$transaction(async tx=>{
 const table={patients:'Pet',appointments:'Appointment',inventory:'InventoryItem','medical-records':'Appointment'}[kind]
 const target=kind==='medical-records'?id.replace(/^attendance-/,''):id
 if(kind==='medical-records'&&!id.startsWith('attendance-'))throw Error('NOT_FOUND')
 const rows=await tx.$queryRaw<{id:string;status?:string}[]>(Prisma.sql`SELECT id ${kind==='medical-records'?Prisma.sql`,status`:Prisma.empty} FROM ${Prisma.raw(table)} WHERE id=${target} FOR UPDATE`)
 if(!rows.length||(kind==='medical-records'&&rows[0].status!=='COMPLETED'))throw Error('NOT_FOUND')
 await tx.$executeRaw`INSERT IGNORE INTO RemovedRecord (kind,recordId,removedBy,removedAt) VALUES (${kind},${id},${removedBy},NOW(3))`
 })
}
