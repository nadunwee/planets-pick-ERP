import React, { useEffect, useState } from "react";
import { Card, Row, Col, message } from "antd";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from "recharts";
import { getReportsDashboard } from "../services/reportService";
import type {
  ReportsDashboardDTO,
  SupplierRankingRow, SpendingTrendRow, OrdersBySupplierRow, CycleTimelineRow
} from "../../types";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1", "#a4de6c", "#d0ed57", "#ffc0cb"];

const ReportsDashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ReportsDashboardDTO>({
    supplierRanking: [],
    spendingTrends: [],
    ordersBySupplier: [],
    cycleTime: [],
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getReportsDashboard();
      setData(res);
    } catch (e: any) {
      message.error(e?.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const rank: SupplierRankingRow[] = data.supplierRanking;
  const spend: SpendingTrendRow[] = data.spendingTrends;
  const orders: OrdersBySupplierRow[] = data.ordersBySupplier;
  const cycle: CycleTimelineRow[] = data.cycleTime;

  return (
    <div className="space-y-4">
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Supplier Performance Ranking" loading={loading}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={rank}>
                <XAxis dataKey="supplier" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="score" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Spending Trends" loading={loading}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={spend}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="spending" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Orders by Supplier" loading={loading}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={orders}
                  dataKey="orders"
                  nameKey="supplier"
                  outerRadius={110}
                  label
                >
                  {orders.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Procurement Cycle Timeline (Avg Days)" loading={loading}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={cycle}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="avgDays" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ReportsDashboard;
