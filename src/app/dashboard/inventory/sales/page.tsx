import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { Card, CardContent } from '@/components/ui/card'
export const dynamic='force-dynamic'
export default async function SalesPage(){if(!await getServerSession(authOptions))redirect('/login');const sales=await prisma.$queryRaw<{id:string;billNumber:string;total:unknown;paid:unknown;createdAt:Date}[]>`SELECT id,billNumber,total,paid,createdAt FROM InventorySale ORDER BY createdAt DESC LIMIT 500`;return <div className="space-y-6"><div className="flex justify-between"><h1>Inventory sales &amp; bills</h1><Link href="/dashboard/inventory/sell" className="ui-button primary md">New sale</Link></div><Card><CardContent><p className="text-xs text-slate-500 mb-4">Latest 500 sales · amounts in PKR</p>{sales.length?<div className="overflow-x-auto"><table><thead><tr>{['Bill','Date','Total','Paid','Balance',''].map((h,i)=><th key={i} className="text-left">{h}</th>)}</tr></thead><tbody>{sales.map(s=><tr key={s.id}><td>{s.billNumber}</td><td>{s.createdAt.toLocaleString('en-PK',{timeZone:'Asia/Karachi'})}</td><td>{Number(s.total).toFixed(2)}</td><td>{Number(s.paid).toFixed(2)}</td><td>{(Number(s.total)-Number(s.paid)).toFixed(2)}</td><td><Link href={'/dashboard/inventory/sales/'+s.id} className="text-teal-700">View / print bill</Link></td></tr>)}</tbody></table></div>:<p>No sales yet.</p>}</CardContent></Card></div>}
