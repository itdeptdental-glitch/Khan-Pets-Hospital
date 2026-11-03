import { prisma } from '@/lib/db/prisma'
export type ProcedureService={id:string;name:string;category:string;fee:number;samplePrice:boolean}
export async function getProcedureServices():Promise<ProcedureService[]>{const rows=await prisma.$queryRaw<{id:string;name:string;category:string;fee:unknown;samplePrice:boolean|number}[]>`SELECT id,name,category,fee,samplePrice FROM ProcedureService ORDER BY category,name`;return rows.map(row=>({...row,fee:Number(row.fee),samplePrice:Boolean(row.samplePrice)}))}
