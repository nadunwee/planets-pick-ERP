// Test script to verify Balance Sheet balancing
// This simulates the logic from Finance.tsx

const sampleTransactions = [
  { type: "income", category: "Sales Revenue", amount: 10000, date: "2024-01-01", description: "Product sales" },
  { type: "income", category: "Service Revenue", amount: 15000, date: "2024-01-02", description: "Consulting service" },
  { type: "expense", category: "Office Supplies", amount: 5000, date: "2024-01-03", description: "Stationery" },
  { type: "expense", category: "Utilities", amount: 3000, date: "2024-01-04", description: "Electricity bill" },
  { type: "asset", subtype: "non-current", name: "Office Equipment", value: 20000, date: "2024-01-05", status: "active" },
  { type: "liability", subtype: "non-current", name: "Bank Loan", value: 30000, date: "2024-01-06", status: "active" }
];

// Simulate ledger account generation (simplified from actual implementation)
function generateLedgerAccounts(transactions, assetsLiabilities) {
  const accounts = new Map();
  
  // Create cash account
  const cashAccount = {
    accountName: "Cash",
    accountType: "asset",
    debitTotal: 0,
    creditTotal: 0,
    balance: 0,
    entries: []
  };
  accounts.set("Cash", cashAccount);
  
  // Process each transaction
  [...transactions, ...assetsLiabilities].forEach(item => {
    if (item.type === "income") {
      // Income: Dr Cash, Cr Income
      cashAccount.debitTotal += item.amount;
      
      if (!accounts.has(item.category)) {
        accounts.set(item.category, {
          accountName: item.category,
          accountType: "income",
          debitTotal: 0,
          creditTotal: 0,
          balance: 0,
          entries: []
        });
      }
      accounts.get(item.category).creditTotal += item.amount;
      
    } else if (item.type === "expense") {
      // Expense: Dr Expense, Cr Cash
      cashAccount.creditTotal += item.amount;
      
      if (!accounts.has(item.category)) {
        accounts.set(item.category, {
          accountName: item.category,
          accountType: "expense",
          debitTotal: 0,
          creditTotal: 0,
          balance: 0,
          entries: []
        });
      }
      accounts.get(item.category).debitTotal += item.amount;
      
    } else if (item.type === "asset") {
      // Asset: Dr Asset, Cr Cash
      cashAccount.creditTotal += item.value;
      
      const name = `Assets - ${item.name}`;
      if (!accounts.has(name)) {
        accounts.set(name, {
          accountName: name,
          accountType: "asset",
          debitTotal: 0,
          creditTotal: 0,
          balance: 0,
          entries: []
        });
      }
      accounts.get(name).debitTotal += item.value;
      
    } else if (item.type === "liability") {
      // Liability: Dr Cash, Cr Liability
      cashAccount.debitTotal += item.value;
      
      const name = `Liabilities - ${item.name}`;
      if (!accounts.has(name)) {
        accounts.set(name, {
          accountName: name,
          accountType: "liability",
          debitTotal: 0,
          creditTotal: 0,
          balance: 0,
          entries: []
        });
      }
      accounts.get(name).creditTotal += item.value;
    }
  });
  
  // Calculate balances
  accounts.forEach(account => {
    if (account.accountType === "asset" || account.accountType === "expense") {
      account.balance = account.debitTotal - account.creditTotal;
    } else if (account.accountType === "liability" || account.accountType === "income") {
      account.balance = account.creditTotal - account.debitTotal;
    }
  });
  
  return Array.from(accounts.values());
}

// Separate transactions and assets/liabilities
const transactions = sampleTransactions.filter(t => t.type === "income" || t.type === "expense");
const assetsLiabilities = sampleTransactions.filter(t => t.type === "asset" || t.type === "liability");

const ledgerAccounts = generateLedgerAccounts(transactions, assetsLiabilities);

console.log("================================================================================");
console.log("LEDGER ACCOUNTS SUMMARY");
console.log("================================================================================\n");

ledgerAccounts.forEach(acc => {
  console.log(`${acc.accountName} (${acc.accountType})`);
  console.log(`  Debit Total:  LKR ${acc.debitTotal.toLocaleString()}`);
  console.log(`  Credit Total: LKR ${acc.creditTotal.toLocaleString()}`);
  console.log(`  Balance:      LKR ${acc.balance.toLocaleString()}`);
  console.log();
});

// Generate financial reports
const assets = ledgerAccounts.filter(acc => acc.accountType === "asset");
const liabilities = ledgerAccounts.filter(acc => acc.accountType === "liability");
const income = ledgerAccounts.filter(acc => acc.accountType === "income");
const expenses = ledgerAccounts.filter(acc => acc.accountType === "expense");

const totalRevenue = income.reduce((sum, acc) => sum + acc.creditTotal, 0);
const totalExpenses = expenses.reduce((sum, acc) => sum + acc.debitTotal, 0);
const netIncome = totalRevenue - totalExpenses;

const totalAssets = assets.reduce((sum, acc) => sum + acc.balance, 0);
const totalLiabilities = liabilities.reduce((sum, acc) => sum + acc.balance, 0);
const equity = netIncome; // Retained earnings from P&L

console.log("================================================================================");
console.log("PROFIT & LOSS STATEMENT");
console.log("================================================================================\n");
console.log(`Revenue:       LKR ${totalRevenue.toLocaleString()}`);
console.log(`Expenses:      LKR ${totalExpenses.toLocaleString()}`);
console.log(`Net Income:    LKR ${netIncome.toLocaleString()}`);
console.log();

console.log("================================================================================");
console.log("BALANCE SHEET");
console.log("================================================================================\n");
console.log("ASSETS:");
console.log(`  Total Assets:              LKR ${totalAssets.toLocaleString()}`);
console.log();
console.log("LIABILITIES & EQUITY:");
console.log(`  Total Liabilities:         LKR ${totalLiabilities.toLocaleString()}`);
console.log(`  Retained Earnings (Equity): LKR ${equity.toLocaleString()}`);
console.log(`  Total Liab. & Equity:      LKR ${(totalLiabilities + equity).toLocaleString()}`);
console.log();

// Verify balance
const difference = totalAssets - (totalLiabilities + equity);
console.log("================================================================================");
console.log("BALANCE VERIFICATION");
console.log("================================================================================\n");
console.log(`Assets:                    LKR ${totalAssets.toLocaleString()}`);
console.log(`Liabilities + Equity:      LKR ${(totalLiabilities + equity).toLocaleString()}`);
console.log(`Difference:                LKR ${difference.toLocaleString()}`);

if (difference === 0) {
  console.log("\n✓ BALANCE SHEET IS BALANCED!");
  console.log("✓ Assets = Liabilities + Equity");
} else {
  console.log("\n✗ BALANCE SHEET IS NOT BALANCED!");
  console.log(`✗ Difference of LKR ${Math.abs(difference).toLocaleString()} found`);
}

console.log("================================================================================");
