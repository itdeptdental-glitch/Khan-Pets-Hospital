export const allergyCategories = ['Food','Environmental','Flea / insect','Medication','Contact','Other'] as const
export type AllergyCategory = (typeof allergyCategories)[number]

export function parseAllergies(value:string):{categories:AllergyCategory[];details:string}{
 const match=value.match(/^\[([^\]]+)\](?: ([\s\S]*))?$/)
 if(match){const selected=match[1].split(', ');if(selected.every(item=>allergyCategories.includes(item as AllergyCategory)))return {categories:selected as AllergyCategory[],details:match[2]??''}}
 return {categories:[],details:value}
}
export function serializeAllergies(categories:AllergyCategory[],details:string):string{
 const prefix=allergyCategories.filter(item=>categories.includes(item)).join(', ')
 return prefix?'['+prefix+']'+(details?' '+details:''):details
}
