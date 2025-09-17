import api from "./api";
import type { PurchaseOrder as Ptype, PurchaseOrderPayload } from "../../types";

// List all purchase orders
export const listPOs = async (): Promise<Ptype[]> => {
  const { data } = await api.get<Ptype[]>("/purchase-orders");
  return data;
};

// Get a single PO by ID
export const getPO = async (id: string): Promise<Ptype> => {
  const { data } = await api.get<Ptype>(`/purchase-orders/${id}`);
  return data;
};

// Create a new PO
export const createPO = async (po: PurchaseOrderPayload): Promise<Ptype> => {
  const { data } = await api.post<Ptype>("/purchase-orders", po);
  return data;
};

// Update PO
export const updatePO = async (id: string, updates: Partial<PurchaseOrderPayload>): Promise<Ptype> => {
  const { data } = await api.put<Ptype>(`/purchase-orders/${id}`, updates);
  return data;
};

// Delete PO
export const deletePO = async (id: string): Promise<{ message: string }> => {
  const { data } = await api.delete<{ message: string }>(`/purchase-orders/${id}`);
  return data;
};
