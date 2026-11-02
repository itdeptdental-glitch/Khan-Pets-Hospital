import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import { generateReport } from '@/lib/reports/store'
import { reportTypes, type ReportType } from '@/lib/reports/types'
export async function GET(request:Request){
 if(!await getServerSession(authOptions))return Response.json({error:'Please sign in to generate reports.'},{status:401})
 const params=new URL(request.url).searchParams
 const type=params.get('type')??'patients';const from=params.get('from')??'';const to=params.get('to')??''
 const validDate=(value:string)=>!value||(/^\d{4}-\d{2}-\d{2}$/.test(value)&&!Number.isNaN(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value)
 if(!Object.hasOwn(reportTypes,type)||!validDate(from)||!validDate(to)||(from&&to&&from>to))return Response.json({error:'Choose a valid report and date range.'},{status:400})
 try{return Response.json(await generateReport(type as ReportType,from,to),{headers:{'Cache-Control':'no-store'}})}catch(error){console.error('Report generation failed',error);return Response.json({error:'Unable to generate this report. Please try again.'},{status:500})}
}
