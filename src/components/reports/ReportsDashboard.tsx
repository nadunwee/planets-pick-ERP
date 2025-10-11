import React, { useState, useEffect } from "react";
import { Card, Row, Col, message, Spin } from "antd";
import { FileText, Download, Eye, X, RefreshCw } from "lucide-react";
import { getReportsDashboard, type Report } from "../services/reportService";

const ReportsDashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  // Fetch reports from backend
  const fetchData = async () => {
    setLoading(true);
    try {
      const reportsData = await getReportsDashboard();
      setReports(reportsData);
    } catch (e: any) {
      message.error(e?.response?.data?.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  // Refresh reports
  const handleRefresh = () => {
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Reports Dashboard</h2>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Spin size="large" />
        </div>
      ) : (
        <Row gutter={[16, 16]}>
          {reports.length === 0 ? (
            <Col span={24}>
              <div className="text-center py-12">
                <FileText className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-600">No reports available</p>
              </div>
            </Col>
          ) : (
            reports.map((report) => (
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
              <p className="text-sm text-gray-600 mb-1">Date: {report.date}</p>
              {report.description && (
                <p className="text-xs text-gray-500 mb-2">{report.description}</p>
              )}
              {report.size && (
                <p className="text-xs text-gray-500 mb-3">Size: {report.size}</p>
              )}
              {report.isPlaceholder && (
                <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
                  Report file not found - placeholder data
                </div>
              )}

              <div className="flex gap-2">
                <a
                  href={report.downloadUrl || report.fileUrl}
                  download
                  className={`flex-1 px-3 py-2 text-sm rounded transition flex items-center justify-center gap-1 ${
                    report.isPlaceholder 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                  onClick={report.isPlaceholder ? (e) => e.preventDefault() : undefined}
                >
                  <Download size={14} /> Download
                </a>
                <button
                  onClick={() => setSelectedReport(report)}
                  disabled={report.isPlaceholder}
                  className={`flex-1 px-3 py-2 text-sm rounded transition flex items-center justify-center gap-1 ${
                    report.isPlaceholder 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  <Eye size={14} /> Preview
                </button>
              </div>
            </Card>
          </Col>
            ))
          )}
        </Row>
      )}

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
