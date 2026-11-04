import NextAuth, { type NextAuthOptions } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { createHash } from 'node:crypto'
import { prisma } from '@/lib/db/prisma'
import bcrypt from 'bcryptjs'
const version=(hash:string)=>createHash('sha256').update(hash).digest('hex')
export const authOptions:NextAuthOptions={
 pages:{signIn:'/login'},secret:process.env.NEXTAUTH_SECRET,
 providers:[Credentials({credentials:{email:{label:'Email',type:'email'},password:{label:'Password',type:'password'}},async authorize(credentials){
 if(!credentials?.email||!credentials.password)return null
 const user=await prisma.user.findUnique({where:{email:credentials.email.trim().toLowerCase()},include:{staffProfile:{select:{isActive:true}}}})
 if(!user||user.role!=='ADMIN'||!await bcrypt.compare(credentials.password,user.password))return null
 return {id:user.id,email:user.email,name:user.name,role:user.role,authVersion:version(user.password)}
 }})],session:{strategy:'jwt'},callbacks:{
 async jwt({token,user}){
 if(user){token.sub=user.id;token.authVersion=user.authVersion}
 if(!token.sub)throw Error('Please sign in again.')
 const account=await prisma.user.findUnique({where:{id:token.sub},select:{id:true,name:true,email:true,role:true,password:true,staffProfile:{select:{isActive:true}}}})
 if(!account||account.role!=='ADMIN')throw Error('Account is unavailable. Please sign in again.')
 const current=version(account.password)
 if(token.authVersion&&token.authVersion!==current)throw Error('Password changed. Please sign in again.')
 token.authVersion=current;token.role=account.role;token.name=account.name;token.email=account.email
 return token
 },async session({session,token}){session.user={id:token.sub!,name:token.name,email:token.email!,role:token.role};return session}
 }}
const handler=NextAuth(authOptions)
export {handler as GET,handler as POST}
