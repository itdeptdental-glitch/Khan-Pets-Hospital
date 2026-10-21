<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Hospital Management System - Project Information

### Tech Stack
- Framework: Next.js 16 with App Router
- Language: TypeScript
- Database: MySQL with Prisma ORM
- Authentication: NextAuth.js
- Styling: Tailwind CSS
- Password Hashing: bcryptjs

### Database Setup
1. Create a MySQL database named `hospital_management`
2. Create a `.env` file (see SETUP.md for template)
3. Run: `npx prisma migrate dev --name init`
4. Run: `npx prisma generate`
5. Run: `npm run seed` (to populate initial data)

### Default Credentials
- Admin: admin@hospital.com / admin123
- Doctor: doctor@hospital.com / doctor123

### Key Features
- Patient Management (CRUD)
- Doctor/Staff Management (CRUD)
- Appointment Scheduling
- Medical Records
- Role-based Authentication (Admin, Doctor, Staff)

### Project Structure
- `src/app/dashboard/` - Main application pages
- `src/app/api/` - API routes
- `src/lib/auth/` - Authentication configuration
- `src/lib/db/` - Database client
- `src/components/` - Reusable UI components
- `prisma/` - Database schema and seed files

### Running the Application
```bash
npm run dev
```
The app will be available at http://localhost:3000
