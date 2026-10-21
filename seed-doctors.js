const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'mysql://root:root@localhost:3306/hospital_management',
    },
  },
})

const departments = [
  { name: 'Cardiology', specialty: 'Cardiologist' },
  { name: 'Neurology', specialty: 'Neurologist' },
  { name: 'Orthopedics', specialty: 'Orthopedic Surgeon' },
  { name: 'Pediatrics', specialty: 'Pediatrician' },
  { name: 'Dermatology', specialty: 'Dermatologist' },
  { name: 'Ophthalmology', specialty: 'Ophthalmologist' },
  { name: 'Gynecology', specialty: 'Gynecologist' },
  { name: 'Psychiatry', specialty: 'Psychiatrist' },
  { name: 'General Surgery', specialty: 'General Surgeon' },
  { name: 'Internal Medicine', specialty: 'Internist' }
]

const doctorNames = [
  { firstName: 'Dr. Ahmed', lastName: 'Khan' },
  { firstName: 'Dr. Fatima', lastName: 'Malik' },
  { firstName: 'Dr. Ali', lastName: 'Sheikh' },
  { firstName: 'Dr. Ayesha', lastName: 'Rajput' },
  { firstName: 'Dr. Hassan', lastName: 'Butt' },
  { firstName: 'Dr. Zainab', lastName: 'Mir' },
  { firstName: 'Dr. Muhammad', lastName: 'Dar' },
  { firstName: 'Dr. Sara', lastName: 'Lone' },
  { firstName: 'Dr. Imran', lastName: 'Wani' },
  { firstName: 'Dr. Maryam', lastName: 'Bhat' }
]

async function main() {
  console.log('Seeding 10 doctors from different departments...')

  for (let i = 0; i < 10; i++) {
    const doctor = doctorNames[i]
    const dept = departments[i]
    const email = `doctor${i + 1}@hospital.com`
    const password = 'doctor123'
    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: `${doctor.firstName} ${doctor.lastName}`,
        role: 'DOCTOR',
      },
    })

    await prisma.staff.create({
      data: {
        userId: user.id,
        name: `${doctor.firstName} ${doctor.lastName}`,
        specialty: dept.specialty,
        department: dept.name,
        phone: `03${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`,
        isActive: true,
      },
    })

    console.log(`✓ Created ${doctor.firstName} ${doctor.lastName} - ${dept.name}`)
  }

  console.log('✅ Successfully seeded 10 doctors!')
  console.log('\nDoctor Credentials:')
  for (let i = 0; i < 10; i++) {
    console.log(`Doctor ${i + 1}: doctor${i + 1}@hospital.com / doctor123`)
  }
}

main()
  .catch((e) => {
    console.error('Error seeding doctors:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
