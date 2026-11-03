import { allowedLoginEmail } from '@/lib/auth/access-policy'
import { getServerSession } from 'next-auth'
import { Prisma } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { authOptions } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { accountInput } from '@/lib/account/validation'
export async function GET(){const session=await getServerSession(authOptions);if(!session)return Response.json({error:'Please sign in.'},{status:401});const account=await prisma.user.findUnique({where:{id:session.user.id},select:{id:true,name:true,email:true,role:true,staffProfile:{select:{phone:true,specialty:true,department:true}}}});return Response.json(account,{headers:{'Cache-Control':'no-store'}})}
export async function PATCH(request:Request){
 const session=await getServerSession(authOptions);if(!session)return Response.json({error:'Please sign in.'},{status:401})
 const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return Response.json({error:'Invalid request origin.'},{status:403})
 let body;try{body=await request.json()}catch{return Response.json({error:'Invalid request.'},{status:400})}
 if(typeof body.email==='string'&&body.email.trim().toLowerCase()!==allowedLoginEmail)return Response.json({error:'The login email is fixed to '+allowedLoginEmail+' while single-login mode is enabled.'},{status:400})
 const parsed=accountInput.safeParse(body);if(!parsed.success)return Response.json({error:parsed.error.issues[0].message},{status:400})
 try{
 const input=parsed.data;const user=await prisma.user.findUnique({where:{id:session.user.id},select:{id:true,password:true}})
 if(!user||!await bcrypt.compare(input.currentPassword,user.password))return Response.json({error:'Your current password is incorrect.'},{status:400})
 const password=input.newPassword?await bcrypt.hash(input.newPassword,10):null
 await prisma.$transaction(async tx=>{
 const saved=await tx.user.updateMany({where:{id:user.id,password:user.password},data:{name:input.name,email:input.email,...(password?{password}:{})}})
 if(!saved.count)throw Error('ACCOUNT_CHANGED')
 await tx.staff.updateMany({where:{userId:user.id},data:{name:input.name,phone:input.phone||null,specialty:input.specialty||null,department:input.department||null}})
 })
 return Response.json({ok:true,passwordChanged:Boolean(password),message:password?'Account updated. Sign in with your new password.':'Account details updated.'})
 }catch(error){if(error instanceof Prisma.PrismaClientKnownRequestError&&error.code==='P2002')return Response.json({error:'This email address is already used by another account.'},{status:409});if(error instanceof Error&&error.message==='ACCOUNT_CHANGED')return Response.json({error:'Your account changed while saving. Sign in again and retry.'},{status:409});console.error('Account update failed',error);return Response.json({error:'Unable to update your account. Please try again.'},{status:500})}
}
