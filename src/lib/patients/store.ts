import { getRemovedIds } from '@/lib/records/removal'
import { prisma } from '@/lib/db/prisma'
import type { PatientData } from './types'
export async function getPatientData(): Promise<PatientData> {
 const removed=await getRemovedIds('patients')
 const [pets, owners] = await Promise.all([
  prisma.pet.findMany({where:{id:{notIn:removed}},select:{
   id:true,ownerId:true,name:true,species:true,breed:true,age:true,weight:true,gender:true,color:true,microchipId:true,dateOfBirth:true,createdAt:true,allergies:true,notes:true,
   appointments:{take:5,orderBy:{date:'desc'},select:{id:true,date:true,time:true,status:true,reason:true,veterinarian:{select:{name:true}}}},
   medicalRecords:{take:5,orderBy:{visitDate:'desc'},select:{id:true,visitDate:true,diagnosis:true,treatment:true}},
   vaccinations:{take:5,orderBy:{dateAdministered:'desc'},select:{id:true,vaccineName:true,dateAdministered:true,nextDueDate:true}},
  },orderBy:[{createdAt:'desc'},{id:'asc'}]}),
  prisma.owner.findMany({select:{id:true,firstName:true,lastName:true,phone:true,email:true,address:true,emergencyContact:true,emergencyPhone:true},orderBy:[{firstName:'asc'},{lastName:'asc'}]}),
 ])
 return {pets:pets.map(({appointments,medicalRecords,vaccinations,createdAt,...pet})=>({
  ...pet,registeredAt:createdAt.toISOString(),dateOfBirth:pet.dateOfBirth?.toISOString().slice(0,10)??null,
  canRemove:true,
  appointments:appointments.map(({date,veterinarian,...item})=>({...item,date:date.toISOString().slice(0,10),veterinarianName:veterinarian.name})),
  medicalRecords:medicalRecords.map(({visitDate,...item})=>({...item,visitDate:visitDate.toISOString().slice(0,10)})),
  vaccinations:vaccinations.map(({dateAdministered,nextDueDate,...item})=>({...item,dateAdministered:dateAdministered.toISOString().slice(0,10),nextDueDate:nextDueDate?.toISOString().slice(0,10)??null})),
 })),owners}
}
