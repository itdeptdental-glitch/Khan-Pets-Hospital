import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import { getMedicalHistory } from '@/lib/medical-records/store'
export async function GET(){if(!await getServerSession(authOptions))return Response.json({error:'Please sign in.'},{status:401});try{return Response.json(await getMedicalHistory())}catch(error){console.error('Medical history read failed',error);return Response.json({error:'Unable to load medical records.'},{status:500})}}
export async function POST(){if(!await getServerSession(authOptions))return Response.json({error:'Please sign in.'},{status:401});return Response.json({error:'Medical records are generated automatically from attended appointments. Attend the patient from Appointments.'},{status:405,headers:{Allow:'GET'}})}
