# Code Examples - Enhanced UI Components

## Example 1: Enhanced Inventory Card

### Code Structure:
```tsx
<div className="bg-white p-4 rounded-lg shadow border hover:shadow-lg transition">
  {/* Header with checkbox, name, SKU, and status */}
  <div className="flex justify-between items-start mb-3">
    <div className="flex-1">
      <div className="flex items-center gap-2">
        <input type="checkbox" className="rounded border-gray-300" />
        <div>
          <h3 className="font-semibold text-lg">Organic Virgin Coconut Oil</h3>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Raw Materials</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Tag size={12} />
              SKU: VCO-ORG-001
            </span>
          </div>
        </div>
      </div>
    </div>
    <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
      <TrendingUp size={14} />
      In stock
    </span>
  </div>

  {/* Stock and Pricing Info */}
  <div className="space-y-2">
    <div className="flex justify-between">
      <span className="text-sm text-gray-600">Current Stock:</span>
      <span className="font-medium">500 liters</span>
    </div>
    <div className="flex justify-between">
      <span className="text-sm text-gray-600">Min / Max Stock:</span>
      <span className="font-medium">100 / 1000 liters</span>
    </div>
    <div className="flex justify-between">
      <span className="text-sm text-gray-600">Unit Price:</span>
      <span className="font-medium">LKR 1,200</span>
    </div>
    <div className="flex justify-between border-t pt-2">
      <span className="text-sm font-medium text-gray-700">Total Value:</span>
      <span className="font-bold text-green-600">LKR 600,000</span>
    </div>
  </div>

  {/* Location, Batch, Expiry, Supplier Info */}
  <div className="space-y-2 mt-4 pt-4 border-t">
    <div className="flex items-center gap-2 text-xs text-gray-600">
      <MapPin size={12} />
      <span>Zone: A, Rack: A-12, Shelf: 03</span>
    </div>
    <div className="flex items-center gap-2 text-xs text-gray-600">
      <Archive size={12} />
      <span>Batch: BATCH-2024-VCO-15</span>
    </div>
    <div className="flex items-center gap-2 text-xs text-orange-600">
      <Calendar size={12} />
      <span>Exp: 2024-12-31 (30 days)</span>
    </div>
    <div className="flex items-center gap-2 text-xs text-gray-600">
      <Truck size={12} />
      <span>Supplier: Green Valley Farms</span>
    </div>
    <div className="flex items-center gap-2 text-xs text-gray-600">
      <BarChart3 size={12} />
      <span>Valuation: FIFO</span>
    </div>
  </div>

  {/* Action Buttons */}
  <div className="flex gap-2 mt-4">
    <button className="flex-1 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded">
      Edit Item
    </button>
    <button className="px-3 py-2 text-sm bg-green-100 text-green-700 rounded">
      <FileText size={16} />
    </button>
    <button className="px-3 py-2 text-sm bg-purple-100 text-purple-700 rounded">
      <RefreshCw size={16} />
    </button>
  </div>
</div>
```

### Visual Result:
```
┌─────────────────────────────────────────────────────────┐
│ ☑ Organic Virgin Coconut Oil           [🟢 In stock]   │
│   Raw Materials • 🏷️ SKU: VCO-ORG-001                  │
│                                                         │
│ Current Stock: 500 liters                               │
│ Min / Max Stock: 100 / 1000 liters                      │
│ Unit Price: LKR 1,200                                   │
│ ─────────────────────────────────────────               │
│ Total Value: LKR 600,000                                │
│ ═════════════════════════════════════════               │
│ 📍 Zone: A, Rack: A-12, Shelf: 03                       │
│ 📦 Batch: BATCH-2024-VCO-15                             │
│ 📅 Exp: 2024-12-31 ⚠️ (30 days)                         │
│ 🚚 Supplier: Green Valley Farms                         │
│ 📊 Valuation: FIFO                                      │
│                                                         │
│ [    Edit Item    ] [📄] [🔄]                           │
└─────────────────────────────────────────────────────────┘
```

