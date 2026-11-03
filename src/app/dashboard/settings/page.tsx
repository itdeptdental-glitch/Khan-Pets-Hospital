import './settings.css'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { AccountSettings } from '@/components/account/account-settings'
export const dynamic='force-dynamic'
export default async function SettingsPage(){const session=await getServerSession(authOptions);if(!session)redirect('/login');const account=await prisma.user.findUnique({where:{id:session.user.id},select:{id:true,name:true,email:true,role:true,staffProfile:{select:{phone:true,department:true,specialty:true}}}});if(!account)redirect('/login');return <AccountSettings account={account}/>}
