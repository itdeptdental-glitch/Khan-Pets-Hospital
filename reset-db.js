const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'mysql://root:root@localhost:3306/hospital_management',
    },
  },
})

async function resetDatabase() {
  try {
    console.log('Deleting all existing data...')
    
    // Delete in reverse order of dependencies
    await prisma.grooming.deleteMany()
    await prisma.boarding.deleteMany()
    await prisma.vaccination.deleteMany()
    await prisma.medicalRecord.deleteMany()
    await prisma.appointment.deleteMany()
    await prisma.pet.deleteMany()
    await prisma.owner.deleteMany()
    await prisma.staff.deleteMany()
    await prisma.user.deleteMany()
    await prisma.medicine.deleteMany()
    await prisma.petFood.deleteMany()
    await prisma.equipment.deleteMany()
    
    console.log('✅ All data deleted successfully!')
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resetDatabase()
