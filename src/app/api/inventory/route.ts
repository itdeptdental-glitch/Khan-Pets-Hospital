import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import { getInventory, saveInventory } from '@/lib/inventory/store'
import { inventoryInput } from '@/lib/inventory/validation'
export async function GET() {
  if (!await getServerSession(authOptions)) return NextResponse.json({error:'Please sign in to manage inventory.'},{status:401})
  try { return NextResponse.json(await getInventory()) }
  catch(error) { console.error('Inventory read failed',error); return NextResponse.json({error:'Unable to load inventory.'},{status:500}) }
}
async function write(request: Request, update: boolean) {
  if (!await getServerSession(authOptions)) return NextResponse.json({error:'Please sign in to manage inventory.'},{status:401})
  let body
  try { body = await request.json() } catch { return NextResponse.json({error:'Invalid request.'},{status:400}) }
  const result = inventoryInput.safeParse(body)
  if (!result.success) return NextResponse.json({error:result.error.issues[0].message},{status:400})
  if (update && (typeof body.id !== 'string' || !body.id || body.id.length > 191)) return NextResponse.json({error:'Invalid item ID.'},{status:400})
  try {
    const saved = await saveInventory(result.data, update ? body.id : undefined)
    if (!saved) return NextResponse.json({error:'Item no longer exists.'},{status:404})
    return NextResponse.json({ok:true,items:await getInventory()},{status:update?200:201})
  } catch(error) { console.error('Inventory save failed',error); return NextResponse.json({error:'Unable to save this item. Please try again.'},{status:500}) }
}
export async function POST(request: Request) { return write(request,false) }
export async function PATCH(request: Request) { return write(request,true) }

