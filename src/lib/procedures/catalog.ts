import type { procedureCategories } from './types'

export type CatalogProcedure = { name:string; category:(typeof procedureCategories)[number] }

export const procedureCatalog: CatalogProcedure[] = [
  {
    "name": "General consultation",
    "category": "Wellness"
  },
  {
    "name": "Routine health examination",
    "category": "Wellness"
  },
  {
    "name": "Puppy / kitten health examination",
    "category": "Wellness"
  },
  {
    "name": "Senior pet health examination",
    "category": "Wellness"
  },
  {
    "name": "Nutrition and weight consultation",
    "category": "Wellness"
  },
  {
    "name": "Pre-operative examination",
    "category": "Wellness"
  },
  {
    "name": "Post-operative follow-up",
    "category": "Wellness"
  },
  {
    "name": "Rabies vaccination",
    "category": "Vaccination"
  },
  {
    "name": "Canine core vaccination",
    "category": "Vaccination"
  },
  {
    "name": "Feline core vaccination",
    "category": "Vaccination"
  },
  {
    "name": "Vaccination booster",
    "category": "Vaccination"
  },
  {
    "name": "Complete blood count (CBC)",
    "category": "Diagnostics"
  },
  {
    "name": "Serum biochemistry panel",
    "category": "Diagnostics"
  },
  {
    "name": "Blood glucose test",
    "category": "Diagnostics"
  },
  {
    "name": "Urinalysis",
    "category": "Diagnostics"
  },
  {
    "name": "Fecal examination",
    "category": "Diagnostics"
  },
  {
    "name": "Skin scraping examination",
    "category": "Diagnostics"
  },
  {
    "name": "Ear cytology",
    "category": "Diagnostics"
  },
  {
    "name": "X-ray imaging",
    "category": "Diagnostics"
  },
  {
    "name": "Ultrasound examination",
    "category": "Diagnostics"
  },
  {
    "name": "Diagnostic sample collection",
    "category": "Diagnostics"
  },
  {
    "name": "Dog spay",
    "category": "Surgery"
  },
  {
    "name": "Dog neuter",
    "category": "Surgery"
  },
  {
    "name": "Cat spay",
    "category": "Surgery"
  },
  {
    "name": "Cat neuter",
    "category": "Surgery"
  },
  {
    "name": "Wound repair and suturing",
    "category": "Surgery"
  },
  {
    "name": "Abscess drainage",
    "category": "Surgery"
  },
  {
    "name": "Lump removal",
    "category": "Surgery"
  },
  {
    "name": "Foreign body removal",
    "category": "Surgery"
  },
  {
    "name": "Hernia repair",
    "category": "Surgery"
  },
  {
    "name": "Dental examination",
    "category": "Dental care"
  },
  {
    "name": "Dental scaling and polishing",
    "category": "Dental care"
  },
  {
    "name": "Dental X-ray",
    "category": "Dental care"
  },
  {
    "name": "Tooth extraction",
    "category": "Dental care"
  },
  {
    "name": "Wound cleaning and dressing",
    "category": "Treatment"
  },
  {
    "name": "Bandage application / change",
    "category": "Treatment"
  },
  {
    "name": "Suture removal",
    "category": "Treatment"
  },
  {
    "name": "IV catheter placement",
    "category": "Treatment"
  },
  {
    "name": "Fluid therapy",
    "category": "Treatment"
  },
  {
    "name": "Medication administration",
    "category": "Treatment"
  },
  {
    "name": "Deworming",
    "category": "Treatment"
  },
  {
    "name": "Flea and tick treatment",
    "category": "Treatment"
  },
  {
    "name": "Ear treatment",
    "category": "Treatment"
  },
  {
    "name": "Emergency stabilization",
    "category": "Treatment"
  },
  {
    "name": "Hospitalization and monitoring",
    "category": "Treatment"
  },
  {
    "name": "Bath and shampoo",
    "category": "Grooming"
  },
  {
    "name": "Haircut and coat trim",
    "category": "Grooming"
  },
  {
    "name": "Nail trimming",
    "category": "Grooming"
  },
  {
    "name": "Ear cleaning",
    "category": "Grooming"
  },
  {
    "name": "De-matting and brushing",
    "category": "Grooming"
  },
  {
    "name": "Medicated bath",
    "category": "Grooming"
  },
  {
    "name": "Microchip implantation",
    "category": "Other"
  },
  {
    "name": "Microchip scan",
    "category": "Other"
  },
  {
    "name": "Pet boarding",
    "category": "Other"
  },
  {
    "name": "Health certificate examination",
    "category": "Other"
  }
]
