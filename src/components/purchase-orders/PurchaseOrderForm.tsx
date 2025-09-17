import React, { useEffect, useMemo } from "react";
import { Modal, Form, Input, Select, Button, Space, InputNumber, Divider, Alert, message } from "antd";
// import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import type { PurchaseOrder, Supplier } from "../../types";
import { listSuppliersLite } from "../services/supplierService";

type Props = {
  open: boolean;
  onClose: () => void;
  initial?: PurchaseOrder | null;
  onSubmit: (po: PurchaseOrder) => Promise<void>;
};

const PurchaseOrderForm: React.FC<Props> = ({ open, onClose, initial, onSubmit }) => {
  const [form] = Form.useForm<PurchaseOrder>();
  const [suppliers, setSuppliers] = React.useState<Supplier[]>([]);

  const isEditing = !!initial?._id;
  const isLocked = useMemo(() => initial ? ["Approved", "Delivered"].includes(initial.status) : false, [initial]);

  useEffect(() => {
    const loadSuppliers = async () => {
      const list = await listSuppliersLite();
      setSuppliers(list);
    };
    loadSuppliers();
  }, []);

  useEffect(() => {
    if (open) {
      form.resetFields();
      
      // Ensure we have valid default values
      const defaultItems = initial?.items?.length
        ? initial.items
        : [{ material: "", quantity: 1, price: 0 }];
      
      const formValues = {
        supplierId: initial?.supplierId,
        items: defaultItems,
        status: initial?.status || "Pending",
        notes: initial?.notes || "",
      };
      
      console.log('Setting form values:', formValues);
      form.setFieldsValue(formValues);
    }
  }, [open, initial, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      console.log('Form values before processing:', values);
      
      // Ensure all numeric values are properly converted and validated
      const processedValues = {
        ...values,
        items: values.items.map((item: any) => {
          const quantity = Number(item.quantity);
          const price = Number(item.price);
          
          if (isNaN(quantity) || quantity <= 0) {
            throw new Error(`Invalid quantity: ${item.quantity}`);
          }
          
          if (isNaN(price) || price < 0) {
            throw new Error(`Invalid price: ${item.price}`);
          }
          
          return {
            ...item,
            quantity: quantity,
            price: price,
          };
        }),
      };
      
      console.log('Processed values:', processedValues);
      await onSubmit({ ...initial, ...processedValues });
    } catch (error) {
      console.error('Form validation error:', error);
      if (error instanceof Error) {
        message.error(error.message);
      } else {
        message.error('Form validation failed');
      }
    }
  };

  return (
    <Modal
      title={isEditing ? "Edit Purchase Order" : "New Purchase Order"}
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      okText={isEditing ? "Save" : "Create"}
      destroyOnClose
    >
      {isLocked && (
        <Alert
          message="Admin approval required"
          description="Orders in Approved/Delivered are locked for direct edits."
          type="warning"
          showIcon
          style={{ marginBottom: 12 }}
        />
      )}

      <Form form={form} layout="vertical" disabled={isLocked}>
        <Form.Item
          name="supplierId"
          label="Supplier"
          rules={[
            { required: true, message: "Supplier is required" },
            {
              validator: (_, value) => {
                if (!value) {
                  return Promise.reject(new Error('Supplier is required'));
                }
                return Promise.resolve();
              }
            }
          ]}
        >
          <Select
            placeholder="Choose supplier"
            showSearch
            optionFilterProp="label"
            options={suppliers.map((s) => ({ value: s._id!, label: `${s.name} (${s.code})` }))}
          />
        </Form.Item>

        <Divider orientation="left">Items</Divider>
        <Form.List
          name="items"
          rules={[{
            validator: async (_, items) => {
              if (!items || items.length === 0) {
                return Promise.reject(new Error("At least one item is required"));
              }
              
              // Validate that each item has required fields
              for (let i = 0; i < items.length; i++) {
                const item = items[i];
                
                if (!item.material || item.material.trim() === '') {
                  return Promise.reject(new Error(`Item ${i + 1}: Material name is required`));
                }
                
                if (item.quantity === undefined || item.quantity === null || item.quantity === '') {
                  return Promise.reject(new Error(`Item ${i + 1}: Quantity is required`));
                }
                
                const quantity = Number(item.quantity);
                if (isNaN(quantity) || quantity <= 0) {
                  return Promise.reject(new Error(`Item ${i + 1}: Quantity must be a positive number`));
                }
                
                if (item.price === undefined || item.price === null || item.price === '') {
                  return Promise.reject(new Error(`Item ${i + 1}: Price is required`));
                }
                
                const price = Number(item.price);
                if (isNaN(price) || price < 0) {
                  return Promise.reject(new Error(`Item ${i + 1}: Price must be a non-negative number`));
                }
              }
            }
          }]}
        >
          {(fields, { add, remove }, { errors }) => (
            <>
              {fields.map((field) => (
                <Space key={field.key} align="baseline" className="w-full mb-2">
                  <Form.Item 
                    {...field} 
                    name={[field.name, "material"]} 
                    fieldKey={[field.fieldKey!, "material"]} 
                    rules={[
                      { required: true, message: "Material required" },
                      {
                        validator: (_, value) => {
                          if (!value || value.trim() === '') {
                            return Promise.reject(new Error('Material name is required'));
                          }
                          return Promise.resolve();
                        }
                      }
                    ]}
                  >
                    <Input placeholder="Material" />
                  </Form.Item>
                  <Form.Item 
                    {...field} 
                    name={[field.name, "quantity"]} 
                    fieldKey={[field.fieldKey!, "quantity"]} 
                    rules={[
                      { required: true, message: "Qty required" },
                      { type: 'number', min: 1, message: 'Quantity must be at least 1' },
                      {
                        validator: (_, value) => {
                          if (value === undefined || value === null || value === '') {
                            return Promise.reject(new Error('Quantity is required'));
                          }
                          const num = Number(value);
                          if (isNaN(num) || num <= 0) {
                            return Promise.reject(new Error('Quantity must be a positive number'));
                          }
                          return Promise.resolve();
                        }
                      }
                    ]}
                  >
                    <InputNumber min={1} placeholder="Qty" />
                  </Form.Item>
                  <Form.Item 
                    {...field} 
                    name={[field.name, "price"]} 
                    fieldKey={[field.fieldKey!, "price"]} 
                    rules={[
                      { required: true, message: "Price required" },
                      { type: 'number', min: 0, message: 'Price must be at least 0' },
                      {
                        validator: (_, value) => {
                          if (value === undefined || value === null || value === '') {
                            return Promise.reject(new Error('Price is required'));
                          }
                          const num = Number(value);
                          if (isNaN(num) || num < 0) {
                            return Promise.reject(new Error('Price must be a non-negative number'));
                          }
                          return Promise.resolve();
                        }
                      }
                    ]}
                  >
                    <InputNumber min={0} step={0.01} placeholder="Price" />
                  </Form.Item>
                  {/* <MinusCircleOutlined onClick={() => remove(field.name)} /> */}
                </Space>
              ))}
              <Form.ErrorList errors={errors} />
              <Form.Item>
                {/* <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}> */}
                  Add item
                {/* </Button> */}
              </Form.Item>
            </>
          )}
        </Form.List>

        <Form.Item 
          name="status" 
          label="Status" 
          rules={[
            { required: true, message: "Status is required" },
            {
              validator: (_, value) => {
                if (!value) {
                  return Promise.reject(new Error('Status is required'));
                }
                return Promise.resolve();
              }
            }
          ]}
        >
          <Select options={[
            { value: "Pending", label: "Pending" },
            { value: "Approved", label: "Approved" },
            { value: "Delivered", label: "Delivered" },
          ]} />
        </Form.Item>

        <Form.Item name="notes" label="Notes" initialValue="">
          <Input.TextArea rows={3} placeholder="Optional notes" />
        </Form.Item>
        
        {/* Debug info */}
        {process.env.NODE_ENV === 'development' && (
          <Form.Item label="Debug Info">
            <pre style={{ fontSize: '12px', background: '#f5f5f5', padding: '8px' }}>
              {JSON.stringify({ 
                initial, 
                isEditing, 
                isLocked,
                formValues: form.getFieldsValue()
              }, null, 2)}
            </pre>
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

export default PurchaseOrderForm;
