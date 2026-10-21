import { seedDemoPatients } from '../src/lib/patients/demo'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@hospital.com' },
    update: {},
    create: {
      email: 'admin@hospital.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
  })

  // Create admin staff profile
  await prisma.staff.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      userId: admin.id,
      name: 'Admin User',
      department: 'Administration',
      phone: '1234567890',
    },
  })

  // Create a doctor user
  const doctorPassword = await bcrypt.hash('doctor123', 10)
  const doctorUser = await prisma.user.upsert({
    where: { email: 'doctor@hospital.com' },
    update: {},
    create: {
      email: 'doctor@hospital.com',
      password: doctorPassword,
      name: 'Dr. John Smith',
      role: 'VETERINARIAN',
    },
  })

  // Create doctor staff profile
  await prisma.staff.upsert({
    where: { userId: doctorUser.id },
    update: {},
    create: {
      userId: doctorUser.id,
      name: 'Dr. John Smith',
      specialty: 'Cardiology',
      department: 'Cardiology',
      phone: '1234567891',
    },
  })

  // Create sample patients
  const patient1 = await prisma.owner.upsert({
    where: { id: 'patient1' },
    update: {},
    create: {
      id: 'patient1',
      firstName: 'Jane',
      lastName: 'Doe',
      phone: '5551234567',
      email: 'jane.doe@example.com',
    },
  })

  const patient2 = await prisma.owner.upsert({
    where: { id: 'patient2' },
    update: {},
    create: {
      id: 'patient2',
      firstName: 'Bob',
      lastName: 'Johnson',
      phone: '5559876543',
      email: 'bob.johnson@example.com',
    },
  })

  const demo = await seedDemoPatients(prisma)
  console.log(`Demo patients added: ${demo.added}`)
  console.log('Database seeded successfully!')
  console.log('Admin credentials: admin@hospital.com / admin123')
  console.log('Doctor credentials: doctor@hospital.com / doctor123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
