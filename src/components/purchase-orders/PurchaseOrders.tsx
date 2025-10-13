import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Table, Tag, Tooltip, message } from "antd";
import {
  DownloadCloud,
  FileText,
  Plus,
  ShieldCheck,
  Truck,
} from "lucide-react";
import type { PurchaseOrder, PurchaseOrderPayload } from "../../types";
import PurchaseOrderForm from "./PurchaseOrderForm";
import {
  listPOs,
  createPO,
  updatePO,
  deletePO,
  approvePO,
  markPurchaseOrderDelivered,
} from "../services/purchaseOrderService";
import { fetchInvoicePdf } from "../services/invoiceService";
import {
  getCurrentUser,
  canCreatePurchaseOrders,
  canApprovePurchaseOrders,
  canMarkDelivered,
} from "../../utils/userAuth";
import {
  submitProcurementChangeRequest,
  fetchProcurementChangeRequests,
  approveProcurementChangeRequest,
  rejectProcurementChangeRequest,
  type ProcurementChangeRequest,
} from "../../utils/api";

const PurchaseOrders: React.FC = () => {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingOrder, setEditingOrder] = useState<PurchaseOrder | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [pendingRequests, setPendingRequests] = useState<
    ProcurementChangeRequest[]
  >([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsError, setRequestsError] = useState<string | null>(null);
  const [requestActionId, setRequestActionId] = useState<string | null>(null);

  const currentUser = useMemo(() => getCurrentUser(), []);
  const userLevel = currentUser?.level;
  const allowCreate = userLevel ? canCreatePurchaseOrders(userLevel) : false;
  const allowApprove = userLevel ? canApprovePurchaseOrders(userLevel) : false;
  const allowDeliver = userLevel ? canMarkDelivered(userLevel) : false;
  const isProcurementManagerL1 =
    currentUser?.level === "L1" && currentUser?.department === "Procurement";
  const isProcurementDirector =
    currentUser?.department === "Procurement" && currentUser?.level === "L2";

  const loadPendingRequests = useCallback(async () => {
    setRequestsLoading(true);
    setRequestsError(null);
    try {
      const result = await fetchProcurementChangeRequests({
        status: "pending",
      });
      setPendingRequests(result.requests || []);
    } catch (err) {
      console.error(err);
      const errorMessage =
        ((err as any)?.data as any)?.message ||
        (err as any)?.message ||
        "Failed to load pending requests";
      setRequestsError(
        typeof errorMessage === "string"
          ? errorMessage
          : "Failed to load pending requests"
      );
    } finally {
      setRequestsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isProcurementDirector) {
      loadPendingRequests();
    }
  }, [isProcurementDirector, loadPendingRequests]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listPOs();
      setOrders(
        data.map((po) => ({
          ...po,
          supplierId: (po as any).supplier?._id,
          supplierName: (po as any).supplier?.name,
          items: po.items.map((i: any) => ({
            material: i.materialName,
            quantity: i.quantity,
            price: i.unitPrice,
          })),
          notes: (po as any).notes,
          createdBy: (po as any).createdBy,
          approvedBy: (po as any).approvedBy,
          approvedAt: (po as any).approvedAt,
          approvalNotes: (po as any).approvalNotes,
          deliveredAt: (po as any).deliveredAt,
        }))
      );
    } catch (err) {
      console.error(err);
      message.error("Failed to fetch purchase orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleCreate = () => {
    if (!allowCreate) {
      message.error("You do not have permission to create purchase orders.");
      return;
    }
    setEditingOrder(null);
    setShowForm(true);
  };

  const handleEdit = (po: PurchaseOrder) => {
    setEditingOrder(po);
    setShowForm(true);
  };

  const handleDelete = async (po: PurchaseOrder) => {
    if (!po._id) return;
    if (po.status !== "Pending") {
      message.warning(
        "Only Pending orders can be deleted without Admin approval."
      );
      return;
    }
    if (!window.confirm("Are you sure you want to delete this order?")) return;

    if (isProcurementManagerL1) {
      const reason = window.prompt(
        "Provide a note for your Procurement Director (optional):",
        ""
      );
      if (reason === null) {
        return;
      }
      try {
        setActionId(po._id);
        await submitProcurementChangeRequest({
          entityType: "purchaseOrder",
          actionType: "delete",
          targetId: po._id,
          reason,
        });
        message.success(
          "Purchase order deletion request submitted for approval."
        );
      } catch (err) {
        console.error(err);
        message.error(
          (err as any)?.message ||
            "Failed to submit purchase order delete request"
        );
      } finally {
        setActionId(null);
      }
      return;
    }

    try {
      setActionId(po._id);
      await deletePO(po._id);
      message.success("Purchase order deleted");
      fetchOrders();
    } catch (err) {
      console.error(err);
      message.error("Failed to delete purchase order");
    }
    setActionId(null);
  };

  const handleApprove = async (po: PurchaseOrder) => {
    if (!po._id) return;
    if (!allowApprove) {
      message.error("You are not authorized to approve purchase orders.");
      return;
    }

    const approvalNotes = window.prompt(
      "Add approval notes (optional)",
      po.approvalNotes || ""
    );

    try {
      setActionId(po._id);
      await approvePO(po._id, { approvalNotes: approvalNotes || "" });
      message.success("Purchase order approved successfully");
      fetchOrders();
    } catch (err) {
      console.error(err);
      message.error("Failed to approve purchase order");
    } finally {
      setActionId(null);
    }
  };

  const handleDeliver = async (po: PurchaseOrder) => {
    if (!po._id) return;
    if (!allowDeliver) {
      message.error("You do not have permission to mark orders as delivered.");
      return;
    }
    if (po.status !== "Approved") {
      message.warning("Only approved orders can be marked as delivered.");
      return;
    }

    if (!window.confirm("Mark this purchase order as delivered?")) {
      return;
    }

    try {
      setActionId(po._id);
      await markPurchaseOrderDelivered(po._id);
      message.success("Purchase order marked as delivered");
      fetchOrders();
    } catch (err) {
      console.error(err);
      message.error("Failed to update purchase order status");
    } finally {
      setActionId(null);
    }
  };

  const openInvoiceBlob = (blob: Blob, filename: string, download = false) => {
    const blobUrl = window.URL.createObjectURL(blob);
    if (download) {
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      window.open(blobUrl, "_blank", "noopener");
    }

    setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl);
    }, 30_000);
  };

  const handlePreviewInvoice = async (po: PurchaseOrder) => {
    if (!po.invoice?._id) {
      message.warning("No invoice available to preview");
      return;
    }

    try {
      setActionId(po._id || null);
      const blob = await fetchInvoicePdf(po.invoice._id);
      openInvoiceBlob(
        blob,
        `${po.invoice.invoiceNumber || po.poNumber}.pdf`,
        false
      );
    } catch (err) {
      console.error(err);
      message.error("Failed to preview invoice");
    } finally {
      setActionId(null);
    }
  };

  const handleDownloadInvoice = async (po: PurchaseOrder) => {
    if (!po.invoice?._id) {
      message.warning("No invoice available to download");
      return;
    }

    try {
      setActionId(po._id || null);
      const blob = await fetchInvoicePdf(po.invoice._id);
      openInvoiceBlob(
        blob,
        `${po.invoice.invoiceNumber || po.poNumber}.pdf`,
        true
      );
    } catch (err) {
      console.error(err);
      message.error("Failed to download invoice");
    } finally {
      setActionId(null);
    }
  };

  const handleApproveRequest = useCallback(
    async (request: ProcurementChangeRequest) => {
      const approvalNote = window.prompt(
        "Add approval note for this request (optional):",
        ""
      );
      if (approvalNote === null) {
        return;
      }

      try {
        setRequestActionId(request._id);
        await approveProcurementChangeRequest(
          request._id,
          approvalNote || undefined
        );
        message.success("Request approved successfully");
        await loadPendingRequests();
        await fetchOrders();
      } catch (err) {
        console.error(err);
        message.error(
          (err as any)?.message || "Failed to approve procurement request"
        );
      } finally {
        setRequestActionId(null);
      }
    },
    [fetchOrders, loadPendingRequests]
  );

  const handleRejectRequest = useCallback(
    async (request: ProcurementChangeRequest) => {
      const rejectionReason = window.prompt(
        "Provide a reason for rejection (optional):",
        ""
      );
      if (rejectionReason === null) {
        return;
      }

      try {
        setRequestActionId(request._id);
        await rejectProcurementChangeRequest(
          request._id,
          rejectionReason || undefined
        );
        message.success("Request rejected");
        await loadPendingRequests();
      } catch (err) {
        console.error(err);
        message.error(
          (err as any)?.message || "Failed to reject procurement request"
        );
      } finally {
        setRequestActionId(null);
      }
    },
    [loadPendingRequests]
  );

  const requestColumns = useMemo(
    () => [
      {
        title: "Item",
        key: "entityType",
        render: (_: unknown, record: ProcurementChangeRequest) => {
          const entityLabel =
            record.entityType === "supplier" ? "Supplier" : "Purchase Order";
          const actionLabel = `${record.actionType
            .charAt(0)
            .toUpperCase()}${record.actionType.slice(1)}`;
          return `${entityLabel} • ${actionLabel}`;
        },
      },
      {
        title: "Requested By",
        dataIndex: "requestedByName",
        key: "requestedByName",
        render: (_: string, record: ProcurementChangeRequest) =>
          `${record.requestedByName} (${record.requestedByLevel})`,
      },
      {
        title: "Reason / Notes",
        dataIndex: "reason",
        key: "reason",
        render: (value: string | null) => value || "—",
      },
      {
        title: "Submitted",
        dataIndex: "createdAt",
        key: "createdAt",
        render: (value: string) =>
          value ? new Date(value).toLocaleString() : "-",
      },
      {
        title: "Actions",
        key: "actions",
        render: (_: unknown, record: ProcurementChangeRequest) => (
          <div className="flex flex-wrap gap-2">
            <Button
              size="small"
              type="primary"
              icon={<ShieldCheck size={14} />}
              onClick={() => handleApproveRequest(record)}
              loading={requestActionId === record._id}
            >
              Approve
            </Button>
            <Button
              size="small"
              danger
              onClick={() => handleRejectRequest(record)}
              disabled={requestActionId === record._id}
            >
              Reject
            </Button>
          </div>
        ),
      },
    ],
    [handleApproveRequest, handleRejectRequest, requestActionId]
  );

  const handleFormSubmit = async (po: PurchaseOrder): Promise<void> => {
    // Validate that all required fields are present
    if (!po.supplierId) {
      message.error("Supplier is required");
      return;
    }

    if (!po.items || po.items.length === 0) {
      message.error("At least one item is required");
      return;
    }

    // Validate each item has required fields
    for (const item of po.items) {
      if (
        !item.material ||
        !item.quantity ||
        item.price === undefined ||
        item.price === null
      ) {
        message.error(
          "All item fields (material, quantity, price) are required"
        );
        return;
      }
    }

    // Calculate total amount safely
    const totalAmount = po.items.reduce((sum, i) => {
      const price = Number(i.price) || 0;
      const quantity = Number(i.quantity) || 0;
      return sum + price * quantity;
    }, 0);

    // Prepare payload for backend
    const payload: PurchaseOrderPayload = {
      poNumber: po.poNumber || `PO-${Date.now()}`,
      supplier: po.supplierId, // backend expects `supplier`
      items: po.items.map((i) => ({
        materialName: i.material, // backend field
        quantity: Number(i.quantity),
        unitPrice: Number(i.price), // backend field
      })),
      totalAmount: totalAmount,
      status: po.status,
      notes: po.notes,
    };

    try {
      if (isProcurementManagerL1) {
        const reason = window.prompt(
          "Provide a note for your Procurement Director (optional):",
          ""
        );
        if (reason === null) {
          return;
        }

        await submitProcurementChangeRequest({
          entityType: "purchaseOrder",
          actionType: editingOrder?._id ? "update" : "create",
          targetId: editingOrder?._id,
          payload: payload as unknown as Record<string, unknown>,
          reason,
        });
        message.success(
          editingOrder?._id
            ? "Purchase order update request submitted for approval."
            : "Purchase order creation request submitted for approval."
        );
      } else {
        if (editingOrder?._id) {
          await updatePO(editingOrder._id, payload);
          message.success("Purchase order updated");
        } else {
          await createPO(payload);
          message.success("Purchase order created");
        }
        fetchOrders();
      }
    } catch (err) {
      console.error("Error details:", err);
      message.error("Failed to save purchase order");
    } finally {
      setShowForm(false);
    }
  };

  // There is nothing to fix here, as the code is already correct and complete.

  const columns = [
    { title: "PO Number", dataIndex: "poNumber", key: "poNumber" },
    { title: "Supplier", dataIndex: "supplierName", key: "supplierName" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: PurchaseOrder["status"]) => {
        const color =
          status === "Pending"
            ? "default"
            : status === "Approved"
            ? "blue"
            : "green";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Approval",
      key: "approval",
      render: (_: any, record: PurchaseOrder) => {
        if (record.approvedBy?.name) {
          const approvedOn = record.approvedAt
            ? new Date(record.approvedAt).toLocaleDateString()
            : "";
          return (
            <div className="text-sm text-gray-600">
              <div>By {record.approvedBy.name}</div>
              {approvedOn && <div>On {approvedOn}</div>}
            </div>
          );
        }
        return <span className="text-xs text-gray-500">Awaiting approval</span>;
      },
    },
    {
      title: "Total Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (value: number | undefined) =>
        value?.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }) || "0.00",
    },
    {
      title: "Items",
      key: "items",
      render: (_: any, record: PurchaseOrder) =>
        record.items
          .map(
            (item) =>
              `${item.material} (Qty: ${item.quantity}, Price: ${item.price})`
          )
          .join(", "),
    },
    {
      title: "Invoice",
      key: "invoice",
      render: (_: any, record: PurchaseOrder) => {
        if (record.invoice) {
          return (
            <div className="flex flex-wrap gap-2">
              <Tooltip title="Preview invoice">
                <Button
                  size="small"
                  icon={<FileText size={14} />}
                  onClick={() => handlePreviewInvoice(record)}
                  loading={actionId === record._id}
                >
                  View
                </Button>
              </Tooltip>
              <Tooltip title="Download invoice PDF">
                <Button
                  size="small"
                  icon={<DownloadCloud size={14} />}
                  onClick={() => handleDownloadInvoice(record)}
                  loading={actionId === record._id}
                >
                  PDF
                </Button>
              </Tooltip>
            </div>
          );
        }

        return <span className="text-xs text-gray-400">No invoice</span>;
      },
    },
    {
      title: "Created",
      key: "createdAt",
      render: (_: any, record: PurchaseOrder) =>
        record.createdAt
          ? new Date(record.createdAt).toLocaleDateString()
          : "-",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: PurchaseOrder) => (
        <div className="flex flex-wrap gap-2">
          {allowCreate && (
            <Button
              size="small"
              onClick={() => handleEdit(record)}
              disabled={actionId === record._id}
            >
              Edit
            </Button>
          )}
          {allowCreate && (
            <Button
              size="small"
              danger
              onClick={() => handleDelete(record)}
              disabled={actionId === record._id || record.status !== "Pending"}
              loading={actionId === record._id}
            >
              Delete
            </Button>
          )}
          {allowApprove && record.status === "Pending" && (
            <Button
              size="small"
              type="primary"
              icon={<ShieldCheck size={14} />}
              onClick={() => handleApprove(record)}
              loading={actionId === record._id}
            >
              Approve
            </Button>
          )}
          {allowDeliver && record.status === "Approved" && (
            <Button
              size="small"
              icon={<Truck size={14} />}
              onClick={() => handleDeliver(record)}
              loading={actionId === record._id}
            >
              Deliver
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold">Purchase Orders</h2>
        {allowCreate && (
          <Button type="primary" icon={<Plus />} onClick={handleCreate}>
            New PO
          </Button>
        )}
      </div>

      <Table
        dataSource={orders}
        columns={columns}
        loading={loading}
        rowKey={(record) => record._id || record.poNumber}
      />

      {isProcurementDirector && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">
              Pending Procurement Requests
            </h3>
            <Button onClick={loadPendingRequests} loading={requestsLoading}>
              Refresh
            </Button>
          </div>
          {requestsError && (
            <div className="mb-3 text-sm text-red-600">{requestsError}</div>
          )}
          <Table
            dataSource={pendingRequests}
            columns={requestColumns}
            loading={requestsLoading}
            rowKey={(record) => record._id}
            pagination={{ pageSize: 5 }}
            locale={{ emptyText: "No pending requests" }}
          />
        </div>
      )}

      {showForm && (
        <PurchaseOrderForm
          open={showForm}
          onClose={() => setShowForm(false)}
          initial={editingOrder}
          onSubmit={handleFormSubmit}
        />
      )}
    </div>
  );
};

export default PurchaseOrders;
