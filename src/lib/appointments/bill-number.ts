import type { Prisma } from '@prisma/client'
// AUTO_INCREMENT allocates distinct numbers even when visits are saved concurrently.
export async function allocateBillNumber(tx:Prisma.TransactionClient,date:Date):Promise<string>{
 await tx.$executeRaw`INSERT INTO BillingSequence () VALUES ()`
 const [sequence]=await tx.$queryRaw<{number:bigint}[]>`SELECT LAST_INSERT_ID() AS number`
 const year=new Intl.DateTimeFormat('en',{year:'numeric',timeZone:'Asia/Karachi'}).format(date)
 return 'KPH-'+year+'-'+String(sequence.number).padStart(6,'0')
}
