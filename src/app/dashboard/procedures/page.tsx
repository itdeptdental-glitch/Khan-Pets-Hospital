import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth/auth'
import { getProcedureServices } from '@/lib/procedures/services'
import { ProcedureManager } from '@/components/procedures/procedure-manager'
export const dynamic='force-dynamic'
export default async function ProceduresPage(){if(!await getServerSession(authOptions))redirect('/login');return <ProcedureManager initialItems={await getProcedureServices()}/>}
