const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

class PDFService {
  constructor() {
    this.browser = null;
  }

  async initialize() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    }
  }

  async generatePDF(htmlContent, options = {}) {
    await this.initialize();
    
    const page = await this.browser.newPage();
    
    try {
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm'
        },
        ...options
      });
      
      return pdfBuffer;
    } finally {
      await page.close();
    }
  }

  async generateReportPDF(reportData, templateName, outputPath) {
    console.log('Generating PDF with data:', JSON.stringify(reportData, null, 2));
    const htmlContent = this.generateHTMLFromTemplate(reportData, templateName);
    console.log('Generated HTML length:', htmlContent.length);
    const pdfBuffer = await this.generatePDF(htmlContent);
    
    // Ensure directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Write PDF to file
    fs.writeFileSync(outputPath, pdfBuffer);
    
    return {
      filePath: outputPath,
      size: pdfBuffer.length,
      generatedAt: new Date()
    };
  }

  generateHTMLFromTemplate(data, templateName) {
    let template;
    
    switch (templateName) {
      case 'procurement-summary':
        template = this.getProcurementSummaryTemplate();
        break;
      case 'supplier-performance':
        template = this.getSupplierPerformanceTemplate();
        break;
      case 'purchase-orders':
        template = this.getPurchaseOrdersTemplate();
        break;
      default:
        template = this.getDefaultTemplate();
    }

    return this.populateTemplate(template, data);
  }

  getProcurementSummaryTemplate() {
    return '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Monthly Procurement Summary</title><style>body{font-family:Arial,sans-serif;margin:0;padding:20px}.header{text-align:center;margin-bottom:30px;border-bottom:2px solid #333;padding-bottom:20px}.header h1{color:#2c3e50;margin:0}.header p{color:#7f8c8d;margin:5px 0}.section{margin-bottom:25px}.section h2{color:#34495e;border-bottom:1px solid #bdc3c7;padding-bottom:5px}.stats-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:15px;margin:20px 0}.stat-card{background:#f8f9fa;padding:15px;border-radius:5px;text-align:center}.stat-value{font-size:24px;font-weight:bold;color:#2c3e50}.stat-label{color:#7f8c8d;font-size:14px}.table{width:100%;border-collapse:collapse;margin:15px 0}.table th,.table td{padding:10px;text-align:left;border-bottom:1px solid #ddd}.table th{background-color:#f8f9fa;font-weight:bold}.footer{margin-top:30px;text-align:center;color:#7f8c8d;font-size:12px}</style></head><body><div class="header"><h1>Monthly Procurement Summary</h1><p>Generated on: {{generatedDate}}</p><p>Period: {{startDate}} to {{endDate}}</p></div><div class="section"><h2>Executive Summary</h2><div class="stats-grid"><div class="stat-card"><div class="stat-value">{{totalOrders}}</div><div class="stat-label">Total Orders</div></div><div class="stat-card"><div class="stat-value">${{totalSpend}}</div><div class="stat-label">Total Spend</div></div><div class="stat-card"><div class="stat-value">{{activeSuppliers}}</div><div class="stat-label">Active Suppliers</div></div><div class="stat-card"><div class="stat-value">{{averageOrderValue}}</div><div class="stat-label">Avg Order Value</div></div></div></div><div class="section"><h2>Top Suppliers by Spend</h2><table class="table"><thead><tr><th>Supplier</th><th>Orders</th><th>Total Spend</th><th>% of Total</th></tr></thead><tbody>{{#each topSuppliers}}<tr><td>{{name}}</td><td>{{orders}}</td><td>${{spend}}</td><td>{{percentage}}%</td></tr>{{/each}}</tbody></table></div><div class="section"><h2>Monthly Trends</h2><p>This report shows procurement activity for the month, including order volumes, spending patterns, and supplier performance metrics.</p></div><div class="footer"><p>Planet\'s Pick ERP System - Procurement Module</p></div></body></html>';
  }

  getSupplierPerformanceTemplate() {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Supplier Performance Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .header h1 { color: #2c3e50; margin: 0; }
          .section { margin-bottom: 25px; }
          .section h2 { color: #34495e; border-bottom: 1px solid #bdc3c7; padding-bottom: 5px; }
          .table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          .table th, .table td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
          .table th { background-color: #f8f9fa; font-weight: bold; }
          .rating { display: inline-block; padding: 4px 8px; border-radius: 3px; font-weight: bold; }
          .rating.excellent { background: #d4edda; color: #155724; }
          .rating.good { background: #d1ecf1; color: #0c5460; }
          .rating.average { background: #fff3cd; color: #856404; }
          .rating.poor { background: #f8d7da; color: #721c24; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Supplier Performance Report</h1>
          <p>Generated on: {{generatedDate}}</p>
        </div>

        <div class="section">
          <h2>Performance Overview</h2>
          <table class="table">
            <thead>
              <tr>
                <th>Supplier</th>
                <th>On-Time Delivery</th>
                <th>Quality Score</th>
                <th>Responsiveness</th>
                <th>Overall Rating</th>
                <th>Total Orders</th>
              </tr>
            </thead>
            <tbody>
              {{#each suppliers}}
              <tr>
                <td>{{name}}</td>
                <td>{{onTimeDelivery}}%</td>
                <td>{{qualityScore}}/100</td>
                <td>{{responsivenessScore}}/100</td>
                <td><span class="rating {{ratingClass}}">{{overallRating}}</span></td>
                <td>{{totalOrders}}</td>
              </tr>
              {{/each}}
            </tbody>
          </table>
        </div>

        <div class="footer">
          <p>Planet's Pick ERP System - Supplier Management Module</p>
        </div>
      </body>
      </html>
    `;
  }

  getPurchaseOrdersTemplate() {
    return '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Purchase Orders Analysis</title><style>body{font-family:Arial,sans-serif;margin:0;padding:20px}.header{text-align:center;margin-bottom:30px;border-bottom:2px solid #333;padding-bottom:20px}.header h1{color:#2c3e50;margin:0}.section{margin-bottom:25px}.section h2{color:#34495e;border-bottom:1px solid #bdc3c7;padding-bottom:5px}.table{width:100%;border-collapse:collapse;margin:15px 0}.table th,.table td{padding:10px;text-align:left;border-bottom:1px solid #ddd}.table th{background-color:#f8f9fa;font-weight:bold}.status{display:inline-block;padding:4px 8px;border-radius:3px;font-weight:bold}.status.pending{background:#fff3cd;color:#856404}.status.approved{background:#d1ecf1;color:#0c5460}.status.delivered{background:#d4edda;color:#155724}.footer{margin-top:30px;text-align:center;color:#7f8c8d;font-size:12px}</style></head><body><div class="header"><h1>Purchase Orders Analysis</h1><p>Generated on: {{generatedDate}}</p><p>Period: {{startDate}} to {{endDate}}</p></div><div class="section"><h2>Order Summary</h2><table class="table"><thead><tr><th>Order ID</th><th>Supplier</th><th>Date</th><th>Total Amount</th><th>Status</th><th>Items</th></tr></thead><tbody>{{#each orders}}<tr><td>{{orderId}}</td><td>{{supplierName}}</td><td>{{orderDate}}</td><td>${{totalAmount}}</td><td><span class="status {{statusClass}}">{{status}}</span></td><td>{{itemCount}}</td></tr>{{/each}}</tbody></table></div><div class="footer"><p>Planet\'s Pick ERP System - Purchase Order Module</p></div></body></html>';
  }

  getDefaultTemplate() {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .header h1 { color: #2c3e50; margin: 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>{{title}}</h1>
          <p>Generated on: {{generatedDate}}</p>
        </div>
        <div class="content">
          {{content}}
        </div>
      </body>
      </html>
    `;
  }

  populateTemplate(template, data) {
    let html = template;
    
    // Debug: log the data being passed
    console.log('Template data:', JSON.stringify(data, null, 2));
    
    // Replace simple variables
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      const value = data[key] !== undefined ? data[key] : '';
      html = html.replace(regex, value);
    });
    
    // Replace generated date
    html = html.replace(/{{generatedDate}}/g, new Date().toLocaleDateString());
    
    // Handle arrays (simplified - in production you'd use a proper templating engine)
    if (data.topSuppliers && Array.isArray(data.topSuppliers)) {
      const suppliersHtml = data.topSuppliers.map(supplier => 
        `<tr><td>${supplier.name}</td><td>${supplier.orders}</td><td>$${supplier.spend}</td><td>${supplier.percentage}%</td></tr>`
      ).join('');
      html = html.replace(/{{#each topSuppliers}}[\s\S]*?{{\/each}}/g, suppliersHtml);
    }
    
    if (data.suppliers && Array.isArray(data.suppliers)) {
      const suppliersHtml = data.suppliers.map(supplier => 
        `<tr><td>${supplier.name}</td><td>${supplier.onTimeDelivery}%</td><td>${supplier.qualityScore}/100</td><td>${supplier.responsivenessScore}/100</td><td><span class="rating ${supplier.ratingClass}">${supplier.overallRating}</span></td><td>${supplier.totalOrders}</td></tr>`
      ).join('');
      html = html.replace(/{{#each suppliers}}[\s\S]*?{{\/each}}/g, suppliersHtml);
    }
    
    if (data.orders && Array.isArray(data.orders)) {
      const ordersHtml = data.orders.map(order => 
        `<tr><td>${order.orderId}</td><td>${order.supplierName}</td><td>${order.orderDate}</td><td>$${order.totalAmount}</td><td><span class="status ${order.statusClass}">${order.status}</span></td><td>${order.itemCount}</td></tr>`
      ).join('');
      html = html.replace(/{{#each orders}}[\s\S]*?{{\/each}}/g, ordersHtml);
    }
    
    return html;
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

module.exports = new PDFService();
