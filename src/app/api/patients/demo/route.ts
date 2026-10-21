import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { seedDemoPatients } from '@/lib/patients/demo'
import { getPatientData } from '@/lib/patients/store'

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Please sign in.' }, { status: 401 })
  if ((session.user as { role?: string })?.role !== 'ADMIN') return NextResponse.json({ error: 'Only administrators can load demo data.' }, { status: 403 })
  try {
    const result = await seedDemoPatients(prisma)
    return NextResponse.json({ ...result, data: await getPatientData() })
  } catch (error) {
    console.error('Demo patient setup failed', error)
    return NextResponse.json({ error: 'Unable to load demo patients. Please try again.' }, { status: 500 })
  }
}
