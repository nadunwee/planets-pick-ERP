# Access Control Implementation Changes

This document outlines the changes made to implement the refined access control system as per the requirements.

## Summary of Changes

The access control system has been refined to implement a more granular permission structure based on user levels (L1-L4) and departments. The key principle is:

- **L1 (Manager)**: Can add items but cannot approve or view reports
- **L2 (Director)**: Can approve department-specific items and view department reports
- **L3 (Finance Manager)**: Can view all reports except Finance reports, add transactions that require L4 approval, but cannot approve/delete items from other departments
- **L4 (Finance Director/Admin)**: Can do everything including approve transactions and view Finance reports

## Backend Changes

### 1. Finance Model (`backend/models/financeModel.js`)
**Added approval workflow fields to Transaction schema:**
- `approved`: Boolean to track if transaction is approved
- `approvalStatus`: Enum ("pending", "approved", "rejected")
- `createdBy`: String to track who created the transaction
- `approvedBy`: String to track who approved the transaction
- `approvedAt`: Date when the transaction was approved

### 2. Finance Controller (`backend/controllers/financeController.js`)
**Modified `addTransaction` function:**
- L3 users create transactions with `approvalStatus: "pending"` and `approved: false`
- L4 users create transactions with `approvalStatus: "approved"` and `approved: true`
- Transactions requiring approval have `status: "pending"` until approved

**Added `approveTransaction` function:**
- Only accessible by L4 users
- Allows approving or rejecting pending transactions
- Updates transaction status to "completed" when approved or "failed" when rejected
- Tracks who approved and when

### 3. Finance Routes (`backend/routes/finance.js`)
**Added new route:**
- `PATCH /api/finance/transactions/:id/approve` - L4 only
- Placed before the generic PUT route to avoid route conflicts

### 4. Reports Controller (`backend/controllers/reportsController.js`)
**Updated `isReportCategoryAllowed` function:**
- L1: Cannot view any reports
- L2: Can view reports relevant to their department
- L3: Can view all reports EXCEPT Finance reports
- L4: Can view all reports including Finance

### 5. Route Permission Updates
**Updated the following routes to exclude L3 from delete operations:**

- `backend/routes/supplierRoutes.js`: DELETE - L2, L4 only (removed L3)
- `backend/routes/customer.js`: DELETE - L2, L4 only (removed L3)
- `backend/routes/order.js`: DELETE - L2, L4 only (removed L3)
- `backend/routes/production.js`: DELETE - L2, L4 only (removed L3)
- `backend/routes/purchaseOrderRoutes.js`: 
  - PATCH /:id/deliver (mark delivered) - L2, L4 only (removed L3)
  - Approve endpoint already restricted to L2, L4

## Frontend Changes

### 1. User Auth Utility (`src/utils/userAuth.ts`)
**Updated permission functions:**

- `canApprovePurchaseOrders`: L2 and L4 only (removed L3)
- `canDeleteSuppliers`: L2 and L4 only (removed L3)
- `canMarkDelivered`: L2 and L4 only (removed L3)
- `canViewReportCategory`: L3 can view all EXCEPT Finance reports
- `canDownloadReportCategory`: L3 can download all EXCEPT Finance reports

**Added new function:**
- `canApproveTransactions`: L4 only

**Updated descriptions:**
- Updated `getUserPermissionsDescription` to reflect new L3 restrictions

### 2. Administrator Page (`src/pages/Administrator.tsx`)
**Removed L5 option:**
- Updated level dropdown to only show L1-L4 (removed L5 as L4 is the highest level)

## Documentation Updates

### 1. PERMISSIONS_IMPLEMENTATION.md
**Updated all level descriptions to reflect new permissions:**

- L2: Added note that they cannot approve transactions
- L3: Completely rewritten to clarify:
  - Can only do L1 permissions (create entries)
  - Cannot approve/delete items from other departments
  - Can view all reports EXCEPT Finance
  - Transactions require L4 approval
- L4: Added details about transaction approval and Finance report access

**Updated Access Control Matrix:**
- Split report access into three rows: Department, All except Finance, Finance only
- Added transaction approval row
- Added "Mark PO as Delivered" row
- Clarified which levels can delete items

## Testing Verification

- ✅ Backend server starts without errors
- ✅ All JavaScript/TypeScript files have correct syntax
- ✅ Route configurations are properly set up
- ✅ Finance model includes all required fields

## Migration Notes

For existing systems:
1. Run a migration to add new fields to existing Transaction documents
2. Existing transactions without approval fields should be set to `approved: true` and `approvalStatus: "approved"`
3. L3 users should be notified of their new permission restrictions
4. L4 users should be informed of their new transaction approval responsibilities

## API Changes

### New Endpoint
**PATCH /api/finance/transactions/:id/approve**
- Access: L4 only
- Request body: `{ approve: true/false }`
- Response: Updated transaction object with approval status

### Modified Behavior
**POST /api/finance/transactions**
- L3 users: Creates transaction with `approvalStatus: "pending"`
- L4 users: Creates transaction with `approvalStatus: "approved"`
- All transactions track creator and approver information

## Security Implications

1. **Separation of Duties**: L3 cannot approve their own transactions - requires L4 approval
2. **Audit Trail**: All transactions track who created and who approved them
3. **Department Isolation**: L3 cannot delete or approve items from other departments
4. **Report Access Control**: Finance reports are restricted to L4 only

## Key Behavioral Changes

1. **L3 Finance Managers**:
   - Can no longer delete suppliers, customers, orders, or production batches
   - Can no longer approve purchase orders
   - Can no longer mark purchase orders as delivered
   - Cannot view Finance reports (L4 only)
   - Transactions they create require L4 approval

2. **L4 Finance Directors**:
   - Must approve all transactions created by L3 users
   - Exclusive access to Finance reports
   - Can approve transactions before they are finalized in the system

3. **Transaction Workflow**:
   - L3 creates transaction → Status: "pending", Approval: "pending"
   - L4 approves → Status: "completed", Approval: "approved"
   - L4 rejects → Status: "failed", Approval: "rejected"
