export type OwnerRecord={id:string;firstName:string;lastName:string;phone:string;email:string|null;address:string|null;emergencyContact:string|null;emergencyPhone:string|null}
export type PetRecord={id:string;ownerId:string;name:string;species:string;breed:string|null;age:number;weight:number;gender:string;color:string|null;microchipId:string|null;dateOfBirth:string|null;allergies:string|null;notes:string|null}
export type PatientData={pets:PetRecord[];owners:OwnerRecord[]}
