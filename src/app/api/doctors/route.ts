import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { Prisma } from '@prisma/client'
import { authOptions } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { staffInput } from '@/lib/staff/validation'
import bcrypt from 'bcryptjs'
export async function POST(request:Request){
 const session=await getServerSession(authOptions)
 if(!session)return NextResponse.json({error:'Please sign in to add a staff member.'},{status:401})
 if((session.user as {role?:string})?.role!=='ADMIN')return NextResponse.json({error:'An administrator account is required to add doctors and staff.'},{status:403})
 let body;try{body=await request.json()}catch{return NextResponse.json({error:'Invalid request.'},{status:400})}
 const parsed=staffInput.safeParse(body);if(!parsed.success)return NextResponse.json({error:parsed.error.issues[0].message},{status:400})
 try{
 const {name,email,password,role,specialty,phone,department}=parsed.data
 if(role==='ADMIN')return NextResponse.json({error:'This practice has one full-access administrator. Create a Doctor or Staff account instead.'},{status:409})
 const hashedPassword=await bcrypt.hash(password,10)
 const result=await prisma.$transaction(async tx=>{
 const user=await tx.user.create({data:{name,email,password:hashedPassword,role},select:{id:true,email:true,name:true,role:true}})
 const staff=await tx.staff.create({data:{userId:user.id,name,specialty,phone,department}})
 return {user,staff}
 })
 return NextResponse.json(result,{status:201})
 }catch(error){if(error instanceof Prisma.PrismaClientKnownRequestError&&error.code==='P2002')return NextResponse.json({error:'This email address is already in use. Enter another email address.'},{status:409});console.error('Staff creation failed',error);return NextResponse.json({error:'Unable to add the staff member. No account changes were saved.'},{status:500})}
}
export async function GET(){
 if(!await getServerSession(authOptions))return NextResponse.json({error:'Please sign in to view doctors and staff.'},{status:401})
 try{return NextResponse.json(await prisma.staff.findMany({where:{isActive:true},include:{user:{select:{id:true,email:true,name:true,role:true}}},orderBy:{createdAt:'desc'}}))}catch(error){console.error('Staff read failed',error);return NextResponse.json({error:'Unable to load doctors and staff.'},{status:500})}
}
