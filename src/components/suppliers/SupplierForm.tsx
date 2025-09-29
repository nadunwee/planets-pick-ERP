import React, { useEffect } from "react";
import { Modal, Form, Input, Select, Space, InputNumber, Divider, message } from "antd";
import type { Supplier } from "../../types";

type Props = {
  open: boolean;
  onClose: () => void;
  initial?: Supplier | null;
  onSubmit: (supplier: Supplier) => Promise<void>;
};

const SupplierForm: React.FC<Props> = ({ open, onClose, initial, onSubmit }) => {
  const [form] = Form.useForm<Supplier>();

  const isEditing = !!initial?._id;

  useEffect(() => {
    if (open) {
      form.resetFields();
      
      const formValues = {
        name: initial?.name || "",
        code: initial?.code || "",
        contactPerson: initial?.contactPerson || "",
        email: initial?.email || "",
        phone: initial?.phone || "",
        address: initial?.address || "",
        country: initial?.country || "",
        category: initial?.category || "",
        status: initial?.status || "active",
        onTimeDeliveryRate: initial?.onTimeDeliveryRate || 0,
        qualityScore: initial?.qualityScore || 0,
        responsivenessScore: initial?.responsivenessScore || 0,
        totalSpend: initial?.totalSpend || 0,
        ordersCount: initial?.ordersCount || 0,
      };
      
      form.setFieldsValue(formValues);
    }
  }, [open, initial, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      
      const processedValues = {
        ...values,
        onTimeDeliveryRate: Number(values.onTimeDeliveryRate) || 0,
        qualityScore: Number(values.qualityScore) || 0,
        responsivenessScore: Number(values.responsivenessScore) || 0,
        totalSpend: Number(values.totalSpend) || 0,
        ordersCount: Number(values.ordersCount) || 0,
      };
      
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
      title={isEditing ? "Edit Supplier" : "New Supplier"}
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      okText={isEditing ? "Save" : "Create"}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item
        name="name"
          label="Supplier Name"
          rules={[
            { required: true, message: "Supplier name is required" },
            { min: 2, message: "Name must be at least 2 characters" },
            { max: 100, message: "Name must not exceed 100 characters" },
            {
              validator: (_, value) => {
                if (!value || value.trim() === '') {
                  return Promise.reject(new Error('Supplier name is required'));
                }
                if (value.trim().length < 2) {
                  return Promise.reject(new Error('Name must be at least 2 characters'));
                }
                if (value.length > 100) {
                  return Promise.reject(new Error('Name must not exceed 100 characters'));
                }
                return Promise.resolve();
              }
            }
          ]}
        >
          <Input placeholder="Enter supplier name" />
        </Form.Item>

        <Form.Item
        name="code"
          label="Supplier Code"
          rules={[
            { required: true, message: "Supplier code is required" },
            { min: 2, message: "Code must be at least 2 characters" },
            { max: 20, message: "Code must not exceed 20 characters" },
            {
              pattern: /^[A-Z0-9_-]+$/,
              message: "Code must contain only uppercase letters, numbers, hyphens, and underscores"
            },
            {
              validator: (_, value) => {
                if (!value || value.trim() === '') {
                  return Promise.reject(new Error('Supplier code is required'));
                }
                if (value.trim().length < 2) {
                  return Promise.reject(new Error('Code must be at least 2 characters'));
                }
                if (value.length > 20) {
                  return Promise.reject(new Error('Code must not exceed 20 characters'));
                }
                if (!/^[A-Z0-9_-]+$/.test(value)) {
                  return Promise.reject(new Error('Code must contain only uppercase letters, numbers, hyphens, and underscores'));
                }
                return Promise.resolve();
              }
            }
          ]}
        >
          <Input placeholder="Enter supplier code (e.g., SUP001)" />
        </Form.Item>

        <Form.Item
        name="category"
          label="Category"
          rules={[
            {
              validator: (_, value) => {
                if (value && value.length > 50) {
                  return Promise.reject(new Error('Category must not exceed 50 characters'));
                }
                return Promise.resolve();
              }
            }
          ]}
        >
          <Select
            placeholder="Select category"
            allowClear
            options={[
              { value: "Raw Materials", label: "Raw Materials" },
              { value: "Packaging", label: "Packaging" },
              { value: "Finished Products", label: "Finished Products" },
              { value: "Services", label: "Services" },
            ]}
          />
        </Form.Item>

        <Divider orientation="left">Contact Information</Divider>

        <Form.Item
        name="contactPerson"
          label="Contact Person"
          rules={[
            { max: 100, message: "Contact person name must not exceed 100 characters" },
            {
              validator: (_, value) => {
                if (value && value.length > 100) {
                  return Promise.reject(new Error('Contact person name must not exceed 100 characters'));
                }
                if (value && value.trim().length < 2) {
                  return Promise.reject(new Error('Contact person name must be at least 2 characters'));
                }
                return Promise.resolve();
              }
            }
          ]}
        >
          <Input placeholder="Enter contact person name" />
        </Form.Item>

        <Form.Item
        name="email"
          label="Email"
          rules={[
            {
              type: 'email',
              message: 'Please enter a valid email address',
            },
            { max: 100, message: "Email must not exceed 100 characters" },
            {
              validator: (_, value) => {
                if (value && value.length > 100) {
                  return Promise.reject(new Error('Email must not exceed 100 characters'));
                }
                return Promise.resolve();
              }
            }
          ]}
        >
          <Input placeholder="Enter email address" />
        </Form.Item>

        <Form.Item
        name="phone"
          label="Phone"
          rules={[
            { max: 20, message: "Phone number must not exceed 20 characters" },
            {
              pattern: /^[\+]?[0-9\s\-\(\)]+$/,
              message: "Phone number can only contain numbers, spaces, hyphens, parentheses, and optional + prefix"
            },
            {
              validator: (_, value) => {
                if (value && value.length > 20) {
                  return Promise.reject(new Error('Phone number must not exceed 20 characters'));
                }
                if (value && !/^[\+]?[0-9\s\-\(\)]+$/.test(value)) {
                  return Promise.reject(new Error('Phone number can only contain numbers, spaces, hyphens, parentheses, and optional + prefix'));
                }
                return Promise.resolve();
              }
            }
          ]}
        >
          <Input placeholder="Enter phone number (e.g., +1-555-123-4567)" />
        </Form.Item>

        <Form.Item
        name="address"
          label="Address"
          rules={[
            { max: 500, message: "Address must not exceed 500 characters" },
            {
              validator: (_, value) => {
                if (value && value.length > 500) {
                  return Promise.reject(new Error('Address must not exceed 500 characters'));
                }
                return Promise.resolve();
              }
            }
          ]}
        >
          <Input.TextArea rows={3} placeholder="Enter address" />
        </Form.Item>

        <Form.Item
        name="country"
          label="Country"
          rules={[
            { max: 50, message: "Country name must not exceed 50 characters" },
            {
              validator: (_, value) => {
                if (value && value.length > 50) {
                  return Promise.reject(new Error('Country name must not exceed 50 characters'));
                }
                if (value && value.trim().length < 2) {
                  return Promise.reject(new Error('Country name must be at least 2 characters'));
                }
                return Promise.resolve();
              }
            }
          ]}
        >
          <Input placeholder="Enter country" />
        </Form.Item>

        <Divider orientation="left">Performance Metrics</Divider>

        <Space.Compact style={{ width: '100%' }}>
          <Form.Item
            name="onTimeDeliveryRate"
            label="On-Time Delivery Rate (%)"
            style={{ width: '50%', marginRight: 8 }}
            rules={[
              { type: 'number', min: 0, max: 100, message: 'Rate must be between 0-100' },
              {
                validator: (_, value) => {
                  if (value !== undefined && value !== null && value !== '') {
                    const num = Number(value);
                    if (isNaN(num)) {
                      return Promise.reject(new Error('Rate must be a valid number'));
                    }
                    if (num < 0 || num > 100) {
                      return Promise.reject(new Error('Rate must be between 0-100'));
                    }
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <InputNumber min={0} max={100} placeholder="0" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="qualityScore"
            label="Quality Score"
            style={{ width: '50%' }}
            rules={[
              { type: 'number', min: 0, max: 100, message: 'Score must be between 0-100' },
              {
                validator: (_, value) => {
                  if (value !== undefined && value !== null && value !== '') {
                    const num = Number(value);
                    if (isNaN(num)) {
                      return Promise.reject(new Error('Score must be a valid number'));
                    }
                    if (num < 0 || num > 100) {
                      return Promise.reject(new Error('Score must be between 0-100'));
                    }
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <InputNumber min={0} max={100} placeholder="0" style={{ width: '100%' }} />
          </Form.Item>
        </Space.Compact>

        <Form.Item
          name="responsivenessScore"
          label="Responsiveness Score"
          rules={[
            { type: 'number', min: 0, max: 100, message: 'Score must be between 0-100' },
            {
              validator: (_, value) => {
                if (value !== undefined && value !== null && value !== '') {
                  const num = Number(value);
                  if (isNaN(num)) {
                    return Promise.reject(new Error('Score must be a valid number'));
                  }
                  if (num < 0 || num > 100) {
                    return Promise.reject(new Error('Score must be between 0-100'));
                  }
                }
                return Promise.resolve();
              }
            }
          ]}
        >
          <InputNumber min={0} max={100} placeholder="0" style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="status"
          label="Status"
          rules={[
            { required: true, message: "Status is required" }
          ]}
        >
          <Select options={[
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
          ]} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default SupplierForm;
