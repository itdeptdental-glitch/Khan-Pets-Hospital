import { z } from 'zod'
export const nextAppointmentInput=z.object({date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value=>!Number.isNaN(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value,'Enter a valid date'),time:z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),veterinarianId:z.string().min(1).max(191),reason:z.string().trim().min(1).max(191)})
export const attendanceInput=z.object({action:z.enum(['attend','followup']),veterinarianId:z.string().min(1).max(191).optional(),discount:z.number().min(0).max(99999999.99).refine(n=>Math.abs(n*100-Math.round(n*100))<0.00001,'Use at most two decimal places').default(0),payment:z.object({paid:z.number().min(0).max(99999999.99).refine(n=>Math.abs(n*100-Math.round(n*100))<0.00001,'Use at most two decimal places'),method:z.enum(['Cash','Card','Bank transfer','Other']).optional(),reference:z.string().trim().max(191).default('')}).default({paid:0,reference:''}),procedures:z.array(z.object({name:z.string().trim().min(1).max(191),fee:z.number().min(0).max(99999999.99).refine(n=>Math.abs(n*100-Math.round(n*100))<0.00001,'Use at most two decimal places').nullable()})).max(100).default([]),extras:z.array(z.object({name:z.string().trim().min(1,'Describe the additional work.').max(191),fee:z.number().min(0).max(99999999.99).refine(n=>Math.abs(n*100-Math.round(n*100))<0.00001,'Use at most two decimal places')})).max(20).default([]),notes:z.string().trim().max(2000).default(''),next:nextAppointmentInput.optional()}).superRefine((value,ctx)=>{
 const lines=[...value.procedures,...value.extras]
 if(value.action==='attend'&&!value.veterinarianId)ctx.addIssue({code:'custom',message:'Select the attending doctor.'})
 if(value.action==='attend'&&value.procedures.some(p=>p.fee===null))ctx.addIssue({code:'custom',message:'Enter a fee for every procedure (0 for no charge).'})
 if(value.payment.paid>0&&!value.payment.method)ctx.addIssue({code:'custom',message:'Select the payment method.'})
 if(value.action==='attend'&&Math.round(value.discount*100)>lines.reduce((sum,p)=>sum+Math.round((p.fee??0)*100),0))ctx.addIssue({code:'custom',message:'Discount cannot exceed the procedure subtotal.'})
 if(Math.round(value.payment.paid*100)>lines.reduce((sum,p)=>sum+Math.round((p.fee??0)*100),0)-Math.round(value.discount*100)&&value.action==='attend')ctx.addIssue({code:'custom',message:'Payment cannot exceed the bill total.'})
 if(value.action==='attend'&&!lines.length)ctx.addIssue({code:'custom',message:'Select a procedure or add additional work.'})
 if(new Set(lines.map(p=>p.name.toLowerCase())).size!==lines.length)ctx.addIssue({code:'custom',message:'A procedure can only be selected once.'})
 if(value.action==='followup'&&!value.next)ctx.addIssue({code:'custom',message:'Enter the next appointment details.'})
 if(value.next&&new Date(value.next.date+'T'+value.next.time+':00+05:00')<=new Date())ctx.addIssue({code:'custom',message:'The next appointment must be in the future (Pakistan time).'})
})

export const appointmentInput=nextAppointmentInput.extend({petId:z.string().trim().min(1,'Select a patient.').max(191),reason:z.string().trim().max(191).default(''),notes:z.string().trim().max(2000).default('')})
