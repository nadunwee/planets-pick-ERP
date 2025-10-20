# Test Execution Guide

## Quick Reference for Test Execution

This document provides practical guidance for executing the test cases defined in TEST_CASES.md.

---

## Test Execution Checklist

### Before Starting Tests
- [ ] Verify test environment is properly configured
- [ ] Ensure database connection is available (or mock data is enabled)
- [ ] Create test data backup if using production-like data
- [ ] Review test cases to be executed
- [ ] Prepare test accounts for different user levels (L1, L2, L3, L4)
- [ ] Clear browser cache and cookies
- [ ] Document environment details (browser, OS, app version)

### During Test Execution
- [ ] Follow test steps exactly as documented
- [ ] Record actual results for each step
- [ ] Take screenshots for any failures or unexpected behavior
- [ ] Note the timestamp when test was executed
- [ ] Document any deviations from expected results
- [ ] Log console errors or warnings

### After Test Execution
- [ ] Update test case status (Pass/Fail)
- [ ] Log defects for failed tests
- [ ] Update test results summary
- [ ] Clean up test data if needed
- [ ] Prepare test execution report

---

## Sample Test Data Sets

### Finance Module Test Data

#### Sample Transactions
```json
{
  "income_transaction": {
    "type": "income",
    "category": "Sales Revenue",
    "description": "Product sales for January 2025",
    "amount": 50000,
    "account": "Cash",
    "reference": "INV-2025-001",
    "date": "2025-01-15"
  },
  "expense_transaction": {
    "type": "expense",
    "category": "Office Supplies",
    "description": "Purchase of stationery items",
    "amount": 5000,
    "account": "Cash",
    "reference": "EXP-2025-001",
    "date": "2025-01-16"
  }
}
```

#### Sample Asset
```json
{
  "type": "asset",
  "subtype": "non-current",
  "name": "Manufacturing Equipment",
  "value": 200000,
  "date": "2025-01-10",
  "status": "active"
}
```

#### Sample Liability
```json
{
  "type": "liability",
  "subtype": "current",
  "name": "Bank Loan - Short Term",
  "value": 100000,
  "date": "2025-01-05",
  "status": "active"
}
```

### Inventory Module Test Data

```json
{
  "inventory_items": [
    {
      "name": "Organic Fertilizer",
      "type": "Raw Material",
      "currentStock": 100,
      "minStock": 20,
      "maxStock": 500,
      "unitPrice": 150,
      "unit": "kg",
      "sku": "RM-001",
      "valuationMethod": "FIFO"
    },
    {
      "name": "Seeds - Corn",
      "type": "Raw Material",
      "currentStock": 50,
      "minStock": 10,
      "maxStock": 200,
      "unitPrice": 200,
      "unit": "kg",
      "sku": "RM-002",
      "valuationMethod": "Average"
    }
  ]
}
```

### Order Module Test Data

```json
{
  "sample_order": {
    "orderId": "ORD-2025-001",
    "orderedOn": "2025-01-15",
    "expectedDate": "2025-01-25",
    "priority": "high",
    "status": "pending",
    "items": [
      {
        "name": "Organic Compost",
        "quantity": 50,
        "unit": "kg",
        "unitPrice": 150,
        "totalPrice": 7500
      },
      {
        "name": "Bio Fertilizer",
        "quantity": 30,
        "unit": "kg",
        "unitPrice": 200,
        "totalPrice": 6000
      }
    ],
    "subtotal": 13500,
    "discount": 500,
    "discountType": "fixed",
    "tax": 1040,
    "taxRate": 8,
    "shippingCost": 500,
    "totalAmount": 14540,
    "paymentStatus": "unpaid"
  }
}
```

### Employee Module Test Data

```json
{
  "sample_employees": [
    {
      "name": "John Doe",
      "position": "Finance Manager",
      "department": "Finance",
      "salary": 75000,
      "email": "john.doe@planetspack.com",
      "phone": "0771234567",
      "level": "L3"
    },
    {
      "name": "Jane Smith",
      "position": "Warehouse Supervisor",
      "department": "Warehouse",
      "salary": 50000,
      "email": "jane.smith@planetspack.com",
      "phone": "0771234568",
      "level": "L2"
    }
  ]
}
```

