import React, { useState, useEffect } from "react";
import { Card, Row, Col, message } from "antd";
import { FileText, Download, Eye, X } from "lucide-react";
import { getReportsDashboard } from "../services/reportService";

// Report type
type Report = {
  id: string;
  title: string;
  category: string;
  date: string;
  fileUrl: string;
};

const ReportsDashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  // Fetch reports (replace with actual backend response)
  const fetchData = async () => {
    setLoading(true);
    try {
      // Example API call (adjust if backend returns reports differently)
      const res = await getReportsDashboard();
      // If res is already an array of reports, use it directly
      setReports(res || [
        {
          id: "1",
          title: "Monthly Procurement Summary",
          category: "Procurement",
          date: "2025-09-01",
          fileUrl: "/reports/procurement-summary.pdf",
        },
        {
          id: "2",
          title: "Supplier Performance Report",
          category: "Suppliers",
          date: "2025-09-05",
          fileUrl: "/reports/supplier-performance.pdf",
        },
        {
          id: "3",
          title: "Purchase Order Analysis",
          category: "Orders",
          date: "2025-09-10",
          fileUrl: "/reports/purchase-orders.pdf",
        },
      ]);
    } catch (e: any) {
      message.error(e?.response?.data?.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <Row gutter={[16, 16]}>
        {reports.map((report) => (
          <Col xs={24} md={12} lg={8} key={report.id}>
            <Card
              loading={loading}
              className="shadow-sm hover:shadow-md transition"
              title={
                <div className="flex items-center gap-2">
                  <FileText className="text-green-600" size={18} />
                  <span>{report.title}</span>
                </div>
              }
            >
              <p className="text-sm text-gray-600 mb-1">
                Category: {report.category}
              </p>
              <p className="text-sm text-gray-600 mb-3">Date: {report.date}</p>

              <div className="flex gap-2">
                <a
                  href={report.fileUrl}
                  download
                  className="flex-1 px-3 py-2 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition flex items-center justify-center gap-1"
                >
                  <Download size={14} /> Download
                </a>
                <button
                  onClick={() => setSelectedReport(report)}
                  className="flex-1 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition flex items-center justify-center gap-1"
                >
                  <Eye size={14} /> Preview
                </button>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* PDF Preview Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex justify-center items-center">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setSelectedReport(null)}
          />
          <div className="relative w-full max-w-4xl h-[80vh] bg-white rounded-lg shadow-lg z-10 flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center px-4 py-2 border-b">
              <h2 className="font-semibold text-lg">{selectedReport.title}</h2>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            {/* PDF Viewer */}
            <iframe
              src={selectedReport.fileUrl}
              title={selectedReport.title}
              className="flex-1 w-full rounded-b-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsDashboard;
