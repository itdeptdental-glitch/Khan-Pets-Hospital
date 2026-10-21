import { prisma } from '@/lib/db/prisma'
import type { InventoryItem } from './types'
import { inventoryInput } from './validation'
import { randomUUID } from 'node:crypto'
import type { z } from 'zod'
type InventoryRow = Omit<InventoryItem, 'price' | 'expiryDate'> & { price: unknown; expiryDate: Date | null }
export async function getInventory(): Promise<InventoryItem[]> {
  const rows = await prisma.$queryRaw<InventoryRow[]>`SELECT id, name, category, brand, quantity, unit, price, reorderLevel, expiryDate, description FROM InventoryItem ORDER BY name ASC`
  return rows.map(row => ({ ...row, price: row.price === null ? null : Number(row.price), expiryDate: row.expiryDate?.toISOString().slice(0,10) ?? null }))
}
export async function saveInventory(input: z.infer<typeof inventoryInput>, id?: string) {
  const {name, category, brand, quantity, unit, price, reorderLevel, expiryDate, description} = input
  const expiry = expiryDate ? new Date(expiryDate + 'T00:00:00Z') : null
  if (id) {
    // Match existence separately: MySQL can report zero changes for an unchanged row.
    const existing = await prisma.$queryRaw<{id:string}[]>`SELECT id FROM InventoryItem WHERE id = ${id}`
    if (!existing.length) return false
    await prisma.$executeRaw`UPDATE InventoryItem SET name=${name}, category=${category}, brand=${brand || null}, quantity=${quantity}, unit=${unit}, price=${price}, reorderLevel=${reorderLevel}, expiryDate=${expiry}, description=${description || null}, updatedAt=NOW(3) WHERE id=${id}`
  } else {
    await prisma.$executeRaw`INSERT INTO InventoryItem (id,name,category,brand,quantity,unit,price,reorderLevel,expiryDate,description,createdAt,updatedAt) VALUES (${randomUUID()},${name},${category},${brand || null},${quantity},${unit},${price},${reorderLevel},${expiry},${description || null},NOW(3),NOW(3))`
  }
  return true
}
