import { getServerSession } from 'next-auth'
import { Prisma } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { authOptions } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { getTeam } from '@/lib/staff/store'
import { z } from 'zod'
const updateInput=z.object({id:z.string().min(1).max(191),name:z.string().trim().min(1).max(191),email:z.string().trim().toLowerCase().pipe(z.email().max(191)),role:z.enum(['VETERINARIAN','STAFF']),active:z.boolean(),phone:z.string().trim().max(30).default(''),department:z.string().trim().max(191).default(''),specialty:z.string().trim().max(191).default(''),password:z.string().default('')}).refine(value=>!value.password||(value.password.length>=8&&Buffer.byteLength(value.password,'utf8')<=72),'A reset password must contain at least 8 characters and at most 72 bytes.')
export async function GET(){const session=await getServerSession(authOptions);if(!session)return Response.json({error:'Please sign in.'},{status:401});if(session.user.role!=='ADMIN')return Response.json({error:'Administrator access is required.'},{status:403});return Response.json(await getTeam(),{headers:{'Cache-Control':'no-store'}})}
async function write(request:Request,remove:boolean){
 const session=await getServerSession(authOptions);if(!session)return Response.json({error:'Please sign in.'},{status:401});if(session.user.role!=='ADMIN')return Response.json({error:'Only the administrator can manage user accounts.'},{status:403})
 let body;try{body=await request.json()}catch{return Response.json({error:'Invalid request.'},{status:400})}
 if(typeof body.id!=='string'||!body.id||body.id.length>191)return Response.json({error:'Invalid user ID.'},{status:400})
 const parsed=remove?null:updateInput.safeParse(body);if(parsed&&!parsed.success)return Response.json({error:parsed.error.issues[0].message},{status:400})
 try{
 const input=parsed?.success?parsed.data:null;const password=input?.password?await bcrypt.hash(input.password,10):null
 await prisma.$transaction(async tx=>{
 const [target]=await tx.$queryRaw<{id:string;role:string;name:string|null}[]>`SELECT id,role,name FROM User WHERE id=${body.id} FOR UPDATE`
 if(!target)throw Error('NOT_FOUND')
 if(target.role==='ADMIN'||target.id===session.user.id)throw Error('ADMIN_PROTECTED')
 const removed=await tx.$queryRaw<{userId:string}[]>`SELECT userId FROM RemovedUser WHERE userId=${target.id}`
 if(removed.length)throw Error('NOT_FOUND')
 if(remove){
 // Keep relation targets so historical appointments and clinical records remain intact.
 await tx.staff.upsert({where:{userId:target.id},create:{userId:target.id,name:target.name??'Removed staff',isActive:false},update:{isActive:false}})
 await tx.$executeRaw`INSERT INTO RemovedUser (userId,removedAt) VALUES (${target.id},NOW(3))`
 }else if(input){
 await tx.user.update({where:{id:target.id},data:{name:input.name,email:input.email,role:input.role,...(password?{password}:{})}})
 await tx.staff.upsert({where:{userId:target.id},create:{userId:target.id,name:input.name,phone:input.phone||null,department:input.department||null,specialty:input.specialty||null,isActive:input.active},update:{name:input.name,phone:input.phone||null,department:input.department||null,specialty:input.specialty||null,isActive:input.active}})
 }
 })
 return Response.json({users:await getTeam(),message:remove?'User removed from the team. Existing patient history was preserved.':'User account updated.'})
 }catch(error){const message=error instanceof Error?error.message:'';if(message==='NOT_FOUND')return Response.json({error:'This user no longer exists.'},{status:404});if(message==='ADMIN_PROTECTED')return Response.json({error:'The administrator is protected. Update its profile and password from Account Settings.'},{status:409});if(error instanceof Prisma.PrismaClientKnownRequestError&&error.code==='P2002')return Response.json({error:'This email address is already in use.'},{status:409});console.error('User management failed',error);return Response.json({error:'Unable to save this account. Please try again.'},{status:500})}
}
export async function PATCH(request:Request){return write(request,false)}
export async function DELETE(request:Request){return write(request,true)}
