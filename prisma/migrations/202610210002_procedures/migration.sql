CREATE TABLE IF NOT EXISTS `PetProcedure` (
 `id` VARCHAR(191) NOT NULL,
 `petId` VARCHAR(191) NOT NULL,
 `name` VARCHAR(191) NOT NULL,
 `category` VARCHAR(191) NOT NULL,
 `date` DATETIME(3) NOT NULL,
 `status` VARCHAR(191) NOT NULL DEFAULT 'Scheduled',
 `performedBy` VARCHAR(191) NULL,
 `fee` DECIMAL(10,2) NULL,
 `notes` TEXT NULL,
 `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 `updatedAt` DATETIME(3) NOT NULL,
 PRIMARY KEY (`id`),
 INDEX `PetProcedure_date_idx` (`date`),
 INDEX `PetProcedure_category_idx` (`category`),
 CONSTRAINT `PetProcedure_petId_fkey` FOREIGN KEY (`petId`) REFERENCES `Pet` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO PetProcedure (id,petId,name,category,date,status,performedBy,fee,notes,createdAt,updatedAt)
SELECT CONCAT('grooming_',id),petId,serviceType,'Grooming',date,CASE WHEN status='COMPLETED' THEN 'Completed' WHEN status='CANCELLED' THEN 'Cancelled' WHEN status='IN_PROGRESS' THEN 'In progress' ELSE 'Scheduled' END,groomer,price,notes,createdAt,updatedAt FROM Grooming;
