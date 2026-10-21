export const procedureCategories = ['Grooming','Vaccination','Surgery','Dental care','Diagnostics','Treatment','Wellness','Other'] as const
export const procedureStatuses = ['Scheduled','In progress','Completed','Cancelled'] as const
export const procedureExamples: Record<string,string> = {
 Grooming:'Bath & haircut, nail trim, ear cleaning', Vaccination:'Rabies, core vaccines, booster', Surgery:'Spay / neuter, wound repair, minor surgery', 'Dental care':'Dental examination, scaling, extraction', Diagnostics:'Blood test, X-ray, ultrasound', Treatment:'Wound dressing, medication, parasite control', Wellness:'Routine examination, nutrition consultation', Other:'Enter the procedure or service name',
}
export type ProcedureEntry = {id:string;petId:string;petName:string;species:string;name:string;category:string;date:string;status:string;performedBy:string|null;fee:number|null;notes:string|null}
export type ProcedurePet = {id:string;name:string;species:string;owner:{firstName:string;lastName:string}}
