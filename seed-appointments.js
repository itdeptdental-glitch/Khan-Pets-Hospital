const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'mysql://root:root@localhost:3306/hospital_management',
    },
  },
})

const appointmentReasons = [
  'Regular checkup',
  'Follow-up visit',
  'Consultation',
  'Lab results review',
  'Prescription refill',
  'Vaccination',
  'Health screening',
  'Urgent care',
  'Specialist referral',
  'Chronic condition management',
  'Pre-surgery consultation',
  'Post-surgery follow-up',
  'Annual physical',
  'Blood pressure check',
  'Diabetes management',
  'Pain management'
]

const appointmentStatuses = ['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function getRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

async function main() {
  console.log('Fetching patients and doctors...')
  
  const patients = await prisma.patient.findMany()
  const doctors = await prisma.staff.findMany({ where: { isActive: true } })

  console.log(`Found ${patients.length} patients and ${doctors.length} doctors`)
  console.log('Creating 500 appointments...')

  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const sixMonthsLater = new Date()
  sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6)

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30'
  ]

  for (let i = 0; i < 500; i++) {
    const patient = getRandomItem(patients)
    const doctor = getRandomItem(doctors)
    const date = getRandomDate(sixMonthsAgo, sixMonthsLater)
    const time = getRandomItem(timeSlots)
    const status = getRandomItem(appointmentStatuses)
    const reason = getRandomItem(appointmentReasons)

    await prisma.appointment.create({
      data: {
        patientId: patient.id,
        doctorId: doctor.id,
        date,
        time,
        status,
        reason,
        notes: Math.random() > 0.5 ? 'Patient requested morning slot' : null,
      },
    })

    if ((i + 1) % 50 === 0) {
      console.log(`Created ${i + 1} appointments...`)
    }
  }

  console.log('✅ Successfully seeded 500 appointments!')
}

main()
  .catch((e) => {
    console.error('Error seeding appointments:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
