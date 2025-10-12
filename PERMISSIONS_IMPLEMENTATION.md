# User Level Access Control Implementation

## Overview
This document details the implementation of a four-level user access control system for the Planets Pick ERP.

## User Levels

### Level 1 (L1) - Manager
**Permissions:**
- Can add/create new entries (suppliers, purchase orders, inventory items, customers, orders, production batches)
- Can view and edit existing entries
- **Cannot:**
  - Approve submissions
  - Download or view reports
  - Delete entries
  - Access Finance module
  - Manage users or employees

### Level 2 (L2) - Director
**Permissions:**
- All L1 permissions
- Can approve purchase orders and other submissions
- Can view and download reports relevant to their division/department
- Can delete entries (suppliers, customers, orders, production batches)
- Can mark purchase orders as delivered
- **Cannot:**
  - View all reports (only division-specific)
  - Access Finance module
  - Manage users or employees

### Level 3 (L3) - Finance Manager
**Permissions:**
- All L1 and L2 permissions
- Can view and download ALL reports (not restricted by division)
- Can access Finance module (transactions, accounts, budgets, assets/liabilities)
- Can generate invoices
- Can use Finance AI predictions
- **Cannot:**
  - Add or delete users
  - Add or delete employees
  - Approve user accounts

### Level 4 (L4) - Admin/Finance Director
**Permissions:**
- All permissions from L1, L2, and L3
- Can add, edit, and delete users
- Can approve/reject user account requests
- Can add, edit, and delete employees
- Full access to all modules and features

## Implementation Details

### Frontend Changes

#### 1. Updated Permission Functions (`src/utils/userAuth.ts`)
- `canManageUsers()` - Only L4
- `canApproveUsers()` - Only L4
- `canDeleteSuppliers()` - L2, L3, L4
- `canApprovePurchaseOrders()` - L2, L4
- `canMarkDelivered()` - L2, L3, L4
- `canGenerateInvoices()` - L3, L4
- `canViewReportCategory()` - Updated to allow L3 to view all reports
- Updated permission descriptions

#### 2. Sidebar Navigation (`src/components/Sidebar.tsx`)
- Filters menu items based on user level
- Hides "Administrator" and "Employees" from non-L4 users
- Hides "Reports" from L1 users
- Hides "Finance" from non-L3/L4 users

#### 3. Page-Level Protection
Added access control checks to:
- **Administrator Page** (`src/pages/Administrator.tsx`) - L4 only
- **Employees Page** (`src/pages/Employees.tsx`) - L4 only
- **Finance Page** (`src/pages/Finance.tsx`) - L3, L4 only
- **Reports Page** (`src/pages/Reports.tsx`) - L2, L3, L4 only

### Backend Changes

#### 1. User Routes (`backend/routes/user.js`)
- All user management endpoints now require L4 access
- Routes protected: GET /, POST /, PATCH /:id, DELETE /:id, PATCH /approve/:id

#### 2. Employee Routes (`backend/routes/employee.js`)
- All employee management endpoints (add, update, delete) now require L4 access
- View endpoints accessible to all authenticated users

#### 3. Finance Routes (`backend/routes/finance.js`)
- All finance endpoints now require L3 or L4 access
- Includes: transactions, accounts, budgets, assets/liabilities

#### 4. Finance AI Routes (`backend/routes/financeAi.js`)
- Prediction endpoint requires L3 or L4 access

#### 5. Inventory Routes (`backend/routes/inventory.js`)
- All levels (L1-L4) can add, edit, and view inventory items

#### 6. Order Routes (`backend/routes/order.js`)
- All levels can create and edit orders
- Only L2+ can delete orders

#### 7. Customer Routes (`backend/routes/customer.js`)
- All levels can create and edit customers
- Only L2+ can delete customers

#### 8. Production Routes (`backend/routes/production.js`)
- All levels can create and update production batches
- Only L2+ can delete batches

#### 9. Procurement Reports Routes (`backend/routes/procurementReportsRoutes.js`)
- Report generation: L2, L3, L4
- Report viewing: L2, L3, L4
- Report deletion: L3, L4

#### 10. Purchase Order Routes (`backend/routes/purchaseOrderRoutes.js`)
- Already correctly configured:
  - All levels can create and view
  - Only L2 and L4 can approve
  - L2+ can mark as delivered

#### 11. Supplier Routes (`backend/routes/supplierRoutes.js`)
- All levels can create and view suppliers
- Only L2+ can delete suppliers

#### 12. Invoice Routes (`backend/routes/invoice.js`)
- Already correctly configured:
  - All levels can view invoices
  - L3+ can generate invoices

#### 13. Report Routes (`backend/routes/reportRoutes.js`)
- Already correctly configured:
  - L2+ can view and download reports
  - Department-specific filtering handled in frontend

## Access Control Matrix

| Feature | L1 | L2 | L3 | L4 |
|---------|----|----|----|----|
| Create Suppliers/POs/Inventory | ✅ | ✅ | ✅ | ✅ |
| Approve POs | ❌ | ✅ | ❌ | ✅ |
| Delete Suppliers/Customers | ❌ | ✅ | ✅ | ✅ |
| View Reports | ❌ | ✅ (Division) | ✅ (All) | ✅ (All) |
| Download Reports | ❌ | ✅ (Division) | ✅ (All) | ✅ (All) |
| Access Finance Module | ❌ | ❌ | ✅ | ✅ |
| Generate Invoices | ❌ | ❌ | ✅ | ✅ |
| Finance AI | ❌ | ❌ | ✅ | ✅ |
| Manage Users | ❌ | ❌ | ❌ | ✅ |
| Manage Employees | ❌ | ❌ | ❌ | ✅ |
| Approve User Accounts | ❌ | ❌ | ❌ | ✅ |

## Testing Recommendations

### Backend Testing
1. Test each route with different user levels to ensure proper access control
2. Verify that L1 users are blocked from reports, finance, and user management
3. Verify that L2 users can approve and delete but not access finance
4. Verify that L3 users can access finance but not manage users
5. Verify that L4 users have full access

### Frontend Testing
1. Login as each level and verify:
   - Sidebar shows correct menu items
   - Restricted pages redirect to dashboard
   - Permission-based UI elements are shown/hidden correctly

### Integration Testing
1. Test the complete user creation workflow (L4 creates user, approves with level)
2. Test employee creation with user account (should require L4 approval)
3. Test report access by different levels with different departments
4. Test purchase order approval workflow (L1 creates, L2/L4 approves)

## Security Notes

1. **Defense in Depth**: Both frontend and backend enforce permissions
   - Frontend prevents UI access and navigation
   - Backend enforces at the API level

2. **User Account Creation**: 
   - New users always require L4 approval
   - Level is assigned during approval process

3. **Employee Management**:
   - Creating employees with user accounts triggers user approval workflow
   - Only L4 can manage employees and their linked user accounts

## Migration Notes

If implementing this on an existing system:
1. Existing users without levels will be assigned L1 by default (see `backend/middleware/requireAuth.js`)
2. L4 users should review and reassign levels as needed
3. Update user documentation to reflect new permission structure
