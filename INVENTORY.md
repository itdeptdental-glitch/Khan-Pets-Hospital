# Inventory

Open **Dashboard > Inventory** to add and edit pet food, toys, accessories, medicines, equipment, and other supplies. Enter stock quantities in the unit shown on each item. Low stock means the quantity is at or below the item's threshold; zero means out of stock. Prices are in PKR.

The existing food, medicine, and equipment records are copied once into `InventoryItem`. This table is the source for the Inventory page and dashboard snapshot. Original records remain intact. Subsequent edits are saved in `InventoryItem`.

For another installation with the existing hospital tables, run from the project root:

```
node scripts/migrate-inventory.mjs
```

The additive migration creates the inventory table and imports existing stock. It can be repeated without overwriting inventory edits. It does not reset the database. The Prisma model is in `prisma/schema.prisma`; the inventory data layer uses parameterized Prisma SQL so the running server does not require a generated-client restart.

Inventory writes require a signed-in account. Use **Add item** for new products and **Edit / stock** to update quantities, pricing, expiry dates, or product details.
