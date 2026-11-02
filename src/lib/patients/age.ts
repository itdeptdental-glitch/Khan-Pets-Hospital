import { differenceInCalendarDays, format, parseISO, startOfDay, subDays, subMonths, subYears } from 'date-fns'

export type PatientAge = { years: string; months: string; weeks: string; days: string }

// Clamp month ends and leap days before subtracting weeks and days.
export function birthDateFromAge(age: PatientAge, today = new Date()): string {
 const values = [age.years, age.months, age.weeks, age.days].map(Number)
 if (values.some(value => !Number.isInteger(value) || value < 0) || values[0] > 200 || values[1] > 11 || values[2] > 4 || values[3] > 6) return ''
 return format(subDays(subMonths(subYears(startOfDay(today), values[0]), values[1]), values[2] * 7 + values[3]), 'yyyy-MM-dd')
}

export function ageFromBirthDate(dateOfBirth: string | null, fallbackYears: number, today = new Date()): PatientAge {
 if (!dateOfBirth) return { years: String(fallbackYears), months: '0', weeks: '0', days: '0' }
 const birth = parseISO(dateOfBirth)
 let cursor = startOfDay(today)
 if (!Number.isFinite(birth.getTime()) || birth > cursor) return { years: String(fallbackYears), months: '0', weeks: '0', days: '0' }
 let years = 0
 while (subYears(cursor, years + 1) >= birth) years++
 cursor = subYears(cursor, years)
 let months = 0
 while (months < 11 && subMonths(cursor, months + 1) >= birth) months++
 cursor = subMonths(cursor, months)
 const days = differenceInCalendarDays(cursor, birth)
 return { years: String(years), months: String(months), weeks: String(Math.floor(days / 7)), days: String(days % 7) }
}

export function formatPatientAge(dateOfBirth: string | null, fallbackYears: number): string {
 const age = ageFromBirthDate(dateOfBirth, fallbackYears)
 return age.years+' years, '+age.months+' months, '+age.weeks+' weeks, '+age.days+' days'
}
