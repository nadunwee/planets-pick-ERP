import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  TrendingUp,
  TrendingDown,
  FileText,
  Plus,
  X,
  Download,
  Edit2,
  Trash2,
  BookOpen,
  Calculator,
  BarChart3,
  ArrowUp,
  Bot,
  Sparkles,
} from "lucide-react";

import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

function PageWithScrollTop() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // show button after scrolling 300px down
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // smooth scroll animation
    });
  };
}

// --- Register ChartJS components ---
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

// --- TYPES ---
interface Transaction {
  _id: string;
  date: string;
  type: "income" | "expense";
  category: string;
  description: string;
  amount: number;
  account: string;
  reference?: string;
  status: "completed" | "pending" | "failed";
}

interface Account {
  _id: string;
  name: string;
  type: "checking" | "savings" | "credit" | "investment";
  balance: number;
  currency: string;
  bank: string;
  accountNumber: string;
}

interface Budget {
  _id: string;
  category: string;
  allocated: number;
  spent: number;
  period: "monthly" | "quarterly" | "yearly";
}

interface ReportType {
  id: string;
  name: string;
  format: "pdf" | "excel" | "csv";
}

interface AssetLiability {
  _id: string;
  type: "asset" | "liability";
  subtype: "current" | "non-current";
  name: string;
  value: number;
  date: string;
  status: "active" | "sold" | "settled";
}

type UnifiedRow = {
  _id: string;
  source: "transaction" | "assetLiability";
  date: string;
  type: "income" | "expense" | "asset" | "liability";
  description: string;
  category: string;
  account: string;
  amount: number;
  status: string;
  raw: Transaction | AssetLiability;
};

interface LedgerEntry {
  _id: string;
  accountName: string;
  date: string;
  description: string;
  reference: string;
  debit: number;
  credit: number;
  balance: number;
  transactionId: string;
}

interface LedgerAccount {
  _id: string;
  accountCode: string;
  accountName: string;
  accountType: "asset" | "liability" | "equity" | "income" | "expense";
  debitTotal: number;
  creditTotal: number;
  balance: number;
  entries: LedgerEntry[];
}

interface TrialBalanceEntry {
  accountName: string;
  accountType: string;
  debitBalance: number;
  creditBalance: number;
}

interface FinancialReport {
  balanceSheet: {
    assets: { current: number; nonCurrent: number; total: number };
    liabilities: { current: number; nonCurrent: number; total: number };
    equity: number;
  };
  profitLoss: {
    revenue: number;
    expenses: number;
    netIncome: number;
  };
  cashFlow: {
    operating: number;
    investing: number;
    financing: number;
    netChange: number;
  };
}

interface PredictionData {
  month: string;
  predicted_income: number;
  predicted_expense: number;
  predicted_profit: number;
}

interface HistoricalData {
  month: string;
  income: number;
  expense: number;
  profit: number;
}

interface AIPredictionResponse {
  success: boolean;
  predictions: PredictionData[];
  insights: string[];
  historical: HistoricalData[];
  model_trained: boolean;
  data_points: number;
}

// --- API ---
const API = axios.create({
  baseURL: "http://localhost:4000/api/finance",
});

const AI_API = axios.create({
  baseURL: "http://localhost:4000/api/finance-ai",
});

