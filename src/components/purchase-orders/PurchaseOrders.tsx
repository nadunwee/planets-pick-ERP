import React, { useEffect, useState } from "react";
import { Button, Table, message } from "antd";
import { Plus } from "lucide-react";
import type { PurchaseOrder, PurchaseOrderPayload } from "../../types";
import PurchaseOrderForm from "./PurchaseOrderForm";
import { listPOs, createPO, updatePO, deletePO } from "../services/purchaseOrderService";

const PurchaseOrders: React.FC = () => {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingOrder, setEditingOrder] = useState<PurchaseOrder | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);

  const fetchOrders = async () => {
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
        }))
      );
    } catch (err) {
      console.error(err);
      message.error("Failed to fetch purchase orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCreate = () => {
    setEditingOrder(null);
    setShowForm(true);
  };

  const handleEdit = (po: PurchaseOrder) => {
    setEditingOrder(po);
    setShowForm(true);
  };

  const handleDelete = async (po: PurchaseOrder) => {
    if (po.status !== "Pending") {
      message.warning("Only Pending orders can be deleted without Admin approval.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this order?")) return;

    try {
      await deletePO(po._id!);
      message.success("Purchase order deleted");
      fetchOrders();
    } catch (err) {
      console.error(err);
      message.error("Failed to delete purchase order");
    }
  };

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
    if (!item.material || !item.quantity || item.price === undefined || item.price === null) {
      message.error("All item fields (material, quantity, price) are required");
      return;
    }
  }

  // Calculate total amount safely
  const totalAmount = po.items.reduce((sum, i) => {
    const price = Number(i.price) || 0;
    const quantity = Number(i.quantity) || 0;
    return sum + (price * quantity);
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
    console.log('Sending payload to backend:', payload);
    
    if (editingOrder?._id) {
      await updatePO(editingOrder._id, payload);
      message.success("Purchase order updated");
    } else {
      await createPO(payload);
      message.success("Purchase order created");
    }
    fetchOrders();
  } catch (err) {
    console.error('Error details:', err);
    message.error("Failed to save purchase order");
  } finally {
    setShowForm(false);
  }
};

  // There is nothing to fix here, as the code is already correct and complete.

  const columns = [
    { title: "PO Number", dataIndex: "poNumber", key: "poNumber" },
    { title: "Supplier", dataIndex: "supplierName", key: "supplierName" },
    { title: "Status", dataIndex: "status", key: "status" },
    { title: "Total Amount", dataIndex: "totalAmount", key: "totalAmount" },
    {
      title: "Items",
      key: "items",
      render: (_: any, record: PurchaseOrder) =>
        record.items.map((i) => `${i.material} (Qty: ${i.quantity}, Price: ${i.price})`).join(", "),
    },
    {
      title: "Created At",
      key: "createdAt",
      render: (_: any, record: PurchaseOrder) =>
        record.createdAt ? new Date(record.createdAt).toLocaleDateString() : "-",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: PurchaseOrder) => (
        <div className="flex gap-2">
          <Button size="small" onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Button size="small" danger onClick={() => handleDelete(record)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold">Purchase Orders</h2>
        <Button type="primary" icon={<Plus />} onClick={handleCreate}>
          New PO
        </Button>
      </div>

      <Table
        dataSource={orders}
        columns={columns}
        loading={loading}
        rowKey={(record) => record._id!}
      />

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
