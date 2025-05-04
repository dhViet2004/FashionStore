import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Modal, Form, Select, Input, Space, message } from 'antd';
import { 
  CheckCircleOutlined, 
  SyncOutlined, 
  CarOutlined, 
  ShoppingOutlined,
  SearchOutlined,
  FilterOutlined
} from '@ant-design/icons';
import { format } from 'date-fns';

const { Option } = Select;

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await fetch('http://localhost:3001/orders');
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const data = await response.json();
      setOrders(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (error) {
      console.error('Error loading orders:', error);
      message.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'confirmed':
        return 'success';
      case 'processing':
        return 'processing';
      case 'shipped':
        return 'purple';
      case 'delivered':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <CheckCircleOutlined />;
      case 'confirmed':
        return <CheckCircleOutlined />;
      case 'processing':
        return <SyncOutlined spin />;
      case 'shipped':
        return <CarOutlined />;
      case 'delivered':
        return <ShoppingOutlined />;
      default:
        return null;
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      const updatedOrder = {
        ...order,
        status: newStatus,
        statusHistory: Array.isArray(order.statusHistory) 
          ? [...order.statusHistory, {
              status: newStatus,
              timestamp: new Date().toISOString(),
              note: `Status changed to ${newStatus}`
            }]
          : [{
              status: newStatus,
              timestamp: new Date().toISOString(),
              note: `Status changed to ${newStatus}`
            }]
      };

      const response = await fetch(`http://localhost:3001/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedOrder),
      });

      if (response.ok) {
        message.success(`Order status updated to ${newStatus}`);
        loadOrders();
      } else {
        throw new Error('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      message.error('Failed to update order status');
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsModalVisible(true);
  };

  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'id',
      key: 'id',
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => format(new Date(date), 'PPP'),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: 'Customer',
      dataIndex: 'userId',
      key: 'userId',
      render: (userId) => `User #${userId}`,
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      render: (items) => items.length,
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (total) => `$${total.toFixed(2)}`,
      sorter: (a, b) => a.total - b.total,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status || 'pending')} icon={getStatusIcon(status || 'pending')}>
          {(status || 'pending').toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: 'Pending', value: 'pending' },
        { text: 'Confirmed', value: 'confirmed' },
        { text: 'Processing', value: 'processing' },
        { text: 'Shipped', value: 'shipped' },
        { text: 'Delivered', value: 'delivered' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="primary" onClick={() => handleViewDetails(record)}>
            View Details
          </Button>
          <Select
            defaultValue={record.status}
            style={{ width: 120 }}
            onChange={(value) => handleStatusChange(record.id, value)}
          >
            <Option value="pending">Pending</Option>
            <Option value="confirmed">Confirmed</Option>
            <Option value="processing">Processing</Option>
            <Option value="shipped">Shipped</Option>
            <Option value="delivered">Delivered</Option>
          </Select>
        </Space>
      ),
    },
  ];

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toString().includes(searchText) ||
      order.userId.toString().includes(searchText) ||
      order.items.some(item => item.name.toLowerCase().includes(searchText.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Order Management</h1>
        <Space>
          <Input
            placeholder="Search orders..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 200 }}
          />
          <Select
            defaultValue="all"
            style={{ width: 120 }}
            onChange={setStatusFilter}
          >
            <Option value="all">All Status</Option>
            <Option value="pending">Pending</Option>
            <Option value="confirmed">Confirmed</Option>
            <Option value="processing">Processing</Option>
            <Option value="shipped">Shipped</Option>
            <Option value="delivered">Delivered</Option>
          </Select>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={filteredOrders}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={`Order Details #${selectedOrder?.id}`}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedOrder && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Order Information</h3>
              <p>Date: {format(new Date(selectedOrder.createdAt), 'PPP')}</p>
              <p>Status: 
                <Tag color={getStatusColor(selectedOrder.status)} icon={getStatusIcon(selectedOrder.status)}>
                  {selectedOrder.status.toUpperCase()}
                </Tag>
              </p>
              {selectedOrder.trackingNumber && (
                <p>Tracking Number: {selectedOrder.trackingNumber}</p>
              )}
            </div>

            <div>
              <h3 className="font-semibold">Shipping Information</h3>
              <p>Address: {selectedOrder.shippingInfo.address}</p>
              <p>City: {selectedOrder.shippingInfo.city}</p>
              <p>State: {selectedOrder.shippingInfo.state}</p>
              <p>ZIP: {selectedOrder.shippingInfo.zipCode}</p>
              <p>Phone: {selectedOrder.shippingInfo.phone}</p>
            </div>

            <div>
              <h3 className="font-semibold">Order Items</h3>
              <Table
                dataSource={selectedOrder.items}
                columns={[
                  {
                    title: 'Product',
                    dataIndex: 'name',
                    key: 'name',
                  },
                  {
                    title: 'Price',
                    dataIndex: 'price',
                    key: 'price',
                    render: (price) => `$${price.toFixed(2)}`,
                  },
                  {
                    title: 'Quantity',
                    dataIndex: 'quantity',
                    key: 'quantity',
                  },
                  {
                    title: 'Total',
                    key: 'total',
                    render: (_, record) => `$${(record.price * record.quantity).toFixed(2)}`,
                  },
                ]}
                pagination={false}
              />
              <div className="text-right mt-4">
                <p className="font-bold">Total: ${selectedOrder.total.toFixed(2)}</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold">Status History</h3>
              <Table
                dataSource={selectedOrder.statusHistory}
                columns={[
                  {
                    title: 'Status',
                    dataIndex: 'status',
                    key: 'status',
                    render: (status) => (
                      <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
                        {status.toUpperCase()}
                      </Tag>
                    ),
                  },
                  {
                    title: 'Date',
                    dataIndex: 'timestamp',
                    key: 'timestamp',
                    render: (timestamp) => format(new Date(timestamp), 'PPp'),
                  },
                  {
                    title: 'Note',
                    dataIndex: 'note',
                    key: 'note',
                  },
                ]}
                pagination={false}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrderManagement; 