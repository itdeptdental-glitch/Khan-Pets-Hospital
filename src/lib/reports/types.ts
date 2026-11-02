export const reportTypes = {patients:'Patients',owners:'Owners',appointments:'Appointments',payments:'Payments',charges:'Service charges',doctors:'Doctors',staff:'Staff',procedures:'Procedures',inventory:'Inventory',medical:'Medical records',vaccinations:'Vaccinations'} as const
export type ReportType = keyof typeof reportTypes
export type ReportResult = { title:string; dateBasis:string; columns:string[]; rows:(string|number)[][]; note?:string; truncated?:boolean }
