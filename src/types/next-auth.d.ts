import 'next-auth'

declare module 'next-auth' {
  interface User {
    authVersion?: string
    role: string
  }

  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      role: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    authVersion?: string
    role: string
  }
}
