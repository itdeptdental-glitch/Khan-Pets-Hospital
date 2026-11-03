import { prisma } from '@/lib/db/prisma'
﻿import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth/auth'
import { getPatientData } from '@/lib/patients/store'
import { PatientManager } from '@/components/patients/patient-manager'
export const dynamic='force-dynamic'
export default async function PatientsPage(){const session=await getServerSession(authOptions);if(!session)redirect('/login');const doctors=await prisma.staff.findMany({where:{isActive:true,user:{role:'VETERINARIAN'}},select:{id:true,name:true},orderBy:{name:'asc'}});return <PatientManager doctors={doctors} canLoadDemo={(session.user as {role?:string})?.role==='ADMIN'} initialData={await getPatientData()}/>}

