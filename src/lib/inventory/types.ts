export const categories = ['Pet food', 'Pet toys', 'Accessories', 'Medicine', 'Equipment', 'Other'] as const
export type InventoryItem = {
  id: string
  name: string
  category: string
  brand: string | null
  quantity: number
  unit: string
  price: number | null
  reorderLevel: number
  expiryDate: string | null
  description: string | null
}
export function stockStatus(item: Pick<InventoryItem, 'quantity' | 'reorderLevel'>) {
  return item.quantity === 0 ? 'Out of stock' : item.quantity <= item.reorderLevel ? 'Low stock' : 'In stock'
}
