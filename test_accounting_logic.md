# Accounting Logic Test Cases

## Test Scenario 1: Income Transaction
**Transaction**: Sales Revenue of LKR 10,000
**Expected Double Entry**:
- Debit: Cash (Asset) = 10,000
- Credit: Sales/Income Account = 10,000

**Trial Balance Check**:
- Cash (Debit) = 10,000
- Sales (Credit) = 10,000
- Total Debits = Total Credits ✓

## Test Scenario 2: Expense Transaction
**Transaction**: Office Supplies Expense of LKR 5,000
**Expected Double Entry**:
- Debit: Office Supplies (Expense) = 5,000
- Credit: Cash (Asset) = 5,000

**Trial Balance Check** (after both transactions):
- Cash (Debit) = 10,000 - 5,000 = 5,000
- Sales (Credit) = 10,000
- Office Supplies (Debit) = 5,000
- Total Debits = 10,000, Total Credits = 10,000 ✓

## Test Scenario 3: Asset Purchase
**Transaction**: Equipment Purchase of LKR 20,000
**Expected Double Entry**:
- Debit: Equipment (Asset) = 20,000
- Credit: Cash (Asset) = 20,000

**Trial Balance Check** (after all transactions):
- Cash (Debit) = 10,000 - 5,000 - 20,000 = -15,000 (Credit balance of 15,000)
- Sales (Credit) = 10,000
- Office Supplies (Debit) = 5,000
- Equipment (Debit) = 20,000
- Total Debits = 25,000, Total Credits = 25,000 ✓

## Test Scenario 4: Liability
**Transaction**: Loan Received of LKR 30,000
**Expected Double Entry**:
- Debit: Cash (Asset) = 30,000
- Credit: Loan Payable (Liability) = 30,000

**Trial Balance Check** (after all transactions):
- Cash (Debit balance) = 10,000 - 5,000 - 20,000 + 30,000 = 15,000
- Sales (Credit) = 10,000
- Office Supplies (Debit) = 5,000
- Equipment (Debit) = 20,000
- Loan Payable (Credit) = 30,000
- Total Debits = 40,000, Total Credits = 40,000 ✓

## Verification Steps
1. Add a sample income transaction and verify Cash is debited and Income is credited
2. Add an expense transaction and verify Expense is debited and Cash is credited
3. Add an asset and verify Asset is debited and Cash is credited
4. Add a liability and verify Cash is debited and Liability is credited
5. Check the Trial Balance to ensure Total Debits = Total Credits

## Implementation Notes
The accounting logic has been updated in `src/pages/Finance.tsx` in the `generateLedgerAccounts` function to properly implement double-entry bookkeeping:

1. **Income Transactions**: Cash (Dr), Income Account (Cr)
2. **Expense Transactions**: Expense Account (Dr), Cash (Cr)
3. **Asset Purchases**: Asset Account (Dr), Cash (Cr)
4. **Liabilities**: Cash (Dr), Liability Account (Cr)

Each transaction now creates TWO ledger entries (one debit and one credit) ensuring the fundamental accounting equation is maintained.
