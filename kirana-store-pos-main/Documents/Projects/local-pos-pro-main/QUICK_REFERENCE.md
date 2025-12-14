# Local POS Pro - Quick Reference Guide

## Project at a Glance

**Full Name**: Kirana Store - Local POS Pro
**Type**: Point of Sale & Inventory Management System
**Built For**: Indian neighborhood kirana stores
**Current Status**: UI/Frontend Complete (100%) | Backend Required (0%)
**Last Updated**: November 3, 2025

---

## Getting Started

### Setup
```bash
npm install
npm run dev              # Start at http://localhost:8080
npm run build           # Production build
npm run lint            # Check code quality
```

### Project Structure
```
src/
├── pages/           # 8 main pages (Dashboard, POS, Products, etc)
├── components/      # Layout, AppSidebar, StatCard + 51 UI components
├── hooks/          # Custom hooks (useIsMobile, useToast)
├── lib/            # Utilities
├── App.tsx         # Routes & providers
├── main.tsx        # Entry point
└── index.css       # Design system & global styles
```

---

## Key Pages & Features

### Dashboard (`/`)
- 5 KPI stats with trends
- Low stock alerts
- Expiring soon alerts
- Real-time status

### POS (`/pos`)
- Product search
- Quick-add grid
- Shopping cart
- Bill calculation (Subtotal, Discount, Tax, Total)
- Payment method selection
- Clear cart & Record payment buttons

### Products (`/products`)
- Inventory table (9 columns)
- 5 sample products
- Stock status indicators
- Search & filter
- Add/Edit/Delete actions

### Customers (`/customers`)
- Customer database table (6 columns)
- 5 sample customers
- Credit tracking
- Payment buttons
- Search & filter

### Sales (`/sales`)
- Transaction history (9 columns)
- 5 sample transactions
- Status badges (Paid/Partial/Credit)
- Search by bill or customer
- Date filters
- View & Print buttons

### Credit (`/credit`)
- Outstanding credit total (₹2,890)
- Credit accounts table (6 columns)
- 4 customers with credit
- Record payment actions
- Transaction history

### Settings (`/settings`)
- Store information
- Billing preferences
- Receipt settings
- Form inputs with defaults

---

## Technology Stack

### Core
- **React 18.3.1** - UI framework
- **TypeScript 5.8.3** - Type safety
- **Vite 5.4.19** - Build tool
- **React Router 6.30.1** - Navigation

### UI & Styling
- **Tailwind CSS 3.4.17** - Styling
- **shadcn/ui (51 components)** - Component library
- **Radix UI** - Headless components
- **Lucide React (462 icons)** - Icons

### State & Data
- **React Hooks** - Local state (useState, useEffect)
- **React Query 5.83** - Server state (configured, ready for APIs)
- **React Hook Form 7.61** - Form handling (ready)
- **Zod 3.25** - Validation (ready)

### Utilities
- **date-fns 3.6** - Date handling
- **recharts 2.15.4** - Charts (available)
- **sonner 1.7.4** - Notifications
- **next-themes 0.3** - Dark mode

---

## Important Files

| File | Purpose |
|------|---------|
| `src/App.tsx` | Routes & setup |
| `src/pages/Dashboard.tsx` | Main dashboard |
| `src/pages/POS.tsx` | Checkout system |
| `src/components/Layout.tsx` | Main layout |
| `src/components/AppSidebar.tsx` | Navigation |
| `src/index.css` | Design system (colors, spacing) |
| `tailwind.config.ts` | Tailwind config |
| `vite.config.ts` | Vite build config |
| `package.json` | Dependencies |
| `tsconfig.json` | TypeScript config |

---

## Data Models (Mock)

### Products
```ts
{ id, name, category, price, stock, min, unit, barcode, status }
```

### Customers
```ts
{ id, name, phone, creditBalance, totalSpent, purchases }
```

### Sales
```ts
{ id, date, customer, total, paid, credit, method, status }
```

### Cart Items
```ts
{ id, name, price, qty, discount }
```

---

## Key Calculations (Working)

### POS Billing
```
Subtotal = SUM(price × qty)
Discount = SUM(discount × qty)
Tax = Subtotal × 5%
Total = Subtotal - Discount + Tax
```

### Credit Total
```
Total Outstanding = SUM(balance for all customers)
```

