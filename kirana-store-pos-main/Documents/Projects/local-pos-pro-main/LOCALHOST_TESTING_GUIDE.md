# 🚀 Local POS Pro - Testing Guide

## ✅ Servers Running

### Frontend (React + Vite)
- **URL**: http://localhost:8081
- **Network**: http://192.168.29.35:8081
- Status: ✅ **RUNNING**

### Backend (Spring Boot)
- **URL**: http://localhost:8080
- **API Base**: http://localhost:8080/api/v1
- **H2 Console**: http://localhost:8080/h2-console
- Status: ✅ **RUNNING WITH TEST DATA**

---

## 🔐 Test Accounts

### Owner Account
- **Email**: `owner@localpos.com`
- **Password**: `password123`
- **Role**: OWNER (Full Access)

### Cashier Account
- **Email**: `cashier@localpos.com`
- **Password**: `password123`
- **Role**: CASHIER (Limited Access)

---

## 📦 Test Data Seeded

### Products (15 items)
- Tata Salt 1kg - ₹22
- Maggi Noodles - ₹12 (Low Stock)
- Parle-G Biscuits - ₹5 (Low Stock)
- Bru Coffee 50g - ₹145
- Colgate Toothpaste - ₹85
- Lays Chips 50g - ₹20
- **Amul Milk 500ml** - ₹28 *(Expires in 2 days)*
- **Fresh Bread** - ₹40 *(Expires tomorrow)*
- **Curd 200g** - ₹25 *(Expires in 3 days)*
- Sunflower Oil 1L - ₹180
- Basmati Rice 1kg - ₹95
- Surf Excel 1kg - ₹250
- Red Label Tea 250g - ₹120
- Dairy Milk Chocolate - ₹50
- Vim Dishwash Bar - ₹15

### Customers (8 accounts)
- Rajesh Kumar - ₹450 credit
- Priya Sharma - ₹0 credit
- Amit Patel - ₹1,200 credit (Highest)
- Sunita Verma - ₹350 credit
- Vikram Singh - ₹0 credit
- Kavita Reddy - ₹890 credit
- Ramesh Gupta - ₹0 credit
- Anjali Mehta - ₹250 credit

**Total Outstanding Credit**: ₹3,140

---

## 🧪 Testing Features

### 1. Authentication
1. Open http://localhost:8081
2. Login with `owner@localpos.com` / `password123`
3. You should see the Dashboard

### 2. Dashboard
- View today's sales (will be ₹0 initially)
- See low stock alerts (Maggi & Parle-G)
- See expiring products (Milk, Bread, Curd)
- View credit outstanding (₹3,140)

### 3. Products Management
**Navigate to**: Products page
- **Search**: Try searching for "Maggi"
- **View**: See all 15 products
- **Low Stock Filter**: Click "Low Stock" button
- **Status**: Items below min stock show "Low Stock" badge

### 4. Customers Management
**Navigate to**: Customers page
- **Search**: Search by name or phone
- **Credit Balance**: See customers with outstanding credit
- **Pay Credit**: Click "Pay Credit" for customers with balance

### 5. Point of Sale (POS)
**Navigate to**: POS page
- **Search Product**: Type "Tata" to find Tata Salt
- **Quick Add**: Click any product button
- **Add to Cart**: Products appear in cart
- **Quantity**: Use +/- buttons
- **Select Customer**: Choose from dropdown (optional)
- **Payment Method**: Choose CASH, UPI, CARD, CREDIT, or PARTIAL
- **Complete Sale**: Click "Complete Sale"

### 6. Sales History
**Navigate to**: Sales page
- **View Transactions**: See all completed sales
- **Bill Number**: Each sale has unique bill number
- **Payment Status**: See PAID/PARTIAL/CREDIT badges
- **Date Filter**: Use date range buttons

### 7. Credit Management
**Navigate to**: Credit page
- **Outstanding Accounts**: See all customers with credit
- **Total Outstanding**: ₹3,140
- **Record Payment**: Click "Record Payment"
- **View History**: See transaction history

---

## 🔗 API Endpoints

### Authentication
```bash
POST http://localhost:8080/api/v1/auth/register
POST http://localhost:8080/api/v1/auth/login
POST http://localhost:8080/api/v1/auth/logout
GET  http://localhost:8080/api/v1/auth/me
```

