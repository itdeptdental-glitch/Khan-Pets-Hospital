import { prisma } from '@/lib/db/prisma'
import type { PatientData } from './types'
export async function getPatientData():Promise<PatientData>{
 const [pets,owners]=await Promise.all([
  prisma.pet.findMany({select:{id:true,ownerId:true,name:true,species:true,breed:true,age:true,weight:true,gender:true,color:true,microchipId:true,dateOfBirth:true,allergies:true,notes:true},orderBy:{createdAt:'desc'}}),
  prisma.owner.findMany({select:{id:true,firstName:true,lastName:true,phone:true,email:true,address:true,emergencyContact:true,emergencyPhone:true},orderBy:[{firstName:'asc'},{lastName:'asc'}]}),
 ])
 return {pets:pets.map(pet=>({...pet,dateOfBirth:pet.dateOfBirth?.toISOString().slice(0,10)??null})),owners}
}
