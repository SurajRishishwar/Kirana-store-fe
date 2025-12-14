# API Reference - Quick Lookup

Base URL: `http://localhost:3000/api/v1`

---

## Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | ❌ | Create new user |
| POST | `/auth/login` | ❌ | Login and get token |
| GET | `/auth/me` | ✅ | Get current user |
| PUT | `/auth/me` | ✅ | Update profile |
| PUT | `/auth/change-password` | ✅ | Change password |

### Examples

**Login**
```bash
POST /api/v1/auth/login
{
  "email": "admin@store.com",
  "password": "admin123"
}

Response:
{
  "success": true,
  "data": {
    "user": { "id": "...", "email": "...", "fullName": "...", "role": "..." },
    "token": "eyJhbGci...",
    "expiresIn": "24h"
  }
}
```

---

## Products

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/products` | ✅ | All | List products |
| GET | `/products/:id` | ✅ | All | Get product |
| POST | `/products` | ✅ | Owner, Cashier, Staff | Create product |
| PUT | `/products/:id` | ✅ | Owner, Cashier, Staff | Update product |
| DELETE | `/products/:id` | ✅ | Owner, Cashier, Staff | Delete product |
| PATCH | `/products/:id/stock` | ✅ | All | Update stock |
| GET | `/products/low-stock` | ✅ | All | Get low stock items |
| GET | `/products/expiring` | ✅ | All | Get expiring items |
| GET | `/products/barcode/:code` | ✅ | All | Search by barcode |

### Query Parameters

```
GET /products?page=1&limit=20&search=salt&category=Grocery&status=active&lowStock=true&sortBy=name&sortOrder=asc
```

### Examples

**Create Product**
```bash
POST /api/v1/products
Authorization: Bearer TOKEN

{
  "name": "Tata Salt 1kg",
  "category": "Grocery",
  "price": 22.00,
  "costPrice": 18.00,
  "stockQuantity": 45,
  "minStockLevel": 20,
  "unit": "pcs",
  "barcode": "8901234567890"
}
```

**Update Stock**
```bash
PATCH /api/v1/products/:id/stock
Authorization: Bearer TOKEN

{
  "quantity": 50,
  "notes": "Restocked from supplier"
}
```

---

## Customers

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/customers` | ✅ | All | List customers |
| GET | `/customers/:id` | ✅ | All | Get customer |
| POST | `/customers` | ✅ | Owner, Cashier | Create customer |
| PUT | `/customers/:id` | ✅ | Owner, Cashier | Update customer |
| DELETE | `/customers/:id` | ✅ | Owner | Delete customer |
| GET | `/customers/:id/history` | ✅ | All | Purchase history |
| GET | `/customers/:id/credit` | ✅ | All | Credit transactions |
| GET | `/customers/with-credit` | ✅ | All | Customers with credit |

### Query Parameters

```
GET /customers?page=1&limit=20&search=rajesh&withCredit=true&sortBy=totalSpent&sortOrder=desc
```

### Examples

**Create Customer**
```bash
POST /api/v1/customers
Authorization: Bearer TOKEN

{
  "name": "Rajesh Kumar",
  "phone": "9876543210",
  "email": "rajesh@example.com",
  "address": "123 Main Street",
  "creditLimit": 5000
}
```

---

## Sales

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/sales` | ✅ | All | List sales |
| GET | `/sales/:id` | ✅ | All | Get sale details |
| POST | `/sales` | ✅ | Owner, Cashier | Create sale (checkout) |
| PUT | `/sales/:id` | ✅ | Owner | Update sale |
| DELETE | `/sales/:id` | ✅ | Owner | Void sale |
| GET | `/sales/today` | ✅ | All | Today's sales |
| GET | `/sales/date-range` | ✅ | All | Sales by date range |
| GET | `/sales/bill/:billNumber` | ✅ | All | Get by bill number |
| GET | `/sales/:id/receipt` | ✅ | All | Generate receipt |

### Query Parameters

```
GET /sales?page=1&limit=20&status=PAID&paymentMethod=CASH&startDate=2025-11-01&endDate=2025-11-30
```

### Examples

**Create Sale (Checkout)**
```bash
POST /api/v1/sales
Authorization: Bearer TOKEN

{
  "customerId": "uuid-or-null",
  "items": [
    {
      "productId": "uuid",
      "quantity": 2,
      "discount": 0
    },
    {
      "productId": "uuid",
      "quantity": 5,
      "discount": 2
    }
  ],
  "paymentMethod": "CASH",
  "amountPaid": 100.00,
  "notes": "Regular customer"
}

Response:
{
  "success": true,
  "data": {
    "sale": {
      "id": "...",
      "billNumber": "BILL-2025-001240",
      "customerId": null,
      "subtotal": 104.00,
      "discountAmount": 10.00,
      "taxAmount": 4.70,
      "totalAmount": 98.70,
      "amountPaid": 100.00,
      "creditAmount": 0.00,
      "paymentMethod": "CASH",
      "paymentStatus": "PAID",
      "items": [...],
      "createdAt": "2025-11-03T14:30:00Z"
    }
  }
}
```

**Credit Sale**
```bash
POST /api/v1/sales
Authorization: Bearer TOKEN

{
  "customerId": "uuid-required",
  "items": [
    { "productId": "uuid", "quantity": 3, "discount": 0 }
  ],
  "paymentMethod": "CREDIT",
  "amountPaid": 0.00,
  "notes": "Full credit"
}
```

**Partial Payment**
```bash
POST /api/v1/sales
Authorization: Bearer TOKEN

