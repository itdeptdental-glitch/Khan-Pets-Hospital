import { isRecordRemoved } from '@/lib/records/removal'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { allocateBillNumber } from '@/lib/appointments/bill-number'
import { pakistanToday } from '@/lib/appointments/filters'
import { createHash } from 'node:crypto'
import { z } from 'zod'
const money=z.number().min(0).max(99999999.99).refine(n=>Math.abs(n*100-Math.round(n*100))<0.00001,'Use at most two decimal places')
const input=z.object({id:z.uuid(),petId:z.string().min(1).max(191).nullable().default(null),items:z.array(z.object({id:z.string().min(1).max(191),quantity:z.number().int().min(1).max(100000)})).min(1,'Add an item to the sale.').max(100),discount:money.default(0),paid:money,method:z.enum(['Cash','Card','Bank transfer','Other']),reference:z.string().trim().max(191).default('')}).refine(value=>new Set(value.items.map(i=>i.id)).size===value.items.length,'An item can only appear once in a sale.')
export async function POST(request:Request){
 const session=await getServerSession(authOptions);if(!session)return Response.json({error:'Please sign in to sell inventory.'},{status:401})
 let body;try{body=await request.json()}catch{return Response.json({error:'Invalid request.'},{status:400})}
 const parsed=input.safeParse(body);if(!parsed.success)return Response.json({error:parsed.error.issues[0].message},{status:400})
 const sale=parsed.data;const hash=createHash('sha256').update(JSON.stringify({...sale,items:[...sale.items].sort((a,b)=>a.id.localeCompare(b.id))})).digest('hex')
 try{
 const result=await prisma.$transaction(async tx=>{
 const [existing]=await tx.$queryRaw<{id:string;requestHash:string}[]>`SELECT id,requestHash FROM InventorySale WHERE id=${sale.id}`
 if(existing){if(existing.requestHash!==hash)throw Error('REUSED');return {id:existing.id}}
 const pet=sale.petId?await tx.pet.findUnique({where:{id:sale.petId},include:{owner:true}}):null
 if(sale.petId&&(!pet||await isRecordRemoved('patients',sale.petId,tx)))throw Error('PATIENT')
 const lines:{id:string;name:string;quantity:number;unit:string;unitPrice:number;total:number}[]=[]
 for(const item of [...sale.items].sort((a,b)=>a.id.localeCompare(b.id))){
 const [stock]=await tx.$queryRaw<{id:string;name:string;quantity:number;unit:string;price:unknown;expiryDate:Date|null}[]>`SELECT id,name,quantity,unit,price,expiryDate FROM InventoryItem WHERE id=${item.id} AND id NOT IN (SELECT recordId FROM RemovedRecord WHERE kind='inventory') FOR UPDATE`
 if(!stock)throw Error('MISSING')
 if(stock.quantity<item.quantity)throw Error('STOCK:'+stock.name)
 if(stock.price===null)throw Error('PRICE:'+stock.name)
 if(stock.expiryDate&&stock.expiryDate.toISOString().slice(0,10)<pakistanToday())throw Error('EXPIRED:'+stock.name)
 const cents=Math.round(Number(stock.price)*100);lines.push({id:stock.id,name:stock.name,quantity:item.quantity,unit:stock.unit,unitPrice:cents/100,total:cents*item.quantity/100})
 }
 const subtotalCents=lines.reduce((sum,line)=>sum+Math.round(line.total*100),0);const total=(subtotalCents-Math.round(sale.discount*100))/100
 if(total<0)throw Error('DISCOUNT');if(sale.paid>total)throw Error('PAYMENT')
 for(const line of lines)await tx.$executeRaw`UPDATE InventoryItem SET quantity=quantity-${line.quantity},updatedAt=NOW(3) WHERE id=${line.id}`
 const now=new Date();const billNumber=await allocateBillNumber(tx,now)
 const snapshot=JSON.stringify({kind:'sale',petName:pet?.name??'',species:pet?.species??'',breed:pet?.breed??null,registeredAt:pet?.createdAt.toISOString(),ownerName:pet?pet.owner.firstName+' '+pet.owner.lastName:'Walk-in customer',ownerPhone:pet?.owner.phone??'',doctorName:'',scheduledDate:'',scheduledTime:'',attendedAt:now.toISOString(),procedures:[],saleItems:lines,subtotal:subtotalCents/100,discount:sale.discount,notes:'',soldBy:session.user?.name??session.user?.email??''})
 await tx.$executeRaw`INSERT INTO InventorySale (id,billNumber,requestHash,snapshot,total,paid,method,reference,createdAt) VALUES (${sale.id},${billNumber},${hash},${snapshot},${total},${sale.paid},${sale.paid>0?sale.method:null},${sale.reference||null},${now})`
 return {id:sale.id}
 },{timeout:15000})
 return Response.json({...result,billUrl:'/dashboard/inventory/sales/'+result.id},{status:201})
 }catch(error){const message=error instanceof Error?error.message:'';const fixed:Record<string,string>={REUSED:'This sale was already saved with different details. Reopen its bill.',PATIENT:'Select an existing patient.',MISSING:'An item no longer exists. Refresh inventory.',DISCOUNT:'Discount cannot exceed the subtotal.',PAYMENT:'Amount received cannot exceed the discounted total.'};const [code,...rest]=message.split(':');const named:Record<string,string>={STOCK:'Not enough stock for ',PRICE:'Set a selling price for ',EXPIRED:'Cannot sell expired item: '};if(fixed[message]||named[code])return Response.json({error:fixed[message]??named[code]+rest.join(':')},{status:409});console.error('Inventory sale failed',error);return Response.json({error:'Unable to complete sale. No stock changes were saved. Please retry.'},{status:500})}
}
