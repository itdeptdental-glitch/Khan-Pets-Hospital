import { connection } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getProcedures } from '@/lib/procedures/store'
import { ProcedureManager } from '@/components/procedures/procedure-manager'
export const dynamic='force-dynamic'
export default async function ProceduresPage() {
  await connection()
 const [items,pets,staff]=await Promise.all([getProcedures(),prisma.pet.findMany({select:{id:true,name:true,species:true,owner:{select:{firstName:true,lastName:true}}},orderBy:{name:'asc'}}),prisma.staff.findMany({where:{isActive:true},select:{name:true},orderBy:{name:'asc'}})])
 return <ProcedureManager initialItems={items} pets={pets} staff={staff.map(person=>person.name)}/>
}
