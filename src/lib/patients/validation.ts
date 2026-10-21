import { z } from 'zod'
const optionalText=(max=191)=>z.string().trim().max(max).nullable().optional()
const phone=z.string().trim().min(5,'Enter a valid phone number').max(30).regex(/^[+\d()\s.-]+$/,'Enter a valid phone number').refine(value=>value.replace(/\D/g,'').length>=7,'Enter a valid phone number')
export const ownerInput=z.object({
 firstName:z.string().trim().min(1,'First name is required').max(191),
 lastName:z.string().trim().min(1,'Last name is required').max(191),
 phone,
 email:z.union([z.email().max(191),z.literal(''),z.null()]).optional(),
 address:optionalText(),
 emergencyContact:optionalText(),
 emergencyPhone:z.union([phone,z.literal(''),z.null()]).optional(),
})
const birthDate=z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value=>{
 const parsed=new Date(value+'T00:00:00Z')
 return !Number.isNaN(parsed.getTime())&&parsed.toISOString().slice(0,10)===value&&parsed<=new Date()
},'Enter a valid birth date that is not in the future')
export const petInput=z.object({
 ownerId:z.string().trim().min(1).max(191).optional(),
 owner:ownerInput.optional(),
 name:z.string().trim().min(1,'Pet name is required').max(191),
 species:z.string().trim().min(1,'Species is required').max(191),
 breed:optionalText(),
 age:z.number().int().min(0).max(200),
 weight:z.number().min(0).max(100000),
 gender:z.enum(['Male','Female','Unknown']),
 color:optionalText(),
 microchipId:optionalText(),
 dateOfBirth:birthDate.nullable(),
 allergies:optionalText(),
 notes:optionalText(),
}).refine(value=>Boolean(value.ownerId)!==Boolean(value.owner),'Select an existing owner or enter a new owner')
export function cleanOwner(input:z.infer<typeof ownerInput>){
 return {...input,email:input.email||null,address:input.address||null,emergencyContact:input.emergencyContact||null,emergencyPhone:input.emergencyPhone||null}
}