export default function Finance() {
  // --- TAB STATE ---
  const [activeTab, setActiveTab] = useState<"transactions" | "ledgers">(
    "transactions"
  );

  // --- STATES ---
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [assetsLiabilities, setAssetsLiabilities] = useState<AssetLiability[]>(
    []
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // --- LEDGER STATES ---
  const [ledgerAccounts, setLedgerAccounts] = useState<LedgerAccount[]>([]);
  const [trialBalance, setTrialBalance] = useState<TrialBalanceEntry[]>([]);
  const [selectedLedgerAccount, setSelectedLedgerAccount] =
    useState<string>("");
  const [showReportsModal, setShowReportsModal] = useState(false);

  // --- Modals ---
  const [showAddAssetModal, setShowAddAssetModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditAssetModal, setShowEditAssetModal] = useState(false);
  const [showDeleteAssetModal, setShowDeleteAssetModal] = useState(false);
  const [transactionToEdit, setTransactionToEdit] =
    useState<Transaction | null>(null);
  const [transactionToDelete, setTransactionToDelete] =
    useState<Transaction | null>(null);
  const [assetToEdit, setAssetToEdit] = useState<AssetLiability | null>(null);
  const [assetToDelete, setAssetToDelete] = useState<AssetLiability | null>(
    null
  );

  // --- AI PREDICTION STATES ---
  const [aiPredictions, setAiPredictions] = useState<PredictionData[]>([]);
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);

  const [formData, setFormData] = useState({
    type: "expense",
    subType: "current" as "current" | "non-current",
    category: "",
    description: "",
    amount: "",
    account: "",
    reference: "",
    date: new Date().toISOString().split("T")[0],
    name: "",
    value: "",
  });

  const types = ["All", "income", "expense", "asset", "liability"];
  const categories = [
    "All",
    "Sales",
    "Raw Materials",
    "Operations",
    "Payroll",
    "Marketing",
    "Equipment",
  ];
  const reportTypes: ReportType[] = [
    { id: "1", name: "Monthly Report", format: "pdf" },
    { id: "2", name: "Quarterly Report", format: "excel" },
  ];

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tRes, aRes, bRes, alRes] = await Promise.all([
          API.get<Transaction[]>("/transactions"),
          API.get<Account[]>("/accounts"),
          API.get<Budget[]>("/budgets"),
          API.get<AssetLiability[]>("/assets-liabilities"),
        ]);
        setTransactions(tRes.data);
        setAccounts(aRes.data);
        setBudgets(bRes.data);
        setAssetsLiabilities(alRes.data);
      } catch (err: any) {
        console.error("Fetch error:", err.response?.data || err.message);
      }
    };
    fetchData();
  }, []);

  // --- FETCH AI PREDICTIONS ---
  useEffect(() => {
    const fetchPredictions = async () => {
      setAiLoading(true);
      try {
        const response = await AI_API.get<AIPredictionResponse>("/predict");
        if (response.data.success) {
          setAiPredictions(response.data.predictions);
          setAiInsights(response.data.insights);
          setHistoricalData(response.data.historical);
        }
      } catch (err: any) {
        console.error("AI Prediction error:", err.response?.data || err.message);
        // Set default insights if AI service is not available
        setAiInsights([
          "AI prediction service is currently unavailable. Start the AI service to get predictions.",
        ]);
      } finally {
        setAiLoading(false);
      }
    };
    fetchPredictions();
  }, [transactions]); // Re-fetch when transactions change

  // --- RESET FORM WHEN MODAL OPENS ---
  useEffect(() => {
    if (showAddModal) {
      resetForm();
    }
  }, [showAddModal]);

  useEffect(() => {
    if (showAddAssetModal) {
      resetAssetForm();
    }
  }, [showAddAssetModal]);

  // --- GENERATE LEDGER ACCOUNTS FROM TRANSACTIONS ---
  const generateLedgerAccounts = useMemo(() => {
    const accountsMap = new Map<string, LedgerAccount>();

    // Process transactions with proper double-entry
    transactions.forEach((transaction) => {
      const accountName = transaction.account;
      if (!accountsMap.has(accountName)) {
        accountsMap.set(accountName, {
          _id: `ledger-${accountName}`,
          accountCode: `ACC-${accountName.slice(0, 3).toUpperCase()}`,
          accountName,
          accountType: transaction.type === "income" ? "income" : "expense",
          debitTotal: 0,
          creditTotal: 0,
          balance: 0,
          entries: [],
        });
      }

      const account = accountsMap.get(accountName)!;
      const entry: LedgerEntry = {
        _id: `entry-${transaction._id}`,
        accountName,
        date: transaction.date,
        description: transaction.description,
        reference: transaction.reference || `TXN-${transaction._id.slice(-6)}`,
        debit: transaction.type === "expense" ? transaction.amount : 0,
        credit: transaction.type === "income" ? transaction.amount : 0,
        balance: 0,
        transactionId: transaction._id,
      };

      account.entries.push(entry);
      account.debitTotal += entry.debit;
      account.creditTotal += entry.credit;
    });

    // Process assets/liabilities with proper double-entry
    assetsLiabilities.forEach((item) => {
      const accountName = `${
        item.type === "asset" ? "Assets" : "Liabilities"
      } - ${item.name}`;
      if (!accountsMap.has(accountName)) {
        accountsMap.set(accountName, {
          _id: `ledger-${accountName}`,
          accountCode:
            item.type === "asset"
              ? `AST-${item.name.slice(0, 3).toUpperCase()}`
              : `LBL-${item.name.slice(0, 3).toUpperCase()}`,
          accountName,
          accountType: item.type,
          debitTotal: 0,
          creditTotal: 0,
          balance: 0,
          entries: [],
        });
      }

      const account = accountsMap.get(accountName)!;
      const entry: LedgerEntry = {
        _id: `entry-${item._id}`,
        accountName,
        date: item.date,
        description: `${item.type === "asset" ? "Asset" : "Liability"} - ${
          item.name
        }`,
        reference: `AST-${item._id.slice(-6)}`,
        debit: item.type === "asset" ? item.value : 0,
        credit: item.type === "liability" ? item.value : 0,
        balance: 0,
        transactionId: item._id,
      };

      account.entries.push(entry);
      account.debitTotal += entry.debit;
      account.creditTotal += entry.credit;
    });

    // Add Cash account for proper double-entry (every transaction affects cash)
    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    const totalAssets = assetsLiabilities
      .filter((al) => al.type === "asset")
      .reduce((sum, al) => sum + al.value, 0);
    const totalLiabilities = assetsLiabilities
      .filter((al) => al.type === "liability")
      .reduce((sum, al) => sum + al.value, 0);

    // Cash account (debit for income and assets, credit for expenses and liabilities)
    if (!accountsMap.has("Cash")) {
      accountsMap.set("Cash", {
        _id: "ledger-Cash",
        accountCode: "CASH-001",
        accountName: "Cash",
        accountType: "asset",
        debitTotal: 0,
        creditTotal: 0,
        balance: 0,
        entries: [],
      });
    }

    const cashAccount = accountsMap.get("Cash")!;
    // Cash increases with income and assets, decreases with expenses and liabilities
    const cashIncrease = totalIncome + totalAssets;
    const cashDecrease = totalExpenses + totalLiabilities;

    if (cashIncrease > 0) {
      cashAccount.entries.push({
        _id: "cash-income-assets",
        accountName: "Cash",
        date: new Date().toISOString(),
        description: "Cash from Income and Assets",
        reference: "CASH-INC",
        debit: cashIncrease,
        credit: 0,
        balance: 0,
        transactionId: "cash-entry",
      });
      cashAccount.debitTotal += cashIncrease;
    }

    if (cashDecrease > 0) {
      cashAccount.entries.push({
        _id: "cash-expenses-liabilities",
        accountName: "Cash",
        date: new Date().toISOString(),
        description: "Cash for Expenses and Liabilities",
        reference: "CASH-EXP",
        debit: 0,
        credit: cashDecrease,
        balance: 0,
        transactionId: "cash-entry",
      });
      cashAccount.creditTotal += cashDecrease;
    }

    return Array.from(accountsMap.values()).sort((a, b) =>
      a.accountName.localeCompare(b.accountName)
    );
  }, [transactions, assetsLiabilities]);

  // --- GENERATE TRIAL BALANCE ---
  const generateTrialBalance = useMemo(() => {
    const trialBalanceEntries: TrialBalanceEntry[] = [];

    generateLedgerAccounts.forEach((account) => {
      let debitBalance = 0;
      let creditBalance = 0;

      // Proper accounting balance rules
      if (
        account.accountType === "asset" ||
        account.accountType === "expense"
      ) {
        // Assets and Expenses have normal debit balances
        debitBalance = Math.max(0, account.debitTotal - account.creditTotal);
        creditBalance = Math.max(0, account.creditTotal - account.debitTotal);
      } else if (
        account.accountType === "liability" ||
        account.accountType === "equity" ||
        account.accountType === "income"
      ) {
        // Liabilities, Equity, and Income have normal credit balances
        creditBalance = Math.max(0, account.creditTotal - account.debitTotal);
        debitBalance = Math.max(0, account.debitTotal - account.creditTotal);
      }

      // Only include accounts with balances
      if (debitBalance > 0 || creditBalance > 0) {
        trialBalanceEntries.push({
          accountName: account.accountName,
          accountType: account.accountType,
          debitBalance: debitBalance,
          creditBalance: creditBalance,
        });
      }
    });

    return trialBalanceEntries;
  }, [generateLedgerAccounts]);

  // --- GENERATE FINANCIAL REPORTS ---
  const generateFinancialReports = useMemo((): FinancialReport => {
    const assets = generateLedgerAccounts.filter(
      (acc) => acc.accountType === "asset"
    );
    const liabilities = generateLedgerAccounts.filter(
      (acc) => acc.accountType === "liability"
    );
    const income = generateLedgerAccounts.filter(
      (acc) => acc.accountType === "income"
    );
    const expenses = generateLedgerAccounts.filter(
      (acc) => acc.accountType === "expense"
    );

    const currentAssets = assets.filter(
      (acc) =>
        acc.accountName.includes("Current") || acc.accountName.includes("Cash")
    );
    const nonCurrentAssets = assets.filter(
      (acc) =>
        !acc.accountName.includes("Current") &&
        !acc.accountName.includes("Cash")
    );

    const currentLiabilities = liabilities.filter((acc) =>
      acc.accountName.includes("Current")
    );
    const nonCurrentLiabilities = liabilities.filter(
      (acc) => !acc.accountName.includes("Current")
    );

    const totalRevenue = income.reduce((sum, acc) => sum + acc.creditTotal, 0);
    const totalExpenses = expenses.reduce(
      (sum, acc) => sum + acc.debitTotal,
      0
    );

    return {
      balanceSheet: {
        assets: {
          current: currentAssets.reduce((sum, acc) => sum + acc.balance, 0),
          nonCurrent: nonCurrentAssets.reduce(
            (sum, acc) => sum + acc.balance,
            0
          ),
          total: assets.reduce((sum, acc) => sum + acc.balance, 0),
        },
        liabilities: {
          current: currentLiabilities.reduce(
            (sum, acc) => sum + acc.balance,
            0
          ),
          nonCurrent: nonCurrentLiabilities.reduce(
            (sum, acc) => sum + acc.balance,
            0
          ),
          total: liabilities.reduce((sum, acc) => sum + acc.balance, 0),
        },
        equity: totalRevenue - totalExpenses,
      },
      profitLoss: {
        revenue: totalRevenue,
        expenses: totalExpenses,
        netIncome: totalRevenue - totalExpenses,
      },
      cashFlow: {
        operating: totalRevenue - totalExpenses,
        investing: 0, // Would need more detailed transaction categorization
        financing: 0, // Would need more detailed transaction categorization
        netChange: totalRevenue - totalExpenses,
      },
    };
  }, [generateLedgerAccounts]);

  // --- COMBINED ROWS (Transactions + Assets/Liabilities) ---
  const combinedRows = useMemo<UnifiedRow[]>(() => {
    const txRows: UnifiedRow[] = transactions.map((t) => ({
      _id: t._id,
      source: "transaction",
      date: t.date,
      type: t.type,
      description: t.description,
      category: t.category,
      account: t.account,
      amount: t.amount,
      status: t.status,
      raw: t,
    }));

    const alRows: UnifiedRow[] = assetsLiabilities.map((al) => ({
      _id: al._id,
      source: "assetLiability",
      date: al.date,
      type: al.type,
      description: al.name,
      // Use subtype as "category" so it fits the table. Could also map to "Assets"/"Liabilities".
      category: al.subtype,
      // No account for assets/liabilities in this model; display a dash
      account: "-",
      amount: al.value,
      status: al.status,
      raw: al,
    }));

    // Sort newest first by date
    return [...txRows, ...alRows].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [transactions, assetsLiabilities]);

  // --- FILTERED ROWS ---
  const filteredRows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return combinedRows.filter((r) => {
      const matchesSearch =
        !term ||
        r.description.toLowerCase().includes(term) ||
        (r.source === "transaction" &&
          (r.raw as Transaction).reference?.toLowerCase().includes(term));

      const matchesType = selectedType === "All" || r.type === selectedType;
      const matchesCategory =
        selectedCategory === "All" || r.category === selectedCategory;

      return matchesSearch && matchesType && matchesCategory;
    });
  }, [combinedRows, searchTerm, selectedType, selectedCategory]);

  // --- CALCULATIONS ---
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalAssets = assetsLiabilities
    .filter((al) => al.type === "asset")
    .reduce((sum, al) => sum + al.value, 0);
  const totalLiabilities = assetsLiabilities
    .filter((al) => al.type === "liability")
    .reduce((sum, al) => sum + al.value, 0);

  const netWorth = totalAssets - totalLiabilities;

  // --- TIME-BASED CHART DATA ---
  const generateTimeBasedData = (items: AssetLiability[], type: string) => {
    const sortedItems = items
      .filter((item) => item.type === type)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (sortedItems.length === 0) {
      return {
        labels: ["No Data"],
        datasets: [
          {
            label: `${type} - Current`,
            data: [0],
            borderColor: "rgba(59, 130, 246, 1)",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            tension: 0.4,
          },
          {
            label: `${type} - Non-current`,
            data: [0],
            borderColor: "rgba(16, 185, 129, 1)",
            backgroundColor: "rgba(16, 185, 129, 0.1)",
            tension: 0.4,
          },
        ],
      };
    }

    // Group by month for better visualization
    const monthlyData = new Map<
      string,
      { current: number; nonCurrent: number }
    >();

    sortedItems.forEach((item) => {
      const monthKey = new Date(item.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      });

      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { current: 0, nonCurrent: 0 });
      }

      const data = monthlyData.get(monthKey)!;
      if (item.subtype === "current") {
        data.current += item.value;
      } else {
        data.nonCurrent += item.value;
      }
    });

    const labels = Array.from(monthlyData.keys());
    const currentData = labels.map((label) => monthlyData.get(label)!.current);
    const nonCurrentData = labels.map(
      (label) => monthlyData.get(label)!.nonCurrent
    );

    return {
      labels,
      datasets: [
        {
          label: `${type} - Current`,
          data: currentData,
          borderColor: "rgba(59, 130, 246, 1)",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          tension: 0.4,
          fill: true,
        },
        {
          label: `${type} - Non-current`,
          data: nonCurrentData,
          borderColor: "rgba(16, 185, 129, 1)",
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          tension: 0.4,
          fill: true,
        },
      ],
    };
  };

  const assetsChartData = generateTimeBasedData(assetsLiabilities, "asset");
  const liabilitiesChartData = generateTimeBasedData(
    assetsLiabilities,
    "liability"
  );

  // --- AI PREDICTION CHART DATA ---
  const predictionChartData = useMemo(() => {
    const allData = [...historicalData, ...aiPredictions];
    
    if (allData.length === 0) {
      return {
        labels: ["No Data"],
        datasets: [
          {
            label: "Income",
            data: [0],
            borderColor: "rgba(34, 197, 94, 1)",
            backgroundColor: "rgba(34, 197, 94, 0.1)",
            tension: 0.4,
          },
          {
            label: "Expenses",
            data: [0],
            borderColor: "rgba(239, 68, 68, 1)",
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            tension: 0.4,
          },
          {
            label: "Profit",
            data: [0],
            borderColor: "rgba(59, 130, 246, 1)",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            tension: 0.4,
          },
        ],
      };
    }

    const labels = allData.map((d) => d.month);
    const incomeData = allData.map((d) => 
      'income' in d ? d.income : d.predicted_income
    );
    const expenseData = allData.map((d) => 
      'expense' in d ? d.expense : d.predicted_expense
    );
    const profitData = allData.map((d) => 
      'profit' in d ? d.profit : d.predicted_profit
    );

    return {
      labels,
      datasets: [
        {
          label: "Income",
          data: incomeData,
          borderColor: "rgba(34, 197, 94, 1)",
          backgroundColor: "rgba(34, 197, 94, 0.1)",
          borderWidth: 2,
          tension: 0.4,
          fill: true,
        },
        {
          label: "Expenses",
          data: expenseData,
          borderColor: "rgba(239, 68, 68, 1)",
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          borderWidth: 2,
          tension: 0.4,
          fill: true,
        },
        {
          label: "Profit",
          data: profitData,
          borderColor: "rgba(59, 130, 246, 1)",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          borderWidth: 2,
          tension: 0.4,
          fill: true,
        },
      ],
    };
  }, [historicalData, aiPredictions]);

  // --- UTILS ---
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "failed":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };
  const getTypeColor = (type: string) =>
    type === "income" || type === "asset"
      ? "text-green-600"
      : type === "expense" || type === "liability"
      ? "text-red-600"
      : "text-gray-600";

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({
      type: "expense",
      category: "",
      subType: "current",
      description: "",
      amount: "",
      account: "",
      reference: "",
      date: new Date().toISOString().split("T")[0],
      name: "",
      value: "",
    });
  };

  const resetAssetForm = () => {
    setFormData({
      type: "asset",
      category: "",
      subType: "current",
      description: "",
      amount: "",
      account: "",
      reference: "",
      date: new Date().toISOString().split("T")[0],
      name: "",
      value: "",
    });
  };

  // --- CRUD HANDLERS (Transactions) ---
  const handleAddTransaction = async () => {
    // Enhanced validation
    const errors = [];
    if (!formData.type) errors.push("Transaction type is required");
    if (!formData.category) errors.push("Category is required");
    if (!formData.description?.trim()) errors.push("Description is required");
    if (!formData.amount || Number(formData.amount) <= 0)
      errors.push("Valid amount is required");
    if (!formData.account?.trim()) errors.push("Account is required");
    if (!formData.date) errors.push("Date is required");

    if (errors.length > 0) {
      alert(`Please fix the following errors:\n• ${errors.join("\n• ")}`);
      return;
    }

    try {
      const res = await API.post<Transaction>("/transactions", {
        ...formData,
        amount: Number(formData.amount),
      });
      setTransactions([res.data, ...transactions]);
      setShowAddModal(false);
      resetForm();
    } catch (err: any) {
      console.error(err.response?.data || err.message);
      const errorMsg = err.response?.data?.error || "Failed to add transaction";
      alert(`Error: ${errorMsg}`);
    }
  };

  const handleEditTransaction = (t: Transaction) => {
    setTransactionToEdit(t);
    setFormData({
      type: t.type,
      category: t.category,
      description: t.description,
      amount: t.amount.toString(),
      account: t.account,
      reference: t.reference || "",
      date: t.date.split("T")[0],
      // keep asset/liability fields intact but they won't be used here
      name: "",
      value: "",
      subType: "current",
    });
    setShowEditModal(true);
  };

  const handleUpdateTransaction = async () => {
    if (!transactionToEdit) return;

    // Enhanced validation
    const errors = [];
    if (!formData.type) errors.push("Transaction type is required");
    if (!formData.category) errors.push("Category is required");
    if (!formData.description?.trim()) errors.push("Description is required");
    if (!formData.amount || Number(formData.amount) <= 0)
      errors.push("Valid amount is required");
    if (!formData.account?.trim()) errors.push("Account is required");
    if (!formData.date) errors.push("Date is required");

    if (errors.length > 0) {
      alert(`Please fix the following errors:\n• ${errors.join("\n• ")}`);
      return;
    }

    try {
      const res = await API.put<Transaction>(
        `/transactions/${transactionToEdit._id}`,
        {
          ...formData,
          amount: Number(formData.amount),
        }
      );
      setTransactions(
        transactions.map((t) => (t._id === res.data._id ? res.data : t))
      );
      setShowEditModal(false);
      setTransactionToEdit(null);
      resetForm();
    } catch (err: any) {
      console.error(err.response?.data || err.message);
      const errorMsg =
        err.response?.data?.error || "Failed to update transaction";
      alert(`Error: ${errorMsg}`);
    }
  };

  const handleDeleteTransaction = (t: Transaction) => {
    setTransactionToDelete(t);
    setShowDeleteModal(true);
  };

  const confirmDeleteTransaction = async () => {
    if (!transactionToDelete) return;
    try {
      await API.delete(`/transactions/${transactionToDelete._id}`);
      setTransactions(
        transactions.filter((t) => t._id !== transactionToDelete._id)
      );
      setShowDeleteModal(false);
      setTransactionToDelete(null);
    } catch (err: any) {
      console.error(err.response?.data || err.message);
      const errorMsg =
        err.response?.data?.error || "Failed to delete transaction";
      alert(`Error: ${errorMsg}`);
    }
  };

  const setShowDownloadReports = (show: boolean) => {
    setShowReportsModal(show);
  };

  // --- DOWNLOAD REPORTS ---
  const downloadReport = (
    reportType: string,
    format: "pdf" | "excel" = "pdf"
  ) => {
    const reports = generateFinancialReports;
    const date = new Date().toISOString().split("T")[0];

    if (format === "pdf") {
      downloadPDFReport(reportType, reports, date);
    } else {
      downloadExcelReport(reportType, reports, date);
    }
  };

  const downloadPDFReport = (
    reportType: string,
    reports: FinancialReport,
    date: string
  ) => {
    // Create professional HTML content for PDF generation
    let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${
        reportType === "balanceSheet"
          ? "Balance Sheet"
          : reportType === "profitLoss"
          ? "Profit & Loss Statement"
          : reportType === "cashFlow"
          ? "Cash Flow Statement"
          : "Trial Balance"
      }</title>
      <style>
        @page { margin: 0.5in; }
        body { 
          font-family: 'Times New Roman', serif; 
          margin: 0; 
          padding: 0;
          font-size: 12px;
          line-height: 1.4;
        }
        .header { 
          text-align: center; 
          margin-bottom: 40px;
          border-bottom: 2px solid #000;
          padding-bottom: 20px;
        }
        .company-name { 
          font-size: 28px; 
          font-weight: bold; 
          margin-bottom: 10px;
          letter-spacing: 2px;
        }
        .report-title { 
          font-size: 18px; 
          font-weight: bold; 
          margin-bottom: 5px;
          text-transform: uppercase;
        }
        .date { 
          font-size: 12px; 
          margin-bottom: 10px;
        }
        .section { 
          margin: 30px 0; 
        }
        .section-title { 
          font-size: 14px; 
          font-weight: bold; 
          margin-bottom: 15px;
          text-decoration: underline;
        }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 10px 0;
          font-size: 11px;
        }
        th, td { 
          border: 1px solid #000; 
          padding: 8px 12px; 
          text-align: left;
          vertical-align: top;
        }
        th { 
          background-color: #f0f0f0; 
          font-weight: bold;
          text-align: center;
        }
        .amount { 
          text-align: right; 
          font-family: 'Courier New', monospace;
        }
        .total { 
          font-weight: bold; 
          border-top: 2px solid #000;
          background-color: #f8f8f8;
        }
        .subtotal {
          font-weight: bold;
          background-color: #f5f5f5;
        }
        .currency { 
          font-family: 'Courier New', monospace;
          font-weight: normal;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          font-size: 10px;
          color: #666;
          border-top: 1px solid #ccc;
          padding-top: 20px;
        }
        .report-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
          font-size: 10px;
        }
      </style>
    </head>
    <body>
      <div class="report-info">
        <div>Generated: ${new Date().toLocaleString()}</div>
        <div>Page 1 of 1</div>
      </div>
      
      <div class="header">
        <div class="company-name">PLANETS PICK ERP SYSTEM</div>
        <div class="report-title">${
          reportType === "balanceSheet"
            ? "BALANCE SHEET"
            : reportType === "profitLoss"
            ? "PROFIT & LOSS STATEMENT"
            : reportType === "cashFlow"
            ? "CASH FLOW STATEMENT"
            : "TRIAL BALANCE"
        }</div>
        <div class="date">As of ${new Date().toLocaleDateString()}</div>
      </div>
    `;

    switch (reportType) {
      case "balanceSheet":
        htmlContent += generateBalanceSheetHTML(reports.balanceSheet);
        break;
      case "profitLoss":
        htmlContent += generateProfitLossHTML(reports.profitLoss);
        break;
      case "cashFlow":
        htmlContent += generateCashFlowHTML(reports.cashFlow);
        break;
      case "trialBalance":
        htmlContent += generateTrialBalanceHTML(generateTrialBalance);
        break;
    }

    htmlContent += `
      <div class="footer">
        <p>This report was generated by Planets Pick ERP System</p>
        <p>For questions regarding this report, please contact the Finance Department</p>
      </div>
    </body>
    </html>
    `;

    // Create and download HTML file with instructions for PDF conversion
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${
      reportType === "balanceSheet"
        ? "Balance_Sheet"
        : reportType === "profitLoss"
        ? "Profit_Loss_Statement"
        : reportType === "cashFlow"
        ? "Cash_Flow_Statement"
        : "Trial_Balance"
    }_${date}.html`;

    // Add instructions for PDF conversion
    setTimeout(() => {
      alert(
        'File downloaded! To convert to PDF:\n1. Open the downloaded HTML file in your browser\n2. Press Ctrl+P (Cmd+P on Mac)\n3. Select "Save as PDF" as destination\n4. Click Save'
      );
    }, 100);

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Scroll handler (already declared above)
  // const [showScrollTop, setShowScrollTop] = useState(false); // REMOVE this duplicate
  // useEffect(() => {
  //   const handleScroll = () => setShowScrollTop(window.scrollY > 300);
  //   window.addEventListener("scroll", handleScroll);
  //   return () => window.removeEventListener("scroll", handleScroll);
  // }, []);

  // inside component:
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Find the scrolling container (the main content area)
  useEffect(() => {
    // The scrolling happens in the main content div with overflow-y-auto
    const scrollContainer = document.querySelector(
      ".h-screen.overflow-y-auto"
    ) as HTMLElement;

    if (scrollContainer) {
      const onScroll = () => {
        const scrollTop = scrollContainer.scrollTop;
        console.log("Scroll container scrollTop:", scrollTop);
        setShowScrollTop(scrollTop > 300);
      };

      scrollContainer.addEventListener("scroll", onScroll, { passive: true });
      return () => scrollContainer.removeEventListener("scroll", onScroll);
    } else {
      console.log("Scroll container not found, falling back to window");
      const onScroll = () => {
        const y =
          window.scrollY ||
          document.documentElement.scrollTop ||
          document.body.scrollTop;
        console.log("Window scrollY:", y);
        setShowScrollTop(y > 300);
      };

      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
    }
  }, []);

  const scrollToTop = () => {
    console.log("Scroll to top clicked!");

    // Find the scrolling container (the main content area)
    const scrollContainer = document.querySelector(
      ".h-screen.overflow-y-auto"
    ) as HTMLElement;

    if (scrollContainer) {
      console.log(
        "Current scroll container position:",
        scrollContainer.scrollTop
      );

      // Scroll the container to top
      scrollContainer.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
      });

      // Fallback for immediate scroll if smooth doesn't work
      setTimeout(() => {
        if (scrollContainer.scrollTop > 100) {
          console.log(
            "Smooth scroll failed, using instant scroll on container"
          );
          scrollContainer.scrollTop = 0;
        }
      }, 100);
    } else {
      console.log("Container not found, trying window scroll");
      console.log("Current window scroll position:", window.scrollY);

      // Fallback to window scroll
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
      });

      setTimeout(() => {
        if (window.scrollY > 100) {
          console.log("Smooth scroll might have failed, using instant scroll");
          window.scrollTo(0, 0);
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
        }
      }, 100);
    }
  };

  const downloadExcelReport = (
    reportType: string,
    reports: FinancialReport,
    date: string
  ) => {
    let csvContent = "";

    switch (reportType) {
      case "balanceSheet":
        csvContent = generateBalanceSheetCSV(reports.balanceSheet);
        break;
      case "profitLoss":
        csvContent = generateProfitLossCSV(reports.profitLoss);
        break;
      case "cashFlow":
        csvContent = generateCashFlowCSV(reports.cashFlow);
        break;
      case "trialBalance":
        csvContent = generateTrialBalanceCSV(generateTrialBalance);
        break;
    }

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${
      reportType === "balanceSheet"
        ? "Balance_Sheet"
        : reportType === "profitLoss"
        ? "Profit_Loss_Statement"
        : reportType === "cashFlow"
        ? "Cash_Flow_Statement"
        : "Trial_Balance"
    }_${date}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // --- HTML REPORT GENERATORS ---
  const generateBalanceSheetHTML = (
    balanceSheet: FinancialReport["balanceSheet"]
  ) => {
    return `
      <div class="section">
        <div class="section-title">ASSETS</div>
        <table>
          <tr>
            <th style="width: 70%;">Description</th>
            <th class="amount" style="width: 30%;">Amount (LKR)</th>
          </tr>
          <tr>
            <td style="padding-left: 20px;">Current Assets</td>
            <td class="amount currency">${balanceSheet.assets.current.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding-left: 20px;">Non-Current Assets</td>
            <td class="amount currency">${balanceSheet.assets.nonCurrent.toLocaleString()}</td>
          </tr>
          <tr class="total">
            <td><strong>TOTAL ASSETS</strong></td>
            <td class="amount currency"><strong>${balanceSheet.assets.total.toLocaleString()}</strong></td>
          </tr>
        </table>
      </div>

      <div class="section">
        <div class="section-title">LIABILITIES & EQUITY</div>
        <table>
          <tr>
            <th style="width: 70%;">Description</th>
            <th class="amount" style="width: 30%;">Amount (LKR)</th>
          </tr>
          <tr>
            <td style="padding-left: 20px;">Current Liabilities</td>
            <td class="amount currency">${balanceSheet.liabilities.current.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding-left: 20px;">Non-Current Liabilities</td>
            <td class="amount currency">${balanceSheet.liabilities.nonCurrent.toLocaleString()}</td>
          </tr>
          <tr class="subtotal">
            <td style="padding-left: 10px;"><strong>Total Liabilities</strong></td>
            <td class="amount currency"><strong>${balanceSheet.liabilities.total.toLocaleString()}</strong></td>
          </tr>
          <tr>
            <td style="padding-left: 20px;">Retained Earnings</td>
            <td class="amount currency">${balanceSheet.equity.toLocaleString()}</td>
          </tr>
          <tr class="total">
            <td><strong>TOTAL LIABILITIES & EQUITY</strong></td>
            <td class="amount currency"><strong>${(
              balanceSheet.liabilities.total + balanceSheet.equity
            ).toLocaleString()}</strong></td>
          </tr>
        </table>
      </div>
    `;
  };

  const generateProfitLossHTML = (
    profitLoss: FinancialReport["profitLoss"]
  ) => {
    return `
      <div class="section">
        <div class="section-title">REVENUE</div>
        <table>
          <tr>
            <th style="width: 70%;">Description</th>
            <th class="amount" style="width: 30%;">Amount (LKR)</th>
          </tr>
          <tr>
            <td style="padding-left: 20px;">Total Revenue</td>
            <td class="amount currency">${profitLoss.revenue.toLocaleString()}</td>
          </tr>
          <tr class="total">
            <td><strong>TOTAL REVENUE</strong></td>
            <td class="amount currency"><strong>${profitLoss.revenue.toLocaleString()}</strong></td>
          </tr>
        </table>
      </div>

      <div class="section">
        <div class="section-title">EXPENSES</div>
        <table>
          <tr>
            <th style="width: 70%;">Description</th>
            <th class="amount" style="width: 30%;">Amount (LKR)</th>
          </tr>
          <tr>
            <td style="padding-left: 20px;">Total Expenses</td>
            <td class="amount currency">${profitLoss.expenses.toLocaleString()}</td>
          </tr>
          <tr class="total">
            <td><strong>TOTAL EXPENSES</strong></td>
            <td class="amount currency"><strong>${profitLoss.expenses.toLocaleString()}</strong></td>
          </tr>
        </table>
      </div>

      <div class="section">
        <table>
          <tr class="total">
            <td><strong>NET INCOME (LOSS)</strong></td>
            <td class="amount currency"><strong>${profitLoss.netIncome.toLocaleString()}</strong></td>
          </tr>
        </table>
      </div>
    `;
  };

  const generateCashFlowHTML = (cashFlow: FinancialReport["cashFlow"]) => {
    return `
      <div class="section">
        <div class="section-title">CASH FLOWS FROM OPERATING ACTIVITIES</div>
        <table>
          <tr>
            <th style="width: 70%;">Description</th>
            <th class="amount" style="width: 30%;">Amount (LKR)</th>
          </tr>
          <tr>
            <td style="padding-left: 20px;">Net Income</td>
            <td class="amount currency">${cashFlow.operating.toLocaleString()}</td>
          </tr>
          <tr class="total">
            <td><strong>NET CASH FROM OPERATING ACTIVITIES</strong></td>
            <td class="amount currency"><strong>${cashFlow.operating.toLocaleString()}</strong></td>
          </tr>
        </table>
      </div>

      <div class="section">
        <div class="section-title">CASH FLOWS FROM INVESTING ACTIVITIES</div>
        <table>
          <tr>
            <th style="width: 70%;">Description</th>
            <th class="amount" style="width: 30%;">Amount (LKR)</th>
          </tr>
          <tr>
            <td style="padding-left: 20px;">Investing Activities</td>
            <td class="amount currency">${cashFlow.investing.toLocaleString()}</td>
          </tr>
          <tr class="total">
            <td><strong>NET CASH FROM INVESTING ACTIVITIES</strong></td>
            <td class="amount currency"><strong>${cashFlow.investing.toLocaleString()}</strong></td>
          </tr>
        </table>
      </div>

      <div class="section">
        <div class="section-title">CASH FLOWS FROM FINANCING ACTIVITIES</div>
        <table>
          <tr>
            <th style="width: 70%;">Description</th>
            <th class="amount" style="width: 30%;">Amount (LKR)</th>
          </tr>
          <tr>
            <td style="padding-left: 20px;">Financing Activities</td>
            <td class="amount currency">${cashFlow.financing.toLocaleString()}</td>
          </tr>
          <tr class="total">
            <td><strong>NET CASH FROM FINANCING ACTIVITIES</strong></td>
            <td class="amount currency"><strong>${cashFlow.financing.toLocaleString()}</strong></td>
          </tr>
        </table>
      </div>

      <div class="section">
        <table>
          <tr class="total">
            <td><strong>NET INCREASE (DECREASE) IN CASH</strong></td>
            <td class="amount currency"><strong>${cashFlow.netChange.toLocaleString()}</strong></td>
          </tr>
        </table>
      </div>
    `;
  };

  const generateTrialBalanceHTML = (trialBalance: TrialBalanceEntry[]) => {
    let html = `
      <div class="section">
        <table>
          <tr>
            <th style="width: 50%;">Account Name</th>
            <th style="width: 15%;">Type</th>
            <th class="amount" style="width: 17.5%;">Debit (LKR)</th>
            <th class="amount" style="width: 17.5%;">Credit (LKR)</th>
          </tr>
    `;

    trialBalance.forEach((entry) => {
      html += `
        <tr>
          <td style="padding-left: 10px;">${entry.accountName}</td>
          <td style="text-align: center;">${entry.accountType.toUpperCase()}</td>
          <td class="amount currency">${
            entry.debitBalance > 0 ? entry.debitBalance.toLocaleString() : "-"
          }</td>
          <td class="amount currency">${
            entry.creditBalance > 0 ? entry.creditBalance.toLocaleString() : "-"
          }</td>
        </tr>
      `;
    });

    const totalDebits = trialBalance.reduce(
      (sum, entry) => sum + entry.debitBalance,
      0
    );
    const totalCredits = trialBalance.reduce(
      (sum, entry) => sum + entry.creditBalance,
      0
    );

    html += `
          <tr class="total">
            <td><strong>TOTALS</strong></td>
            <td></td>
            <td class="amount currency"><strong>${totalDebits.toLocaleString()}</strong></td>
            <td class="amount currency"><strong>${totalCredits.toLocaleString()}</strong></td>
          </tr>
        </table>
      </div>
      
      <div class="section">
        <div style="text-align: center; margin: 20px 0;">
          <strong>Trial Balance is ${
            Math.abs(totalDebits - totalCredits) < 0.01
              ? "BALANCED"
              : "OUT OF BALANCE"
          }</strong>
          ${
            Math.abs(totalDebits - totalCredits) >= 0.01
              ? `<br><span style="color: red;">Difference: ${(
                  totalDebits - totalCredits
                ).toLocaleString()} LKR</span>`
              : ""
          }
        </div>
      </div>
    `;

    return html;
  };

  // --- CSV REPORT GENERATORS ---
  const generateBalanceSheetCSV = (
    balanceSheet: FinancialReport["balanceSheet"]
  ) => {
    return `PLANETS PICK ERP SYSTEM - BALANCE SHEET
Generated: ${new Date().toLocaleString()}
As of: ${new Date().toLocaleDateString()}

ASSETS
Description,Amount (LKR)
Current Assets,${balanceSheet.assets.current.toLocaleString()}
Non-Current Assets,${balanceSheet.assets.nonCurrent.toLocaleString()}
TOTAL ASSETS,${balanceSheet.assets.total.toLocaleString()}

LIABILITIES & EQUITY
Description,Amount (LKR)
Current Liabilities,${balanceSheet.liabilities.current.toLocaleString()}
Non-Current Liabilities,${balanceSheet.liabilities.nonCurrent.toLocaleString()}
Total Liabilities,${balanceSheet.liabilities.total.toLocaleString()}
Retained Earnings,${balanceSheet.equity.toLocaleString()}
TOTAL LIABILITIES & EQUITY,${(
      balanceSheet.liabilities.total + balanceSheet.equity
    ).toLocaleString()}`;
  };

  const generateProfitLossCSV = (profitLoss: FinancialReport["profitLoss"]) => {
    return `PLANETS PICK ERP SYSTEM - PROFIT & LOSS STATEMENT
Generated: ${new Date().toLocaleString()}
Period: ${new Date().toLocaleDateString()}

REVENUE
Description,Amount (LKR)
Total Revenue,${profitLoss.revenue.toLocaleString()}
TOTAL REVENUE,${profitLoss.revenue.toLocaleString()}

EXPENSES
Description,Amount (LKR)
Total Expenses,${profitLoss.expenses.toLocaleString()}
TOTAL EXPENSES,${profitLoss.expenses.toLocaleString()}

NET INCOME (LOSS),${profitLoss.netIncome.toLocaleString()}`;
  };

  const generateCashFlowCSV = (cashFlow: FinancialReport["cashFlow"]) => {
    return `PLANETS PICK ERP SYSTEM - CASH FLOW STATEMENT
Generated: ${new Date().toLocaleString()}
Period: ${new Date().toLocaleDateString()}

CASH FLOWS FROM OPERATING ACTIVITIES
Description,Amount (LKR)
Net Income,${cashFlow.operating.toLocaleString()}
NET CASH FROM OPERATING ACTIVITIES,${cashFlow.operating.toLocaleString()}

CASH FLOWS FROM INVESTING ACTIVITIES
Description,Amount (LKR)
Investing Activities,${cashFlow.investing.toLocaleString()}
NET CASH FROM INVESTING ACTIVITIES,${cashFlow.investing.toLocaleString()}

CASH FLOWS FROM FINANCING ACTIVITIES
Description,Amount (LKR)
Financing Activities,${cashFlow.financing.toLocaleString()}
NET CASH FROM FINANCING ACTIVITIES,${cashFlow.financing.toLocaleString()}

NET INCREASE (DECREASE) IN CASH,${cashFlow.netChange.toLocaleString()}`;
  };

  const generateTrialBalanceCSV = (trialBalance: TrialBalanceEntry[]) => {
    const totalDebits = trialBalance.reduce(
      (sum, entry) => sum + entry.debitBalance,
      0
    );
    const totalCredits = trialBalance.reduce(
      (sum, entry) => sum + entry.creditBalance,
      0
    );

    let csv = `PLANETS PICK ERP SYSTEM - TRIAL BALANCE
Generated: ${new Date().toLocaleString()}
As of: ${new Date().toLocaleDateString()}

Account Name,Type,Debit (LKR),Credit (LKR)\n`;

    trialBalance.forEach((entry) => {
      csv += `${entry.accountName},${entry.accountType.toUpperCase()},${
        entry.debitBalance > 0 ? entry.debitBalance.toLocaleString() : ""
      },${
        entry.creditBalance > 0 ? entry.creditBalance.toLocaleString() : ""
      }\n`;
    });

    csv += `TOTALS,,${totalDebits.toLocaleString()},${totalCredits.toLocaleString()}
Trial Balance Status,${
      Math.abs(totalDebits - totalCredits) < 0.01
        ? "BALANCED"
        : "OUT OF BALANCE"
    }
${
  Math.abs(totalDebits - totalCredits) >= 0.01
    ? `Difference,${(totalDebits - totalCredits).toLocaleString()},`
    : ""
}`;

    return csv;
  };

  const generateProfitLossReport = (
    profitLoss: FinancialReport["profitLoss"]
  ) => {
    return `
PROFIT & LOSS STATEMENT
Generated: ${new Date().toLocaleDateString()}

REVENUE:
  Total Revenue: ${profitLoss.revenue.toLocaleString("en-LK", {
    style: "currency",
    currency: "LKR",
  })}

EXPENSES:
  Total Expenses: ${profitLoss.expenses.toLocaleString("en-LK", {
    style: "currency",
    currency: "LKR",
  })}

NET INCOME: ${profitLoss.netIncome.toLocaleString("en-LK", {
      style: "currency",
      currency: "LKR",
    })}
`;
  };

  const generateCashFlowReport = (cashFlow: FinancialReport["cashFlow"]) => {
    return `
CASH FLOW STATEMENT
Generated: ${new Date().toLocaleDateString()}

OPERATING ACTIVITIES:
  Net Cash from Operations: ${cashFlow.operating.toLocaleString("en-LK", {
    style: "currency",
    currency: "LKR",
  })}

INVESTING ACTIVITIES:
  Net Cash from Investing: ${cashFlow.investing.toLocaleString("en-LK", {
    style: "currency",
    currency: "LKR",
  })}

FINANCING ACTIVITIES:
  Net Cash from Financing: ${cashFlow.financing.toLocaleString("en-LK", {
    style: "currency",
    currency: "LKR",
  })}

NET CHANGE IN CASH: ${cashFlow.netChange.toLocaleString("en-LK", {
      style: "currency",
      currency: "LKR",
    })}
`;
  };

  const generateTrialBalanceReport = (trialBalance: TrialBalanceEntry[]) => {
    let content = `
TRIAL BALANCE
Generated: ${new Date().toLocaleDateString()}

Account Name\t\t\t\tDebit\t\tCredit
${"=".repeat(80)}
`;

    let totalDebits = 0;
    let totalCredits = 0;

    trialBalance.forEach((entry) => {
      content += `${
        entry.accountName
      }\t\t\t\t${entry.debitBalance.toLocaleString("en-LK", {
        style: "currency",
        currency: "LKR",
      })}\t\t${entry.creditBalance.toLocaleString("en-LK", {
        style: "currency",
        currency: "LKR",
      })}\n`;
      totalDebits += entry.debitBalance;
      totalCredits += entry.creditBalance;
    });

    content += `${"=".repeat(80)}\n`;
    content += `TOTALS\t\t\t\t${totalDebits.toLocaleString("en-LK", {
      style: "currency",
      currency: "LKR",
    })}\t\t${totalCredits.toLocaleString("en-LK", {
      style: "currency",
      currency: "LKR",
    })}\n`;

    return content;
  };

  // --- ADD ASSET/LIABILITY HANDLER ---
  const handleAddAssetLiability = async () => {
    // Enhanced validation
    const errors = [];
    if (!formData.type) errors.push("Type (Asset/Liability) is required");
    if (!formData.subType)
      errors.push("Subtype (Current/Non-current) is required");
    if (!formData.name?.trim()) errors.push("Name is required");
    if (!formData.value || Number(formData.value) <= 0)
      errors.push("Valid value is required");
    if (!formData.date) errors.push("Date is required");

    if (errors.length > 0) {
      alert(`Please fix the following errors:\n• ${errors.join("\n• ")}`);
      return;
    }

    try {
      const res = await API.post<AssetLiability>("/assets-liabilities", {
        type: formData.type,
        subtype: formData.subType,
        name: formData.name,
        value: Number(formData.value),
        date: formData.date,
      });
      setAssetsLiabilities([res.data, ...assetsLiabilities]);
      setShowAddAssetModal(false);
      resetAssetForm();
    } catch (err: any) {
      console.error(err.response?.data || err.message);
      const errorMsg =
        err.response?.data?.error || "Failed to add asset/liability";
      alert(`Error: ${errorMsg}`);
    }
  };

  // --- CRUD HANDLERS (Assets/Liabilities) ---
  const handleEditAssetLiability = (asset: AssetLiability) => {
    setAssetToEdit(asset);
    setFormData({
      type: asset.type,
      subType: asset.subtype,
      name: asset.name,
      value: asset.value.toString(),
      date: asset.date.split("T")[0],
      // Keep other fields intact but they won't be used here
      category: "",
      description: "",
      amount: "",
      account: "",
      reference: "",
    });
    setShowEditAssetModal(true);
  };

  const handleUpdateAssetLiability = async () => {
    if (!assetToEdit) return;

    // Enhanced validation
    const errors = [];
    if (!formData.type) errors.push("Type (Asset/Liability) is required");
    if (!formData.subType)
      errors.push("Subtype (Current/Non-current) is required");
    if (!formData.name?.trim()) errors.push("Name is required");
    if (!formData.value || Number(formData.value) <= 0)
      errors.push("Valid value is required");
    if (!formData.date) errors.push("Date is required");

    if (errors.length > 0) {
      alert(`Please fix the following errors:\n• ${errors.join("\n• ")}`);
      return;
    }

    try {
      const res = await API.put<AssetLiability>(
        `/assets-liabilities/${assetToEdit._id}`,
        {
          type: formData.type,
          subtype: formData.subType,
          name: formData.name,
          value: Number(formData.value),
          date: formData.date,
        }
      );
      setAssetsLiabilities(
        assetsLiabilities.map((al) => (al._id === res.data._id ? res.data : al))
      );
      setShowEditAssetModal(false);
      setAssetToEdit(null);
      resetAssetForm();
    } catch (err: any) {
      console.error(err.response?.data || err.message);
      const errorMsg =
        err.response?.data?.error || "Failed to update asset/liability";
      alert(`Error: ${errorMsg}`);
    }
  };

  const handleDeleteAssetLiability = (asset: AssetLiability) => {
    setAssetToDelete(asset);
    setShowDeleteAssetModal(true);
  };

  const confirmDeleteAssetLiability = async () => {
    if (!assetToDelete) return;
    try {
      await API.delete(`/assets-liabilities/${assetToDelete._id}`);
      setAssetsLiabilities(
        assetsLiabilities.filter((al) => al._id !== assetToDelete._id)
      );
      setShowDeleteAssetModal(false);
      setAssetToDelete(null);
    } catch (err: any) {
      console.error(err.response?.data || err.message);
      const errorMsg =
        err.response?.data?.error || "Failed to delete asset/liability";
      alert(`Error: ${errorMsg}`);
    }
  };

  // --- RENDER ---
  return (
    <div className="p-4 space-y-6">
      {/* Header + Add Buttons */}
      <div className="flex justify-between items-start flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Finance Management
          </h1>
          <p className="text-gray-600">
            Monitor financial performance, manage budgets, and track cash flow
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition"
          >
            <Plus size={16} /> Add Transaction
          </button>
          <button
            onClick={() => setShowAddAssetModal(true)}
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-yellow-700 transition"
          >
            <Plus size={16} /> Add Asset / Liability
          </button>
          <button
            onClick={() => setShowDownloadReports(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition"
          >
            <FileText size={16} /> Download Reports
          </button>
        </div>
      </div>
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("transactions")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "transactions"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <FileText className="inline mr-2" size={16} />
            Transactions
          </button>
          <button
            onClick={() => setActiveTab("ledgers")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "ledgers"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <BookOpen className="inline mr-2" size={16} />
            View Ledgers
          </button>
        </nav>
      </div>
      {/* Tab Content */}
      {activeTab === "transactions" && (
        <>
          {/* Summary Blocks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-green-50 p-4 rounded-lg shadow min-h-[100px]">
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                Total Income
              </h3>
              <p className="text-lg font-bold text-green-700 break-words overflow-hidden">
                {totalIncome.toLocaleString("en-LK", {
                  style: "currency",
                  currency: "LKR",
                })}
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg shadow min-h-[100px]">
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                Total Expenses
              </h3>
              <p className="text-lg font-bold text-red-700 break-words overflow-hidden">
                {totalExpenses.toLocaleString("en-LK", {
                  style: "currency",
                  currency: "LKR",
                })}
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg shadow min-h-[100px]">
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                Total Assets
              </h3>
              <p className="text-lg font-bold text-blue-700 break-words overflow-hidden">
                {totalAssets.toLocaleString("en-LK", {
                  style: "currency",
                  currency: "LKR",
                })}
              </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg shadow min-h-[100px]">
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                Total Liabilities
              </h3>
              <p className="text-lg font-bold text-yellow-700 break-words overflow-hidden">
                {totalLiabilities.toLocaleString("en-LK", {
                  style: "currency",
                  currency: "LKR",
                })}
              </p>
            </div>
            <div className="bg-indigo-50 p-4 rounded-lg shadow min-h-[100px]">
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                Net Worth
              </h3>
              <p className="text-lg font-bold text-indigo-700 break-words overflow-hidden">
                {netWorth.toLocaleString("en-LK", {
                  style: "currency",
                  currency: "LKR",
                })}
              </p>
            </div>
          </div>

          {/* AI Financial Insights */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="bg-purple-500 text-white p-2 rounded-lg flex-shrink-0">
                <Bot size={20} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-purple-900 flex items-center gap-2">
                  AI Financial Insights
                  <Sparkles size={16} className="text-purple-600" />
                </h3>
                {aiLoading ? (
                  <p className="text-purple-700 text-sm mt-1">
                    Analyzing financial data...
                  </p>
                ) : (
                  <div className="space-y-1 mt-2">
                    {aiInsights.map((insight, idx) => (
                      <p key={idx} className="text-purple-700 text-sm">
                        • {insight}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* AI Predictions Card */}
          {aiPredictions.length > 0 && (
            <div className="bg-white rounded-lg shadow border p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="text-purple-600" size={20} />
                Financial Predictions (Next 3 Months)
              </h3>
              
              {/* Prediction Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {aiPredictions.map((pred, idx) => (
                  <div key={idx} className="bg-gradient-to-br from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
                    <h4 className="text-sm font-medium text-gray-600 mb-2">
                      {pred.month}
                    </h4>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-gray-500">Income</p>
                        <p className="text-base font-bold text-green-600">
                          {pred.predicted_income.toLocaleString("en-LK", {
                            style: "currency",
                            currency: "LKR",
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Expenses</p>
                        <p className="text-base font-bold text-red-600">
                          {pred.predicted_expense.toLocaleString("en-LK", {
                            style: "currency",
                            currency: "LKR",
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Profit</p>
                        <p className={`text-base font-bold ${pred.predicted_profit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                          {pred.predicted_profit.toLocaleString("en-LK", {
                            style: "currency",
                            currency: "LKR",
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Prediction Chart */}
              <div className="h-64">
                <Line
                  data={predictionChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "top" as const,
                      },
                      title: {
                        display: true,
                        text: "Historical & Predicted Financial Trends",
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                              label += ': ';
                            }
                            if (context.parsed.y !== null) {
                              label += context.parsed.y.toLocaleString("en-LK", {
                                style: "currency",
                                currency: "LKR",
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0,
                              });
                            }
                            return label;
                          }
                        }
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: function(value) {
                            return 'LKR ' + Number(value).toLocaleString();
                          }
                        }
                      },
                    },
                  }}
                />
              </div>
            </div>
          )}

          {/* ASSET/LIABILITY MODAL */}
          {showAddAssetModal && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
              <div className="bg-white/95 backdrop-blur-md shadow-xl rounded-2xl w-full max-w-md relative p-6">
                <button
                  onClick={() => {
                    setShowAddAssetModal(false);
                    resetAssetForm();
                  }}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition"
                >
                  <X size={24} />
                </button>
                <h2 className="text-2xl font-semibold mb-4">
                  Add Asset / Liability
                </h2>
                <form className="space-y-4">
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="border border-gray-300 rounded-lg p-2 w-full"
                  >
                    <option value="asset">Asset</option>
                    <option value="liability">Liability</option>
                  </select>
                  <select
                    name="subType"
                    value={formData.subType}
                    onChange={handleInputChange}
                    className="border border-gray-300 rounded-lg p-2 w-full"
                  >
                    <option value="current">Current</option>
                    <option value="non-current">Non-current</option>
                  </select>
                  <input
                    type="text"
                    name="name"
                    placeholder="Asset/Liability Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="border border-gray-300 rounded-lg p-2 w-full"
                  />
                  <input
                    type="number"
                    name="value"
                    placeholder="Value"
                    value={formData.value}
                    onChange={handleInputChange}
                    className="border border-gray-300 rounded-lg p-2 w-full"
                  />
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="border border-gray-300 rounded-lg p-2 w-full"
                  />
                  <button
                    type="button"
                    onClick={handleAddAssetLiability}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold hover:from-yellow-600 hover:to-orange-600 transition"
                  >
                    Add
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ADD / EDIT MODAL */}
          {(showAddModal || showEditModal) && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
              <div className="bg-white/95 backdrop-blur-md shadow-xl rounded-2xl w-full max-w-md relative p-6">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition"
                >
                  <X size={24} />
                </button>
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className={`p-3 rounded-full ${
                      formData.type === "income"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {formData.type === "income" ? (
                      <TrendingUp size={20} />
                    ) : (
                      <TrendingDown size={20} />
                    )}
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">
                    {showAddModal ? "Add" : "Edit"} Transaction
                  </h2>
                </div>
                <form className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                    >
                      <option value="income">Income</option>
                      <option value="expense">Expense</option>
                    </select>
                    <input
                      type="text"
                      name="category"
                      placeholder="Category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                    />
                  </div>
                  <input
                    type="text"
                    name="description"
                    placeholder="Description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="number"
                      name="amount"
                      placeholder="Amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                    />
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="account"
                      placeholder="Account"
                      value={formData.account}
                      onChange={handleInputChange}
                      className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                    />
                    <input
                      type="text"
                      name="reference"
                      placeholder="Reference"
                      value={formData.reference}
                      onChange={handleInputChange}
                      className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={
                      showAddModal
                        ? handleAddTransaction
                        : handleUpdateTransaction
                    }
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold hover:from-indigo-600 hover:to-purple-600 transition"
                  >
                    {showAddModal ? "Add Transaction" : "Update Transaction"}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* EDIT ASSET/LIABILITY MODAL */}
          {showEditAssetModal && assetToEdit && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
              <div className="bg-white/95 backdrop-blur-md shadow-xl rounded-2xl w-full max-w-md relative p-6">
                <button
                  onClick={() => {
                    setShowEditAssetModal(false);
                    setAssetToEdit(null);
                  }}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition"
                >
                  <X size={24} />
                </button>
                <h2 className="text-2xl font-semibold mb-4">
                  Edit {assetToEdit.type === "asset" ? "Asset" : "Liability"}
                </h2>
                <form className="space-y-4">
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="border border-gray-300 rounded-lg p-2 w-full"
                  >
                    <option value="asset">Asset</option>
                    <option value="liability">Liability</option>
                  </select>
                  <select
                    name="subType"
                    value={formData.subType}
                    onChange={handleInputChange}
                    className="border border-gray-300 rounded-lg p-2 w-full"
                  >
                    <option value="current">Current</option>
                    <option value="non-current">Non-current</option>
                  </select>
                  <input
                    type="text"
                    name="name"
                    placeholder="Asset/Liability Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="border border-gray-300 rounded-lg p-2 w-full"
                  />
                  <input
                    type="number"
                    name="value"
                    placeholder="Value"
                    value={formData.value}
                    onChange={handleInputChange}
                    className="border border-gray-300 rounded-lg p-2 w-full"
                  />
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="border border-gray-300 rounded-lg p-2 w-full"
                  />
                  <button
                    type="button"
                    onClick={handleUpdateAssetLiability}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold hover:from-yellow-600 hover:to-orange-600 transition"
                  >
                    Update
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* DELETE TRANSACTION MODAL */}
          {showDeleteModal && transactionToDelete && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6 relative">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
                >
                  <X size={20} />
                </button>
                <h2 className="text-xl font-semibold mb-4">Confirm Delete</h2>
                <p>
                  Are you sure you want to delete transaction{" "}
                  <span className="font-bold">
                    {transactionToDelete.description}
                  </span>
                  ?
                </p>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeleteTransaction}
                    className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* DELETE ASSET/LIABILITY MODAL */}
          {showDeleteAssetModal && assetToDelete && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6 relative">
                <button
                  onClick={() => setShowDeleteAssetModal(false)}
                  className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
                >
                  <X size={20} />
                </button>
                <h2 className="text-xl font-semibold mb-4">Confirm Delete</h2>
                <p>
                  Are you sure you want to delete{" "}
                  <span className="font-bold">
                    {assetToDelete.type} - {assetToDelete.name}
                  </span>
                  ?
                </p>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => setShowDeleteAssetModal(false)}
                    className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeleteAssetLiability}
                    className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Transactions + Assets/Liabilities Table */}
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <div className="p-4 flex gap-2 flex-wrap items-center">
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border rounded p-2 flex-1 min-w-[200px]"
              />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="border rounded p-2"
              >
                {types.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border rounded p-2"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Account
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-8 text-center text-gray-500"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <FileText className="text-gray-400" size={48} />
                          <span className="text-lg">No records found</span>
                          <span className="text-sm">
                            Try adjusting your search or filters
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map((r) => (
                      <tr
                        key={`${r.source}-${r._id}`}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {new Date(r.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              r.type === "income" || r.type === "asset"
                                ? "bg-green-100 text-green-800"
                                : r.type === "expense" || r.type === "liability"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {r.source === "assetLiability" ? (
                              <>
                                {r.type === "asset" ? "📈" : "📉"} {r.type}
                              </>
                            ) : (
                              <>
                                {r.type === "income" ? "💰" : "💸"} {r.type}
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                          {r.description}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                            {r.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {r.account === "-" ? (
                            <span className="text-gray-400 italic">N/A</span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800">
                              {r.account}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold">
                          <span
                            className={`${
                              r.type === "income" || r.type === "asset"
                                ? "text-green-600"
                                : r.type === "expense" || r.type === "liability"
                                ? "text-red-600"
                                : "text-gray-600"
                            }`}
                          >
                            {r.amount.toLocaleString("en-LK", {
                              style: "currency",
                              currency: "LKR",
                            })}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                              r.status
                            )}`}
                          >
                            {r.status === "completed" && "✅"}
                            {r.status === "pending" && "⏳"}
                            {r.status === "failed" && "❌"}
                            {r.status === "active" && "✅"}
                            {r.status === "sold" && "🏷️"}
                            {r.status === "settled" && "✅"} {r.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            {r.source === "transaction" ? (
                              <>
                                <button
                                  onClick={() =>
                                    handleEditTransaction(r.raw as Transaction)
                                  }
                                  className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors"
                                  title="Edit transaction"
                                >
                                  <Edit2 size={12} />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteTransaction(
                                      r.raw as Transaction
                                    )
                                  }
                                  className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                  title="Delete transaction"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </>
                            ) : r.source === "assetLiability" ? (
                              <>
                                <button
                                  onClick={() =>
                                    handleEditAssetLiability(
                                      r.raw as AssetLiability
                                    )
                                  }
                                  className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors"
                                  title="Edit asset/liability"
                                >
                                  <Edit2 size={12} />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteAssetLiability(
                                      r.raw as AssetLiability
                                    )
                                  }
                                  className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                  title="Delete asset/liability"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </>
                            ) : (
                              <span className="text-gray-400 text-xs">—</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                <TrendingUp className="text-blue-600" size={16} />
                Assets Trend
              </h3>
              <div className="h-32">
                <Line
                  data={assetsChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                      title: {
                        display: false,
                      },
                    },
                    scales: {
                      x: {
                        display: false,
                      },
                      y: {
                        display: false,
                        beginAtZero: true,
                      },
                    },
                    interaction: {
                      intersect: false,
                    },
                    elements: {
                      point: {
                        radius: 2,
                      },
                      line: {
                        tension: 0.4,
                      },
                    },
                  }}
                />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                <TrendingDown className="text-red-600" size={16} />
                Liabilities Trend
              </h3>
              <div className="h-32">
                <Line
                  data={liabilitiesChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                      title: {
                        display: false,
                      },
                    },
                    scales: {
                      x: {
                        display: false,
                      },
                      y: {
                        display: false,
                        beginAtZero: true,
                      },
                    },
                    interaction: {
                      intersect: false,
                    },
                    elements: {
                      point: {
                        radius: 2,
                      },
                      line: {
                        tension: 0.4,
                      },
                    },
                  }}
                />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                <BarChart3 className="text-green-600" size={16} />
                Income Trend
              </h3>
              <div className="h-32 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {totalIncome.toLocaleString("en-LK", {
                      style: "currency",
                      currency: "LKR",
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </p>
                  <p className="text-xs text-gray-500">Total Income</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                <Calculator className="text-purple-600" size={16} />
                Net Worth
              </h3>
              <div className="h-32 flex items-center justify-center">
                <div className="text-center">
                  <p
                    className={`text-2xl font-bold ${
                      netWorth >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {netWorth.toLocaleString("en-LK", {
                      style: "currency",
                      currency: "LKR",
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </p>
                  <p className="text-xs text-gray-500">Net Worthy</p>
                </div>
              </div>
            </div>

            <button
              onClick={scrollToTop}
              className="fixed bottom-6 right-6 bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-full shadow-lg transition"
            >
              <ArrowUp className="w-5 h-5" />
            </button>
          </div>
        </>
      )}
      {/* Ledgers Tab Content */}
      {activeTab === "ledgers" && (
        <div className="space-y-6">
          {/* Ledger Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-600">
                Total Accounts
              </h3>
              <p className="text-2xl font-bold text-blue-700">
                {generateLedgerAccounts.length}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-600">
                Total Debits
              </h3>
              <p className="text-2xl font-bold text-green-700">
                {generateTrialBalance
                  .reduce((sum, entry) => sum + entry.debitBalance, 0)
                  .toLocaleString("en-LK", {
                    style: "currency",
                    currency: "LKR",
                  })}
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-600">
                Total Credits
              </h3>
              <p className="text-2xl font-bold text-red-700">
                {generateTrialBalance
                  .reduce((sum, entry) => sum + entry.creditBalance, 0)
                  .toLocaleString("en-LK", {
                    style: "currency",
                    currency: "LKR",
                  })}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-600">Balanced</h3>
              <p className="text-2xl font-bold text-purple-700">
                {Math.abs(
                  generateTrialBalance.reduce(
                    (sum, entry) => sum + entry.debitBalance,
                    0
                  ) -
                    generateTrialBalance.reduce(
                      (sum, entry) => sum + entry.creditBalance,
                      0
                    )
                ) < 0.01
                  ? "✅ Yes"
                  : "❌ No"}
              </p>
            </div>
          </div>

          {/* Ledger Accounts Selection */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Ledger Accounts
              </h3>
              <select
                value={selectedLedgerAccount}
                onChange={(e) => setSelectedLedgerAccount(e.target.value)}
                className="border border-gray-300 rounded-lg p-2"
              >
                <option value="">Select Account to View Details</option>
                {generateLedgerAccounts.map((account) => (
                  <option key={account._id} value={account._id}>
                    {account.accountName} ({account.accountType})
                  </option>
                ))}
              </select>
            </div>

            {/* Trial Balance Table */}
            <div className="mb-6">
              <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Calculator size={20} /> Trial Balance
              </h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Account Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Debit Balance
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Credit Balance
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {generateTrialBalance.map((entry, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {entry.accountName}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              entry.accountType === "asset"
                                ? "bg-blue-100 text-blue-800"
                                : entry.accountType === "liability"
                                ? "bg-red-100 text-red-800"
                                : entry.accountType === "equity"
                                ? "bg-purple-100 text-purple-800"
                                : entry.accountType === "income"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {entry.accountType}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {entry.debitBalance > 0
                            ? entry.debitBalance.toLocaleString("en-LK", {
                                style: "currency",
                                currency: "LKR",
                              })
                            : "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {entry.creditBalance > 0
                            ? entry.creditBalance.toLocaleString("en-LK", {
                                style: "currency",
                                currency: "LKR",
                              })
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr className="font-semibold">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        TOTALS
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900"></td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {generateTrialBalance
                          .reduce((sum, entry) => sum + entry.debitBalance, 0)
                          .toLocaleString("en-LK", {
                            style: "currency",
                            currency: "LKR",
                          })}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {generateTrialBalance
                          .reduce((sum, entry) => sum + entry.creditBalance, 0)
                          .toLocaleString("en-LK", {
                            style: "currency",
                            currency: "LKR",
                          })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Selected Ledger Account Details */}
            {selectedLedgerAccount && (
              <div className="mt-6">
                {(() => {
                  const account = generateLedgerAccounts.find(
                    (acc) => acc._id === selectedLedgerAccount
                  );
                  if (!account) return null;

                  return (
                    <div>
                      <h4 className="text-md font-semibold text-gray-800 mb-3">
                        {account.accountName} Ledger
                      </h4>
                      <div className="bg-gray-50 p-4 rounded-lg mb-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-600">
                              Account Code:
                            </span>
                            <p className="text-gray-900">
                              {account.accountCode}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">
                              Type:
                            </span>
                            <p className="text-gray-900 capitalize">
                              {account.accountType}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">
                              Debit Total:
                            </span>
                            <p className="text-gray-900">
                              {account.debitTotal.toLocaleString("en-LK", {
                                style: "currency",
                                currency: "LKR",
                              })}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">
                              Credit Total:
                            </span>
                            <p className="text-gray-900">
                              {account.creditTotal.toLocaleString("en-LK", {
                                style: "currency",
                                currency: "LKR",
                              })}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Description
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Reference
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Debit
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Credit
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Balance
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {account.entries.map((entry) => (
                              <tr key={entry._id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  {new Date(entry.date).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  {entry.description}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  {entry.reference}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  {entry.debit > 0
                                    ? entry.debit.toLocaleString("en-LK", {
                                        style: "currency",
                                        currency: "LKR",
                                      })
                                    : "-"}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  {entry.credit > 0
                                    ? entry.credit.toLocaleString("en-LK", {
                                        style: "currency",
                                        currency: "LKR",
                                      })
                                    : "-"}
                                </td>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                  {Math.abs(
                                    account.debitTotal - account.creditTotal
                                  ).toLocaleString("en-LK", {
                                    style: "currency",
                                    currency: "LKR",
                                  })}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}
      {/* Reports Modal */}
      {showReportsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white/95 backdrop-blur-md shadow-xl rounded-2xl w-full max-w-2xl relative p-6">
            <button
              onClick={() => setShowReportsModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
              <BarChart3 className="text-indigo-600" size={24} />
              Download Financial Reports
            </h2>
            {/* Format Selection */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Select Format:</h4>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="format"
                    value="pdf"
                    defaultChecked
                    className="text-indigo-600"
                  />
                  <span className="text-sm text-gray-700">
                    PDF (HTML format for printing)
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="format"
                    value="excel"
                    className="text-indigo-600"
                  />
                  <span className="text-sm text-gray-700">
                    Excel (CSV format)
                  </span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => {
                  const format =
                    (
                      document.querySelector(
                        'input[name="format"]:checked'
                      ) as HTMLInputElement
                    )?.value || "pdf";
                  downloadReport("balanceSheet", format as "pdf" | "excel");
                }}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <FileText className="text-blue-600" size={20} />
                  </div>
                  <h3 className="font-semibold text-gray-900">Balance Sheet</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Assets, Liabilities & Equity as of{" "}
                  {new Date().toLocaleDateString()}
                </p>
              </button>

              <button
                onClick={() => {
                  const format =
                    (
                      document.querySelector(
                        'input[name="format"]:checked'
                      ) as HTMLInputElement
                    )?.value || "pdf";
                  downloadReport("profitLoss", format as "pdf" | "excel");
                }}
                className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                    <TrendingUp className="text-green-600" size={20} />
                  </div>
                  <h3 className="font-semibold text-gray-900">Profit & Loss</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Revenue, Expenses & Net Income statement
                </p>
              </button>

              <button
                onClick={() => {
                  const format =
                    (
                      document.querySelector(
                        'input[name="format"]:checked'
                      ) as HTMLInputElement
                    )?.value || "pdf";
                  downloadReport("cashFlow", format as "pdf" | "excel");
                }}
                className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                    <Calculator className="text-purple-600" size={20} />
                  </div>
                  <h3 className="font-semibold text-gray-900">Cash Flow</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Operating, Investing & Financing activities
                </p>
              </button>
              <button
                onClick={() => {
                  const format =
                    (
                      document.querySelector(
                        'input[name="format"]:checked'
                      ) as HTMLInputElement
                    )?.value || "pdf";
                  downloadReport("trialBalance", format as "pdf" | "excel");
                }}
                className="p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                    <BookOpen className="text-orange-600" size={20} />
                  </div>
                  <h3 className="font-semibold text-gray-900">Trial Balance</h3>
                </div>
                <p className="text-sm text-gray-600">
                  All account balances with debits & credits
                </p>
              </button>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Report Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Total Assets:</span>
                  <p className="font-semibold text-gray-900">
                    {generateFinancialReports.balanceSheet.assets.total.toLocaleString(
                      "en-LK",
                      {
                        style: "currency",
                        currency: "LKR",
                      }
                    )}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Net Income:</span>
                  <p className="font-semibold text-gray-900">
                    {generateFinancialReports.profitLoss.netIncome.toLocaleString(
                      "en-LK",
                      {
                        style: "currency",
                        currency: "LKR",
                      }
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}{" "}
      <button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-full shadow-lg transition"
      >
        <ArrowUp className="w-5 h-5" />
      </button>
    </div>
  );
}
