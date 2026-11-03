import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth/auth'
import { getTeam } from '@/lib/staff/store'
import { UserManager } from '@/components/staff/user-manager'
export const dynamic='force-dynamic'
export default async function DoctorsPage(){const session=await getServerSession(authOptions);if(!session)redirect('/login');return <UserManager initialUsers={await getTeam()} isAdmin={session.user.role==='ADMIN'}/>}
