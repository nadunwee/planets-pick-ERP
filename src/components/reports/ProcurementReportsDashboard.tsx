import React, { useState, useEffect } from "react";
import { Card, Row, Col, Button, DatePicker, Select, message, Spin, Modal, Table, Statistic } from "antd";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  DollarSign, 
  FileText,
  Download,
  Eye,
  RefreshCw,
  Calendar,
  Filter
} from "lucide-react";
import dayjs from "dayjs";
import {
  generateSupplierRanking,
  generateSpendingAnalytics,
  generateOrdersBySupplier,
  generateProcurementCycle,
  getProcurementReports,
  type ProcurementReport,
  type DateRange
} from "../services/procurementReportService";

const { RangePicker } = DatePicker;
const { Option } = Select;

interface ReportGenerationState {
  supplierRanking: boolean;
  spendingAnalytics: boolean;
  ordersBySupplier: boolean;
  procurementCycle: boolean;
}

const ProcurementReportsDashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState<ProcurementReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<ProcurementReport | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: dayjs().subtract(1, 'month').format('YYYY-MM-DD'),
    endDate: dayjs().format('YYYY-MM-DD')
  });
  const [generating, setGenerating] = useState<ReportGenerationState>({
    supplierRanking: false,
    spendingAnalytics: false,
    ordersBySupplier: false,
    procurementCycle: false
  });

  // Fetch reports
  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await getProcurementReports();
      setReports(response.reports);
    } catch (error) {
      message.error('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Generate report functions
  const handleGenerateSupplierRanking = async () => {
    setGenerating(prev => ({ ...prev, supplierRanking: true }));
    try {
      const response = await generateSupplierRanking(dateRange);
      if (response.success) {
        message.success('Supplier ranking report generated successfully');
        fetchReports();
      }
    } catch (error) {
      message.error('Failed to generate supplier ranking report');
    } finally {
      setGenerating(prev => ({ ...prev, supplierRanking: false }));
    }
  };

  const handleGenerateSpendingAnalytics = async () => {
    setGenerating(prev => ({ ...prev, spendingAnalytics: true }));
    try {
      const response = await generateSpendingAnalytics(dateRange);
      if (response.success) {
        message.success('Spending analytics report generated successfully');
        fetchReports();
      }
    } catch (error) {
      message.error('Failed to generate spending analytics report');
    } finally {
      setGenerating(prev => ({ ...prev, spendingAnalytics: false }));
    }
  };

  const handleGenerateOrdersBySupplier = async () => {
    setGenerating(prev => ({ ...prev, ordersBySupplier: true }));
    try {
      const response = await generateOrdersBySupplier(dateRange);
      if (response.success) {
        message.success('Orders by supplier report generated successfully');
        fetchReports();
      }
    } catch (error) {
      message.error('Failed to generate orders by supplier report');
    } finally {
      setGenerating(prev => ({ ...prev, ordersBySupplier: false }));
    }
  };

  const handleGenerateProcurementCycle = async () => {
    setGenerating(prev => ({ ...prev, procurementCycle: true }));
    try {
      const response = await generateProcurementCycle(dateRange);
      if (response.success) {
        message.success('Procurement cycle report generated successfully');
        fetchReports();
      }
    } catch (error) {
      message.error('Failed to generate procurement cycle report');
    } finally {
      setGenerating(prev => ({ ...prev, procurementCycle: false }));
    }
  };

  // Report generation cards
  const reportCards = [
    {
      title: "Supplier Ranking",
      description: "Rank suppliers based on performance metrics",
      icon: <Users size={24} />,
      color: "blue",
      onGenerate: handleGenerateSupplierRanking,
      loading: generating.supplierRanking
    },
    {
      title: "Spending Analytics",
      description: "Analyze procurement spending trends",
      icon: <DollarSign size={24} />,
      color: "green",
      onGenerate: handleGenerateSpendingAnalytics,
      loading: generating.spendingAnalytics
    },
    {
      title: "Orders by Supplier",
      description: "Analyze order patterns by supplier",
      icon: <BarChart3 size={24} />,
      color: "purple",
      onGenerate: handleGenerateOrdersBySupplier,
      loading: generating.ordersBySupplier
    },
    {
      title: "Procurement Cycle",
      description: "Analyze procurement cycle times",
      icon: <Clock size={24} />,
      color: "orange",
      onGenerate: handleGenerateProcurementCycle,
      loading: generating.procurementCycle
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Procurement Reports</h2>
          <p className="text-gray-600">Generate and manage procurement analytics reports</p>
        </div>
        <Button 
          icon={<RefreshCw size={16} />} 
          onClick={fetchReports}
          loading={loading}
        >
          Refresh
        </Button>
      </div>

      {/* Date Range Selector */}
      <Card>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar size={16} />
            <span className="font-medium">Date Range:</span>
          </div>
          <RangePicker
            value={[dayjs(dateRange.startDate), dayjs(dateRange.endDate)]}
            onChange={(dates) => {
              if (dates) {
                setDateRange({
                  startDate: dates[0].format('YYYY-MM-DD'),
                  endDate: dates[1].format('YYYY-MM-DD')
                });
              }
            }}
            format="YYYY-MM-DD"
          />
        </div>
      </Card>

      {/* Report Generation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reportCards.map((card, index) => (
          <Card
            key={index}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={card.onGenerate}
          >
            <div className="text-center">
              <div className={`inline-flex p-3 rounded-full bg-${card.color}-100 text-${card.color}-600 mb-4`}>
                {card.icon}
              </div>
              <h3 className="font-semibold text-lg mb-2">{card.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{card.description}</p>
              <Button
                type="primary"
                loading={card.loading}
                disabled={card.loading}
                className="w-full"
              >
                {card.loading ? 'Generating...' : 'Generate Report'}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Generated Reports */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Generated Reports</h3>
          <div className="flex gap-2">
            <Button icon={<Filter size={16} />}>Filter</Button>
            <Button icon={<Download size={16} />}>Export All</Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Spin size="large" />
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">No reports generated yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports.map((report) => (
              <Card
                key={report._id}
                className="hover:shadow-md transition-shadow"
                actions={[
                  <Button
                    key="view"
                    icon={<Eye size={16} />}
                    onClick={() => setSelectedReport(report)}
                  >
                    View
                  </Button>,
                  <Button
                    key="download"
                    icon={<Download size={16} />}
                    type="primary"
                  >
                    Download
                  </Button>
                ]}
              >
                <div className="space-y-2">
                  <h4 className="font-semibold">{report.title}</h4>
                  <p className="text-sm text-gray-600">{report.description}</p>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{report.reportType}</span>
                    <span>{dayjs(report.createdAt).format('MMM DD, YYYY')}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{report.metadata.totalRecords} records</span>
                    <span>{report.status}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      {/* Report Detail Modal */}
      <Modal
        title={selectedReport?.title}
        open={!!selectedReport}
        onCancel={() => setSelectedReport(null)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setSelectedReport(null)}>
            Close
          </Button>,
          <Button key="download" type="primary" icon={<Download size={16} />}>
            Download Report
          </Button>
        ]}
      >
        {selectedReport && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Statistic title="Report Type" value={selectedReport.reportType} />
              <Statistic title="Total Records" value={selectedReport.metadata.totalRecords} />
              <Statistic title="Generated By" value={selectedReport.generatedBy.name} />
              <Statistic title="Date Range" value={`${dayjs(selectedReport.dateRange.startDate).format('MMM DD')} - ${dayjs(selectedReport.dateRange.endDate).format('MMM DD, YYYY')}`} />
            </div>
            
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Report Data Preview</h4>
              <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                <pre className="text-xs">
                  {JSON.stringify(selectedReport.data, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProcurementReportsDashboard;
