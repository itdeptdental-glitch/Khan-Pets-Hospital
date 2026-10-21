import type { PrismaClient } from '@prisma/client'

// Stable IDs make loading the fictional demo repeatable without overwriting edits.
export async function seedDemoPatients(prisma: PrismaClient) {
  return prisma.$transaction(async tx => {
    const people = [
      ['Ayesha', 'Khan'], ['Omar', 'Ahmed'], ['Sara', 'Malik'],
      ['Bilal', 'Hassan'], ['Fatima', 'Ali'], ['Zain', 'Shah'],
    ]
    for (const [index, [firstName, lastName]] of people.entries()) {
      await tx.owner.upsert({ where: { id: `demo-owner-${index + 1}` }, update: {}, create: {
        id: `demo-owner-${index + 1}`, firstName, lastName,
        phone: `0300000010${index}`, email: `demo.owner${index + 1}@example.invalid`,
        address: `Demo address ${index + 1}, Rahim Yar Khan`,
        emergencyContact: 'Demo emergency contact', emergencyPhone: '03000000999',
      } })
    }
    const patients = [
      { name: 'Luna', species: 'Cat', breed: 'Persian', age: 3, weight: 4.2, gender: 'Female', color: 'White', owner: 1, allergies: 'Sensitive to chicken' },
      { name: 'Bruno', species: 'Dog', breed: 'Labrador', age: 5, weight: 28.5, gender: 'Male', color: 'Golden', owner: 2, allergies: '' },
      { name: 'Milo', species: 'Cat', breed: 'Domestic shorthair', age: 2, weight: 3.8, gender: 'Male', color: 'Ginger', owner: 1, allergies: '' },
      { name: 'Coco', species: 'Rabbit', breed: 'Holland Lop', age: 1, weight: 1.8, gender: 'Female', color: 'Brown', owner: 3, allergies: '' },
      { name: 'Rocky', species: 'Dog', breed: 'German Shepherd', age: 4, weight: 32, gender: 'Male', color: 'Black and tan', owner: 4, allergies: 'Flea bite sensitivity' },
      { name: 'Kiwi', species: 'Bird', breed: 'Budgerigar', age: 2, weight: 0.04, gender: 'Unknown', color: 'Green', owner: 5, allergies: '' },
      { name: 'Bella', species: 'Dog', breed: 'Beagle', age: 1, weight: 9.4, gender: 'Female', color: 'Tricolour', owner: 6, allergies: '' },
      { name: 'Simba', species: 'Cat', breed: 'Siamese', age: 6, weight: 5.1, gender: 'Male', color: 'Cream', owner: 3, allergies: '' },
      { name: 'Snowy', species: 'Rabbit', breed: 'Angora', age: 3, weight: 2.3, gender: 'Male', color: 'White', owner: 5, allergies: '' },
      { name: 'Daisy', species: 'Dog', breed: 'Mixed breed', age: 2, weight: 14.6, gender: 'Female', color: 'Brown', owner: 6, allergies: '' },
    ]
    let added = 0
    for (const [index, item] of patients.entries()) {
      const { owner, allergies, ...details } = item
      const id = `demo-pet-${index + 1}`
      if (!await tx.pet.findUnique({ where: { id }, select: { id: true } })) {
        await tx.pet.create({ data: { ...details, id, ownerId: `demo-owner-${owner}`, allergies: allergies || null, notes: 'Fictional demo patient. For demonstration only.' } })
        added++
      }
    }
    // Reuse an available care team member; never create login accounts from the UI.
    const vet = await tx.staff.findFirst({ where: { isActive: true, user: { role: 'VETERINARIAN' } }, orderBy: { id: 'asc' } })
    if (vet) {
      const now = new Date(); now.setUTCHours(0, 0, 0, 0)
      const day = (offset: number) => new Date(now.getTime() + offset * 86400000)
      for (let index = 1; index <= 3; index++) {
        const petId = `demo-pet-${index}`
        await tx.appointment.upsert({ where: { id: `demo-appointment-${index}` }, update: {}, create: {
          id: `demo-appointment-${index}`, petId, veterinarianId: vet.id, date: day(index), time: `${9 + index}:00`, status: 'CONFIRMED', reason: 'Demo wellness follow-up', notes: 'Fictional demonstration appointment',
        } })
        await tx.medicalRecord.upsert({ where: { id: `demo-record-${index}` }, update: {}, create: {
          id: `demo-record-${index}`, petId, veterinarianId: vet.id, visitDate: day(-14), diagnosis: 'Demo wellness examination', treatment: 'Routine care discussed', notes: 'Fictional record; not clinical guidance',
        } })
        await tx.vaccination.upsert({ where: { id: `demo-vaccine-${index}` }, update: {}, create: {
          id: `demo-vaccine-${index}`, petId, veterinarianId: vet.id, vaccineName: 'Demo vaccination', vaccineType: 'Demonstration', dateAdministered: day(-30), nextDueDate: day(335), notes: 'Fictional vaccination record',
        } })
      }
    }
    return { added, historyAdded: Boolean(vet) }
  }, { timeout: 15000 })
}
