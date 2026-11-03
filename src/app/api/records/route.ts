import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import { removeRecord, removableKinds } from '@/lib/records/removal'
import { z } from 'zod'
const input=z.object({kind:z.enum(removableKinds),id:z.string().min(1).max(220)})
export async function DELETE(request:Request){const session=await getServerSession(authOptions);if(!session)return Response.json({error:'Please sign in.'},{status:401});if(session.user.role!=='ADMIN')return Response.json({error:'Administrator access is required.'},{status:403});let body;try{body=await request.json()}catch{return Response.json({error:'Invalid request.'},{status:400})}const parsed=input.safeParse(body);if(!parsed.success)return Response.json({error:'Select an individual record to delete.'},{status:400});try{await removeRecord(parsed.data.kind,parsed.data.id,session.user.id);return Response.json({ok:true})}catch(error){if(error instanceof Error&&error.message==='NOT_FOUND')return Response.json({error:'Record not found.'},{status:404});console.error('Record removal failed',error);return Response.json({error:'Unable to remove this record. Please try again.'},{status:500})}}
