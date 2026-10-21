const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'mysql://root:root@localhost:3306/hospital_management',
    },
  },
})

const pakistaniNames = [
  'Ahmed', 'Ali', 'Fatima', 'Ayesha', 'Hassan', 'Hussain', 'Zainab', 'Khadija',
  'Muhammad', 'Aisha', 'Omar', 'Umar', 'Usman', 'Zara', 'Sara', 'Maryam',
  'Imran', 'Khan', 'Rashid', 'Saeed', 'Javed', 'Nasir', 'Tariq', 'Farooq',
  'Jamal', 'Kamal', 'Nadeem', 'Rizwan', 'Shahbaz', 'Waheed', 'Yasir', 'Zafar',
  'Amir', 'Anwar', 'Bilal', 'Danish', 'Ejaz', 'Faisal', 'Ghulam', 'Hafeez',
  'Irfan', 'Jamil', 'Kashif', 'Latif', 'Moeed', 'Noman', 'Osama', 'Parvez',
  'Qasim', 'Rashid', 'Salman', 'Tahir', 'Uzair', 'Vikram', 'Waqar', 'Xavier',
  'Yasin', 'Zahid'
]

const pakistaniSurnames = [
  'Khan', 'Malik', 'Rajput', 'Sheikh', 'Butt', 'Mir', 'Dar', 'Lone',
  'Wani', 'Bhat', 'Naqvi', 'Rizvi', 'Jafri', 'Haider', 'Hussain', 'Shah',
  'Siddiqui', 'Farooqui', 'Kazmi', 'Naqvi', 'Zaidi', 'Geelani', 'Rather',
  'Baba', 'Chaudhry', 'Mian', 'Sardar', 'Nawab', 'Qureshi', 'Ansari',
  'Hashmi', 'Qadri', 'Gilani', 'Zia', 'Kashmiri', 'Mughal', 'Pathan'
]

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const cities = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta']

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generatePhone() {
  return `03${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`
}

function generateCnic() {
  return `${Math.floor(Math.random() * 90000) + 10000}-${Math.floor(Math.random() * 900000000) + 100000000}-${Math.floor(Math.random() * 9)}`
}

async function main() {
  console.log('Seeding 100 Pakistani patients...')

  for (let i = 0; i < 100; i++) {
    const firstName = getRandomItem(pakistaniNames)
    const lastName = getRandomItem(pakistaniSurnames)
    const birthYear = Math.floor(Math.random() * 50) + 1960
    const birthMonth = Math.floor(Math.random() * 12) + 1
    const birthDay = Math.floor(Math.random() * 28) + 1
    
    await prisma.patient.create({
      data: {
        firstName,
        lastName,
        dateOfBirth: new Date(birthYear, birthMonth, birthDay),
        gender: Math.random() > 0.5 ? 'Male' : 'Female',
        phone: generatePhone(),
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@gmail.com`,
        address: `${Math.floor(Math.random() * 999) + 1} ${getRandomItem(cities)} Road, ${getRandomItem(cities)}`,
        emergencyContact: `${getRandomItem(pakistaniNames)} ${getRandomItem(pakistaniSurnames)}`,
        emergencyPhone: generatePhone(),
        bloodType: getRandomItem(bloodTypes),
        allergies: Math.random() > 0.7 ? 'None' : getRandomItem(['Penicillin', 'Sulfa', 'Dust', 'Pollen', 'Latex']),
      },
    })
    
    if ((i + 1) % 10 === 0) {
      console.log(`Created ${i + 1} patients...`)
    }
  }

  console.log('✅ Successfully seeded 100 Pakistani patients!')
}

main()
  .catch((e) => {
    console.error('Error seeding patients:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
