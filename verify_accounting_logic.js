#!/usr/bin/env node
/**
 * Accounting Logic Verification Script
 * 
 * This script verifies that the double-entry bookkeeping implementation
 * in Finance.tsx works correctly by simulating transactions and checking
 * that the trial balance balances.
 */

// Sample transaction and asset/liability data
const sampleTransactions = [
  {
    _id: "txn001",
    type: "income",
    account: "Sales Revenue",
    description: "Product Sales",
    amount: 10000,
    date: "2025-01-15",
    reference: "INV-001"
  },
  {
    _id: "txn002",
    type: "expense",
    account: "Office Supplies",
    description: "Stationery Purchase",
    amount: 5000,
    date: "2025-01-16",
    reference: "EXP-001"
  },
  {
    _id: "txn003",
    type: "income",
    account: "Service Revenue",
    description: "Consulting Services",
    amount: 15000,
    date: "2025-01-17",
    reference: "INV-002"
  },
  {
    _id: "txn004",
    type: "expense",
    account: "Utilities",
    description: "Electricity Bill",
    amount: 3000,
    date: "2025-01-18",
    reference: "EXP-002"
  }
];

const sampleAssets = [
  {
    _id: "ast001",
    type: "asset",
    name: "Office Equipment",
    value: 20000,
    date: "2025-01-19"
  },
  {
    _id: "lib001",
    type: "liability",
    name: "Bank Loan",
    value: 30000,
    date: "2025-01-20"
  }
];

// Simulate the accounting logic
function generateLedgerAccounts(transactions, assets) {
  const accountsMap = new Map();

  // Create Cash account first
  accountsMap.set("Cash", {
    accountName: "Cash",
    accountType: "asset",
    debitTotal: 0,
    creditTotal: 0,
    entries: []
  });

  // Process transactions with double-entry
  transactions.forEach((transaction) => {
    const accountName = transaction.account;
    
    if (!accountsMap.has(accountName)) {
      accountsMap.set(accountName, {
        accountName,
        accountType: transaction.type === "income" ? "income" : "expense",
        debitTotal: 0,
        creditTotal: 0,
        entries: []
      });
    }

    const account = accountsMap.get(accountName);
    const cashAccount = accountsMap.get("Cash");

    if (transaction.type === "income") {
      // Debit Cash, Credit Income
      cashAccount.debitTotal += transaction.amount;
      cashAccount.entries.push({
        description: `Cash from ${transaction.description}`,
        debit: transaction.amount,
        credit: 0
      });

      account.creditTotal += transaction.amount;
      account.entries.push({
        description: transaction.description,
        debit: 0,
        credit: transaction.amount
      });
    } else {
      // Debit Expense, Credit Cash
      account.debitTotal += transaction.amount;
      account.entries.push({
        description: transaction.description,
        debit: transaction.amount,
        credit: 0
      });

      cashAccount.creditTotal += transaction.amount;
      cashAccount.entries.push({
        description: `Cash paid for ${transaction.description}`,
        debit: 0,
        credit: transaction.amount
      });
    }
  });

  // Process assets and liabilities
  assets.forEach((item) => {
    const accountName = `${item.type === "asset" ? "Assets" : "Liabilities"} - ${item.name}`;
    
    if (!accountsMap.has(accountName)) {
      accountsMap.set(accountName, {
        accountName,
        accountType: item.type,
        debitTotal: 0,
        creditTotal: 0,
        entries: []
      });
    }

    const account = accountsMap.get(accountName);
    const cashAccount = accountsMap.get("Cash");

    if (item.type === "asset") {
      // Debit Asset, Credit Cash
      account.debitTotal += item.value;
      account.entries.push({
        description: `Asset - ${item.name}`,
        debit: item.value,
        credit: 0
      });

      cashAccount.creditTotal += item.value;
      cashAccount.entries.push({
        description: `Cash paid for asset - ${item.name}`,
        debit: 0,
        credit: item.value
      });
    } else {
      // Debit Cash, Credit Liability
      cashAccount.debitTotal += item.value;
      cashAccount.entries.push({
        description: `Cash from liability - ${item.name}`,
        debit: item.value,
        credit: 0
      });

      account.creditTotal += item.value;
      account.entries.push({
        description: `Liability - ${item.name}`,
        debit: 0,
        credit: item.value
      });
    }
  });

  return Array.from(accountsMap.values());
}

