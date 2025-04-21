# Employee Management System

A full-stack application for managing organizations, teams, employees, and leave requests.

## Features

- Authentication and authorization with role-based access control
- Organization and team management
- Employee management with reporting structure
- Leave request and approval system
- Responsive UI with modern design

## Tech Stack

### Frontend
- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- Shadcn UI components
- NextAuth.js for authentication
- React Hook Form for form handling
- Zod for validation

### Backend
- NestJS
- TypeScript
- Prisma ORM
- MongoDB
- JWT authentication
- Passport.js
- Class-validator

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB (local or Atlas)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/employee-management.git
cd employee-management
```

2. Install dependencies:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Set up environment variables:

**Backend (.env)**
```
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/employee-management?retryWrites=true&w=majority"
JWT_SECRET="your-jwt-secret"
JWT_EXPIRATION="1d"
PORT=12001
```

**Frontend (.env.local)**
```
NEXT_PUBLIC_API_URL=http://localhost:12001
NEXTAUTH_URL=http://localhost:12000
NEXTAUTH_SECRET=your-nextauth-secret
```

4. Generate Prisma client:
```bash
cd backend
npx prisma generate
```

5. Seed the database:
```bash
cd backend
npm run prisma:seed
```

### Running the Application

1. Start the backend:
```bash
cd backend
npm run start:dev
```

2. Start the frontend:
```bash
cd frontend
npm run dev
```

3. Access the application:
   - Frontend: http://localhost:12000
   - Backend API: http://localhost:12001
   - API Documentation: http://localhost:12001/api

## Default Users

After seeding the database, you can log in with the following credentials:

- Admin:
  - Email: admin@demo.com
  - Password: admin123

- Manager:
  - Email: manager@demo.com
  - Password: manager123

- Employee:
  - Email: dev1@demo.com
  - Password: employee123

## License

This project is licensed under the MIT License - see the LICENSE file for details.