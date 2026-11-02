import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { databaseUrl } from './database.mjs';
databaseUrl();
const prisma = new PrismaClient();
const catalog = JSON.parse(await readFile(new URL('../prisma/shop-catalog.json', import.meta.url), 'utf8'));
try {
 const added = await prisma.$transaction(async tx => {
  let count = 0;
  for (const item of catalog) {
   const id = 'shop_' + createHash('sha256').update(item.category + ':' + item.name).digest('hex').slice(0,32);
   const existing = await tx.inventoryItem.findFirst({where:{OR:[{id},{name:item.name,category:item.category}]},select:{id:true}});
   if (existing) continue;
   await tx.inventoryItem.create({data:{id,...item}});
   count++;
  }
  return count;
 });
 console.log('Added ' + added + ' shop / medical-store items with sample PKR prices and zero opening stock. Existing items were preserved.');
} finally { await prisma.$disconnect(); }
