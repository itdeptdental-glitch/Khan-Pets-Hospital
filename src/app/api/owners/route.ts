import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { Prisma } from '@prisma/client'
import { authOptions } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { ownerInput,cleanOwner } from '@/lib/patients/validation'
import { getPatientData } from '@/lib/patients/store'
export async function GET(){
 if(!await getServerSession(authOptions))return NextResponse.json({error:'Please sign in to view owners.'},{status:401})
 return NextResponse.json((await getPatientData()).owners)
}
async function write(request:Request,update:boolean){
 if(!await getServerSession(authOptions))return NextResponse.json({error:'Please sign in to manage owners.'},{status:401})
 let body
 try{body=await request.json()}catch{return NextResponse.json({error:'Invalid request.'},{status:400})}
 const result=ownerInput.safeParse(body)
 if(!result.success)return NextResponse.json({error:result.error.issues[0].message},{status:400})
 if(update&&(typeof body.id!=='string'||!body.id||body.id.length>191))return NextResponse.json({error:'Invalid owner ID.'},{status:400})
 try{
  const owner=update?await prisma.owner.update({where:{id:body.id},data:cleanOwner(result.data)}):await prisma.owner.create({data:cleanOwner(result.data)})
  return NextResponse.json({ownerId:owner.id,data:await getPatientData()},{status:update?200:201})
 }catch(error){
  if(error instanceof Prisma.PrismaClientKnownRequestError&&error.code==='P2025')return NextResponse.json({error:'Owner no longer exists.'},{status:404})
  console.error('Owner save failed',error);return NextResponse.json({error:'Unable to save owner details.'},{status:500})
 }
}
export async function POST(request:Request){return write(request,false)}
export async function PATCH(request:Request){return write(request,true)}
export async function DELETE(request:Request){
 if(!await getServerSession(authOptions))return NextResponse.json({error:'Please sign in to manage owners.'},{status:401})
 let body
 try{body=await request.json()}catch{return NextResponse.json({error:'Invalid request.'},{status:400})}
 if(typeof body?.id!=='string'||!body.id||body.id.length>191)return NextResponse.json({error:'Invalid owner ID.'},{status:400})
 try{
  const outcome=await prisma.$transaction(async tx=>{
   // Lock the parent so a concurrent pet registration cannot race this check.
   const rows=await tx.$queryRaw<{id:string}[]>`SELECT id FROM Owner WHERE id=${body.id} FOR UPDATE`
   if(!rows.length)return 'missing'
   if(await tx.pet.count({where:{ownerId:body.id}})>0)return 'linked'
   await tx.owner.delete({where:{id:body.id}})
   return 'removed'
  })
  if(outcome==='missing')return NextResponse.json({error:'Owner no longer exists.'},{status:404})
  if(outcome==='linked')return NextResponse.json({error:'This owner has registered pets. Edit each pet to assign another owner before removing this owner. You can clear optional contact details by editing the owner.'},{status:409})
  return NextResponse.json({data:await getPatientData()})
 }catch(error){console.error('Owner removal failed',error);return NextResponse.json({error:'Unable to remove owner.'},{status:500})}
}
