import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth/auth'
import { getPaymentCounter, type PaymentFilters } from '@/lib/payments/store'
import { PaymentCounter } from '@/components/payments/payment-counter'
export const dynamic='force-dynamic'
export default async function PaymentsPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){
 if(!await getServerSession(authOptions))redirect('/login')
 const params=await searchParams;const date=typeof params.date==='string'?params.date:''
 const validDate=!date||(/^\d{4}-\d{2}-\d{2}$/.test(date)&&!Number.isNaN(Date.parse(date))&&new Date(date).toISOString().slice(0,10)===date)
 const filters:PaymentFilters={period:params.period==='past'?'past':params.period==='all'?'all':'today',date:validDate?date:'',page:typeof params.page==='string'&&/^\d+$/.test(params.page)?Math.max(1,Math.min(1000000,Number(params.page))):1,source:params.source==='patient'?'patient':params.source==='inventory'?'inventory':'all'}
 return <PaymentCounter data={await getPaymentCounter(filters)} invalidDate={!validDate}/>
}
