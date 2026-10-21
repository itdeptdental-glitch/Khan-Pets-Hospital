import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import { getProcedures, saveProcedure } from '@/lib/procedures/store'
import { procedureInput } from '@/lib/procedures/validation'
export async function GET() {
 if(!await getServerSession(authOptions)) return NextResponse.json({error:'Please sign in to manage procedures.'},{status:401})
 try {return NextResponse.json(await getProcedures())} catch(error){console.error('Procedures read failed',error);return NextResponse.json({error:'Unable to load procedures.'},{status:500})}
}
async function write(request:Request,update:boolean) {
 if(!await getServerSession(authOptions)) return NextResponse.json({error:'Please sign in to manage procedures.'},{status:401})
 let body
 try {body=await request.json()} catch{return NextResponse.json({error:'Invalid request.'},{status:400})}
 const parsed=procedureInput.safeParse(body)
 if(!parsed.success) return NextResponse.json({error:parsed.error.issues[0].message},{status:400})
 if(update&&(typeof body.id!=='string'||!body.id||body.id.length>191)) return NextResponse.json({error:'Invalid procedure ID.'},{status:400})
 try {
  const result=await saveProcedure(parsed.data,update?body.id:undefined)
  if(result==='pet-missing') return NextResponse.json({error:'Please select an existing pet.'},{status:400})
  if(result==='missing') return NextResponse.json({error:'Procedure no longer exists.'},{status:404})
  return NextResponse.json({items:await getProcedures()},{status:update?200:201})
 } catch(error){console.error('Procedure save failed',error);return NextResponse.json({error:'Unable to save procedure. Please try again.'},{status:500})}
}
export async function POST(request:Request){return write(request,false)}
export async function PATCH(request:Request){return write(request,true)}