---

## Test User Accounts

### Recommended Test Users

| Username | Password | Level | Role | Use For Testing |
|----------|----------|-------|------|-----------------|
| admin@test.com | Admin@123 | L4 | Administrator | All approval workflows, system configuration |
| finance@test.com | Finance@123 | L3 | Finance Manager | Finance transactions, reports |
| supervisor@test.com | Super@123 | L2 | Supervisor | Basic operations, inventory updates |
| user@test.com | User@123 | L1 | Basic User | View-only access, basic operations |

**Note**: Change these credentials in production environments!

---

## Common Test Scenarios

### Scenario 1: New Order Processing (Happy Path)
1. Login as L2 user
2. Create new order with valid customer and items
3. Verify order calculations are correct
4. Submit order for approval
5. Login as L4 user
6. Approve the order
7. Login as L3 user
8. Record payment
9. Verify inventory is updated
10. Verify finance transaction is created

**Expected Outcome**: Order processed successfully, all modules updated

### Scenario 2: Transaction Approval Workflow
1. Login as L3 user (Finance Manager)
2. Create expense transaction
3. Verify status is "Pending"
4. Logout
5. Login as L4 user (Admin)
6. Navigate to pending transactions
7. Approve the transaction
8. Verify status changes to "Approved"
9. Verify accounting entries are created

**Expected Outcome**: Approval workflow functions correctly

### Scenario 3: Low Stock Alert
1. Login as L2 user
2. Navigate to Inventory
3. Update stock to below minimum level
4. Check for alert notification
5. Verify item is highlighted
6. Create purchase order to replenish stock

**Expected Outcome**: Alert triggered and visible

### Scenario 4: Production with Quality Control
1. Login as L2 user
2. Create production batch
3. Start production (raw materials consumed)
4. Complete production with QC results
5. Verify finished goods added to inventory
6. Verify raw materials reduced
7. Check production report

**Expected Outcome**: Production tracked, inventory updated correctly

---

## Defect Reporting Template

### Defect Report Format

```markdown
**Defect ID**: DEF-[MODULE]-[NUMBER]
**Reported By**: [Your Name]
**Date**: [Date]
**Test Case ID**: [Related Test Case]

**Summary**: [Brief description of the issue]

**Severity**: [Critical/High/Medium/Low]
**Priority**: [P1/P2/P3/P4]
**Status**: [New/Open/In Progress/Fixed/Closed]

**Environment**:
- Browser: [Browser name and version]
- OS: [Operating system]
- App Version: [Application version]
- Database: [Connected/Mock]

**Steps to Reproduce**:
1. [Step 1]
2. [Step 2]
3. [Step 3]
...

**Expected Result**: 
[What should happen]

**Actual Result**: 
[What actually happened]

**Attachments**:
- Screenshot: [filename]
- Console Log: [filename]
- Network Log: [filename]

**Additional Notes**:
[Any other relevant information]
```

### Example Defect Report

```markdown
**Defect ID**: DEF-FIN-001
**Reported By**: QA Team
**Date**: 2025-01-20

**Summary**: Transaction approval button not visible for L4 users

**Severity**: High
**Priority**: P1
**Status**: New

**Environment**:
- Browser: Chrome 120.0
- OS: Windows 11
- App Version: 1.0.0
- Database: Connected

**Steps to Reproduce**:
1. Login as L4 user (admin@test.com)
2. Navigate to Finance > Transactions
3. Filter by "Pending Approval"
4. Select a pending transaction
5. Look for "Approve" button

**Expected Result**: 
Approve button should be visible and clickable for L4 users

**Actual Result**: 
Approve button is not visible in the UI

**Attachments**:
- Screenshot: def-fin-001-screenshot.png
- Console Log: def-fin-001-console.txt

**Additional Notes**:
Issue only occurs when accessing from Finance module. Approve button works correctly when accessed from Dashboard pending approvals widget.
```

