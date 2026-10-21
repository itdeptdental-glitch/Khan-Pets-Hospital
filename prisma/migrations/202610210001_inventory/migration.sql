CREATE TABLE IF NOT EXISTS `InventoryItem` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `category` VARCHAR(191) NOT NULL,
  `brand` VARCHAR(191) NULL,
  `quantity` INTEGER NOT NULL DEFAULT 0,
  `unit` VARCHAR(30) NOT NULL DEFAULT 'pieces',
  `price` DECIMAL(10,2) NULL,
  `reorderLevel` INTEGER NOT NULL DEFAULT 5,
  `expiryDate` DATETIME(3) NULL,
  `description` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `InventoryItem_category_idx` (`category`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO InventoryItem (id,name,category,brand,quantity,unit,price,expiryDate,description,createdAt,updatedAt)
SELECT CONCAT('food_',id),name,'Pet food',brand,GREATEST(quantity,0),LEFT(unit,30),price,expiryDate,description,createdAt,updatedAt FROM PetFood;
INSERT IGNORE INTO InventoryItem (id,name,category,brand,quantity,unit,price,expiryDate,description,createdAt,updatedAt)
SELECT CONCAT('medicine_',id),name,'Medicine',manufacturer,GREATEST(quantity,0),LEFT(COALESCE(NULLIF(unit,''),'pieces'),30),price,expiryDate,description,createdAt,updatedAt FROM Medicine;
INSERT IGNORE INTO InventoryItem (id,name,category,quantity,unit,description,createdAt,updatedAt)
SELECT CONCAT('equipment_',id),name,'Equipment',GREATEST(quantity,0),'pieces',description,createdAt,updatedAt FROM Equipment;
