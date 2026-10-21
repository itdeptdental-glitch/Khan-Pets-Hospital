const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'mysql://root:root@localhost:3306/hospital_management',
    },
  },
})

async function test() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'admin@hospital.com' },
    })
    console.log('User found:', user ? 'YES' : 'NO')
    if (user) {
      console.log('User email:', user.email)
      console.log('User name:', user.name)
    }
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

test()