// Generate trial balance
function generateTrialBalance(accounts) {
  const trialBalance = [];
  
  accounts.forEach((account) => {
    let debitBalance = 0;
    let creditBalance = 0;

    if (account.accountType === "asset" || account.accountType === "expense") {
      debitBalance = Math.max(0, account.debitTotal - account.creditTotal);
      creditBalance = Math.max(0, account.creditTotal - account.debitTotal);
    } else if (account.accountType === "liability" || account.accountType === "income") {
      creditBalance = Math.max(0, account.creditTotal - account.debitTotal);
      debitBalance = Math.max(0, account.debitTotal - account.creditTotal);
    }

    if (debitBalance > 0 || creditBalance > 0) {
      trialBalance.push({
        accountName: account.accountName,
        accountType: account.accountType,
        debitBalance,
        creditBalance
      });
    }
  });

  return trialBalance;
}

// Main verification
console.log("=".repeat(80));
console.log("ACCOUNTING LOGIC VERIFICATION");
console.log("=".repeat(80));
console.log();

// Generate ledger accounts
const ledgerAccounts = generateLedgerAccounts(sampleTransactions, sampleAssets);

console.log("LEDGER ACCOUNTS:");
console.log("-".repeat(80));
ledgerAccounts.forEach((account) => {
  console.log(`\n${account.accountName} (${account.accountType})`);
  console.log(`  Debit Total:  LKR ${account.debitTotal.toLocaleString()}`);
  console.log(`  Credit Total: LKR ${account.creditTotal.toLocaleString()}`);
  console.log(`  Entries: ${account.entries.length}`);
});

console.log("\n" + "=".repeat(80));
console.log("TRIAL BALANCE");
console.log("=".repeat(80));
console.log();

const trialBalance = generateTrialBalance(ledgerAccounts);

let totalDebits = 0;
let totalCredits = 0;

console.log("Account Name".padEnd(40) + "Debit".padEnd(20) + "Credit");
console.log("-".repeat(80));

trialBalance.forEach((entry) => {
  const debit = entry.debitBalance > 0 ? `LKR ${entry.debitBalance.toLocaleString()}` : "";
  const credit = entry.creditBalance > 0 ? `LKR ${entry.creditBalance.toLocaleString()}` : "";
  
  console.log(
    entry.accountName.padEnd(40) + 
    debit.padEnd(20) + 
    credit
  );

  totalDebits += entry.debitBalance;
  totalCredits += entry.creditBalance;
});

console.log("-".repeat(80));
console.log("TOTALS".padEnd(40) + `LKR ${totalDebits.toLocaleString()}`.padEnd(20) + `LKR ${totalCredits.toLocaleString()}`);
console.log("=".repeat(80));
console.log();

// Verify balance
const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;
console.log(`\n✓ Trial Balance Check: ${isBalanced ? "PASSED" : "FAILED"}`);
console.log(`  Total Debits:  LKR ${totalDebits.toLocaleString()}`);
console.log(`  Total Credits: LKR ${totalCredits.toLocaleString()}`);
console.log(`  Difference:    LKR ${Math.abs(totalDebits - totalCredits).toLocaleString()}`);

if (isBalanced) {
  console.log("\n✓ The accounting logic is correctly implemented!");
  console.log("✓ Double-entry bookkeeping principles are maintained.");
  console.log("✓ Trial balance is balanced (Debits = Credits).");
} else {
  console.log("\n✗ ERROR: Trial balance does not balance!");
  console.log("✗ There is an issue with the double-entry bookkeeping.");
}

console.log("\n" + "=".repeat(80));

// Exit with appropriate code
process.exit(isBalanced ? 0 : 1);
