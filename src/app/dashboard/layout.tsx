import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth/auth'
import './dashboard-layout.css'
import { Navbar } from '@/components/ui/navbar'
import { Providers } from '@/components/providers'
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  if(!await getServerSession(authOptions))redirect('/login')
  return <Providers><div className="app-shell"><Navbar /><div className="workspace"><header className="workspace-topbar"><div><p className="text-sm font-semibold">Practice workspace</p><p className="text-xs text-slate-500">Khan Pets Hospital / Rahim Yar Khan</p></div><span className="text-xs text-teal-700 bg-teal-50 rounded-full px-3 py-1.5">Veterinary management</span></header><main id="main-content" className="workspace-main">{children}</main></div></div></Providers>
}
