'use client'
import { FormEvent, useRef, useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { categories, InventoryItem, stockStatus } from '@/lib/inventory/types'
const emptyForm = {name:'',category:'Pet food',brand:'',quantity:'0',unit:'pieces',price:'',reorderLevel:'5',expiryDate:'',description:''}
const currency = new Intl.NumberFormat('en-PK',{style:'currency',currency:'PKR',maximumFractionDigits:2})
export function InventoryManager({initialItems}:{initialItems:InventoryItem[]}) {
 const [items,setItems]=useState(initialItems)
 const [query,setQuery]=useState('')
 const [category,setCategory]=useState('All categories')
 const [stock,setStock]=useState('All stock')
 const [editing,setEditing]=useState<string|null>(null)
 const [open,setOpen]=useState(false)
 const [form,setForm]=useState(emptyForm)
 const [saving,setSaving]=useState(false)
 const [error,setError]=useState('')
 const [message,setMessage]=useState('')
 const formRef=useRef<HTMLFormElement>(null)
 const visible=items.filter(item=>(category==='All categories'||item.category===category)&&(stock==='All stock'||stockStatus(item)===stock)&&`${item.name} ${item.brand||''} ${item.category}`.toLowerCase().includes(query.toLowerCase().trim()))
 const low=items.filter(item=>item.quantity>0&&item.quantity<=item.reorderLevel).length
 const out=items.filter(item=>item.quantity===0).length
 function start(item?:InventoryItem) {
  setError('');setMessage('');setEditing(item?.id??null)
  setForm(item?{name:item.name,category:item.category,brand:item.brand??'',quantity:String(item.quantity),unit:item.unit,price:item.price===null?'':String(item.price),reorderLevel:String(item.reorderLevel),expiryDate:item.expiryDate??'',description:item.description??''}:emptyForm)
  setOpen(true)
  requestAnimationFrame(()=>{formRef.current?.scrollIntoView({behavior:'smooth',block:'center'});formRef.current?.querySelector('input')?.focus({preventScroll:true})})
 }
 async function submit(event:FormEvent) {
  event.preventDefault();setSaving(true);setError('');setMessage('')
  try {
   const response=await fetch('/api/inventory',{method:editing?'PATCH':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...form,id:editing,quantity:Number(form.quantity),reorderLevel:Number(form.reorderLevel),price:form.price===''?null:Number(form.price),expiryDate:form.expiryDate||null})})
   const result=await response.json()
   if(!response.ok) throw new Error(result.error||'Unable to save item.')
   setItems(result.items);setOpen(false);setMessage(editing?'Item and stock updated.':'Inventory item added.');setEditing(null);setForm(emptyForm)
  } catch(error) {setError(error instanceof Error?error.message:'Unable to save item. Please try again.')}
  finally {setSaving(false)}
 }
 function field(name:keyof typeof emptyForm,value:string){setForm(previous=>({...previous,[name]:value}))}
 return <div className="space-y-6"><div className="flex justify-between items-center gap-4 flex-wrap"><div><p className="eyebrow mb-1">Supplies for better care</p><h1>Inventory</h1><p>Manage pet food, toys, medicines, and practice supplies.</p></div><Button onClick={()=>start()}><span aria-hidden="true">+</span>Add item</Button></div>
 <div className="stat-grid">{[['Product lines',items.length,'inventory'],['Low stock',low,'records'],['Out of stock',out,'inventory'],['Categories',new Set(items.map(item=>item.category)).size,'dashboard']].map(([label,value,icon])=><Card key={label}><div className="stat-card"><div className="flex items-center justify-between"><p className="text-xs text-slate-500">{label}</p><span className="text-teal-700"><Icon name={String(icon)}/></span></div><p className="stat-value">{value}</p></div></Card>)}</div>
 {message&&<div role="status" className="rounded-lg border border-teal-200 bg-teal-50 text-teal-800 p-4 text-sm">{message}</div>}
 {open&&<Card><CardHeader><h2 className="text-lg font-semibold">{editing?'Edit inventory item':'Add inventory item'}</h2><p className="text-sm text-slate-500 mt-1">Set the available stock and the quantity that triggers a low-stock warning.</p></CardHeader><CardContent><form ref={formRef} onSubmit={submit} className="space-y-6" aria-label={editing?'Edit inventory item':'Add inventory item'}>{error&&<p role="alert" className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</p>}<fieldset disabled={saving} className="grid grid-cols-1 md:grid-cols-2 gap-5"><legend className="sr-only">Item details</legend>
 <label className="inventory-field">Item name *<input required maxLength={191} value={form.name} onChange={e=>field('name',e.target.value)} placeholder="e.g. Rubber chew toy"/></label>
 <label className="inventory-field">Category *<select value={form.category} onChange={e=>field('category',e.target.value)}>{categories.map(value=><option key={value}>{value}</option>)}</select></label>
 <label className="inventory-field">Brand<input maxLength={191} value={form.brand} onChange={e=>field('brand',e.target.value)} placeholder="Brand or manufacturer"/></label>
 <label className="inventory-field">Unit *<input required maxLength={30} value={form.unit} onChange={e=>field('unit',e.target.value)} placeholder="pieces, bags, bottles..."/></label>
 <label className="inventory-field">Quantity in stock *<input type="number" min="0" max="2147483647" step="1" required value={form.quantity} onChange={e=>field('quantity',e.target.value)}/></label>
 <label className="inventory-field">Low-stock threshold *<input type="number" min="0" max="2147483647" step="1" required value={form.reorderLevel} onChange={e=>field('reorderLevel',e.target.value)}/></label>
 <label className="inventory-field">Price per unit (PKR)<input type="number" min="0" max="99999999.99" step="0.01" value={form.price} onChange={e=>field('price',e.target.value)} placeholder="Optional"/></label>
 <label className="inventory-field">Expiry date<input type="date" value={form.expiryDate} onChange={e=>field('expiryDate',e.target.value)}/></label>
 <label className="inventory-field md:col-span-2">Description<textarea rows={2} maxLength={2000} value={form.description} onChange={e=>field('description',e.target.value)} placeholder="Size, flavour, species, storage instructions..."/></label>
 </fieldset><div className="flex justify-end gap-3"><Button type="button" variant="secondary" disabled={saving} onClick={()=>{setOpen(false);setError('')}}>Cancel</Button><Button disabled={saving} type="submit">{saving?'Saving...':editing?'Save changes':'Add item'}</Button></div></form></CardContent></Card>}
 <Card><CardHeader><div className="flex justify-between items-center gap-3"><div><h2 className="text-base font-semibold">All inventory</h2><p className="text-xs text-slate-500 mt-1">{visible.length} of {items.length} items</p></div><span className="text-xs text-slate-500">Prices in PKR</span></div></CardHeader><CardContent><div className="inventory-filters"><label className="inventory-field">Search<input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search name, brand, category..."/></label><label className="inventory-field">Category<select value={category} onChange={e=>setCategory(e.target.value)}><option>All categories</option>{categories.map(value=><option key={value}>{value}</option>)}</select></label><label className="inventory-field">Stock status<select value={stock} onChange={e=>setStock(e.target.value)}>{['All stock','In stock','Low stock','Out of stock'].map(value=><option key={value}>{value}</option>)}</select></label></div>
 {visible.length===0?<div className="text-center py-12"><p className="font-medium">{items.length?'No matching items':'Your inventory is empty'}</p><p className="text-sm text-slate-500 mt-2">{items.length?'Try another search or category.':'Add food, toys, and supplies to start tracking stock.'}</p>{items.length>0&&<button className="text-sm text-teal-700 mt-4" onClick={()=>{setQuery('');setCategory('All categories');setStock('All stock')}}>Clear filters</button>}</div>:<div className="overflow-x-auto"><table><caption className="sr-only">Inventory items and current stock</caption><thead><tr>{['Item','Category','Stock','Unit price','Expiry','Status',''].map((heading,index)=><th scope="col" className="text-left" key={index}>{heading||<span className="sr-only">Actions</span>}</th>)}</tr></thead><tbody>{visible.map(item=>{const status=stockStatus(item);return <tr key={item.id}><td><p className="font-semibold whitespace-nowrap">{item.name}</p><p className="text-xs text-slate-500">{item.brand||'No brand'}</p></td><td className="whitespace-nowrap">{item.category}</td><td className="whitespace-nowrap"><span className="font-semibold">{item.quantity}</span> <span className="text-slate-500">{item.unit}</span><p className="text-[10px] text-slate-400">Low at {item.reorderLevel}</p></td><td className="whitespace-nowrap">{item.price===null?'Not set':currency.format(item.price)}</td><td className="whitespace-nowrap">{item.expiryDate??'Not set'}</td><td><span className={`inventory-badge ${status==='Out of stock'?'empty':status==='Low stock'?'low':'available'}`}>{status}</span></td><td><Button variant="secondary" size="sm" onClick={()=>start(item)} aria-label={`Edit ${item.name}`}>Edit / stock</Button></td></tr>})}</tbody></table></div>}
 </CardContent></Card></div>
}
