const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'mysql://root:root@localhost:3306/hospital_management'
    }
  }
})

async function main() {
  console.log('Starting database seed...')

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
      role: 'DOCTOR',
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
  const patient1 = await prisma.patient.upsert({
    where: { id: 'patient1' },
    update: {},
    create: {
      id: 'patient1',
      firstName: 'Jane',
      lastName: 'Doe',
      dateOfBirth: new Date('1990-05-15'),
      gender: 'Female',
      phone: '5551234567',
      email: 'jane.doe@example.com',
      bloodType: 'A+',
    },
  })

  const patient2 = await prisma.patient.upsert({
    where: { id: 'patient2' },
    update: {},
    create: {
      id: 'patient2',
      firstName: 'Bob',
      lastName: 'Johnson',
      dateOfBirth: new Date('1985-08-20'),
      gender: 'Male',
      phone: '5559876543',
      email: 'bob.johnson@example.com',
      bloodType: 'O+',
    },
  })

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
