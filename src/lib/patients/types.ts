export type OwnerRecord={id:string;firstName:string;lastName:string;phone:string;email:string|null;address:string|null;emergencyContact:string|null;emergencyPhone:string|null}
export type PetRecord={
 id:string;ownerId:string;name:string;species:string;breed:string|null;age:number;weight:number;gender:string;color:string|null;microchipId:string|null;dateOfBirth:string|null;allergies:string|null;notes:string|null;canRemove:boolean
 appointments:{id:string;date:string;time:string;status:string;reason:string|null;veterinarianName:string}[]
 medicalRecords:{id:string;visitDate:string;diagnosis:string;treatment:string|null}[]
 vaccinations:{id:string;vaccineName:string;dateAdministered:string;nextDueDate:string|null}[]
}
export type PatientData={pets:PetRecord[];owners:OwnerRecord[]}
