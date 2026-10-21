import { z } from 'zod'
import { procedureCategories, procedureStatuses } from './types'
export const procedureInput = z.object({
 petId:z.string().trim().min(1).max(191),
 name:z.string().trim().min(1,'Procedure name is required').max(191),
 category:z.enum(procedureCategories),
 date:z.iso.datetime(),
 status:z.enum(procedureStatuses),
 performedBy:z.string().trim().max(191).nullable().optional(),
 fee:z.number().min(0).max(99999999.99).nullable(),
 notes:z.string().trim().max(2000).nullable().optional(),
})
