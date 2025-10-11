# Visual Example: How Double-Entry Accounting Works

## Example Scenario
Let's walk through a simple business day with various transactions.

---

## Starting Position
**Cash Account**: LKR 0

---

## Transaction 1: Sales Revenue (Income)
**Customer pays LKR 10,000 for products sold**

### Journal Entry:
```
Date: 2025-01-15
Dr. Cash Account                    LKR 10,000
    Cr. Sales Revenue                          LKR 10,000
(To record sales revenue received)
```

### Effect:
- Cash increases by LKR 10,000 (Asset ↑)
- Revenue increases by LKR 10,000 (Income ↑)

### Cash Account Balance: LKR 10,000

---

## Transaction 2: Office Supplies (Expense)
**Purchased office supplies for LKR 5,000 cash**

### Journal Entry:
```
Date: 2025-01-16
Dr. Office Supplies Expense         LKR 5,000
    Cr. Cash Account                           LKR 5,000
(To record office supplies purchased)
```

### Effect:
- Expense increases by LKR 5,000 (Expense ↑)
- Cash decreases by LKR 5,000 (Asset ↓)

### Cash Account Balance: LKR 10,000 - 5,000 = LKR 5,000

---

## Transaction 3: Equipment Purchase (Asset)
**Bought office equipment for LKR 20,000 cash**

### Journal Entry:
```
Date: 2025-01-17
Dr. Office Equipment (Asset)        LKR 20,000
    Cr. Cash Account                           LKR 20,000
(To record equipment purchase)
```

### Effect:
- Equipment asset increases by LKR 20,000 (Asset ↑)
- Cash decreases by LKR 20,000 (Asset ↓)
- Total assets remain same (just shifted from cash to equipment)

### Cash Account Balance: LKR 5,000 - 20,000 = -LKR 15,000 (Overdraft!)

---

## Transaction 4: Bank Loan (Liability)
**Received a bank loan of LKR 30,000**

### Journal Entry:
```
Date: 2025-01-18
Dr. Cash Account                    LKR 30,000
    Cr. Bank Loan Payable                      LKR 30,000
(To record bank loan received)
```

### Effect:
- Cash increases by LKR 30,000 (Asset ↑)
- Liability increases by LKR 30,000 (Liability ↑)

### Cash Account Balance: -LKR 15,000 + 30,000 = LKR 15,000

---

## Final Position Summary

### Cash Account Movements
```
Opening Balance:                           LKR      0
+ Sales Revenue (Transaction 1)            LKR 10,000
- Office Supplies (Transaction 2)          LKR (5,000)
- Equipment Purchase (Transaction 3)       LKR(20,000)
+ Bank Loan (Transaction 4)                LKR 30,000
                                          ──────────
Closing Balance:                           LKR 15,000
```

### Complete Trial Balance

```
═══════════════════════════════════════════════════════════════
                        TRIAL BALANCE
                    As at January 18, 2025
═══════════════════════════════════════════════════════════════

Account Name                  Debit (LKR)    Credit (LKR)
───────────────────────────────────────────────────────────────
ASSETS:
  Cash                           15,000              -
  Office Equipment               20,000              -
                                ───────         ───────
  Total Assets                   35,000              -

LIABILITIES:
  Bank Loan Payable                   -         30,000
                                ───────         ───────
  Total Liabilities                   -         30,000

INCOME:
  Sales Revenue                       -         10,000
                                ───────         ───────
  Total Income                        -         10,000

EXPENSES:
  Office Supplies                 5,000              -
                                ───────         ───────
  Total Expenses                  5,000              -

═══════════════════════════════════════════════════════════════
GRAND TOTALS:                  40,000         40,000
═══════════════════════════════════════════════════════════════

✓ Trial Balance is BALANCED!
  Total Debits (40,000) = Total Credits (40,000)
```

---

## Accounting Equation Verification

**Assets = Liabilities + Equity**

### Calculation:

**Assets:**
- Cash: LKR 15,000
- Office Equipment: LKR 20,000
- **Total Assets**: LKR 35,000

**Liabilities:**
- Bank Loan Payable: LKR 30,000
- **Total Liabilities**: LKR 30,000

**Equity (Capital + Profit):**
- Revenue: LKR 10,000
- Expenses: LKR 5,000
- **Net Profit**: LKR 5,000
- **Total Equity**: LKR 5,000

### Verification:
```
Left Side:  Assets = LKR 35,000
Right Side: Liabilities + Equity = 30,000 + 5,000 = LKR 35,000

✓ Equation Balances: 35,000 = 35,000
```

---

## Key Takeaways

### 1. Double-Entry Rule
Every transaction has TWO entries:
- One DEBIT entry
- One CREDIT entry
- Both entries are for the SAME amount

### 2. Account Types and Normal Balances
- **Assets**: Normal DEBIT balance (increases on debit side)
- **Liabilities**: Normal CREDIT balance (increases on credit side)
- **Income**: Normal CREDIT balance (increases on credit side)
- **Expenses**: Normal DEBIT balance (increases on debit side)
- **Equity**: Normal CREDIT balance (increases on credit side)

### 3. The Magic Formula
```
DEBITS = CREDITS (Always!)
```

This is what makes the trial balance balance and ensures accuracy in accounting.

### 4. Cash Flow Tracking
Every cash transaction is recorded in the Cash account, making it easy to:
- Track cash inflows and outflows
- Monitor cash position
- Prepare cash flow statements
- Detect cash shortages early

---

## Business Insights from This Example

### Financial Position:
- **Cash on Hand**: LKR 15,000 (Good liquidity)
- **Equipment Value**: LKR 20,000 (Productive asset)
- **Outstanding Loan**: LKR 30,000 (Need to plan repayment)
- **Profitability**: LKR 5,000 net profit (Profitable operation)

### Financial Health:
- ✓ Positive cash balance
- ✓ Profitable operations
- ✓ Adequate liquidity
- ⚠ High leverage (debt vs equity ratio)

### Recommendations:
1. Continue generating revenue to improve profitability
2. Plan loan repayment schedule
3. Control expenses to maintain profitability
4. Consider building cash reserves

---

This example demonstrates how the implemented accounting logic correctly tracks all financial transactions and maintains the integrity of the accounting system through proper double-entry bookkeeping!
