# Hospital Management System - Setup Guide

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="mysql://root:password@localhost:3306/hospital_management"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"
```

## Database Setup

1. Install MySQL and create a database:
```sql
CREATE DATABASE hospital_management;
```

2. Update the DATABASE_URL in `.env` with your MySQL credentials.

3. Run Prisma migrations:
```bash
npx prisma migrate dev --name init
```

4. Generate Prisma Client:
```bash
npx prisma generate
```

## Running the Application

```bash
npm run dev
```

The application will be available at http://localhost:3000
