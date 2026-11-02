import { z } from 'zod'
import { procedureCatalog } from '@/lib/procedures/catalog'
export const nextAppointmentInput=z.object({date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value=>!Number.isNaN(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value,'Enter a valid date'),time:z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),veterinarianId:z.string().min(1).max(191),reason:z.string().trim().min(1).max(191)})
export const attendanceInput=z.object({action:z.enum(['attend','followup']),veterinarianId:z.string().min(1).max(191).optional(),payment:z.object({paid:z.number().min(0).max(99999999.99).refine(n=>Math.abs(n*100-Math.round(n*100))<0.00001,'Use at most two decimal places'),method:z.enum(['Cash','Card','Bank transfer','Other']).optional(),reference:z.string().trim().max(191).default('')}).default({paid:0,reference:''}),procedures:z.array(z.object({name:z.string().refine(name=>procedureCatalog.some(p=>p.name===name),'Select a catalog procedure'),fee:z.number().min(0).max(99999999.99).refine(n=>Math.abs(n*100-Math.round(n*100))<0.00001,'Use at most two decimal places').nullable()})).max(55).default([]),notes:z.string().trim().max(2000).default(''),next:nextAppointmentInput.optional()}).superRefine((value,ctx)=>{
 if(value.action==='attend'&&!value.veterinarianId)ctx.addIssue({code:'custom',message:'Select the attending doctor.'})
 if(value.action==='attend'&&value.procedures.some(p=>p.fee===null))ctx.addIssue({code:'custom',message:'Enter a fee for every procedure (0 for no charge).'})
 if(value.payment.paid>0&&!value.payment.method)ctx.addIssue({code:'custom',message:'Select the payment method.'})
 if(Math.round(value.payment.paid*100)>value.procedures.reduce((sum,p)=>sum+Math.round((p.fee??0)*100),0)&&value.action==='attend')ctx.addIssue({code:'custom',message:'Payment cannot exceed the bill total.'})
 if(value.action==='attend'&&!value.procedures.length)ctx.addIssue({code:'custom',message:'Select at least one procedure.'})
 if(new Set(value.procedures.map(p=>p.name)).size!==value.procedures.length)ctx.addIssue({code:'custom',message:'A procedure can only be selected once.'})
 if(value.action==='followup'&&!value.next)ctx.addIssue({code:'custom',message:'Enter the next appointment details.'})
 if(value.next&&new Date(value.next.date+'T'+value.next.time+':00+05:00')<=new Date())ctx.addIssue({code:'custom',message:'The next appointment must be in the future (Pakistan time).'})
})
