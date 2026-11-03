CREATE TABLE IF NOT EXISTS BillingSequence (id INTEGER NOT NULL AUTO_INCREMENT, PRIMARY KEY (id));
ALTER TABLE AppointmentBill ADD COLUMN billNumber VARCHAR(30) NULL;
CREATE UNIQUE INDEX AppointmentBill_billNumber_key ON AppointmentBill(billNumber);
