'use client'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Brand } from './brand'
import { Icon } from './icon'
const navigation = [
 {name:'Overview',href:'/dashboard',icon:'dashboard'},
 {name:'Patients',href:'/dashboard/patients',icon:'patients'},
 {name:'Appointments',href:'/dashboard/appointments',icon:'appointments'},
 {name:'Doctors & staff',href:'/dashboard/doctors',icon:'doctors'},
 {name:'Procedures',href:'/dashboard/procedures',icon:'procedures'},
 {name:'Inventory',href:'/dashboard/inventory',icon:'inventory'},
 {name:'Medical records',href:'/dashboard/medical-records',icon:'records'},
]
export function Navbar() {
 const pathname = usePathname()
 const {data:session} = useSession()
 return <aside className="sidebar"><Link href="/dashboard" aria-label="Khan Pets Hospital overview"><Brand/></Link><p className="nav-caption">Practice management</p><nav aria-label="Main navigation">{navigation.map(item=>{const active=item.href==='/dashboard'?pathname===item.href:pathname.startsWith(item.href);return <Link key={item.href} href={item.href} aria-current={active?'page':undefined} className={`nav-link ${active?'active':''}`}><Icon name={item.icon}/>{item.name}</Link>})}</nav><div className="sidebar-bottom"><div className="flex items-center gap-3 mb-4"><span className="user-avatar">{(session?.user?.name || session?.user?.email || 'U')[0].toUpperCase()}</span><div className="min-w-0"><p className="text-xs text-white truncate">{session?.user?.name || 'Team member'}</p><p className="text-[10px] truncate">{session?.user?.email}</p></div></div><button onClick={()=>signOut({callbackUrl:'/login'})} className="text-xs hover:text-white">Sign out &rarr;</button></div><button className="mobile-signout" onClick={()=>signOut({callbackUrl:'/login'})}>Sign out</button></aside>
}