### Stock Status
```
IF stock < minimum THEN "Low Stock" ELSE "Active"
```

---

## UI Components Used

### From shadcn/ui (51 total)
- **Forms**: Input, Button, Select, Checkbox, Radio, Switch
- **Cards**: Card, Dialog, Alert, Sheet, Popover
- **Tables**: Table, Pagination
- **Navigation**: Sidebar, Tabs, Accordion
- **Feedback**: Badge, Toast, Tooltip
- **Others**: Avatar, Separator, Breadcrumb, etc.

### Custom Components
- **Layout.tsx** - Main wrapper with sidebar + header
- **AppSidebar.tsx** - Navigation (7 routes)
- **StatCard.tsx** - Reusable stat display

---

## Design System

### Colors (HSL)
- **Primary**: Blue (#213 94% 43%)
- **Warning**: Orange (#38 92% 50%)
- **Destructive**: Red (#0 84% 60%)
- **Success**: Green (#142 71% 45%)
- **Muted**: Gray (#215 15% 50%)

### Spacing
- Padding: p-2, p-3, p-4, p-6
- Gaps: gap-2, gap-3, gap-4, gap-6
- Space: space-y-2, space-y-4

### Responsive
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px
- Breakpoints: sm, md, lg, xl, 2xl

### Dark Mode
CSS variables ready, no manual changes needed.

---

## What Works

✓ Navigation between all 8 pages
✓ Responsive design (mobile, tablet, desktop)
✓ All pages display correctly
✓ Mock data showing properly
✓ Calculations working (POS, Credit totals)
✓ Status badges and colors
✓ Icons and typography
✓ Sidebar collapse on mobile
✓ Dark mode CSS variables

---

## What Needs Backend

✗ Real data storage (database)
✗ API endpoints
✗ User authentication
✗ Payment processing
✗ Receipt printing
✗ Email notifications
✗ Barcode scanning
✗ Multi-user support

---

## Common Tasks

### Add New Page
1. Create file in `src/pages/NewPage.tsx`
2. Add to routing in `src/App.tsx`
3. Add to sidebar in `src/components/AppSidebar.tsx`
4. Wrap with Layout component

### Modify Colors
1. Edit `src/index.css` (CSS variables)
2. Or use Tailwind classes directly

### Add New Component
1. Create in `src/components/`
2. Use shadcn/ui as base if possible
3. Import in parent component

### Connect to API
1. Use React Query hooks
2. Replace mock data with API calls
3. Handle loading/error states

---

## Environment Info

- **Node Version**: Should be 16+ (uses ES2020)
- **Package Manager**: npm (or bun)
- **Build Tool**: Vite (v5.4)
- **Port**: 8080
- **Mode**: development/production via Vite

---

## Performance Stats

- **Build Time**: <100ms (Vite)
- **File Size**: 368 KB (source code)
- **Components**: 69 TypeScript files
- **Dependencies**: ~40 packages
- **Bundle**: Optimized with code splitting

---

## Next Steps for Development

### Phase 1: Backend (2-3 weeks)
- [ ] Design API endpoints
- [ ] Set up database (PostgreSQL)
- [ ] Implement user authentication

### Phase 2: Integration (1-2 weeks)
- [ ] Connect React Query to APIs
- [ ] Remove mock data
- [ ] Add error handling

### Phase 3: Features (2-3 weeks)
- [ ] Payment processing
- [ ] Receipt printing
- [ ] Advanced features

### Phase 4: Polish (1-2 weeks)
- [ ] Testing
- [ ] Deployment
- [ ] Monitoring

---

## Useful Links

- **React Docs**: https://react.dev
- **Tailwind**: https://tailwindcss.com
- **shadcn/ui**: https://ui.shadcn.com
- **React Router**: https://reactrouter.com
- **Vite**: https://vitejs.dev
- **TypeScript**: https://www.typescriptlang.org

---

## Documentation Files

This project includes three documentation files:

1. **QUICK_REFERENCE.md** (this file) - Quick lookup guide
2. **EXECUTIVE_SUMMARY.md** - High-level overview
3. **PROJECT_OVERVIEW.md** - Detailed documentation

---

## Questions?

Check the documentation files first, then inspect the source code (it's well-organized).

For specific features, see corresponding files in `src/pages/`.

