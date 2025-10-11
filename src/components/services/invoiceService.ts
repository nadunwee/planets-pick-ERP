import api from "./api";
import type { Invoice } from "../../types";

export const listInvoices = async (): Promise<Invoice[]> => {
  const { data } = await api.get<Invoice[]>("/invoices");
  return data;
};

export const getInvoice = async (id: string): Promise<Invoice> => {
  const { data } = await api.get<Invoice>(`/invoices/${id}`);
  return data;
};

export const generateInvoiceFromPO = async (poId: string): Promise<Invoice> => {
  const { data } = await api.post<Invoice>(`/invoices/from-po/${poId}`);
  return data;
};
