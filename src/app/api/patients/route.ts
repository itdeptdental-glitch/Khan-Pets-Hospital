import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { Prisma } from '@prisma/client'
import { authOptions } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { petInput,cleanOwner } from '@/lib/patients/validation'
import { getPatientData } from '@/lib/patients/store'
export async function GET(){
 if(!await getServerSession(authOptions))return NextResponse.json({error:'Please sign in to view patients.'},{status:401})
 try{
  const {pets,owners}=await getPatientData()
  // Keep the name aliases used by the existing appointment/record selectors.
  return NextResponse.json(pets.map(pet=>({...pet,firstName:pet.name,lastName:'',owner:owners.find(owner=>owner.id===pet.ownerId)})))
 }catch(error){console.error('Patient read failed',error);return NextResponse.json({error:'Unable to load patients.'},{status:500})}
}
async function write(request:Request,update:boolean){
 if(!await getServerSession(authOptions))return NextResponse.json({error:'Please sign in to manage patients.'},{status:401})
 let body
 try{body=await request.json()}catch{return NextResponse.json({error:'Invalid request.'},{status:400})}
 const parsed=petInput.safeParse(body)
 if(!parsed.success)return NextResponse.json({error:parsed.error.issues[0].message},{status:400})
 if(update&&(typeof body.id!=='string'||!body.id||body.id.length>191))return NextResponse.json({error:'Invalid patient ID.'},{status:400})
 try{
  await prisma.$transaction(async tx=>{
   const {ownerId,owner,dateOfBirth,breed,color,microchipId,allergies,notes,...details}=parsed.data
   const linkedOwner=owner?await tx.owner.create({data:cleanOwner(owner)}):await tx.owner.findUnique({where:{id:ownerId!}})
   if(!linkedOwner)throw new Error('OWNER_MISSING')
   const data={...details,ownerId:linkedOwner.id,dateOfBirth:dateOfBirth?new Date(dateOfBirth+'T00:00:00Z'):null,breed:breed||null,color:color||null,microchipId:microchipId||null,allergies:allergies||null,notes:notes||null}
   if(update)await tx.pet.update({where:{id:body.id},data})
   else await tx.pet.create({data})
  })
  return NextResponse.json({data:await getPatientData()},{status:update?200:201})
 }catch(error){
  if(error instanceof Error&&error.message==='OWNER_MISSING')return NextResponse.json({error:'Select an existing owner.'},{status:400})
  if(error instanceof Prisma.PrismaClientKnownRequestError){
   if(error.code==='P2002')return NextResponse.json({error:'This microchip ID is already registered.'},{status:409})
   if(error.code==='P2025')return NextResponse.json({error:'Patient no longer exists.'},{status:404})
   if(error.code==='P2003')return NextResponse.json({error:'The selected owner is no longer available. Please refresh.'},{status:409})
  }
  console.error('Patient save failed',error);return NextResponse.json({error:'Unable to save patient.'},{status:500})
 }
}
export async function POST(request:Request){return write(request,false)}
export async function PATCH(request:Request){return write(request,true)}

export async function DELETE(request: Request) {
 if (!await getServerSession(authOptions)) return NextResponse.json({error:'Please sign in to manage patients.'},{status:401})
 let body
 try { body = await request.json() } catch { return NextResponse.json({error:'Invalid request.'},{status:400}) }
 if (typeof body?.id !== 'string' || !body.id || body.id.length > 191) return NextResponse.json({error:'Invalid patient ID.'},{status:400})
 try {
  const outcome = await prisma.$transaction(async tx => {
   const rows = await tx.$queryRaw<{id:string}[]>`SELECT id FROM Pet WHERE id=${body.id} FOR UPDATE`
   if (!rows.length) return 'missing'
   const pet = await tx.pet.findUniqueOrThrow({where:{id:body.id},select:{_count:{select:{appointments:true,medicalRecords:true,vaccinations:true,boarding:true,grooming:true,procedures:true}}}})
   if (Object.values(pet._count).some(count=>count>0)) return 'linked'
   await tx.pet.delete({where:{id:body.id}})
   return 'removed'
  })
  if (outcome==='missing') return NextResponse.json({error:'Patient no longer exists.'},{status:404})
  if (outcome==='linked') return NextResponse.json({error:'This patient has appointments or care records and cannot be removed. Its clinical history must be retained.'},{status:409})
  return NextResponse.json({data:await getPatientData()})
 } catch(error) { console.error('Patient removal failed',error); return NextResponse.json({error:'Unable to remove patient.'},{status:500}) }
}
