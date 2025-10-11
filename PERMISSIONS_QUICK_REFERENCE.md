# User Level Access Control - Quick Reference

## Visual Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                         Level 4 (L4)                            │
│                   Admin/Finance Director                         │
│  ✅ Everything L1, L2, L3 can do                                │
│  ✅ Manage Users (Add/Edit/Delete/Approve)                      │
│  ✅ Manage Employees (Add/Edit/Delete)                          │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │
┌─────────────────────────────────────────────────────────────────┐
│                         Level 3 (L3)                            │
│                      Finance Manager                             │
│  ✅ Everything L1, L2 can do                                    │
│  ✅ Access Finance Module (All transactions, accounts, etc.)    │
│  ✅ View ALL Reports (not restricted by division)               │
│  ✅ Generate Invoices                                           │
│  ✅ Use Finance AI Predictions                                  │
│  ❌ Cannot Manage Users or Employees                            │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │
┌─────────────────────────────────────────────────────────────────┐
│                         Level 2 (L2)                            │
│                         Director                                 │
│  ✅ Everything L1 can do                                        │
│  ✅ Approve Purchase Orders and Submissions                     │
│  ✅ View/Download Division Reports Only                         │
│  ✅ Delete Entries (Suppliers, Customers, Orders, etc.)         │
│  ✅ Mark Purchase Orders as Delivered                           │
│  ❌ Cannot Access Finance Module                                │
│  ❌ Cannot View All Reports (only division-specific)            │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │
┌─────────────────────────────────────────────────────────────────┐
│                         Level 1 (L1)                            │
│                          Manager                                 │
│  ✅ Create/Add New Entries (Suppliers, POs, Inventory, etc.)   │
│  ✅ View Existing Entries                                       │
│  ✅ Edit Existing Entries                                       │
│  ❌ Cannot Approve Anything                                     │
│  ❌ Cannot Download Reports                                     │
│  ❌ Cannot Delete Entries                                       │
│  ❌ Cannot Access Finance                                       │
└─────────────────────────────────────────────────────────────────┘
```

## Feature Access by Level

### 📝 Create/Add Operations
| Feature | L1 | L2 | L3 | L4 |
|---------|:--:|:--:|:--:|:--:|
| Suppliers | ✅ | ✅ | ✅ | ✅ |
| Purchase Orders | ✅ | ✅ | ✅ | ✅ |
| Inventory Items | ✅ | ✅ | ✅ | ✅ |
| Customers | ✅ | ✅ | ✅ | ✅ |
| Orders | ✅ | ✅ | ✅ | ✅ |
| Production Batches | ✅ | ✅ | ✅ | ✅ |
| **Users** | ❌ | ❌ | ❌ | ✅ |
| **Employees** | ❌ | ❌ | ❌ | ✅ |

### ✅ Approve Operations
| Feature | L1 | L2 | L3 | L4 |
|---------|:--:|:--:|:--:|:--:|
| Purchase Orders | ❌ | ✅ | ❌ | ✅ |
| Mark as Delivered | ❌ | ✅ | ✅ | ✅ |
| **User Accounts** | ❌ | ❌ | ❌ | ✅ |

### 🗑️ Delete Operations
| Feature | L1 | L2 | L3 | L4 |
|---------|:--:|:--:|:--:|:--:|
| Suppliers | ❌ | ✅ | ✅ | ✅ |
| Customers | ❌ | ✅ | ✅ | ✅ |
| Orders | ❌ | ✅ | ✅ | ✅ |
| Production Batches | ❌ | ✅ | ✅ | ✅ |
| Procurement Reports | ❌ | ❌ | ✅ | ✅ |
| **Users** | ❌ | ❌ | ❌ | ✅ |
| **Employees** | ❌ | ❌ | ❌ | ✅ |

### 📊 Reports & Finance
| Feature | L1 | L2 | L3 | L4 |
|---------|:--:|:--:|:--:|:--:|
| View Reports | ❌ | ✅ (Division) | ✅ (All) | ✅ (All) |
| Download Reports | ❌ | ✅ (Division) | ✅ (All) | ✅ (All) |
| Generate Reports | ❌ | ✅ (Division) | ✅ (All) | ✅ (All) |
| Finance Module | ❌ | ❌ | ✅ | ✅ |
| Generate Invoices | ❌ | ❌ | ✅ | ✅ |
| Finance AI | ❌ | ❌ | ✅ | ✅ |

### 👥 User & Employee Management
| Feature | L1 | L2 | L3 | L4 |
|---------|:--:|:--:|:--:|:--:|
| View Users | ❌ | ❌ | ❌ | ✅ |
| Create Users | ❌ | ❌ | ❌ | ✅ |
| Edit Users | ❌ | ❌ | ❌ | ✅ |
| Delete Users | ❌ | ❌ | ❌ | ✅ |
| Approve Users | ❌ | ❌ | ❌ | ✅ |
| View Employees | ✅ | ✅ | ✅ | ✅ |
| Create Employees | ❌ | ❌ | ❌ | ✅ |
| Edit Employees | ❌ | ❌ | ❌ | ✅ |
| Delete Employees | ❌ | ❌ | ❌ | ✅ |

## Navigation Access

### Sidebar Menu Items Visible
- **L1**: Dashboard, Inventory, Production, Orders & Sales, Delivery, Procurement, Warehouse, Wastage, Settings
- **L2**: L1 + Reports
- **L3**: L2 + Finance
- **L4**: L3 + Administrator, Employees

## Common Workflows

### 1. Employee Onboarding (L4 Only)
```
L4 Admin Creates Employee → Optional: Create User Account → 
User Needs Approval → L4 Admin Approves User → 
User Can Login with Assigned Level
```

### 2. Purchase Order Workflow
```
L1 Manager Creates PO → 
L2 Director/L4 Admin Reviews → 
L2/L4 Approves PO → 
L2/L3/L4 Marks as Delivered →
L3/L4 Generates Invoice
```

### 3. Report Access
```
L1: No Access
L2: Can view/download reports for their division only
L3: Can view/download ALL reports
L4: Can view/download ALL reports
```

### 4. Finance Operations
```
L1: No Access
L2: No Access  
L3: Full Access (view, create, edit transactions)
L4: Full Access (view, create, edit transactions)
```

## Security Notes

- ✅ **Defense in Depth**: Both frontend and backend enforce permissions
- ✅ **Default Deny**: Users without proper level cannot access restricted features
- ✅ **Approval Required**: New user accounts always need L4 approval
- ✅ **Level Assignment**: Levels are assigned by L4 during user approval
- ✅ **Automatic Default**: Users without level default to L1

## Quick Decision Tree

**Need to approve something?** → L2 or L4
**Need to view reports?** → L2 (division), L3 or L4 (all)
**Need to access finance?** → L3 or L4
**Need to manage users/employees?** → L4 only
**Need to create basic entries?** → Any level (L1-L4)
