import { useState, useRef, useEffect } from "react";
import { X, Send, Bot, MessageSquare, Minimize2 } from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

interface DashboardChatbotProps {
  metrics: {
    financial: {
      netWorth: number;
      totalAssets: number;
      totalLiabilities: number;
      revenue: number;
      expenses: number;
      netProfit: number;
      revenueChange: number;
      expenseChange: number;
      profitChange: number;
    };
    employees: {
      total: number;
      active: number;
      onLeave: number;
      totalPayroll: number;
      change: number;
    };
    inventory: {
      totalValue: number;
      totalItems: number;
      lowStockItems: number;
      stockHealthPercentage: string;
    };
    production: {
      totalBatches: number;
      completedBatches: number;
      activeBatches: number;
      totalYield: number;
      targetYield: number;
      yieldEfficiency: string;
      change: number;
    };
    sales: {
      totalOrders: number;
      completedOrders: number;
      pendingOrders: number;
      totalSales: number;
      averageOrderValue: string;
      orderChange: number;
      salesChange: number;
    };
    customers: {
      total: number;
      new: number;
    };
  };
  period: string;
}

export default function DashboardChatbot({ metrics, period }: DashboardChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm your dashboard assistant. I can help you understand your business metrics. Try asking me about revenue, expenses, sales, inventory, or employees!",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("en-LK").format(value);
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case "30days":
        return "Last 30 Days";
      case "6months":
        return "Last 6 Months";
      case "1year":
        return "Last 1 Year";
      case "2years":
        return "Last 2 Years";
      case "5years":
        return "Last 5 Years";
      default:
        return period;
    }
  };

  const generateResponse = (userMessage: string): string => {
    const msg = userMessage.toLowerCase();

    // Revenue queries
    if (msg.includes("revenue") || msg.includes("income") || msg.includes("earning")) {
      const change = metrics.financial.revenueChange;
      const trend = change >= 0 ? "increased" : "decreased";
      return `Your revenue for ${getPeriodLabel(period)} is ${formatCurrency(metrics.financial.revenue)}. This represents a ${trend} of ${Math.abs(change).toFixed(1)}% compared to the previous period. ${
        change >= 0 ? "Great job! 🎉" : "Consider reviewing your sales strategy."
      }`;
    }

    // Profit queries
    if (msg.includes("profit") || msg.includes("net income")) {
      const change = metrics.financial.profitChange;
      const margin = metrics.financial.revenue > 0 
        ? ((metrics.financial.netProfit / metrics.financial.revenue) * 100).toFixed(2)
        : "0.00";
      const trend = change >= 0 ? "up" : "down";
      return `Your net profit is ${formatCurrency(metrics.financial.netProfit)} with a profit margin of ${margin}%. This is ${trend} ${Math.abs(change).toFixed(1)}% from the previous period. Your revenue is ${formatCurrency(metrics.financial.revenue)} and expenses are ${formatCurrency(metrics.financial.expenses)}.`;
    }

    // Expense queries
    if (msg.includes("expense") || msg.includes("cost") || msg.includes("spending")) {
      const change = metrics.financial.expenseChange;
      const trend = change >= 0 ? "increased" : "decreased";
      return `Your total expenses for ${getPeriodLabel(period)} are ${formatCurrency(metrics.financial.expenses)}. This has ${trend} by ${Math.abs(change).toFixed(1)}%. ${
        change > 10 ? "⚠️ Consider reviewing cost management strategies." : "Expenses are within reasonable range."
      }`;
    }

    // Financial health queries
    if (msg.includes("financial health") || msg.includes("net worth") || msg.includes("balance")) {
      return `Your financial health looks ${metrics.financial.netWorth > 0 ? "strong" : "concerning"}! Net Worth: ${formatCurrency(metrics.financial.netWorth)}. Total Assets: ${formatCurrency(metrics.financial.totalAssets)}. Total Liabilities: ${formatCurrency(metrics.financial.totalLiabilities)}. ${
        metrics.financial.netWorth > 0 ? "Keep up the good work! 💪" : "Consider strategies to improve your financial position."
      }`;
    }

    // Sales queries
    if (msg.includes("sales") || msg.includes("orders")) {
      const salesChange = metrics.sales.salesChange;
      const orderChange = metrics.sales.orderChange;
      return `Sales Overview: Total sales of ${formatCurrency(metrics.sales.totalSales)} from ${formatNumber(metrics.sales.totalOrders)} orders (${metrics.sales.completedOrders} completed, ${metrics.sales.pendingOrders} pending). Average order value is ${formatCurrency(parseFloat(metrics.sales.averageOrderValue))}. Sales are ${salesChange >= 0 ? "up" : "down"} ${Math.abs(salesChange).toFixed(1)}% and orders are ${orderChange >= 0 ? "up" : "down"} ${Math.abs(orderChange).toFixed(1)}%.`;
    }

    // Inventory queries
    if (msg.includes("inventory") || msg.includes("stock")) {
      const lowStock = metrics.inventory.lowStockItems;
      return `Inventory Status: You have ${formatNumber(metrics.inventory.totalItems)} items valued at ${formatCurrency(metrics.inventory.totalValue)}. Stock health is at ${metrics.inventory.stockHealthPercentage}%. ${
        lowStock > 0
          ? `⚠️ Warning: ${lowStock} items are running low on stock. Please review and restock soon.`
          : "✅ All items are adequately stocked!"
      }`;
    }

    // Employee queries
    if (msg.includes("employee") || msg.includes("staff") || msg.includes("workforce") || msg.includes("payroll")) {
      const change = metrics.employees.change;
      return `Workforce Overview: You have ${formatNumber(metrics.employees.active)} active employees out of ${formatNumber(metrics.employees.total)} total (${metrics.employees.onLeave} on leave). Monthly payroll is ${formatCurrency(metrics.employees.totalPayroll)}. Workforce is ${change >= 0 ? "growing" : "decreasing"} by ${Math.abs(change).toFixed(1)}%.`;
    }

    // Production queries
    if (msg.includes("production") || msg.includes("batch") || msg.includes("yield")) {
      const efficiency = parseFloat(metrics.production.yieldEfficiency);
      return `Production Performance: ${formatNumber(metrics.production.completedBatches)} batches completed out of ${formatNumber(metrics.production.totalBatches)} total (${metrics.production.activeBatches} active). Yield efficiency is ${metrics.production.yieldEfficiency}% (Actual: ${formatNumber(metrics.production.totalYield)}, Target: ${formatNumber(metrics.production.targetYield)}). ${
        efficiency >= 90 ? "Excellent performance! 🎯" : efficiency >= 70 ? "Good performance, but there's room for improvement." : "⚠️ Production efficiency needs attention."
      }`;
    }

    // Customer queries
    if (msg.includes("customer") || msg.includes("client")) {
      const growthRate = metrics.customers.total > 0
        ? ((metrics.customers.new / metrics.customers.total) * 100).toFixed(2)
        : "0.00";
      return `Customer Base: You have ${formatNumber(metrics.customers.total)} total customers with ${formatNumber(metrics.customers.new)} new customers in ${getPeriodLabel(period)}. Customer growth rate is ${growthRate}%. ${
        parseFloat(growthRate) > 5 ? "Strong customer acquisition! 🚀" : "Consider marketing strategies to boost customer growth."
      }`;
    }

    // Summary queries
    if (msg.includes("summary") || msg.includes("overview") || msg.includes("how") && (msg.includes("doing") || msg.includes("performing"))) {
      const profitMargin = metrics.financial.revenue > 0 
        ? ((metrics.financial.netProfit / metrics.financial.revenue) * 100).toFixed(1)
        : "0.0";
      return `📊 Business Summary for ${getPeriodLabel(period)}:\n\n💰 Financial: Revenue ${formatCurrency(metrics.financial.revenue)}, Profit ${formatCurrency(metrics.financial.netProfit)} (${profitMargin}% margin)\n👥 Workforce: ${metrics.employees.active} active employees\n📦 Inventory: ${metrics.inventory.totalItems} items, ${metrics.inventory.stockHealthPercentage}% health\n🏭 Production: ${metrics.production.yieldEfficiency}% efficiency\n🛒 Sales: ${metrics.sales.totalOrders} orders worth ${formatCurrency(metrics.sales.totalSales)}`;
    }

    // Help queries
    if (msg.includes("help") || msg.includes("what can you do") || msg.includes("assist")) {
      return "I can help you with information about:\n\n• Revenue and income\n• Profit and margins\n• Expenses and costs\n• Sales and orders\n• Inventory and stock\n• Employees and payroll\n• Production and batches\n• Customer base\n• Financial health\n• Overall business summary\n\nJust ask me a question like 'What's my revenue?' or 'How are sales doing?'";
    }

    // Default response
    return "I'm not sure I understood that. Try asking me about revenue, expenses, sales, inventory, employees, production, or customers. You can also ask for a 'summary' or type 'help' to see what I can do!";
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    // Simulate bot thinking and response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: generateResponse(inputValue),
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 z-50 flex items-center gap-2"
        title="Open Dashboard Assistant"
      >
        <MessageSquare size={24} />
      </button>
    );
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <Bot size={20} />
            <span className="font-semibold">Dashboard Assistant</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(false)}
              className="text-white hover:bg-blue-800 p-1 rounded transition"
              title="Maximize"
            >
              <MessageSquare size={18} />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-blue-800 p-1 rounded transition"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 flex flex-col max-h-[600px]">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 flex items-center justify-between rounded-t-lg">
        <div className="flex items-center gap-2 text-white">
          <Bot size={20} />
          <span className="font-semibold">Dashboard Assistant</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(true)}
            className="text-white hover:bg-blue-800 p-1 rounded transition"
            title="Minimize"
          >
            <Minimize2 size={18} />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-blue-800 p-1 rounded transition"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.sender === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-gray-200 text-gray-800"
              }`}
            >
              <p className="text-sm whitespace-pre-line">{message.text}</p>
              <p
                className={`text-xs mt-1 ${
                  message.sender === "user" ? "text-blue-100" : "text-gray-400"
                }`}
              >
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your dashboard..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            title="Send message"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
