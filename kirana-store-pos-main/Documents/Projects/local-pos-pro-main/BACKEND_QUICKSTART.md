# Backend Quick Start Guide

This guide will help you set up and build the backend API in 30 minutes.

---

## Prerequisites

- Node.js 20+ installed
- PostgreSQL 16+ installed
- Git installed
- Code editor (VS Code recommended)

---

## Step 1: Initialize Project (5 min)

```bash
# Create backend directory
mkdir backend
cd backend

# Initialize npm project
npm init -y

# Install core dependencies
npm install express cors dotenv
npm install @prisma/client bcryptjs jsonwebtoken zod
npm install express-validator

# Install dev dependencies
npm install -D typescript @types/node @types/express
npm install -D @types/bcryptjs @types/jsonwebtoken
npm install -D ts-node nodemon prisma
npm install -D @types/cors

# Initialize TypeScript
npx tsc --init

# Initialize Prisma
npx prisma init
```

---

## Step 2: Configure TypeScript

Create/update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

Update `package.json` scripts:

```json
{
  "scripts": {
    "dev": "nodemon src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "prisma:migrate": "prisma migrate dev",
    "prisma:generate": "prisma generate",
    "prisma:studio": "prisma studio"
  }
}
```

---

## Step 3: Set Up Environment Variables

Create `.env` file:

```env
# Server
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/local_pos_dev?schema=public"

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=http://localhost:8080
```

Create `.env.example`:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/DATABASE_NAME?schema=public"
JWT_SECRET=change-this-secret
JWT_EXPIRES_IN=24h
CORS_ORIGIN=http://localhost:8080
```

---

## Step 4: Create Project Structure

```bash
mkdir -p src/{controllers,routes,middleware,services,utils,config,types}
touch src/server.ts
touch src/app.ts
```

**Final structure:**
```
backend/
├── src/
│   ├── config/
│   │   └── database.ts
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── productController.ts
│   │   ├── customerController.ts
│   │   ├── saleController.ts
│   │   └── dashboardController.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── errorHandler.ts
│   │   └── validateRequest.ts
│   ├── routes/
│   │   ├── index.ts
│   │   ├── authRoutes.ts
│   │   ├── productRoutes.ts
│   │   ├── customerRoutes.ts
│   │   └── saleRoutes.ts
│   ├── services/
│   │   ├── authService.ts
│   │   ├── saleService.ts
│   │   └── billNumberService.ts
│   ├── types/
│   │   └── express.d.ts
│   ├── utils/
│   │   ├── logger.ts
│   │   └── response.ts
│   ├── app.ts
│   └── server.ts
├── prisma/
│   └── schema.prisma
├── .env
├── .gitignore
├── package.json
└── tsconfig.json
```

---

## Step 5: Set Up Prisma Schema (10 min)

Update `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String   @id @default(uuid())
  email         String   @unique
  passwordHash  String
  fullName      String
  role          String   @default("cashier")
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  lastLoginAt   DateTime?

  sales         Sale[]
  creditTxns    CreditTransaction[]
  products      Product[]

  @@index([email])
}

model Product {
  id              String   @id @default(uuid())
  name            String
  description     String?
  category        String?
  price           Decimal  @db.Decimal(10, 2)
  costPrice       Decimal? @db.Decimal(10, 2)
  stockQuantity   Int      @default(0)
  minStockLevel   Int      @default(10)
  unit            String   @default("pcs")
  barcode         String?  @unique
  expiryDate      DateTime?
  status          String   @default("active")
  createdById     String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  createdBy       User?    @relation(fields: [createdById], references: [id])
  saleItems       SaleItem[]
  stockMovements  StockMovement[]

  @@index([barcode])
  @@index([category])
  @@index([status])
}

model Customer {
  id              String   @id @default(uuid())
  name            String
  phone           String?
  email           String?
  address         String?
  creditBalance   Decimal  @default(0) @db.Decimal(10, 2)
  creditLimit     Decimal  @default(5000) @db.Decimal(10, 2)
  loyaltyPoints   Int      @default(0)
  totalPurchases  Int      @default(0)
  totalSpent      Decimal  @default(0) @db.Decimal(12, 2)
  status          String   @default("active")
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  sales           Sale[]
  creditTxns      CreditTransaction[]

  @@index([phone])
}

