// Temporary practice policy: staff profiles remain usable, but only this account can sign in.
export const allowedLoginEmail='noman@kph.com'
export function isLoginAllowed(email:string|null|undefined):boolean{return email?.trim().toLowerCase()===allowedLoginEmail}
