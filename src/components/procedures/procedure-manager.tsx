'use client'
import { FormEvent, useRef, useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { procedureCategories, procedureStatuses, procedureExamples, ProcedureEntry, ProcedurePet } from '@/lib/procedures/types'
const blank={petId:'',name:'',category:'Grooming',date:'',status:'Scheduled',performedBy:'',fee:'',notes:''}
const money=new Intl.NumberFormat('en-PK',{style:'currency',currency:'PKR'})
function localInput(value:string){const date=new Date(value);return new Date(date.getTime()-date.getTimezoneOffset()*60000).toISOString().slice(0,16)}
export function ProcedureManager({initialItems,pets,staff}:{initialItems:ProcedureEntry[];pets:ProcedurePet[];staff:string[]}) {
 const [items,setItems]=useState(initialItems)
 const [query,setQuery]=useState('')
 const [category,setCategory]=useState('All procedures')
 const [status,setStatus]=useState('All statuses')
 const [form,setForm]=useState(blank)
 const [open,setOpen]=useState(false)
 const [editing,setEditing]=useState<string|null>(null)
 const [saving,setSaving]=useState(false)
 const [error,setError]=useState('')
 const [message,setMessage]=useState('')
 const formRef=useRef<HTMLFormElement>(null)
 const visible=items.filter(item=>(category==='All procedures'||item.category===category)&&(status==='All statuses'||item.status===status)&&`${item.name} ${item.petName} ${item.performedBy||''}`.toLowerCase().includes(query.trim().toLowerCase()))
 function start(item?:ProcedureEntry){
  setError('');setMessage('');setEditing(item?.id??null)
  setForm(item?{petId:item.petId,name:item.name,category:item.category,date:localInput(item.date),status:item.status,performedBy:item.performedBy??'',fee:item.fee===null?'':String(item.fee),notes:item.notes??''}:{...blank,date:localInput(new Date().toISOString())})
  setOpen(true)
  requestAnimationFrame(()=>{formRef.current?.scrollIntoView({behavior:'smooth',block:'center'});formRef.current?.querySelector('select')?.focus({preventScroll:true})})
 }
 function field(key:keyof typeof blank,value:string){setForm(previous=>({...previous,[key]:value}))}
 async function submit(event:FormEvent){
  event.preventDefault();setSaving(true);setError('');setMessage('')
  try {
   const response=await fetch('/api/procedures',{method:editing?'PATCH':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...form,id:editing,date:new Date(form.date).toISOString(),fee:form.fee===''?null:Number(form.fee)})})
   const result=await response.json()
   if(!response.ok)throw new Error(result.error||'Unable to save procedure.')
   setItems(result.items);setOpen(false);setMessage(editing?'Procedure updated.':'Procedure added.');setEditing(null)
  }catch(error){setError(error instanceof Error?error.message:'Unable to save procedure.')}
  finally{setSaving(false)}
 }
 return <div className="space-y-6"><div className="flex items-center justify-between gap-4 flex-wrap"><div><p className="eyebrow mb-1">From grooming to clinical care</p><h1>Procedures</h1><p>Plan and record every pet service in one place.</p></div><Button onClick={()=>start()} disabled={pets.length===0}><span aria-hidden="true">+</span>Add procedure</Button></div>
 <div className="stat-grid">{[['All procedures',items.length],['Scheduled',items.filter(item=>item.status==='Scheduled').length],['In progress',items.filter(item=>item.status==='In progress').length],['Completed',items.filter(item=>item.status==='Completed').length]].map(([label,value])=><Card key={label}><div className="stat-card"><div className="flex justify-between items-center"><p className="text-xs text-slate-500">{label}</p><span className="text-teal-700"><Icon name="procedures"/></span></div><p className="stat-value">{value}</p></div></Card>)}</div>
 <div className="procedure-categories" aria-label="Filter by procedure type">{procedureCategories.map(value=><button key={value} onClick={()=>setCategory(category===value?'All procedures':value)} aria-pressed={category===value} className={`procedure-category ${category===value?'selected':''}`}>{value}</button>)}</div>
 {pets.length===0&&<p role="status" className="text-sm text-slate-600">Register a pet before adding a procedure.</p>}
 {message&&<p role="status" className="rounded-lg border border-teal-200 bg-teal-50 text-teal-800 p-4 text-sm">{message}</p>}
 {open&&<Card><CardHeader><h2 className="text-lg font-semibold">{editing?'Edit procedure':'Add procedure'}</h2><p className="text-sm text-slate-500 mt-1">Choose a pet, describe the service, and track its progress.</p></CardHeader><CardContent><form ref={formRef} onSubmit={submit} aria-label="Procedure details" className="space-y-6">{error&&<p role="alert" className="rounded-lg bg-red-50 text-red-700 p-3 text-sm">{error}</p>}<fieldset disabled={saving} className="grid grid-cols-1 md:grid-cols-2 gap-5"><legend className="sr-only">Procedure information</legend>
 <label htmlFor="procedure-pet" className="inventory-field">Pet *<select id="procedure-pet" required value={form.petId} onChange={e=>field('petId',e.target.value)}><option value="">Select a pet</option>{pets.map(pet=><option key={pet.id} value={pet.id}>{pet.name} ({pet.species}) - {pet.owner.firstName} {pet.owner.lastName}</option>)}</select></label>
 <label htmlFor="procedure-category" className="inventory-field">Procedure type *<select id="procedure-category" value={form.category} onChange={e=>field('category',e.target.value)}>{procedureCategories.map(value=><option key={value}>{value}</option>)}</select></label>
 <label className="inventory-field md:col-span-2">Procedure name *<input maxLength={191} required value={form.name} onChange={e=>field('name',e.target.value)} placeholder={procedureExamples[form.category]}/></label>
 <label className="inventory-field">Date and time *<input type="datetime-local" required value={form.date} onChange={e=>field('date',e.target.value)}/><span className="text-xs font-normal text-slate-500">Uses your device&apos;s local time.</span></label>
 <label htmlFor="procedure-status" className="inventory-field">Status *<select id="procedure-status" value={form.status} onChange={e=>field('status',e.target.value)}>{procedureStatuses.map(value=><option key={value}>{value}</option>)}</select></label>
 <label className="inventory-field">Staff member<input list="procedure-staff" maxLength={191} value={form.performedBy} onChange={e=>field('performedBy',e.target.value)} placeholder="Select or enter a staff member"/><datalist id="procedure-staff">{staff.map(value=><option key={value} value={value}/>)}</datalist></label>
 <label className="inventory-field">Fee (PKR)<input type="number" min="0" max="99999999.99" step="0.01" value={form.fee} onChange={e=>field('fee',e.target.value)} placeholder="Optional"/></label>
 <label className="inventory-field md:col-span-2">Notes<textarea rows={3} maxLength={2000} value={form.notes} onChange={e=>field('notes',e.target.value)} placeholder="Instructions, findings, and follow-up care"/></label>
 </fieldset><div className="flex justify-end gap-3"><Button variant="secondary" type="button" disabled={saving} onClick={()=>setOpen(false)}>Cancel</Button><Button disabled={saving} type="submit">{saving?'Saving...':editing?'Save changes':'Save procedure'}</Button></div></form></CardContent></Card>}
 <Card><CardHeader><h2 className="text-base font-semibold">Procedure records</h2><p className="text-xs text-slate-500 mt-1">{visible.length} of {items.length} procedures</p></CardHeader><CardContent><div className="inventory-filters"><label className="inventory-field">Search procedures<input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search service, pet, or staff..."/></label><label htmlFor="procedure-filter-type" className="inventory-field">Type<select id="procedure-filter-type" value={category} onChange={e=>setCategory(e.target.value)}><option>All procedures</option>{procedureCategories.map(value=><option key={value}>{value}</option>)}</select></label><label htmlFor="procedure-filter-status" className="inventory-field">Status<select id="procedure-filter-status" value={status} onChange={e=>setStatus(e.target.value)}><option>All statuses</option>{procedureStatuses.map(value=><option key={value}>{value}</option>)}</select></label></div>
 {visible.length===0?<div className="text-center py-12"><span className="text-teal-700 inline-flex mb-3"><Icon name="procedures"/></span><p className="font-medium">{items.length?'No matching procedures':'No procedures recorded yet'}</p><p className="text-sm text-slate-500 mt-2">{items.length?'Try another search, type, or status.':'Add a grooming session, vaccination, treatment, or another pet service.'}</p>{items.length>0&&<button className="text-sm text-teal-700 mt-4" onClick={()=>{setQuery('');setCategory('All procedures');setStatus('All statuses')}}>Clear filters</button>}</div>:<div className="overflow-x-auto"><table><caption className="sr-only">Pet procedures and progress</caption><thead><tr>{['Procedure','Pet','Date & time','Staff','Fee','Status',''].map((heading,index)=><th key={index} scope="col" className="text-left">{heading||<span className="sr-only">Actions</span>}</th>)}</tr></thead><tbody>{visible.map(item=><tr key={item.id}><td><p className="font-semibold whitespace-nowrap">{item.name}</p><p className="text-xs text-slate-500">{item.category}</p></td><td><p className="font-medium">{item.petName}</p><p className="text-xs text-slate-500">{item.species}</p></td><td className="whitespace-nowrap">{new Date(item.date).toLocaleDateString('en-PK')}<p className="text-xs text-slate-500">{new Date(item.date).toLocaleTimeString('en-PK',{hour:'2-digit',minute:'2-digit'})}</p></td><td>{item.performedBy||'Unassigned'}</td><td className="whitespace-nowrap">{item.fee===null?'Not set':money.format(item.fee)}</td><td><span className={`inventory-badge ${item.status==='Cancelled'?'empty':item.status==='Completed'?'available':'low'}`}>{item.status}</span></td><td><Button size="sm" variant="secondary" onClick={()=>start(item)} aria-label={`Edit procedure ${item.name}`}>Edit</Button></td></tr>)}</tbody></table></div>}
 </CardContent></Card></div>
}
