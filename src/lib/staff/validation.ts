import { z } from 'zod'
const optionalText=(max=191)=>z.string().trim().max(max).optional().transform(value=>value||null)
export const staffInput=z.object({
 name:z.string().trim().min(1,'Enter the staff member’s name.').max(191),
 email:z.email('Enter a valid email address.').trim().toLowerCase().max(191),
 password:z.string().min(6,'Password must contain at least 6 characters.').refine(value=>Buffer.byteLength(value,'utf8')<=72,'Password must be at most 72 bytes.'),
 role:z.enum(['VETERINARIAN','DOCTOR','STAFF','ADMIN']).transform(role=>role==='DOCTOR'?'VETERINARIAN' as const:role),
 specialty:optionalText(),department:optionalText(),phone:optionalText(30),
})
