export function formatRegistrationDate(value:string|Date|null|undefined):string {
 if(!value)return 'Not available'
 const date=value instanceof Date?value:new Date(value)
 if(!Number.isFinite(date.getTime()))return 'Not available'
 return new Intl.DateTimeFormat('en-GB',{day:'2-digit',month:'short',year:'numeric',timeZone:'Asia/Karachi'}).format(date)
}
