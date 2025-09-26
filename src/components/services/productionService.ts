import api from "./api";

export interface ProductionBatch {
  _id?: string;
  id?: string;
  batchName: string; // Maps to batchNumber in frontend
  product: string; // Maps to productName in frontend
  quantity: number;
  status: "idle" | "running" | "paused" | "completed" | "failed";
  processStatus: "getting-raw-materials" | "washing-materials" | "preparing-materials" | "machine-1" | "machine-2" | "machine-3" | "completed" | "failed";
  progress: number;
  estimatedTime: string;
  actualTime?: string;
  operator: string;
  startTime: string;
  endTime?: string;
  yield: number;
  targetYield: number;
  quality: "excellent" | "good" | "fair" | "poor";
  level: number;
  startedAt?: string;
  completedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBatchRequest {
  batchName: string;
  product: string;
  quantity: number;
  targetYield: number;
  operator: string;
  estimatedTime?: string;
  startTime?: string;
  quality?: "excellent" | "good" | "fair" | "poor";
}

export const productionService = {
  // Get all production batches
  getBatches: async (): Promise<ProductionBatch[]> => {
    const response = await api.get("/production");
    return response.data;
  },

  // Create a new production batch
  createBatch: async (batchData: CreateBatchRequest): Promise<ProductionBatch> => {
    const response = await api.post("/production", batchData);
    return response.data;
  },

  // Update a production batch
  updateBatch: async (id: string, updates: Partial<ProductionBatch>): Promise<ProductionBatch> => {
    const response = await api.patch(`/production/${id}`, updates);
    return response.data;
  },

  // Mark batch as completed
  completeBatch: async (id: string): Promise<ProductionBatch> => {
    const response = await api.patch(`/production/${id}/complete`);
    return response.data;
  },

  // Delete a production batch
  deleteBatch: async (id: string): Promise<void> => {
    await api.delete(`/production/${id}`);
  }
};

// Helper function to transform backend data to frontend format
export const transformBatchForFrontend = (batch: ProductionBatch): ProductionBatch => {
  return {
    ...batch,
    id: batch._id || batch.id || "",
    productName: batch.product,
    batchNumber: batch.batchName,
  } as ProductionBatch;
};

// Helper function to transform frontend data to backend format
export const transformBatchForBackend = (batch: any): CreateBatchRequest => {
  return {
    batchName: batch.batchNumber || batch.batchName,
    product: batch.productName || batch.product,
    quantity: batch.quantity || batch.targetYield,
    targetYield: batch.targetYield,
    operator: batch.operator,
    estimatedTime: batch.estimatedTime,
    startTime: batch.startTime,
    quality: batch.quality,
  };
};

// Export the service