import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const medicalRecord = await prisma.medicalRecord.create({
      data: body,
    })

    return NextResponse.json(medicalRecord, { status: 201 })
  } catch (error) {
    console.error('Error creating medical record:', error)
    return NextResponse.json(
      { error: 'Failed to create medical record' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const records = await prisma.medicalRecord.findMany({
      include: {
        pet: true,
        veterinarian: true,
      },
      orderBy: { visitDate: 'desc' },
    })

    return NextResponse.json(records)
  } catch (error) {
    console.error('Error fetching medical records:', error)
    return NextResponse.json(
      { error: 'Failed to fetch medical records' },
      { status: 500 }
    )
  }
}
