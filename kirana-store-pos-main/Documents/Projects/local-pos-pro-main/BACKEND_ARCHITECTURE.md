# LOCAL POS PRO - BACKEND ARCHITECTURE PLAN

## Table of Contents
1. [Technology Stack Recommendations](#technology-stack-recommendations)
2. [Database Schema Design](#database-schema-design)
3. [API Endpoints Structure](#api-endpoints-structure)
4. [Authentication & Authorization](#authentication--authorization)
5. [Business Logic & Validations](#business-logic--validations)
6. [Infrastructure & Deployment](#infrastructure--deployment)
7. [Development Phases](#development-phases)
8. [Timeline & Estimates](#timeline--estimates)

---

## 1. TECHNOLOGY STACK RECOMMENDATIONS

### Backend Framework Options

#### Option A: Node.js + Express (Recommended for MVP)
**Pros:**
- JavaScript/TypeScript ecosystem (matches frontend)
- Fast development
- Large ecosystem (npm packages)
- Easy deployment
- Team can work full-stack with single language

**Stack:**
```
Runtime:        Node.js 20.x LTS
Framework:      Express 4.x
Language:       TypeScript 5.x
Database ORM:   Prisma 5.x or TypeORM 0.3.x
Validation:     Zod 3.x (already in frontend)
Auth:           JWT (jsonwebtoken) + bcrypt
API Docs:       Swagger/OpenAPI 3.0
```

**Folder Structure:**
```
backend/
├── src/
│   ├── controllers/        # Route handlers
│   ├── services/           # Business logic
│   ├── models/             # Database models (Prisma schema)
│   ├── middleware/         # Auth, validation, error handling
│   ├── routes/             # API route definitions
│   ├── utils/              # Helpers, constants
│   ├── config/             # Environment config
│   └── app.ts              # Express app setup
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── migrations/         # DB migrations
├── tests/
├── .env.example
├── package.json
└── tsconfig.json
```

#### Option B: Python + FastAPI
**Pros:**
- Excellent performance
- Auto-generated API docs
- Built-in validation
- Type hints

**Stack:**
```
Framework:      FastAPI 0.104+
ORM:            SQLAlchemy 2.0 or Tortoise ORM
Validation:     Pydantic (built-in)
Auth:           python-jose + passlib
```

#### Option C: Go + Fiber/Gin
**Pros:**
- Best performance
- Compiled binary (easy deployment)
- Excellent concurrency

**Cons:**
- Different language from frontend
- Slower initial development

---

### Database Recommendations

#### Primary Choice: PostgreSQL 16
**Why PostgreSQL:**
- ACID compliance (critical for financial transactions)
- Excellent support for complex queries
- JSON support for flexible data
- Strong community and tooling
- Free and open source
- Battle-tested for production

**Alternative: MongoDB**
- Good for rapid prototyping
- Schema flexibility
- Not ideal for financial transactions (eventual consistency)
- **Not recommended for POS with credit tracking**

---

## 2. DATABASE SCHEMA DESIGN

### Core Entities

#### 2.1 Users (Authentication)
```sql
CREATE TABLE users (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email             VARCHAR(255) UNIQUE NOT NULL,
  password_hash     VARCHAR(255) NOT NULL,
  full_name         VARCHAR(255) NOT NULL,
  role              VARCHAR(50) NOT NULL DEFAULT 'cashier',
                    -- 'owner', 'cashier', 'staff'
  is_active         BOOLEAN DEFAULT true,
  created_at        TIMESTAMP DEFAULT NOW(),
  updated_at        TIMESTAMP DEFAULT NOW(),
  last_login_at     TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

#### 2.2 Store Settings
```sql
CREATE TABLE store_settings (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_name        VARCHAR(255) NOT NULL,
  contact_number    VARCHAR(15),
  address           TEXT,
  currency_symbol   VARCHAR(10) DEFAULT '₹',
  tax_rate          DECIMAL(5,2) DEFAULT 5.00,
  min_stock_default INTEGER DEFAULT 10,
  receipt_header    TEXT,
  receipt_footer    TEXT,
  created_at        TIMESTAMP DEFAULT NOW(),
  updated_at        TIMESTAMP DEFAULT NOW()
);
```

#### 2.3 Products
```sql
CREATE TABLE products (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              VARCHAR(255) NOT NULL,
  description       TEXT,
  category          VARCHAR(100),
  price             DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  cost_price        DECIMAL(10,2) CHECK (cost_price >= 0),
  stock_quantity    INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  min_stock_level   INTEGER DEFAULT 10 CHECK (min_stock_level >= 0),
  unit              VARCHAR(50) DEFAULT 'pcs',
                    -- 'pcs', 'kg', 'gm', 'ltr', 'ml', 'dozen'
  barcode           VARCHAR(100) UNIQUE,
  expiry_date       DATE,
  status            VARCHAR(50) DEFAULT 'active',
                    -- 'active', 'inactive', 'discontinued'
  created_by        UUID REFERENCES users(id),
  created_at        TIMESTAMP DEFAULT NOW(),
  updated_at        TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_low_stock ON products(stock_quantity, min_stock_level)
  WHERE stock_quantity < min_stock_level;
```

#### 2.4 Customers
```sql
CREATE TABLE customers (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              VARCHAR(255) NOT NULL,
  phone             VARCHAR(15),
  email             VARCHAR(255),
  address           TEXT,
  credit_balance    DECIMAL(10,2) DEFAULT 0.00 CHECK (credit_balance >= 0),
  credit_limit      DECIMAL(10,2) DEFAULT 5000.00,
  loyalty_points    INTEGER DEFAULT 0,
  total_purchases   INTEGER DEFAULT 0,
  total_spent       DECIMAL(12,2) DEFAULT 0.00,
  status            VARCHAR(50) DEFAULT 'active',
                    -- 'active', 'inactive', 'blocked'
  created_at        TIMESTAMP DEFAULT NOW(),
  updated_at        TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_credit ON customers(credit_balance)
  WHERE credit_balance > 0;
CREATE INDEX idx_customers_name ON customers(name);
```

#### 2.5 Sales (Bills/Invoices)
```sql
CREATE TABLE sales (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_number       VARCHAR(50) UNIQUE NOT NULL,
                    -- Format: BILL-YYYY-XXXXXX
  customer_id       UUID REFERENCES customers(id),
                    -- NULL for walk-in customers
  subtotal          DECIMAL(10,2) NOT NULL,
  discount_amount   DECIMAL(10,2) DEFAULT 0.00,
  tax_amount        DECIMAL(10,2) DEFAULT 0.00,
  total_amount      DECIMAL(10,2) NOT NULL,
  amount_paid       DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  credit_amount     DECIMAL(10,2) DEFAULT 0.00,
  payment_method    VARCHAR(50) NOT NULL,
                    -- 'CASH', 'UPI', 'CARD', 'CREDIT', 'PARTIAL'
  payment_status    VARCHAR(50) NOT NULL,
                    -- 'PAID', 'PARTIAL', 'CREDIT'
  notes             TEXT,
  created_by        UUID REFERENCES users(id),
  created_at        TIMESTAMP DEFAULT NOW(),
  updated_at        TIMESTAMP DEFAULT NOW(),

  CONSTRAINT check_payment_amounts
    CHECK (amount_paid + credit_amount = total_amount)
);

CREATE INDEX idx_sales_bill_number ON sales(bill_number);
CREATE INDEX idx_sales_customer ON sales(customer_id);
CREATE INDEX idx_sales_date ON sales(created_at DESC);
CREATE INDEX idx_sales_status ON sales(payment_status);
CREATE SEQUENCE bill_number_seq START 1;
```

#### 2.6 Sale Items (Line Items)
```sql
CREATE TABLE sale_items (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id           UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id        UUID NOT NULL REFERENCES products(id),
  product_name      VARCHAR(255) NOT NULL, -- Snapshot at sale time
  quantity          INTEGER NOT NULL CHECK (quantity > 0),
  unit_price        DECIMAL(10,2) NOT NULL,
  discount          DECIMAL(10,2) DEFAULT 0.00,
  line_total        DECIMAL(10,2) NOT NULL,
  created_at        TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sale_items_sale ON sale_items(sale_id);
CREATE INDEX idx_sale_items_product ON sale_items(product_id);
```

#### 2.7 Credit Transactions (Udhaar History)
```sql
CREATE TABLE credit_transactions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id       UUID NOT NULL REFERENCES customers(id),
  sale_id           UUID REFERENCES sales(id),
                    -- NULL for direct payments
  transaction_type  VARCHAR(50) NOT NULL,
                    -- 'CREDIT_TAKEN', 'PAYMENT_MADE'
  amount            DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  balance_before    DECIMAL(10,2) NOT NULL,
  balance_after     DECIMAL(10,2) NOT NULL,
  payment_method    VARCHAR(50),
                    -- 'CASH', 'UPI', 'CARD', 'BANK_TRANSFER'
  notes             TEXT,
  created_by        UUID REFERENCES users(id),
  created_at        TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_credit_txn_customer ON credit_transactions(customer_id, created_at DESC);
CREATE INDEX idx_credit_txn_type ON credit_transactions(transaction_type);
```

#### 2.8 Stock Movements (Audit Trail)
```sql
CREATE TABLE stock_movements (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id        UUID NOT NULL REFERENCES products(id),
  movement_type     VARCHAR(50) NOT NULL,
                    -- 'SALE', 'RETURN', 'ADJUSTMENT', 'RESTOCK'
  quantity_change   INTEGER NOT NULL, -- Negative for outbound
  stock_before      INTEGER NOT NULL,
  stock_after       INTEGER NOT NULL,
  reference_id      UUID, -- sale_id or other reference
  notes             TEXT,
  created_by        UUID REFERENCES users(id),
  created_at        TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_stock_movements_product ON stock_movements(product_id, created_at DESC);
```

### Database Relationships Diagram

```
users (1) ─────> (∞) sales
users (1) ─────> (∞) credit_transactions
users (1) ─────> (∞) products

customers (1) ──> (∞) sales
customers (1) ──> (∞) credit_transactions

sales (1) ──────> (∞) sale_items
products (1) ────> (∞) sale_items
products (1) ────> (∞) stock_movements
sales (1) ───────> (∞) stock_movements
```

---

## 3. API ENDPOINTS STRUCTURE

### Base URL: `/api/v1`

### 3.1 Authentication Endpoints

```
POST   /auth/register          # Create new user (admin only)
POST   /auth/login             # Login and get JWT token
POST   /auth/logout            # Logout (invalidate token)
POST   /auth/refresh           # Refresh JWT token
GET    /auth/me                # Get current user profile
PUT    /auth/me                # Update current user profile
PUT    /auth/change-password   # Change password
```

**Example Request/Response:**
```typescript
// POST /auth/login
Request: {
  email: "cashier@store.com",
  password: "securepass123"
}

Response: {
  success: true,
  data: {
    user: {
      id: "uuid",
      email: "cashier@store.com",
      fullName: "Rajesh Kumar",
      role: "cashier"
    },
    token: "eyJhbGciOiJIUzI1NiIs...",
    expiresIn: "24h"
  }
}
```

### 3.2 Products Endpoints

```
GET    /products               # List all products (with filters)
GET    /products/:id           # Get single product
POST   /products               # Create new product
PUT    /products/:id           # Update product
DELETE /products/:id           # Soft delete product
PATCH  /products/:id/stock     # Update stock quantity
GET    /products/low-stock     # Get low stock items
GET    /products/expiring      # Get expiring items
GET    /products/barcode/:code # Search by barcode
```

**Query Parameters for GET /products:**
```
?page=1                    # Pagination
&limit=20                  # Items per page
&search=salt               # Search by name
&category=Grocery          # Filter by category
&status=active             # Filter by status
&lowStock=true             # Only low stock items
&sortBy=name               # Sort field
&sortOrder=asc             # asc or desc
```

**Example Response:**
```typescript
GET /products?page=1&limit=20

Response: {
  success: true,
  data: {
    products: [
      {
        id: "uuid",
        name: "Tata Salt 1kg",
        category: "Grocery",
        price: 22.00,
        costPrice: 18.00,
        stockQuantity: 45,
        minStockLevel: 20,
        unit: "pcs",
        barcode: "8901234567890",
        status: "active",
        createdAt: "2025-01-15T10:30:00Z"
      },
      // ... more products
    ],
    pagination: {
      total: 234,
      page: 1,
      limit: 20,
      totalPages: 12
    }
  }
}
```

### 3.3 Customers Endpoints

```
GET    /customers              # List all customers
GET    /customers/:id          # Get single customer
POST   /customers              # Create new customer
PUT    /customers/:id          # Update customer
DELETE /customers/:id          # Soft delete customer
GET    /customers/:id/history  # Get purchase history
GET    /customers/:id/credit   # Get credit transaction history
GET    /customers/with-credit  # List customers with outstanding credit
```

### 3.4 Sales/Billing Endpoints

```
GET    /sales                  # List all sales
GET    /sales/:id              # Get single sale with items
POST   /sales                  # Create new sale (checkout)
PUT    /sales/:id              # Update sale (if allowed)
DELETE /sales/:id              # Void sale (admin only)
GET    /sales/today            # Today's sales summary
GET    /sales/date-range       # Sales by date range
GET    /sales/bill/:billNumber # Get sale by bill number
GET    /sales/:id/receipt      # Generate receipt (PDF/HTML)
```

**Example Sale Creation:**
```typescript
POST /sales

Request: {
  customerId: "uuid-or-null", // null for walk-in
  items: [
    {
      productId: "uuid",
      quantity: 2,
      discount: 0
    },
    {
      productId: "uuid",
      quantity: 5,
      discount: 2
    }
  ],
  paymentMethod: "CASH",
  amountPaid: 100.00,
  notes: "Regular customer"
}

Response: {
  success: true,
  data: {
    sale: {
      id: "uuid",
      billNumber: "BILL-2025-001240",
      customerId: null,
      subtotal: 104.00,
      discountAmount: 10.00,
      taxAmount: 4.70,
      totalAmount: 98.70,
      amountPaid: 100.00,
      creditAmount: 0.00,
      paymentMethod: "CASH",
      paymentStatus: "PAID",
      items: [
        {
          productId: "uuid",
          productName: "Tata Salt 1kg",
          quantity: 2,
          unitPrice: 22.00,
          discount: 0.00,
          lineTotal: 44.00
        },
        // ... more items
      ],
      createdAt: "2025-11-03T14:30:00Z"
    }
  }
}
```

### 3.5 Credit Management Endpoints

```
GET    /credit                 # List all outstanding credit accounts
GET    /credit/customer/:id    # Get customer credit details
POST   /credit/payment         # Record credit payment
GET    /credit/transactions    # List all credit transactions
GET    /credit/total           # Get total outstanding credit
```

**Example Credit Payment:**
```typescript
POST /credit/payment

Request: {
  customerId: "uuid",
  amount: 500.00,
  paymentMethod: "UPI",
  notes: "Partial payment"
}

Response: {
  success: true,
  data: {
    transaction: {
      id: "uuid",
      customerId: "uuid",
      transactionType: "PAYMENT_MADE",
      amount: 500.00,
      balanceBefore: 1200.00,
      balanceAfter: 700.00,
      paymentMethod: "UPI",
      createdAt: "2025-11-03T15:00:00Z"
    },
    customer: {
      id: "uuid",
      name: "Amit Patel",
      creditBalance: 700.00
    }
  }
}
```

### 3.6 Dashboard/Analytics Endpoints

```
GET    /dashboard              # Dashboard summary (KPIs)
GET    /dashboard/alerts       # Low stock + expiring items
GET    /analytics/sales        # Sales analytics
GET    /analytics/revenue      # Revenue trends
GET    /analytics/top-products # Best selling products
GET    /analytics/top-customers # Top customers by spend
```

**Example Dashboard Response:**
```typescript
GET /dashboard

Response: {
  success: true,
  data: {
    todaySales: {
      totalAmount: 12450.00,
      billsCount: 47,
      cashSales: 23,
      creditSales: 24
    },
    creditOutstanding: {
      totalAmount: 8920.00,
      customersCount: 12
    },
    inventory: {
      activeProducts: 234,
      lowStockCount: 15,
      expiringCount: 3
    },
    customers: {
      total: 156,
      newThisWeek: 8
    },
    alerts: {
      lowStock: [
        {
          productId: "uuid",
          name: "Tata Salt 1kg",
          currentStock: 5,
          minStock: 10,
          unit: "pcs"
        },
        // ... more items
      ],
      expiring: [
        {
          productId: "uuid",
          name: "Amul Milk 500ml",
          expiryDate: "2025-11-05",
          daysLeft: 2,
          stock: 12
        },
        // ... more items
      ]
    }
  }
}
```

### 3.7 Settings Endpoints

```
GET    /settings               # Get store settings
PUT    /settings               # Update store settings
```

### 3.8 Reports Endpoints (Phase 2)

```
GET    /reports/sales          # Sales report (PDF/Excel)
GET    /reports/inventory      # Inventory report
GET    /reports/credit         # Credit report
GET    /reports/tax            # Tax report
```

---

## 4. AUTHENTICATION & AUTHORIZATION

### JWT-Based Authentication

**Token Structure:**
```typescript
{
  userId: "uuid",
  email: "cashier@store.com",
  role: "cashier",
  iat: 1699012345,  // Issued at
  exp: 1699098745   // Expires at (24 hours)
}
```

**Middleware Flow:**
```
Request → Auth Middleware → Role Check → Route Handler
```

### Role-Based Access Control (RBAC)

| Endpoint | Owner | Cashier | Staff |
|----------|-------|---------|-------|
| Dashboard | ✓ | ✓ | ✓ |
| POS/Sales Create | ✓ | ✓ | ✗ |
| View Sales | ✓ | ✓ | ✗ |
| Void Sales | ✓ | ✗ | ✗ |
| Products CRUD | ✓ | ✓ | ✓ |
| Update Stock | ✓ | ✓ | ✓ |
| Customers CRUD | ✓ | ✓ | ✗ |
| Credit Payment | ✓ | ✓ | ✗ |
| Settings | ✓ | ✗ | ✗ |
| Users Management | ✓ | ✗ | ✗ |
| Reports | ✓ | ✗ | ✗ |

**Implementation Example:**
```typescript
// Middleware
export const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const requireRole = (roles: string[]) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
};

// Usage
router.post('/sales', requireAuth, requireRole(['owner', 'cashier']), createSale);
router.delete('/sales/:id', requireAuth, requireRole(['owner']), voidSale);
```

---

## 5. BUSINESS LOGIC & VALIDATIONS

### 5.1 Sale/Checkout Flow

**Process:**
1. Validate all products exist and have sufficient stock
2. Calculate subtotal, discount, tax, total
3. Validate payment amounts (paid + credit = total)
4. Create sale record with PENDING status (transaction)
5. Create sale_items records
6. Update product stock quantities
7. Create stock_movement records
8. If credit > 0:
   - Check customer credit limit
   - Update customer credit_balance
   - Create credit_transaction record
9. Update customer total_purchases and total_spent
10. Generate bill_number (BILL-YYYY-XXXXXX)
11. Commit transaction (set status to PAID/PARTIAL/CREDIT)
12. Return sale with bill number

**Validation Rules:**
```typescript
// Sale validation schema (Zod)
const saleSchema = z.object({
  customerId: z.string().uuid().nullable(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive(),
    discount: z.number().min(0).default(0)
  })).min(1, "At least one item required"),
  paymentMethod: z.enum(['CASH', 'UPI', 'CARD', 'CREDIT', 'PARTIAL']),
  amountPaid: z.number().min(0),
  notes: z.string().optional()
}).refine(data => {
  // If credit payment, customer must be provided
  if (data.paymentMethod === 'CREDIT' && !data.customerId) {
    throw new Error("Customer required for credit sales");
  }
  return true;
});
```

### 5.2 Credit Limit Validation

```typescript
async function validateCreditLimit(customerId: string, newCredit: number) {
  const customer = await db.customers.findUnique({ where: { id: customerId } });

  const totalCredit = customer.creditBalance + newCredit;

  if (totalCredit > customer.creditLimit) {
    throw new Error(
      `Credit limit exceeded. Limit: ₹${customer.creditLimit}, ` +
      `Current: ₹${customer.creditBalance}, ` +
      `New: ₹${newCredit}, ` +
      `Would be: ₹${totalCredit}`
    );
  }

  return true;
}
```

### 5.3 Stock Validation

```typescript
async function validateStockAvailability(items: SaleItem[]) {
  const errors = [];

  for (const item of items) {
    const product = await db.products.findUnique({ where: { id: item.productId } });

    if (!product) {
      errors.push(`Product ${item.productId} not found`);
      continue;
    }

    if (product.stockQuantity < item.quantity) {
      errors.push(
        `Insufficient stock for ${product.name}. ` +
        `Available: ${product.stockQuantity}, Required: ${item.quantity}`
      );
    }
  }

  if (errors.length > 0) {
    throw new Error(errors.join('; '));
  }
}
```

### 5.4 Bill Number Generation

```typescript
async function generateBillNumber() {
  const year = new Date().getFullYear();
  const nextSeq = await db.$queryRaw`SELECT nextval('bill_number_seq')`;
  const seqNumber = String(nextSeq[0].nextval).padStart(6, '0');
  return `BILL-${year}-${seqNumber}`;
}
```

---

## 6. INFRASTRUCTURE & DEPLOYMENT

### Development Environment

```env
# .env.development
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:pass@localhost:5432/local_pos_dev
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=24h
CORS_ORIGIN=http://localhost:8080
```

### Production Stack Recommendations

#### Option A: Traditional VPS (DigitalOcean/Linode)
```
Cost: $10-20/month
Specs: 2GB RAM, 1 CPU, 50GB SSD

Setup:
- Ubuntu 22.04 LTS
- PostgreSQL 16 (local)
- Node.js 20 LTS
- PM2 (process manager)
- Nginx (reverse proxy)
- SSL (Let's Encrypt)
```

**Deployment Script:**
```bash
# Install dependencies
sudo apt update
sudo apt install postgresql postgresql-contrib nginx

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install nodejs

# Install PM2
sudo npm install -g pm2

# Setup database
sudo -u postgres createdb local_pos_prod
sudo -u postgres psql -c "CREATE USER pos_user WITH PASSWORD 'secure_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE local_pos_prod TO pos_user;"

# Clone and build backend
git clone <your-repo>
cd backend
npm install
npm run build

# Run migrations
npx prisma migrate deploy

# Start with PM2
pm2 start dist/app.js --name local-pos-api
pm2 save
pm2 startup

# Configure Nginx
sudo nano /etc/nginx/sites-available/local-pos
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name api.yourstore.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### Option B: Cloud Platform (Recommended for Scalability)

**Vercel (Frontend) + Railway/Render (Backend + DB)**
```
Frontend:  Vercel (Free tier)
Backend:   Railway.app ($5/month)
Database:  Railway PostgreSQL (included)

OR

Frontend:  Vercel
Backend:   Render.com ($7/month)
Database:  Supabase (Free tier or $25/month)
```

**Advantages:**
- Zero DevOps
- Auto-scaling
- Built-in monitoring
- Easy deployments (git push)
- SSL included

#### Option C: Containerized (Docker)

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: local_pos
      POSTGRES_USER: pos_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    depends_on:
      - postgres
    environment:
      DATABASE_URL: postgresql://pos_user:${DB_PASSWORD}@postgres:5432/local_pos
      JWT_SECRET: ${JWT_SECRET}
    ports:
      - "3000:3000"
    volumes:
      - ./backend:/app
    command: npm run start:prod

  frontend:
    build: ./frontend
    ports:
      - "8080:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

### Backup Strategy

**Database Backups:**
```bash
# Daily automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=/var/backups/postgres
mkdir -p $BACKUP_DIR

pg_dump -U pos_user local_pos_prod | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
```

**Cron Job:**
```
0 2 * * * /home/user/backup.sh
```

---

## 7. DEVELOPMENT PHASES

### Phase 1: Core Backend Setup (Week 1-2)
- [ ] Initialize Node.js + TypeScript project
- [ ] Set up Express server with CORS
- [ ] Configure Prisma ORM
- [ ] Design and create database schema
- [ ] Run migrations
- [ ] Create seed data for testing
- [ ] Set up environment variables
- [ ] Implement error handling middleware

### Phase 2: Authentication (Week 2)
- [ ] Implement user registration endpoint
- [ ] Implement login with JWT
- [ ] Create auth middleware
- [ ] Implement role-based access control
- [ ] Add password hashing (bcrypt)
- [ ] Test authentication flow

### Phase 3: Products API (Week 3)
- [ ] Implement Products CRUD endpoints
- [ ] Add barcode search
- [ ] Add low stock filtering
- [ ] Add expiring products logic
- [ ] Implement stock update endpoint
- [ ] Add validation with Zod
- [ ] Test all product endpoints

### Phase 4: Customers API (Week 3)
- [ ] Implement Customers CRUD endpoints
- [ ] Add customer search
- [ ] Add credit balance tracking
- [ ] Implement purchase history endpoint
- [ ] Add validation
- [ ] Test all customer endpoints

### Phase 5: Sales/Billing API (Week 4-5)
- [ ] Implement sale creation (complex transaction)
- [ ] Add bill number generation
- [ ] Implement stock deduction logic
- [ ] Add sale listing with filters
- [ ] Add date range queries
- [ ] Implement sale details endpoint
- [ ] Add validation for stock availability
- [ ] Add validation for credit limits
- [ ] Test complete checkout flow

### Phase 6: Credit Management (Week 5)
- [ ] Implement credit transaction creation
- [ ] Add credit payment endpoint
- [ ] Implement credit history endpoint
- [ ] Add outstanding credit summary
- [ ] Add customer credit validation
- [ ] Test credit workflows

### Phase 7: Dashboard & Analytics (Week 6)
- [ ] Implement dashboard summary endpoint
- [ ] Add alerts for low stock
- [ ] Add alerts for expiring products
- [ ] Implement sales analytics
- [ ] Add top products endpoint
- [ ] Add top customers endpoint
- [ ] Test all analytics queries

### Phase 8: Integration & Testing (Week 7)
- [ ] Connect frontend to backend APIs
- [ ] Replace all mock data with API calls
- [ ] Implement React Query hooks
- [ ] Add loading states
- [ ] Add error handling
- [ ] Test complete user flows
- [ ] Fix bugs

### Phase 9: Production Prep (Week 8)
- [ ] Set up production database
- [ ] Configure environment variables
- [ ] Set up CI/CD pipeline
- [ ] Deploy backend to hosting
- [ ] Deploy frontend to Vercel
- [ ] Configure CORS properly
- [ ] Add SSL certificates
- [ ] Test production deployment

### Phase 10: Polish & Launch (Week 9-10)
- [ ] Performance optimization
- [ ] Add database indexes
- [ ] Implement caching (Redis optional)
- [ ] Add API rate limiting
- [ ] Set up monitoring (Sentry)
- [ ] Write API documentation
- [ ] Create user manual
- [ ] Final testing
- [ ] Launch!

---

## 8. TIMELINE & ESTIMATES

### Full Development Timeline

| Phase | Duration | Developer | Total Time |
|-------|----------|-----------|------------|
| Backend Setup | 1-2 weeks | Backend Dev | 40-80 hrs |
| Authentication | 1 week | Backend Dev | 40 hrs |
| Products API | 1 week | Backend Dev | 40 hrs |
| Customers API | 1 week | Backend Dev | 40 hrs |
| Sales API | 1-2 weeks | Backend Dev | 40-80 hrs |
| Credit API | 1 week | Backend Dev | 40 hrs |
| Dashboard API | 1 week | Backend Dev | 40 hrs |
| Frontend Integration | 1 week | Frontend Dev | 40 hrs |
| Testing & Fixes | 1 week | Both | 40 hrs |
| Deployment | 1 week | DevOps | 20 hrs |
| **Total** | **10-12 weeks** | | **400-500 hrs** |

### Cost Estimates

**Development Costs:**
- 1 Backend Developer (400 hrs @ $50/hr): $20,000
- 1 Frontend Dev (40 hrs @ $50/hr): $2,000
- Total: $22,000

**Infrastructure Costs (Monthly):**
- Option 1 (VPS): $20/month
- Option 2 (Cloud): $12/month (Railway/Render)
- Option 3 (Premium): $50/month (managed services)

**First Year Total:**
- Development: $22,000 (one-time)
- Hosting (Year 1): $144-600
- **Total: $22,144 - $22,600**

---

## 9. NEXT STEPS

### Immediate Actions

1. **Choose Tech Stack**
   - Decision: Node.js + Express + PostgreSQL (recommended)
   - Alternative: Python + FastAPI if team prefers

2. **Set Up Development Environment**
   ```bash
   mkdir backend
   cd backend
   npm init -y
   npm install express typescript prisma @prisma/client
   npm install -D @types/node @types/express ts-node nodemon
   npx prisma init
   ```

3. **Create Database Schema**
   - Use the Prisma schema provided above
   - Run `npx prisma migrate dev`

4. **Build MVP Features First**
   - Priority 1: Auth + Products + POS/Sales
   - Priority 2: Customers + Credit
   - Priority 3: Dashboard + Analytics

5. **Parallel Development**
   - Backend team: Start Phase 1-3
   - Frontend team: Prepare API integration layer

---

## 10. SAMPLE CODE SNIPPETS

### Prisma Schema Example

```prisma
// prisma/schema.prisma
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

### Sale Controller Example

```typescript
// controllers/saleController.ts
import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { saleSchema } from '../validation/schemas';
import { generateBillNumber } from '../utils/billNumber';

export async function createSale(req: Request, res: Response) {
  try {
    // Validate request
    const saleData = saleSchema.parse(req.body);

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Validate stock availability
      for (const item of saleData.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId }
        });

        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }

        if (product.stockQuantity < item.quantity) {
          throw new Error(
            `Insufficient stock for ${product.name}. ` +
            `Available: ${product.stockQuantity}, Required: ${item.quantity}`
          );
        }
      }

      // 2. Calculate totals
      let subtotal = 0;
      let totalDiscount = 0;

      const itemsWithDetails = await Promise.all(
        saleData.items.map(async (item) => {
          const product = await tx.product.findUnique({
            where: { id: item.productId }
          });

          const lineTotal = product.price * item.quantity - (item.discount * item.quantity);
          subtotal += product.price * item.quantity;
          totalDiscount += item.discount * item.quantity;

          return {
            productId: item.productId,
            productName: product.name,
            quantity: item.quantity,
            unitPrice: product.price,
            discount: item.discount,
            lineTotal
          };
        })
      );

      const taxRate = 0.05; // 5% - should come from settings
      const taxAmount = (subtotal - totalDiscount) * taxRate;
      const totalAmount = subtotal - totalDiscount + taxAmount;
      const creditAmount = totalAmount - saleData.amountPaid;

      // 3. Validate credit limit if applicable
      if (creditAmount > 0 && saleData.customerId) {
        const customer = await tx.customer.findUnique({
          where: { id: saleData.customerId }
        });

        const newCreditBalance = customer.creditBalance + creditAmount;
        if (newCreditBalance > customer.creditLimit) {
          throw new Error(
            `Credit limit exceeded. Limit: ₹${customer.creditLimit}, ` +
            `Current: ₹${customer.creditBalance}, ` +
            `New credit: ₹${creditAmount}`
          );
        }
      }

      // 4. Generate bill number
      const billNumber = await generateBillNumber();

      // 5. Determine payment status
      let paymentStatus = 'PAID';
      if (creditAmount > 0) {
        paymentStatus = saleData.amountPaid > 0 ? 'PARTIAL' : 'CREDIT';
      }

      // 6. Create sale
      const sale = await tx.sale.create({
        data: {
          billNumber,
          customerId: saleData.customerId,
          subtotal,
          discountAmount: totalDiscount,
          taxAmount,
          totalAmount,
          amountPaid: saleData.amountPaid,
          creditAmount,
          paymentMethod: saleData.paymentMethod,
          paymentStatus,
          notes: saleData.notes,
          createdById: req.user.userId,
          items: {
            create: itemsWithDetails
          }
        },
        include: {
          items: true
        }
      });

      // 7. Update stock and create movements
      for (const item of saleData.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId }
        });

        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: {
              decrement: item.quantity
            }
          }
        });

        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            movementType: 'SALE',
            quantityChange: -item.quantity,
            stockBefore: product.stockQuantity,
            stockAfter: product.stockQuantity - item.quantity,
            referenceId: sale.id,
            notes: `Sale ${billNumber}`
          }
        });
      }

      // 8. Update customer credit if applicable
      if (creditAmount > 0 && saleData.customerId) {
        const customer = await tx.customer.findUnique({
          where: { id: saleData.customerId }
        });

        await tx.customer.update({
          where: { id: saleData.customerId },
          data: {
            creditBalance: {
              increment: creditAmount
            },
            totalPurchases: {
              increment: 1
            },
            totalSpent: {
              increment: saleData.amountPaid
            }
          }
        });

        // Create credit transaction
        await tx.creditTransaction.create({
          data: {
            customerId: saleData.customerId,
            saleId: sale.id,
            transactionType: 'CREDIT_TAKEN',
            amount: creditAmount,
            balanceBefore: customer.creditBalance,
            balanceAfter: customer.creditBalance + creditAmount,
            notes: `Credit from sale ${billNumber}`,
            createdById: req.user.userId
          }
        });
      }

      return sale;
    });

    res.status(201).json({
      success: true,
      data: { sale: result }
    });

  } catch (error) {
    console.error('Sale creation error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}
```

---

## CONCLUSION

This backend architecture plan provides a complete roadmap for building a production-ready POS system. Key highlights:

**Robust Foundation:**
- PostgreSQL for transactional integrity
- JWT authentication with RBAC
- Complete API coverage for all features

**Business Logic:**
- Atomic sale transactions
- Stock management with audit trail
- Credit limit validation
- Real-time calculations

**Scalability:**
- Indexed queries for performance
- Cloud deployment options
- Horizontal scaling ready

**Timeline:**
- 10-12 weeks to full production
- Phased approach allows for iterative testing
- Frontend integration in parallel

**Next Steps:**
1. Review and approve this architecture
2. Set up development environment
3. Start Phase 1 (Backend Setup)
4. Begin API development

The system is designed to be maintainable, secure, and scalable for a small to medium kirana store business.
