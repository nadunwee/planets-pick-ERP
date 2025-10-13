# Access Control Quick Reference

## Level Definitions

### L1 - Manager
- **Can**: Add suppliers, purchase orders, inventory, customers, orders, production batches
- **Cannot**: Approve anything, delete anything, mark delivered, view/download reports, access Finance

### L2 - Director
- **Can**: Everything L1 can + Approve department POs, delete department items, mark POs delivered, view/download department reports
- **Cannot**: Approve transactions, view all reports, access Finance module, manage users/employees

### L3 - Finance Manager
- **Can**: Add items (like L1), view/download ALL reports except Finance, access Finance module, add transactions (requires L4 approval), generate invoices, use Finance AI
- **Cannot**: Approve POs, delete items, mark delivered, view Finance reports, approve transactions, manage users/employees

### L4 - Finance Director / Admin
- **Can**: Everything all levels can do + Approve transactions, view Finance reports, manage users/employees, approve user accounts
- **Cannot**: Nothing (full access)

## Report Access Matrix

| Report Category | L1 | L2 | L3 | L4 |
|-----------------|----|----|----|----|
| Procurement     | ❌ | ✅* | ✅ | ✅ |
| Suppliers       | ❌ | ✅* | ✅ | ✅ |
| Orders          | ❌ | ✅* | ✅ | ✅ |
| Inventory       | ❌ | ✅* | ✅ | ✅ |
| Production      | ❌ | ✅* | ✅ | ✅ |
| HR              | ❌ | ✅* | ✅ | ✅ |
| Finance         | ❌ | ❌ | ❌ | ✅ |

*Only if relevant to their department

## Department-Specific Access (L2)

| Department | Can Access Reports |
|------------|-------------------|
| Procurement | Procurement, Suppliers, Orders |
| Finance | Finance |
| Inventory | Inventory |
| Production | Production, Orders |
| Human Resources | HR |
| Administration | Procurement, Suppliers, Orders, Inventory, Finance |

## Approval Workflows

### Purchase Orders
1. **L1** creates purchase order → Status: "pending"
2. **L2 or L4** approves → Status: "approved"
3. **L2 or L4** marks delivered → Status: "delivered"

### Finance Transactions
1. **L3** creates transaction → Status: "pending", Approval: "pending"
2. **L4** approves → Status: "completed", Approval: "approved"
   OR
   **L4** rejects → Status: "failed", Approval: "rejected"

OR

1. **L4** creates transaction → Status: "completed", Approval: "approved" (auto-approved)

## Common Questions

**Q: Can L3 approve purchase orders?**
A: No, only L2 (Director) and L4 (Admin) can approve purchase orders.

**Q: Can L3 delete suppliers?**
A: No, only L2 (Director) and L4 (Admin) can delete suppliers, customers, orders, or production batches.

**Q: Can L3 view Finance reports?**
A: No, only L4 (Finance Director/Admin) can view Finance reports.

**Q: Does L3 need approval for transactions?**
A: Yes, all transactions created by L3 require L4 approval before they are finalized.

**Q: Can L4 see all reports?**
A: Yes, L4 can view and download all reports including Finance reports.

**Q: What's the difference between L2 and L3?**
A: L2 is a department director who can approve and delete items within their department. L3 is a Finance Manager who can access the Finance module and view most reports but cannot approve/delete items from other departments. L3 requires L4 approval for transactions.

**Q: Who can approve new user accounts?**
A: Only L4 (Admin) can approve new user accounts.

**Q: Can L1 view any reports?**
A: No, L1 cannot view or download any reports.

## Frontend Permission Functions

```typescript
// User level check
canManageUsers(level)           // L4 only
canApproveUsers(level)          // L4 only
canApproveTransactions(level)   // L4 only

// Purchase orders
canApprovePurchaseOrders(level) // L2, L4
canMarkDelivered(level)         // L2, L4

// CRUD operations
canDeleteSuppliers(level)       // L2, L4
canGenerateInvoices(level)      // L3, L4

// Reports
canViewReportCategory(level, dept, category)
canDownloadReportCategory(level, dept, category)
```

## Backend Route Access

```javascript
// Finance
POST   /api/finance/transactions           // L3, L4
PATCH  /api/finance/transactions/:id/approve  // L4 only
PUT    /api/finance/transactions/:id       // L3, L4
DELETE /api/finance/transactions/:id       // L3, L4

// Purchase Orders
POST   /api/purchase-orders                // L1, L2, L3, L4
PATCH  /api/purchase-orders/:id/approve    // L2, L4
PATCH  /api/purchase-orders/:id/deliver    // L2, L4

// Suppliers
POST   /api/suppliers                      // L1, L2, L3, L4
DELETE /api/suppliers/:id                  // L2, L4

// Customers
POST   /api/customers/create               // L1, L2, L3, L4
DELETE /api/customers/delete/:id           // L2, L4

// Orders
POST   /api/orders/create                  // L1, L2, L3, L4
DELETE /api/orders/delete/:id              // L2, L4

// Production
POST   /api/production                     // L1, L2, L3, L4
DELETE /api/production/:id                 // L2, L4

// Users & Employees
All user/employee routes                   // L4 only
```
