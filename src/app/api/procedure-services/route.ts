import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { getProcedureServices } from '@/lib/procedures/services'
import { procedureCategories } from '@/lib/procedures/types'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
const input=z.object({name:z.string().trim().min(1).max(191),category:z.enum(procedureCategories),fee:z.number().min(0).max(99999999.99).refine(n=>Math.abs(n*100-Math.round(n*100))<0.00001,'Use at most two decimal places')})
export async function GET(){if(!await getServerSession(authOptions))return Response.json({error:'Please sign in.'},{status:401});return Response.json(await getProcedureServices())}
async function write(request:Request,method:'POST'|'PATCH'|'DELETE'){
 if(!await getServerSession(authOptions))return Response.json({error:'Please sign in.'},{status:401})
 let body;try{body=await request.json()}catch{return Response.json({error:'Invalid request.'},{status:400})}
 if(method!=='POST'&&(typeof body.id!=='string'||!body.id||body.id.length>191))return Response.json({error:'Invalid procedure ID.'},{status:400})
 try{
 if(method==='DELETE'){const count=await prisma.$executeRaw`DELETE FROM ProcedureService WHERE id=${body.id}`;if(!count)return Response.json({error:'Procedure no longer exists.'},{status:404})}
 else{const result=input.safeParse(body);if(!result.success)return Response.json({error:result.error.issues[0].message},{status:400});const {name,category,fee}=result.data
 const duplicate=await prisma.$queryRaw<{id:string}[]>`SELECT id FROM ProcedureService WHERE name=${name}`
 if(duplicate.some(p=>method==='POST'||p.id!==body.id))return Response.json({error:'A procedure with this name already exists.'},{status:409})
 if(method==='POST'){const id=randomUUID();await prisma.$executeRaw`INSERT INTO ProcedureService (id,name,category,fee,samplePrice) VALUES (${id},${name},${category},${fee},false)`}
 else{const existing=await prisma.$queryRaw<{id:string}[]>`SELECT id FROM ProcedureService WHERE id=${body.id}`;if(!existing.length)return Response.json({error:'Procedure no longer exists.'},{status:404});await prisma.$executeRaw`UPDATE ProcedureService SET name=${name},category=${category},fee=${fee},samplePrice=false WHERE id=${body.id}`}
 }
 return Response.json({items:await getProcedureServices()},{status:method==='POST'?201:200})
 }catch(error){console.error('Procedure catalog save failed',error);return Response.json({error:'Unable to save procedure. Please try again.'},{status:500})}
}
export async function POST(r:Request){return write(r,'POST')}
export async function PATCH(r:Request){return write(r,'PATCH')}
export async function DELETE(r:Request){return write(r,'DELETE')}
