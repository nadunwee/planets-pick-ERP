import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Card, Row, Col, message, Spin } from "antd";
import { FileText, Download, Eye, X, RefreshCw } from "lucide-react";
import { getReportsDashboard, type Report } from "../services/reportService";
import api from "../services/api";
import {
  getCurrentUser,
  canDownloadReportCategory,
} from "../../utils/userAuth";

const ReportsDashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [previewReport, setPreviewReport] = useState<Report | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [downloadId, setDownloadId] = useState<string | null>(null);
  const currentUser = useMemo(() => getCurrentUser(), []);
  const userLevel = currentUser?.level;
  const userDepartment = currentUser?.department || "";

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const reportsData = await getReportsDashboard();
      const filtered = reportsData.filter((report) =>
        userLevel
          ? canDownloadReportCategory(
              userLevel,
              userDepartment,
              report.category
            )
          : false
      );
      setReports(filtered);
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  }, [userDepartment, userLevel]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resolveEndpoint = (report: Report, preview = false): string => {
    const base = preview
      ? report.fileUrl
      : report.downloadUrl || report.fileUrl;
    return base.replace(/^\/api\//, "");
  };

  const retrieveReportBlob = async (
    report: Report,
    preview = false
  ): Promise<Blob | null> => {
    if (!userLevel) {
      return null;
    }

    if (
      !canDownloadReportCategory(userLevel, userDepartment, report.category)
    ) {
      message.warning("You do not have access to this report category.");
      return null;
    }

    if (report.isPlaceholder) {
      return null;
    }

    try {
      setDownloadId(report.id);
      const endpoint = resolveEndpoint(report, preview);
      const response = await api.get<Blob>(endpoint, { responseType: "blob" });
      return response.data;
    } catch (error: any) {
      console.error("Report download error", error);
      message.error(
        error?.response?.data?.message || "Failed to retrieve report"
      );
      return null;
    } finally {
      setDownloadId(null);
    }
  };

  const handleDownloadReport = async (report: Report) => {
    const blob = await retrieveReportBlob(report, false);
    if (!blob) return;

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${report.title.replace(/\s+/g, "-").toLowerCase()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => window.URL.revokeObjectURL(url), 30_000);
  };

  const handlePreviewReport = async (report: Report) => {
    const blob = await retrieveReportBlob(report, true);
    if (!blob) return;

    if (previewUrl) {
      window.URL.revokeObjectURL(previewUrl);
    }
    const url = window.URL.createObjectURL(blob);
    setPreviewUrl(url);
    setPreviewReport(report);
  };

  const closePreview = () => {
    if (previewUrl) {
      window.URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setPreviewReport(null);
  };

  useEffect(() => {
    return () => {
      if (previewUrl) {
        window.URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Reports</h2>
        <button
          onClick={fetchData}
          disabled={loading}
          className={`inline-flex items-center gap-2 px-3 py-2 text-sm rounded border transition ${
            loading
              ? "cursor-not-allowed bg-gray-100 text-gray-400 border-gray-200"
              : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
          }`}
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
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
                  <p className="text-sm text-gray-600 mb-1">
                    Date: {report.date}
                  </p>
                  {report.description && (
                    <p className="text-xs text-gray-500 mb-2">
                      {report.description}
                    </p>
                  )}
                  {report.size && (
                    <p className="text-xs text-gray-500 mb-3">
                      Size: {report.size}
                    </p>
                  )}
                  {report.isPlaceholder && (
                    <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
                      Report file not found - placeholder data
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDownloadReport(report)}
                      disabled={
                        downloadId === report.id ||
                        report.isPlaceholder ||
                        !userLevel ||
                        !canDownloadReportCategory(
                          userLevel,
                          userDepartment,
                          report.category
                        )
                      }
                      className={`flex-1 px-3 py-2 text-sm rounded transition flex items-center justify-center gap-1 ${
                        downloadId === report.id ||
                        report.isPlaceholder ||
                        !userLevel ||
                        !canDownloadReportCategory(
                          userLevel,
                          userDepartment,
                          report.category
                        )
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-green-100 text-green-700 hover:bg-green-200"
                      }`}
                    >
                      {downloadId === report.id ? (
                        <Spin size="small" />
                      ) : (
                        <Download size={14} />
                      )}
                      Download
                    </button>
                    <button
                      onClick={() => handlePreviewReport(report)}
                      disabled={
                        downloadId === report.id ||
                        report.isPlaceholder ||
                        !userLevel ||
                        !canDownloadReportCategory(
                          userLevel,
                          userDepartment,
                          report.category
                        )
                      }
                      className={`flex-1 px-3 py-2 text-sm rounded transition flex items-center justify-center gap-1 ${
                        downloadId === report.id ||
                        report.isPlaceholder ||
                        !userLevel ||
                        !canDownloadReportCategory(
                          userLevel,
                          userDepartment,
                          report.category
                        )
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-blue-100 text-blue-700 hover:bg-blue-200"
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

      {previewReport && previewUrl && (
        <div className="fixed inset-0 z-50 flex justify-center items-center">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={closePreview}
          />
          <div className="relative w-full max-w-4xl h-[80vh] bg-white rounded-lg shadow-lg z-10 flex flex-col">
            <div className="flex justify-between items-center px-4 py-2 border-b">
              <h2 className="font-semibold text-lg">{previewReport.title}</h2>
              <button
                onClick={closePreview}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <iframe
              src={previewUrl}
              title={previewReport.title}
              className="flex-1 w-full rounded-b-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsDashboard;
