import type { Supplier } from "../types";

const API_URL = "http://localhost:5000/api";

export const fetchSuppliers = async () => {
  const res = await fetch(`${API_URL}/suppliers`);
  return res.json();
};

export const createSupplier = async (supplier: Supplier) => {
  const res = await fetch(`${API_URL}/suppliers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(supplier),
  });
  return res.json();
};

export const updateSupplier = async (id: string, supplier: Supplier) => {
  const res = await fetch(`${API_URL}/suppliers/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(supplier),
  });
  return res.json();
};

export const deleteSupplier = async (id: string) => {
  await fetch(`${API_URL}/suppliers/${id}`, { method: "DELETE" });
};
