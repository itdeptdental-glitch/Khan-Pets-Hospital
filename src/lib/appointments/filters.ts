export const appointmentPeriods=['Today','Past','Upcoming','All dates'] as const
export const attendanceFilters=['All statuses','Attended','Unattended'] as const
export type AppointmentPeriod=(typeof appointmentPeriods)[number]
export type AttendanceFilter=(typeof attendanceFilters)[number]
export function pakistanToday(now=new Date()):string{
 const parts=new Intl.DateTimeFormat('en',{timeZone:'Asia/Karachi',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now)
 return ['year','month','day'].map(type=>parts.find(part=>part.type===type)!.value).join('-')
}
export function filterAppointments<T extends {date:string;time:string;status:string;petName?:string;ownerName?:string}>(items:T[],period:AppointmentPeriod,attendance:AttendanceFilter,today:string,searchDate='',nameQuery=''):T[]{
 const search=nameQuery.trim().toLocaleLowerCase()
 return items.filter(item=>(searchDate?item.date===searchDate:(period==='All dates'||(period==='Today'?item.date===today:period==='Past'?item.date<today:item.date>today)))&&(attendance==='All statuses'||(attendance==='Attended'?item.status==='COMPLETED':['SCHEDULED','CONFIRMED','NO_SHOW'].includes(item.status)))&&(!search||[item.petName,item.ownerName].some(name=>name?.toLocaleLowerCase().includes(search)))).sort((a,b)=>period==='Past'||period==='All dates'?b.date.localeCompare(a.date)||a.time.localeCompare(b.time):a.date.localeCompare(b.date)||a.time.localeCompare(b.time))
}