model Sale {
  id              String   @id @default(uuid())
  billNumber      String   @unique
  customerId      String?
  subtotal        Decimal  @db.Decimal(10, 2)
  discountAmount  Decimal  @default(0) @db.Decimal(10, 2)
  taxAmount       Decimal  @default(0) @db.Decimal(10, 2)
  totalAmount     Decimal  @db.Decimal(10, 2)
  amountPaid      Decimal  @default(0) @db.Decimal(10, 2)
  creditAmount    Decimal  @default(0) @db.Decimal(10, 2)
  paymentMethod   String
  paymentStatus   String
  notes           String?
  createdById     String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  customer        Customer? @relation(fields: [customerId], references: [id])
  createdBy       User?     @relation(fields: [createdById], references: [id])
  items           SaleItem[]
  creditTxns      CreditTransaction[]
  stockMovements  StockMovement[]

  @@index([billNumber])
  @@index([customerId])
  @@index([createdAt])
}

model SaleItem {
  id          String   @id @default(uuid())
  saleId      String
  productId   String
  productName String
  quantity    Int
  unitPrice   Decimal  @db.Decimal(10, 2)
  discount    Decimal  @default(0) @db.Decimal(10, 2)
  lineTotal   Decimal  @db.Decimal(10, 2)
  createdAt   DateTime @default(now())

  sale        Sale     @relation(fields: [saleId], references: [id], onDelete: Cascade)
  product     Product  @relation(fields: [productId], references: [id])

  @@index([saleId])
}

model CreditTransaction {
  id              String   @id @default(uuid())
  customerId      String
  saleId          String?
  transactionType String
  amount          Decimal  @db.Decimal(10, 2)
  balanceBefore   Decimal  @db.Decimal(10, 2)
  balanceAfter    Decimal  @db.Decimal(10, 2)
  paymentMethod   String?
  notes           String?
  createdById     String?
  createdAt       DateTime @default(now())

  customer        Customer @relation(fields: [customerId], references: [id])
  sale            Sale?    @relation(fields: [saleId], references: [id])
  createdBy       User?    @relation(fields: [createdById], references: [id])

  @@index([customerId, createdAt])
}

model StockMovement {
  id            String   @id @default(uuid())
  productId     String
  movementType  String
  quantityChange Int
  stockBefore   Int
  stockAfter    Int
  referenceId   String?
  notes         String?
  createdAt     DateTime @default(now())

  product       Product  @relation(fields: [productId], references: [id])

  @@index([productId, createdAt])
}

