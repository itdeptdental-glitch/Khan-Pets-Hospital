import { prisma } from '@/lib/db/prisma'
import { randomUUID } from 'node:crypto'
import type { z } from 'zod'
import { procedureInput } from './validation'
import type { ProcedureEntry } from './types'
type ProcedureRow = Omit<ProcedureEntry,'date'|'fee'> & {date:Date;fee:unknown}
export async function getProcedures():Promise<ProcedureEntry[]> {
 const rows=await prisma.$queryRaw<ProcedureRow[]>`SELECT p.id,p.petId,pet.name AS petName,pet.species,p.name,p.category,p.date,p.status,p.performedBy,p.fee,p.notes FROM PetProcedure p JOIN Pet pet ON pet.id=p.petId ORDER BY p.date DESC`
 return rows.map(row=>({...row,date:row.date.toISOString(),fee:row.fee===null?null:Number(row.fee)}))
}
export async function saveProcedure(input:z.infer<typeof procedureInput>,id?:string) {
 const pet=await prisma.pet.findUnique({where:{id:input.petId},select:{id:true}})
 if(!pet) return 'pet-missing'
 const {petId,name,category,date,status,performedBy,fee,notes}=input
 const when=new Date(date)
 if(id){
  const existing=await prisma.$queryRaw<{id:string}[]>`SELECT id FROM PetProcedure WHERE id=${id}`
  if(!existing.length) return 'missing'
  await prisma.$executeRaw`UPDATE PetProcedure SET petId=${petId},name=${name},category=${category},date=${when},status=${status},performedBy=${performedBy||null},fee=${fee},notes=${notes||null},updatedAt=NOW(3) WHERE id=${id}`
 } else {
  await prisma.$executeRaw`INSERT INTO PetProcedure (id,petId,name,category,date,status,performedBy,fee,notes,createdAt,updatedAt) VALUES (${randomUUID()},${petId},${name},${category},${when},${status},${performedBy||null},${fee},${notes||null},NOW(3),NOW(3))`
 }
 return 'saved'
}