---

## Example 2: Enhanced Order Card (Detailed View)

### Code Structure:
```tsx
<div className="bg-white rounded-lg shadow border">
  <div className="p-4">
    {/* Header */}
    <div className="flex justify-between items-start mb-4">
      <div>
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-lg">ORD-2024-001</h3>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
            <Truck size={10} />
            Tracking: TRK-123456
          </span>
        </div>
        <p className="text-sm text-gray-600 flex items-center gap-2">
          <Calendar size={12} />
          Ordered on 2024-01-15 • Expected: 2024-01-30
        </p>
        <p className="text-sm text-green-600 flex items-center gap-1">
          <CheckCircle size={12} />
          Delivered: 2024-01-28
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-700">
          urgent priority
        </span>
        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
          delivered
        </span>
        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
          <CheckCircle size={10} />
          approved
        </span>
      </div>
    </div>

    {/* 3-Column Layout */}
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Customer Details */}
      <div>
        <h4 className="font-medium mb-2 flex items-center gap-2">
          <User size={16} />
          Customer Details
        </h4>
        <div className="space-y-1 text-sm">
          <p className="font-medium">John Smith</p>
          <p className="text-gray-600">Global Trading Inc.</p>
          <div className="flex items-center gap-2 text-gray-600">
            <Mail size={12} /> john@globaltrading.com
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Phone size={12} /> +1-555-0123
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin size={12} /> 123 Business Ave
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Globe size={12} /> United States
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div>
        <h4 className="font-medium mb-2 flex items-center gap-2">
          <Package size={16} />
          Order Items
        </h4>
        <div className="space-y-2">
          <div className="bg-gray-50 rounded p-2 text-sm">
            <div className="flex justify-between">
              <div>
                <p className="font-medium">Virgin Coconut Oil</p>
                <p className="text-gray-600">50 liters × LKR 1,200</p>
              </div>
              <p className="font-medium">LKR 60,000</p>
            </div>
          </div>
          <div className="bg-gray-50 rounded p-2 text-sm">
            <div className="flex justify-between">
              <div>
                <p className="font-medium">Desiccated Coconut</p>
                <p className="text-gray-600">100 kg × LKR 500</p>
              </div>
              <p className="font-medium">LKR 50,000</p>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Details */}
      <div>
        <h4 className="font-medium mb-2 flex items-center gap-2">
          <DollarSign size={16} />
          Financial Details
        </h4>
        <div className="space-y-2 text-sm bg-gray-50 p-3 rounded">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal:</span>
            <span>LKR 110,000</span>
          </div>
          <div className="flex justify-between text-green-600">
            <span>Discount (10%):</span>
            <span>-LKR 11,000</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Tax (5%):</span>
            <span>LKR 4,950</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Shipping:</span>
            <span>LKR 5,000</span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span className="font-medium">Total Amount:</span>
            <span className="font-bold text-lg text-green-600">
              LKR 108,950
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Payment Status:</span>
            <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
              paid
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Payment Method:</span>
            <span>Bank Transfer</span>
          </div>
        </div>

        <h4 className="font-medium mb-2 flex items-center gap-2 mt-4">
          <Truck size={16} />
          Shipping Info
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Shipping:</span>
            <span>Express Delivery</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Tracking:</span>
            <span className="font-mono text-xs">TRK-123456</span>
          </div>
          <div className="bg-gray-50 p-2 rounded text-xs">
            <p className="font-medium mb-1">Shipping Address:</p>
            <p>456 Oak Avenue</p>
            <p>Los Angeles, CA 90001</p>
            <p>United States</p>
          </div>
        </div>
      </div>
    </div>

    {/* Order Timeline */}
    <div className="mt-4 border-t pt-4">
      <h4 className="font-medium mb-3 flex items-center gap-2">
        <History size={16} />
        Order Timeline
      </h4>
      <div className="space-y-2">
        <div className="flex items-start gap-3 text-sm">
          <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5"></div>
          <div className="flex-1">
            <div className="flex justify-between">
              <div>
                <span className="font-medium">Pending</span>
                <span className="text-gray-600 ml-2">by System</span>
              </div>
              <span className="text-gray-500 text-xs">2024-01-15 10:00</span>
            </div>
          </div>
        </div>
        <div className="flex items-start gap-3 text-sm">
          <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5"></div>
          <div className="flex-1">
            <div className="flex justify-between">
              <div>
                <span className="font-medium">Confirmed</span>
                <span className="text-gray-600 ml-2">by Admin</span>
              </div>
              <span className="text-gray-500 text-xs">2024-01-15 14:30</span>
            </div>
          </div>
        </div>
        {/* More timeline events... */}
      </div>
    </div>

    {/* Footer with actions */}
    <div className="flex justify-between items-center mt-4 pt-4 border-t">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Clock size={14} />
        Last updated: 2024-01-28 11:30:45
      </div>
      <div className="flex gap-2">
        <button className="bg-purple-600 text-white px-3 py-1 rounded text-sm">
          <FileText size={14} /> Details
        </button>
        <button className="bg-indigo-600 text-white px-3 py-1 rounded text-sm">
          <FileText size={14} /> Invoice
        </button>
        <button className="bg-gray-600 text-white px-3 py-1 rounded text-sm">
          <Edit size={14} /> Edit
        </button>
        <button className="bg-red-600 text-white px-3 py-1 rounded text-sm">
          <Trash2 size={14} /> Delete
        </button>
      </div>
    </div>
  </div>
</div>
```

