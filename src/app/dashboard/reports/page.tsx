import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth/auth'
import { ReportManager } from '@/components/reports/report-manager'
export default async function ReportsPage(){if(!await getServerSession(authOptions))redirect('/login');return <ReportManager/>}
