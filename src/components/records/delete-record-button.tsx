'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import type { RemovableKind } from '@/lib/records/removal'
export function DeleteRecordButton({kind,id,label,onDeleted}:{kind:RemovableKind;id:string;label:string;onDeleted?:()=>void}){
 const router=useRouter();const [confirm,setConfirm]=useState(false);const [saving,setSaving]=useState(false);const [error,setError]=useState('')
 async function remove(){setSaving(true);setError('');try{const response=await fetch('/api/records',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind,id})});const data=await response.json();if(!response.ok)throw Error(data.error||'Unable to remove record.');setConfirm(false);onDeleted?.();router.refresh()}catch(error){setError(error instanceof Error?error.message:'Unable to reach the server.')}finally{setSaving(false)}}
 return <span className="inline-flex flex-col items-start gap-2"><Button type="button" variant="danger" size="sm" onClick={()=>setConfirm(true)}>Delete</Button>{confirm&&<span role="dialog" aria-label={'Delete '+label} className="block whitespace-normal rounded-lg border border-red-200 bg-red-50 p-3 text-sm max-w-sm"><strong className="block mb-2">Delete {label}?</strong><span className="block text-xs mb-3">This removes the record from this list. Linked bills, payments and historical data are retained.</span><span className="flex flex-wrap gap-2"><Button type="button" variant="secondary" size="sm" disabled={saving} onClick={()=>{setConfirm(false);setError('')}}>Cancel</Button><Button type="button" variant="danger" size="sm" disabled={saving} onClick={remove}>{saving?'Deleting…':'Confirm delete'}</Button></span>{error&&<span role="alert" className="block text-xs text-red-700 mt-2">{error}</span>}</span>}</span>
}
