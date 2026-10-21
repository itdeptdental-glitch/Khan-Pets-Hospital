const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'mysql://root:root@localhost:3306/khan_pets_hospital',
    },
  },
})

async function main() {
  console.log('Seeding Khan Pets Hospital database...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@khanpets.com',
      password: adminPassword,
      name: 'Admin Khan',
      role: 'ADMIN',
    },
  })

  await prisma.staff.create({
    data: {
      userId: admin.id,
      name: 'Admin Khan',
      department: 'Administration',
      phone: '03001234567',
    },
  })

  // Create veterinarians
  const veterinarianNames = [
    { name: 'Dr. Ahmed Khan', specialty: 'Small Animals', department: 'General Medicine' },
    { name: 'Dr. Fatima Malik', specialty: 'Surgery', department: 'Surgery' },
    { name: 'Dr. Ali Sheikh', specialty: 'Dentistry', department: 'Dental Care' },
    { name: 'Dr. Ayesha Rajput', specialty: 'Dermatology', department: 'Dermatology' },
    { name: 'Dr. Hassan Butt', specialty: 'Radiology', department: 'Diagnostics' },
  ]

  for (const vet of veterinarianNames) {
    const vetPassword = await bcrypt.hash('vet123', 10)
    const user = await prisma.user.create({
      data: {
        email: `${vet.name.split(' ')[1].toLowerCase()}@khanpets.com`,
        password: vetPassword,
        name: vet.name,
        role: 'VETERINARIAN',
      },
    })

    await prisma.staff.create({
      data: {
        userId: user.id,
        name: vet.name,
        specialty: vet.specialty,
        department: vet.department,
        phone: `03${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`,
      },
    })
  }

  // Create pet owners
  const ownerNames = [
    { firstName: 'Sarah', lastName: 'Ahmed' },
    { firstName: 'Ali', lastName: 'Raza' },
    { firstName: 'Zara', lastName: 'Malik' },
    { firstName: 'Usman', lastName: 'Khan' },
    { firstName: 'Hina', lastName: 'Sheikh' },
  ]

  const owners = []
  for (const owner of ownerNames) {
    const createdOwner = await prisma.owner.create({
      data: {
        firstName: owner.firstName,
        lastName: owner.lastName,
        phone: `03${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`,
        email: `${owner.firstName.toLowerCase()}.${owner.lastName.toLowerCase()}@gmail.com`,
        address: 'House 123, Main Boulevard, Lahore',
        emergencyContact: 'Family Member',
        emergencyPhone: `03${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`,
      },
    })
    owners.push(createdOwner)
  }

  // Create pets
  const petNames = ['Bella', 'Max', 'Charlie', 'Luna', 'Rocky', 'Coco', 'Milo', 'Daisy']
  const species = ['Dog', 'Cat', 'Rabbit', 'Bird', 'Hamster']
  const breeds = ['German Shepherd', 'Persian', 'Labrador', 'Siamese', 'Golden Retriever']
  const genders = ['Male', 'Female']

  for (let i = 0; i < 50; i++) {
    const owner = owners[Math.floor(Math.random() * owners.length)]
    await prisma.pet.create({
      data: {
        ownerId: owner.id,
        name: petNames[Math.floor(Math.random() * petNames.length)],
        species: species[Math.floor(Math.random() * species.length)],
        breed: breeds[Math.floor(Math.random() * breeds.length)],
        age: Math.floor(Math.random() * 10) + 1,
        weight: parseFloat((Math.random() * 30 + 1).toFixed(1)),
        gender: genders[Math.floor(Math.random() * genders.length)],
        color: 'Various',
        dateOfBirth: new Date(Math.floor(Math.random() * 10) + 2014, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)),
        allergies: Math.random() > 0.8 ? 'None' : 'Chicken',
      },
    })
  }

  // Create equipment
  const equipmentList = [
    { name: 'X-Ray Machine', category: 'Diagnostics', quantity: 2 },
    { name: 'Ultrasound Scanner', category: 'Diagnostics', quantity: 1 },
    { name: 'Surgical Table', category: 'Surgery', quantity: 3 },
    { name: 'Anesthesia Machine', category: 'Surgery', quantity: 2 },
    { name: 'Dental Chair', category: 'Dental', quantity: 1 },
    { name: 'Microscope', category: 'Lab', quantity: 3 },
    { name: 'IV Pump', category: 'Treatment', quantity: 5 },
    { name: 'Oxygen Concentrator', category: 'Treatment', quantity: 2 },
  ]

  for (const eq of equipmentList) {
    await prisma.equipment.create({
      data: {
        name: eq.name,
        category: eq.category,
        quantity: eq.quantity,
        purchaseDate: new Date(2023, 0, 1),
      },
    })
  }

  // Create medicines
  const medicines = [
    { name: 'Amoxicillin', category: 'Antibiotic', quantity: 100, price: 25.50 },
    { name: 'Metacam', category: 'Pain Relief', quantity: 50, price: 45.00 },
    { name: 'Heartgard', category: 'Parasite Control', quantity: 80, price: 60.00 },
    { name: 'Frontline', category: 'Parasite Control', quantity: 75, price: 35.00 },
    { name: 'Rimadyl', category: 'Pain Relief', quantity: 60, price: 55.00 },
  ]

  for (const med of medicines) {
    await prisma.medicine.create({
      data: {
        name: med.name,
        category: med.category,
        quantity: med.quantity,
        unit: 'tablets',
        price: med.price,
        expiryDate: new Date(2025, 11, 31),
        manufacturer: 'PharmaCo',
      },
    })
  }

  // Create pet food
  const petFoods = [
    { name: 'Royal Canin Dog Food', brand: 'Royal Canin', category: 'Dog', weight: 15, price: 85.00 },
    { name: 'Purina Cat Food', brand: 'Purina', category: 'Cat', weight: 10, price: 65.00 },
    { name: 'Hills Science Diet', brand: 'Hills', category: 'Dog', weight: 20, price: 95.00 },
    { name: 'Whiskas Cat Food', brand: 'Whiskas', category: 'Cat', weight: 12, price: 45.00 },
    { name: 'Rabbit Pellets', brand: 'Bunny Basics', category: 'Rabbit', weight: 5, price: 25.00 },
  ]

  for (const food of petFoods) {
    await prisma.petFood.create({
      data: {
        name: food.name,
        brand: food.brand,
        category: food.category,
        quantity: 50,
        unit: 'kg',
        weight: food.weight,
        price: food.price,
        expiryDate: new Date(2025, 6, 30),
        species: food.category,
        ageGroup: 'Adult',
      },
    })
  }

  console.log('✅ Khan Pets Hospital database seeded successfully!')
  console.log('\nLogin Credentials:')
  console.log('Admin: admin@khanpets.com / admin123')
  console.log('Veterinarians: ahmed@khanpets.com, fatima@khanpets.com, etc. / vet123')
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
