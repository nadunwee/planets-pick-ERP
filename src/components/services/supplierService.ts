import api from "./api";
import type { Supplier } from "../../types";

export const listSuppliersLite = async (): Promise<Supplier[]> => {
  const { data } = await api.get<{ items: Supplier[] }>("/suppliers");
  return data.items || [];
};