### Products
```bash
GET    http://localhost:8080/api/v1/products
POST   http://localhost:8080/api/v1/products
GET    http://localhost:8080/api/v1/products/{id}
PUT    http://localhost:8080/api/v1/products/{id}
DELETE http://localhost:8080/api/v1/products/{id}
GET    http://localhost:8080/api/v1/products/barcode/{barcode}
GET    http://localhost:8080/api/v1/products/low-stock
GET    http://localhost:8080/api/v1/products/expiring
```

### Customers
```bash
GET    http://localhost:8080/api/v1/customers
POST   http://localhost:8080/api/v1/customers
GET    http://localhost:8080/api/v1/customers/{id}
PUT    http://localhost:8080/api/v1/customers/{id}
DELETE http://localhost:8080/api/v1/customers/{id}
GET    http://localhost:8080/api/v1/customers/with-credit
GET    http://localhost:8080/api/v1/customers/top
```

### Sales
```bash
GET  http://localhost:8080/api/v1/sales
POST http://localhost:8080/api/v1/sales
GET  http://localhost:8080/api/v1/sales/{id}
GET  http://localhost:8080/api/v1/sales/bill/{billNumber}
GET  http://localhost:8080/api/v1/sales/today
```

### Credit
```bash
POST http://localhost:8080/api/v1/credit/payment
GET  http://localhost:8080/api/v1/credit/customer/{customerId}
GET  http://localhost:8080/api/v1/credit/transactions
GET  http://localhost:8080/api/v1/credit/outstanding
GET  http://localhost:8080/api/v1/credit/total
```

### Dashboard
```bash
GET http://localhost:8080/api/v1/dashboard
```

---

## 🔧 Database Access

### H2 Console
**URL**: http://localhost:8080/h2-console

**Connection Details**:
- **JDBC URL**: `jdbc:h2:mem:localpos`
- **Username**: `SA`
- **Password**: *(leave empty)*

You can run SQL queries to see the data directly!

---

## 🛠️ Common Issues

### Port Already in Use
If port 8080 or 8081 is already in use:
```bash
# Kill process on port 8080
lsof -ti:8080 | xargs kill -9

# Kill process on port 8081
lsof -ti:8081 | xargs kill -9
```

### Backend Not Starting
```bash
cd backend
mvn clean
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

### Frontend Not Starting
```bash
npm install
npm run dev
```

### Clear All Data (Restart Backend)
The H2 database is in-memory, so restarting the backend clears all data and reseeds test data.

---

## 📊 Expected Behavior

### First Time Usage
1. **Login** → Dashboard shows 0 sales
2. **Create Sale** → Go to POS, add items, complete sale
3. **Dashboard** → Now shows today's sales
4. **Sales Page** → See your transaction
5. **Products** → Stock quantities reduced
6. **Credit** → If you used credit, see balance updated

### Testing Credit Flow
1. Go to **POS**
2. Select a customer (e.g., "Rajesh Kumar")
3. Add products
4. Choose payment method: **CREDIT**
5. Complete sale
6. Go to **Credit** page → See increased balance
7. Click "Record Payment" → Reduce balance

---

## 🎯 Testing Checklist

- [ ] Login successfully
- [ ] View Dashboard with stats
- [ ] Browse Products
- [ ] Search for a product
- [ ] View Customers
- [ ] Create a sale in POS
- [ ] Complete payment (Cash)
- [ ] Create credit sale
- [ ] Record credit payment
- [ ] View Sales history
- [ ] Check Dashboard updates after sale
- [ ] View low stock alerts
- [ ] View expiring products

---

## 📱 Mobile Testing

The frontend is responsive! You can also access it from your phone:
**URL**: http://192.168.29.35:8081

Make sure your phone is on the same WiFi network.

---

## 🎉 Success!

Your Local POS Pro application is now fully integrated and running!

- ✅ Spring Boot backend with H2 database
- ✅ React frontend with real-time updates
- ✅ JWT authentication
- ✅ Full CRUD operations
- ✅ Test data seeded
- ✅ Ready for testing

**Start testing now at**: http://localhost:8081
