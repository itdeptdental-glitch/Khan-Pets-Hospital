'use client'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { formatRegistrationDate } from '@/lib/patients/registration-date'
import type { Bill } from '@/lib/appointments/bills'
const money=(n:number)=>new Intl.NumberFormat('en-PK',{minimumFractionDigits:2,maximumFractionDigits:2}).format(n)
export function AppointmentBillView({bill}:{bill:Bill}){
 const s=bill.snapshot;const isSale=s.kind==='sale';const balance=Math.round((bill.total-bill.paid)*100)/100
 const status=balance===0?'Paid':bill.paid>0?'Partially paid':'Unpaid'
 const date=new Date(s.attendedAt)
 const visitDate=new Intl.DateTimeFormat('en-GB',{day:'2-digit',month:'short',year:'numeric',timeZone:'Asia/Karachi'}).format(date)
 const visitTime=new Intl.DateTimeFormat('en-PK',{hour:'2-digit',minute:'2-digit',timeZone:'Asia/Karachi'}).format(date)
 return <div className="bill-page"><div className="bill-controls invoice-toolbar"><div><Link href={isSale?'/dashboard/inventory/sales':'/dashboard/appointments'} className="invoice-back">← {isSale?'Back to inventory sales':'Back to appointments'}</Link><p>{isSale?'Inventory billing':'Patient billing'}</p></div><Button onClick={()=>window.print()}>Print invoice / Save PDF</Button></div>
 {s.demo&&<p role="status" className="mb-4 rounded-lg border border-amber-200 bg-amber-50 text-amber-900 text-sm p-4">DEMO BILL — fictional payment data. No money was received.</p>}
 <article className="bill-document invoice-sheet"><header className="invoice-header"><div className="invoice-brand"><Image src="/logo.jpg" alt="Khan Pets Hospital logo" width={84} height={84} className="invoice-logo" unoptimized/><div><h1>Khan Pets Hospital</h1><p>Veterinary care &amp; pet wellness</p><p>Rahim Yar Khan, Pakistan</p></div></div><div className="invoice-heading"><p className="invoice-kicker">{s.demo?'DEMO INVOICE':isSale?'SALES INVOICE':'INVOICE'}</p><h2>{bill.billNumber??'Number pending'}</h2><span className={'invoice-status '+(balance===0?'paid':bill.paid>0?'partial':'unpaid')}>{status}</span></div></header>
 <div className="invoice-datebar"><span><strong>Invoice date</strong> {visitDate}</span><span><strong>Visit time</strong> {visitTime} PKT</span>{isSale?<span><strong>Currency</strong> PKR</span>:<span><strong>Doctor</strong> {s.doctorName}</span>}</div>
 <section className="invoice-parties"><div><h3>BILLED TO</h3><p className="invoice-person">{s.ownerName}</p><p>{s.ownerPhone}</p></div>{(!isSale||s.petName)&&<div><h3>PATIENT DETAILS</h3><p className="invoice-person">{s.petName}</p><p>{s.species}{s.breed?' · '+s.breed:''}</p><p>Registered: {formatRegistrationDate(s.registeredAt)}</p></div>}</section>
 {isSale?<table className="invoice-items invoice-sale-items"><caption className="sr-only">Sold items and amounts in PKR</caption><thead><tr><th scope="col">Item</th><th scope="col">Qty</th><th scope="col">Unit price</th><th scope="col" className="invoice-amount">Amount (PKR)</th></tr></thead><tbody>{s.saleItems?.map(item=><tr key={item.id}><td>{item.name}</td><td>{item.quantity} {item.unit}</td><td>{money(item.unitPrice)}</td><td className="invoice-amount">{money(item.total)}</td></tr>)}</tbody></table>:(<><table className="invoice-items"><caption className="sr-only">Itemized veterinary procedures, amounts in PKR</caption><thead><tr><th scope="col" className="invoice-line-number">#</th><th scope="col">Procedure / service</th><th scope="col" className="invoice-amount">Amount (PKR)</th></tr></thead><tbody>{s.procedures.map((p,i)=><tr key={i}><td className="invoice-line-number">{String(i+1).padStart(2,'0')}</td><td>{p.name}{p.additional&&<span className="block text-xs text-slate-500 mt-1">Additional work</span>}</td><td className="invoice-amount">{money(p.fee)}</td></tr>)}</tbody></table></>)}

 <section className="invoice-settlement"><div className="invoice-payment"><h3>PAYMENT DETAILS</h3><dl><div><dt>Method</dt><dd>{bill.method??'No payment recorded'}</dd></div>{bill.reference&&<div><dt>Reference</dt><dd>{bill.reference}</dd></div>}</dl><p>All amounts in PKR.</p></div><dl className="invoice-totals">{(s.discount??0)>0&&<><div><dt>{isSale?'Items subtotal':'Procedure subtotal'}</dt><dd>{money(s.subtotal??bill.total+(s.discount??0))}</dd></div><div><dt>Discount</dt><dd>− {money(s.discount??0)}</dd></div></>}<div><dt>Total payable</dt><dd>{money(bill.total)}</dd></div><div><dt>Amount received</dt><dd>{money(bill.paid)}</dd></div><div className="invoice-balance"><dt>Balance due <small>PKR</small></dt><dd>{money(balance)}</dd></div></dl></section>
 {s.notes&&<section className="invoice-notes"><h3>VISIT NOTES</h3><p>{s.notes}</p></section>}
 <footer className="invoice-footer"><p>Thank you for trusting us with your pet’s care.</p><span>Please retain this invoice for your records.</span></footer>
 </article></div>
}
