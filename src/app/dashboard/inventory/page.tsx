import { connection } from 'next/server'
import { getInventory } from '@/lib/inventory/store'
import { InventoryManager } from '@/components/inventory/inventory-manager'
export const dynamic = 'force-dynamic'
export default async function InventoryPage() {
  await connection()
  const items = await getInventory()
  return <InventoryManager initialItems={items}/>
}