---

## Example 3: Enhanced Filter Bar

### Inventory Filters:
```tsx
<div className="bg-white p-4 rounded-lg shadow border">
  <div className="flex flex-col gap-4">
    {/* Search */}
    <div className="flex-1">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          placeholder="Search by name, SKU, or batch number..."
          className="w-full pl-10 pr-4 py-2 border rounded-lg"
        />
      </div>
    </div>

    {/* Filters Row */}
    <div className="flex flex-wrap items-center gap-2">
      <Filter size={16} className="text-gray-500" />
      
      <select className="px-3 py-2 border rounded-lg text-sm">
        <option>All Categories</option>
        <option>Raw Materials</option>
        <option>Finished Products</option>
        <option>Packaging</option>
      </select>

      <select className="px-3 py-2 border rounded-lg text-sm">
        <option>All Locations</option>
        <option>Zone A</option>
        <option>Zone B</option>
        <option>Zone C</option>
      </select>

      <select className="px-3 py-2 border rounded-lg text-sm">
        <option>All Suppliers</option>
        <option>Green Valley Farms</option>
        <option>Fresh Harvest Co.</option>
        <option>Organic Valley</option>
      </select>

      <select className="px-3 py-2 border rounded-lg text-sm">
        <option>All Items</option>
        <option>Expiring Soon (30 days)</option>
        <option>Expired</option>
      </select>

      <div className="ml-auto flex gap-2">
        <button className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm">
          Grid
        </button>
        <button className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm">
          Table
        </button>
      </div>
    </div>
  </div>
</div>
```

---

## Key Features Demonstrated:

### Visual Enhancements:
1. ✅ **Icons everywhere** - Makes information easier to scan
2. ✅ **Color-coded badges** - Quick status identification
3. ✅ **Hierarchical typography** - Clear information hierarchy
4. ✅ **Grouped information** - Related data grouped together
5. ✅ **Action buttons** - Multiple actions available
6. ✅ **Timeline views** - Historical tracking
7. ✅ **Responsive grids** - Adapts to screen size

### Information Density:
- **Before:** 4-5 data points per item
- **After:** 10-15+ data points per item

### User Experience:
- **Before:** Basic CRUD operations
- **After:** Advanced filtering, bulk operations, detailed tracking, visual indicators

### Professional Appearance:
- **Before:** Simple, basic interface
- **After:** Enterprise-grade, feature-rich interface

---

This code shows how the enhanced UI provides significantly more information while maintaining good visual organization and usability!
