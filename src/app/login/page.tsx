'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Brand } from '@/components/ui/brand'
import { Icon } from '@/components/ui/icon'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
export default function LoginPage() {
 const router=useRouter()
 const [email,setEmail]=useState('')
 const [password,setPassword]=useState('')
 const [error,setError]=useState('')
 const [loading,setLoading]=useState(false)
 const handleSubmit=async(e:React.FormEvent)=>{e.preventDefault();setError('');setLoading(true);try{const result=await signIn('credentials',{email,password,redirect:false});if(result?.error){setError('Invalid email or password')}else{router.push('/dashboard');router.refresh()}}catch{setError('Unable to sign in. Please try again.')}finally{setLoading(false)}}
 return <main className="login-layout"><section className="login-story"><Link href="/"><Brand/></Link><div><span className="text-xs uppercase tracking-[.2em] text-teal-200">Built around better care</span><h1>A calmer workspace.<br/>More time for your patients.</h1><p>Bring your team, appointments, and medical records together in one thoughtfully organized place.</p><div className="mt-10 flex items-center gap-3 text-sm text-teal-100"><Icon name="shield"/>Your practice. Connected.</div></div><p className="text-xs">Khan Pets Hospital / Rahim Yar Khan</p></section><section className="login-form"><Link href="/" className="login-hospital-brand"><Image src="/logo.jpg" alt="Khan Pets Hospital logo" width={112} height={112} priority className="login-hospital-logo"/><span><strong>Khan Pets Hospital</strong><small>Rahim Yar Khan</small></span></Link><h2>Welcome back</h2><p className="text-sm text-slate-500 mt-2">Sign in to your practice workspace.</p><form onSubmit={handleSubmit}>{error&&<div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}<div><label htmlFor="email">Email address</label><input id="email" type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@hospital.com"/></div><div><label htmlFor="password">Password</label><input id="password" type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password"/></div><Button type="submit" disabled={loading} size="lg">{loading?'Signing in...':'Sign in to workspace'}<Icon name="arrow"/></Button></form><p className="text-xs text-slate-500 mt-8">Need access? Contact your practice administrator.</p><Link href="/" className="mt-8 text-xs text-teal-700">&larr; Back to home</Link></section></main>
}

