# Access Control Flow Diagram

## Level Hierarchy
```
L4 (Finance Director/Admin) ─────────────────────────┐
    │                                                  │
    │ Full Access                                      │
    │ - Approve transactions                           │
    │ - View Finance reports                           │
    │ - Manage users/employees                         │
    │                                                  │
    └──> Can do everything L1, L2, L3 can do          │
                                                       │
L3 (Finance Manager) ────────────────────────────────┤
    │                                                  │
    │ Finance Module Access                            │
    │ - Add transactions (needs L4 approval)           │
    │ - View all reports EXCEPT Finance                │
    │ - Generate invoices                              │
    │ - Finance AI                                     │
    │                                                  │
    │ CANNOT:                                          │
    │ - Approve POs                                    │
    │ - Delete items                                   │
    │ - Mark delivered                                 │
    │ - View Finance reports                           │
    │                                                  │
    └──> Can do everything L1 can do                  │
                                                       │
L2 (Director) ───────────────────────────────────────┤
    │                                                  │
    │ Department Management                            │
    │ - Approve department POs                         │
    │ - Delete department items                        │
    │ - Mark POs as delivered                          │
    │ - View/download department reports               │
    │                                                  │
    └──> Can do everything L1 can do                  │
                                                       │
L1 (Manager) ────────────────────────────────────────┘
    │
    │ Basic Operations
    │ - Add suppliers
    │ - Add purchase orders
    │ - Add inventory items
    │ - Add customers
    │ - Add orders
    │ - Add production batches
    │
    │ CANNOT:
    │ - Approve anything
    │ - Delete anything
    │ - View reports
    │ - Access Finance module
```

## Purchase Order Workflow
```
┌─────────────────────────────────────────────────────────────────┐
│                    Purchase Order Lifecycle                      │
└─────────────────────────────────────────────────────────────────┘

L1 Manager (Procurement Dept)
    │
    │ Creates PO
    ▼
┌──────────────────┐
│ PO Status:       │
│ - pending        │
└──────────────────┘
    │
    │ Requires Approval
    ▼
L2 Director OR L4 Admin
    │
    │ Approves/Rejects
    ▼
┌──────────────────┐     ┌──────────────────┐
│ If Approved:     │     │ If Rejected:     │
│ - approved       │     │ - rejected       │
└──────────────────┘     └──────────────────┘
    │
    │ Goods Received
    ▼
L2 Director OR L4 Admin
    │
    │ Marks as Delivered
    ▼
┌──────────────────┐
│ PO Status:       │
│ - delivered      │
└──────────────────┘
```

## Transaction Approval Workflow
```
┌─────────────────────────────────────────────────────────────────┐
│                   Transaction Lifecycle                          │
└─────────────────────────────────────────────────────────────────┘

                L3 Finance Manager            L4 Finance Director
                       │                              │
                       │                              │
                  Creates Transaction         Creates Transaction
                       │                              │
                       ▼                              ▼
              ┌─────────────────┐           ┌─────────────────┐
              │ Status:         │           │ Status:         │
              │ - pending       │           │ - completed     │
              │ Approval:       │           │ Approval:       │
              │ - pending       │           │ - approved      │
              │ Approved: false │           │ Approved: true  │
              └─────────────────┘           └─────────────────┘
                       │                              │
                       │                              │
                Requires L4                     Auto-approved
                  Approval                             │
                       │                              │
                       ▼                              ▼
              L4 Finance Director                 Finalized
                       │                        (No approval
                       │                          needed)
                 Approve/Reject
                       │
          ┌────────────┴────────────┐
          ▼                         ▼
  ┌─────────────────┐     ┌─────────────────┐
  │ If Approved:    │     │ If Rejected:    │
  │ - completed     │     │ - failed        │
  │ - approved      │     │ - rejected      │
  │ Approved: true  │     │ Approved: false │
  └─────────────────┘     └─────────────────┘
          │                         │
          ▼                         ▼
    Finalized in                 Cancelled
       System                   Transaction
```

## Report Access Flow
```
┌─────────────────────────────────────────────────────────────────┐
│                     Report Access Control                        │
└─────────────────────────────────────────────────────────────────┘

Report Category: Procurement, Suppliers, Orders, Inventory, etc.
    │
    ├──> L1 Manager: ❌ Access Denied
    │
    ├──> L2 Director: ✅ Only if relevant to department
    │        │
    │        └──> Check department mapping
    │             ├─ Procurement Dept → Procurement, Suppliers, Orders
    │             ├─ Finance Dept → Finance
    │             ├─ Inventory Dept → Inventory
    │             ├─ Production Dept → Production, Orders
    │             ├─ HR Dept → HR
    │             └─ Administration → All non-Finance
    │
    ├──> L3 Finance Manager: ✅ All categories EXCEPT Finance
    │
    └──> L4 Finance Director: ✅ All categories INCLUDING Finance

Report Category: Finance
    │
    ├──> L1 Manager: ❌ Access Denied
    │
    ├──> L2 Director: ❌ Access Denied (unless Finance Dept)
    │
    ├──> L3 Finance Manager: ❌ Access Denied
    │
    └──> L4 Finance Director: ✅ Access Granted
```

## Permission Inheritance
```
┌─────────────────────────────────────────────────────────────────┐
│                    Permission Inheritance                        │
└─────────────────────────────────────────────────────────────────┘

L4 inherits from: None (Full Access)
    │
    ├─ All L1, L2, L3 permissions
    ├─ Approve transactions
    ├─ View Finance reports
    └─ Manage users/employees

L3 inherits from: L1 only
    │
    ├─ All L1 permissions (create items)
    ├─ Access Finance module
    ├─ View all reports except Finance
    └─ Generate invoices
    
    Note: L3 does NOT inherit L2 delete/approve permissions

L2 inherits from: L1
    │
    ├─ All L1 permissions
    ├─ Approve department items
    ├─ Delete department items
    ├─ Mark delivered
    └─ View department reports

L1 base permissions:
    │
    ├─ Create suppliers
    ├─ Create purchase orders
    ├─ Create inventory items
    ├─ Create customers
    ├─ Create orders
    └─ Create production batches
```

## Department-Based Access (L2 Only)
```
┌─────────────────────────────────────────────────────────────────┐
│              Department-Based Report Access (L2)                 │
└─────────────────────────────────────────────────────────────────┘

Department: Procurement
    └──> Can access: Procurement, Suppliers, Orders reports

Department: Finance
    └──> Can access: Finance reports

Department: Inventory
    └──> Can access: Inventory reports

Department: Production
    └──> Can access: Production, Orders reports

Department: Human Resources
    └──> Can access: HR reports

Department: Administration
    └──> Can access: Procurement, Suppliers, Orders, Inventory, Finance reports
```

## Key Principles

1. **Separation of Duties**: L3 cannot approve their own transactions
2. **Department Isolation**: L3 cannot manage items from other departments
3. **Financial Security**: Finance reports are restricted to L4 only
4. **Hierarchical Approval**: 
   - L1 creates → L2/L4 approves (for department items)
   - L3 creates → L4 approves (for finance transactions)
5. **Report Access Gradation**:
   - L1: None
   - L2: Department only
   - L3: All except Finance
   - L4: All including Finance
