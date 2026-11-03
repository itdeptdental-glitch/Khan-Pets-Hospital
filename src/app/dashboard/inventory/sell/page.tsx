import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { getInventory } from '@/lib/inventory/store'
import { InventorySaleForm } from '@/components/inventory/sale-form'
export const dynamic='force-dynamic'
export default async function SellPage({searchParams}:{searchParams:Promise<{item?:string}>}){if(!await getServerSession(authOptions))redirect('/login');const [items,patients,params]=await Promise.all([getInventory(),prisma.pet.findMany({select:{id:true,name:true,species:true,owner:{select:{firstName:true,lastName:true,phone:true}}},orderBy:{name:'asc'}}),searchParams]);return <InventorySaleForm items={items} patients={patients} initialItemId={params.item??''}/>}