model StoreSetting {
  id                String   @id @default(uuid())
  storeName         String
  contactNumber     String?
  address           String?
  currencySymbol    String   @default("₹")
  taxRate           Decimal  @default(5.00) @db.Decimal(5, 2)
  minStockDefault   Int      @default(10)
  receiptHeader     String?
  receiptFooter     String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

Run migrations:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

---

## Step 6: Create Core Files (15 min)

### 6.1 Database Config

`src/config/database.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

export async function disconnectDatabase() {
  await prisma.$disconnect();
}
```

### 6.2 Express App Setup

`src/app.ts`:

```typescript
import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app: Application = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:8080',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/v1', routes);

// Error handling
app.use(errorHandler);

export default app;
```

### 6.3 Server Entry Point

`src/server.ts`:

```typescript
import app from './app';
import { connectDatabase, disconnectDatabase } from './config/database';

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await connectDatabase();

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('SIGTERM received, shutting down gracefully');
      server.close(async () => {
        await disconnectDatabase();
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
```

### 6.4 Auth Middleware

`src/middleware/auth.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function requireRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }

    next();
  };
}
```

### 6.5 Error Handler

`src/middleware/errorHandler.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}
```

### 6.6 Auth Controller

`src/controllers/authController.ts`:

```typescript
import { Request, Response } from 'express';
import { prisma } from '../config/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function register(req: Request, res: Response) {
  try {
    const { email, password, fullName, role } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        role: role || 'cashier'
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true
      }
    });

    res.status(201).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role
        },
        token,
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
}

export async function getMe(req: Request, res: Response) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true
      }
    });

    res.json({ success: true, data: { user } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
}
```

### 6.7 Routes

`src/routes/authRoutes.ts`:

```typescript
import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', requireAuth, getMe);

export default router;
```

`src/routes/index.ts`:

```typescript
import { Router } from 'express';
import authRoutes from './authRoutes';
// Import other routes as you create them

const router = Router();

router.use('/auth', authRoutes);
// router.use('/products', productRoutes);
// router.use('/customers', customerRoutes);
// router.use('/sales', saleRoutes);

export default router;
```

---

## Step 7: Create Seed Data (Optional)

`prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create default user
  const passwordHash = await bcrypt.hash('admin123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'admin@store.com' },
    update: {},
    create: {
      email: 'admin@store.com',
      passwordHash,
      fullName: 'Store Owner',
      role: 'owner'
    }
  });

  console.log('✅ Created user:', user.email);

  // Create sample products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Tata Salt 1kg',
        category: 'Grocery',
        price: 22,
        costPrice: 18,
        stockQuantity: 45,
        minStockLevel: 20,
        unit: 'pcs',
        barcode: '8901234567890',
        createdById: user.id
      }
    }),
    prisma.product.create({
      data: {
        name: 'Maggi Noodles',
        category: 'Instant Food',
        price: 12,
        costPrice: 9,
        stockQuantity: 8,
        minStockLevel: 20,
        unit: 'pcs',
        barcode: '8901234567891',
        createdById: user.id
      }
    })
  ]);

  console.log('✅ Created products:', products.length);

  // Create store settings
  await prisma.storeSetting.create({
    data: {
      storeName: 'My Kirana Store',
      contactNumber: '9876543210',
      address: '123 Main Street',
      currencySymbol: '₹',
      taxRate: 5.00,
      minStockDefault: 10
    }
  });

  console.log('✅ Created store settings');
  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Add to `package.json`:

```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

Run seed:

```bash
npm install -D ts-node
npx prisma db seed
```

---

## Step 8: Test the API

Start the server:

```bash
npm run dev
```

Test endpoints using curl or Postman:

```bash
# Health check
curl http://localhost:3000/health

# Register user
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "cashier@store.com",
    "password": "cashier123",
    "fullName": "Rajesh Kumar",
    "role": "cashier"
  }'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@store.com",
    "password": "admin123"
  }'

# Get current user (replace TOKEN)
curl http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Step 9: Next Steps

1. **Add Products endpoints** - Create `productController.ts` and `productRoutes.ts`
2. **Add Customers endpoints** - Create `customerController.ts` and `customerRoutes.ts`
3. **Add Sales endpoints** - Create `saleController.ts` and `saleRoutes.ts`
4. **Add Dashboard endpoints** - Create `dashboardController.ts` and `dashboardRoutes.ts`
5. **Add validation** - Use Zod schemas for request validation
6. **Add tests** - Write unit and integration tests
7. **Deploy** - Deploy to Railway, Render, or VPS

---

## Useful Commands

```bash
# Development
npm run dev                    # Start dev server with hot reload
npm run build                  # Build TypeScript to JavaScript
npm start                      # Start production server

# Prisma
npx prisma studio              # Open Prisma Studio (DB GUI)
npx prisma migrate dev         # Create and apply migration
npx prisma generate            # Generate Prisma Client
npx prisma db seed             # Seed database

# Database
npx prisma db push             # Push schema to DB (no migration)
npx prisma migrate reset       # Reset DB and re-run migrations
npx prisma format              # Format schema file
```

---

## Troubleshooting

**Database connection error:**
```bash
# Check PostgreSQL is running
psql --version
pg_isready

# Create database manually
psql -U postgres
CREATE DATABASE local_pos_dev;
\q
```

**Port already in use:**
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 PID
```

**Prisma errors:**
```bash
# Regenerate Prisma Client
npx prisma generate

# Reset database
npx prisma migrate reset
```

---

## Resources

- [Prisma Docs](https://www.prisma.io/docs)
- [Express Docs](https://expressjs.com/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [JWT Docs](https://jwt.io/)

---

**You're ready to start building!** 🚀

Start with authentication endpoints, then move to products, customers, and finally the complex sales flow.