---

## Performance Testing Guidelines

### Response Time Benchmarks

| Operation | Expected Time | Acceptable Time | Action Required If |
|-----------|---------------|-----------------|-------------------|
| Page Load | < 2 seconds | < 5 seconds | > 5 seconds |
| API Call | < 1 second | < 3 seconds | > 3 seconds |
| Report Generation | < 5 seconds | < 10 seconds | > 10 seconds |
| Large Data Export | < 30 seconds | < 60 seconds | > 60 seconds |
| Search/Filter | < 1 second | < 2 seconds | > 2 seconds |

### Load Testing Scenarios

1. **Concurrent Users**: Test with 10, 50, 100 simultaneous users
2. **Data Volume**: Test with varying record counts (100, 1K, 10K, 100K)
3. **Peak Load**: Simulate end-of-month reporting period
4. **Sustained Load**: Run tests for extended periods (1 hour, 4 hours, 8 hours)

---

## Regression Testing Checklist

### After Each Code Change

- [ ] Run smoke tests on all critical paths
- [ ] Verify authentication still works
- [ ] Check role-based access controls
- [ ] Test modified functionality thoroughly
- [ ] Test related/dependent functionality
- [ ] Verify no console errors
- [ ] Check database integrity
- [ ] Validate data calculations
- [ ] Test with both database and mock data

### Before Each Release

- [ ] Run full test suite
- [ ] Execute integration tests
- [ ] Perform user acceptance testing
- [ ] Conduct performance testing
- [ ] Review all open defects
- [ ] Verify all critical defects are fixed
- [ ] Test on all supported browsers
- [ ] Test on all supported devices
- [ ] Verify backup and restore procedures
- [ ] Check security configurations

---

## Test Metrics to Track

### Daily Metrics
- Test cases executed
- Pass/Fail count
- Defects found
- Defects fixed
- Test coverage percentage

### Weekly Metrics
- Test execution progress
- Defect trends
- Average time per test
- Blocked tests
- Test environment downtime

### Release Metrics
- Total test cases
- Total pass rate
- Critical defects
- Known issues
- Risk assessment

---

## Testing Tools Recommendations

### Manual Testing
- **Browser DevTools**: For inspecting elements and network calls
- **Postman**: For API testing
- **Screen Recording**: For capturing test execution
- **Note Taking**: For documenting observations

### Automated Testing (Future Implementation)
- **Jest**: For unit testing JavaScript/TypeScript
- **React Testing Library**: For component testing
- **Supertest**: For API integration testing
- **Cypress/Playwright**: For E2E testing
- **k6 or Artillery**: For load testing

---

## Troubleshooting Common Issues

### Issue: Cannot Login
**Possible Causes**:
- Incorrect credentials
- Session expired
- Database connection lost
- User account locked

**Solution**:
1. Verify credentials
2. Clear browser cache
3. Check database connection
4. Contact administrator

### Issue: Data Not Saving
**Possible Causes**:
- Validation errors
- Database connectivity
- Insufficient permissions
- Required fields missing

**Solution**:
1. Check console for validation errors
2. Verify all required fields filled
3. Check user permissions
4. Verify database connection

### Issue: Calculations Incorrect
**Possible Causes**:
- Data type mismatch
- Rounding errors
- Formula errors
- Missing data

**Solution**:
1. Verify input data types
2. Check calculation formulas
3. Review rounding rules
4. Validate all required data present

---

## Test Sign-Off Criteria

### Ready for Release When:
- ✅ 100% of Critical test cases passed
- ✅ 95%+ of High priority test cases passed
- ✅ No open Critical defects
- ✅ No open High priority defects (or approved for release)
- ✅ All regression tests passed
- ✅ Performance benchmarks met
- ✅ Security requirements validated
- ✅ User acceptance testing completed
- ✅ Documentation updated
- ✅ Training materials prepared

---

**Document Version**: 1.0  
**Last Updated**: 2025-01-25  
**Prepared By**: QA Team