{
  "customerId": "uuid-required",
  "items": [
    { "productId": "uuid", "quantity": 3, "discount": 0 }
  ],
  "paymentMethod": "PARTIAL",
  "amountPaid": 50.00,
  "notes": "Partial payment, rest on credit"
}
```

---

## Credit Management

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/credit` | ✅ | All | Outstanding credit accounts |
| GET | `/credit/customer/:id` | ✅ | All | Customer credit details |
| POST | `/credit/payment` | ✅ | Owner, Cashier | Record payment |
| GET | `/credit/transactions` | ✅ | All | All credit transactions |
| GET | `/credit/total` | ✅ | All | Total outstanding |

### Examples

**Record Credit Payment**
```bash
POST /api/v1/credit/payment
Authorization: Bearer TOKEN

{
  "customerId": "uuid",
  "amount": 500.00,
  "paymentMethod": "UPI",
  "notes": "Partial payment"
}

Response:
{
  "success": true,
  "data": {
    "transaction": {
      "id": "...",
      "customerId": "...",
      "transactionType": "PAYMENT_MADE",
      "amount": 500.00,
      "balanceBefore": 1200.00,
      "balanceAfter": 700.00,
      "paymentMethod": "UPI",
      "createdAt": "2025-11-03T15:00:00Z"
    },
    "customer": {
      "id": "...",
      "name": "Amit Patel",
      "creditBalance": 700.00
    }
  }
}
```

---

## Dashboard

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/dashboard` | ✅ | All | Dashboard summary |
| GET | `/dashboard/alerts` | ✅ | All | Low stock + expiring |

### Examples

**Dashboard Summary**
```bash
GET /api/v1/dashboard
Authorization: Bearer TOKEN

Response:
{
  "success": true,
  "data": {
    "todaySales": {
      "totalAmount": 12450.00,
      "billsCount": 47,
      "cashSales": 23,
      "creditSales": 24
    },
    "creditOutstanding": {
      "totalAmount": 8920.00,
      "customersCount": 12
    },
    "inventory": {
      "activeProducts": 234,
      "lowStockCount": 15,
      "expiringCount": 3
    },
    "customers": {
      "total": 156,
      "newThisWeek": 8
    },
    "alerts": {
      "lowStock": [...],
      "expiring": [...]
    }
  }
}
```

---

## Settings

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/settings` | ✅ | All | Get store settings |
| PUT | `/settings` | ✅ | Owner | Update settings |

### Examples

**Update Settings**
```bash
PUT /api/v1/settings
Authorization: Bearer TOKEN

{
  "storeName": "My Kirana Store",
  "contactNumber": "9876543210",
  "address": "123 Main Street",
  "currencySymbol": "₹",
  "taxRate": 5.00,
  "minStockDefault": 10,
  "receiptHeader": "Thank you for shopping!",
  "receiptFooter": "Visit again!"
}
```

---

## Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "stack": "..." // Only in development
}
```

### Paginated Response
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "total": 234,
      "page": 1,
      "limit": 20,
      "totalPages": 12
    }
  }
}
```

---

## HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Validation error |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate entry |
| 500 | Server Error | Internal error |

---

## Authentication

All endpoints except `/auth/register` and `/auth/login` require authentication.

**Header:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Token Expiry:** 24 hours (configurable)

---

## Payment Methods

```
CASH          - Cash payment
UPI           - UPI payment
CARD          - Card payment
CREDIT        - Full credit (no payment)
PARTIAL       - Partial cash + credit
```

---

## Payment Status

```
PAID          - Fully paid
PARTIAL       - Partially paid
CREDIT        - Full credit (unpaid)
```

---

## Product Units

```
pcs           - Pieces
kg            - Kilogram
gm            - Gram
ltr           - Liter
ml            - Milliliter
dozen         - Dozen
```

---

## User Roles

```
owner         - Full access
cashier       - POS, products, customers
staff         - Products only
```

---

## Common Validations

**Product:**
- price > 0
- stockQuantity >= 0
- minStockLevel >= 0
- barcode must be unique

**Customer:**
- phone must be 10 digits
- creditBalance >= 0
- creditLimit > 0

**Sale:**
- items.length > 0
- amountPaid + creditAmount = totalAmount
- customerId required if creditAmount > 0
- creditAmount must not exceed customer's credit limit

---

## Testing with cURL

**Set token as variable:**
```bash
TOKEN="your-jwt-token-here"
```

**Example requests:**
```bash
# List products
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/products

# Create product
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Sugar 1kg","price":45,"stockQuantity":100}' \
  http://localhost:3000/api/v1/products

# Get dashboard
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/dashboard

# Create sale
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d @sale.json \
  http://localhost:3000/api/v1/sales
```

---

## Frontend Integration

### React Query Setup

```typescript
// src/lib/api.ts
import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Example Hooks

```typescript
// src/hooks/useProducts.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useProducts(params = {}) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: async () => {
      const { data } = await api.get('/products', { params });
      return data.data;
    }
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productData) => {
      const { data } = await api.post('/products', productData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });
}
```

---

## Development Checklist

- [ ] Set up PostgreSQL database
- [ ] Configure environment variables
- [ ] Run database migrations
- [ ] Seed initial data
- [ ] Test authentication endpoints
- [ ] Test products CRUD
- [ ] Test customers CRUD
- [ ] Test sales creation
- [ ] Test credit management
- [ ] Test dashboard endpoints
- [ ] Connect frontend to backend
- [ ] Test complete user flows
- [ ] Set up error handling
- [ ] Add input validation
- [ ] Deploy to production

---

**Quick Reference Complete!** 📚

Use this as a reference while building and integrating the backend with your frontend.
