import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Modal, Form, Select, Input, Space, message, Descriptions, Card, Timeline, Typography, Divider } from 'antd';
import { 
  CheckCircleOutlined, 
  SyncOutlined, 
  CarOutlined, 
  ShoppingOutlined,
  SearchOutlined,
  FilterOutlined,
  UserOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  ShoppingCartOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  BarcodeOutlined
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
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
      render: (total) => formatCurrency(total),
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
        title={
          <div className="flex items-center space-x-2">
            <ShoppingCartOutlined className="text-blue-500" />
            <span>Order Details #{selectedOrder?.id}</span>
          </div>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedOrder && (
          <div className="space-y-6">
            <Card>
              <Descriptions title="Order Information" bordered>
                <Descriptions.Item label="Order ID" span={3}>
                  <Space>
                    <BarcodeOutlined />
                    {selectedOrder.id}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Order Date" span={3}>
                  <Space>
                    <ClockCircleOutlined />
                    {format(new Date(selectedOrder.createdAt), 'PPP')}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Status" span={3}>
                  <Tag color={getStatusColor(selectedOrder.status)} icon={getStatusIcon(selectedOrder.status)}>
                    {selectedOrder.status.toUpperCase()}
                  </Tag>
                </Descriptions.Item>
                {selectedOrder.trackingNumber && (
                  <Descriptions.Item label="Tracking Number" span={3}>
                    <Space>
                      <CarOutlined />
                      {selectedOrder.trackingNumber}
                    </Space>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>

            <Card title={
              <div className="flex items-center space-x-2">
                <UserOutlined className="text-blue-500" />
                <span>Customer Information</span>
              </div>
            }>
              <Descriptions bordered>
                <Descriptions.Item label="Customer ID" span={3}>
                  User #{selectedOrder.userId}
                </Descriptions.Item>
                {selectedOrder.shippingInfo && (
                  <>
                    <Descriptions.Item label="Address" span={3}>
                      <Space>
                        <EnvironmentOutlined />
                        {selectedOrder.shippingInfo.address}
                      </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="City" span={3}>
                      {selectedOrder.shippingInfo.city}
                    </Descriptions.Item>
                    <Descriptions.Item label="State" span={3}>
                      {selectedOrder.shippingInfo.state}
                    </Descriptions.Item>
                    <Descriptions.Item label="ZIP Code" span={3}>
                      {selectedOrder.shippingInfo.zipCode}
                    </Descriptions.Item>
                    <Descriptions.Item label="Phone" span={3}>
                      <Space>
                        <PhoneOutlined />
                        {selectedOrder.shippingInfo.phone}
                      </Space>
                    </Descriptions.Item>
                  </>
                )}
              </Descriptions>
            </Card>

            <Card title={
              <div className="flex items-center space-x-2">
                <ShoppingCartOutlined className="text-blue-500" />
                <span>Order Items</span>
              </div>
            }>
              <Table
                dataSource={selectedOrder.items}
                columns={[
                  {
                    title: 'Product',
                    dataIndex: 'name',
                    key: 'name',
                    render: (text, record) => (
                      <Space>
                        <img src={record.imageUrl} alt={text} className="w-10 h-10 object-cover rounded" />
                        <span>{text}</span>
                      </Space>
                    ),
                  },
                  {
                    title: 'Price',
                    dataIndex: 'price',
                    key: 'price',
                    render: (price) => formatCurrency(price),
                  },
                  {
                    title: 'Quantity',
                    dataIndex: 'quantity',
                    key: 'quantity',
                  },
                  {
                    title: 'Total',
                    key: 'total',
                    render: (_, record) => formatCurrency(record.price * record.quantity),
                  },
                ]}
                pagination={false}
              />
              <Divider />
              <div className="text-right">
                <Typography.Title level={4}>
                  <Space>
                    <span>Total Amount:</span>
                    {formatCurrency(selectedOrder.total)}
                  </Space>
                </Typography.Title>
              </div>
            </Card>

            {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
              <Card title={
                <div className="flex items-center space-x-2">
                  <ClockCircleOutlined className="text-blue-500" />
                  <span>Status History</span>
                </div>
              }>
                <Timeline
                  items={selectedOrder.statusHistory.map((history) => ({
                    key: history.timestamp,
                    color: getStatusColor(history.status),
                    children: (
                      <div className="space-y-1" key={history.timestamp}>
                        <div className="flex items-center space-x-2">
                          <Tag color={getStatusColor(history.status)} icon={getStatusIcon(history.status)}>
                            {history.status.toUpperCase()}
                          </Tag>
                          <span className="text-gray-500">
                            {format(new Date(history.timestamp), 'PPp')}
                          </span>
                        </div>
                        <p className="text-gray-600 ml-8">{history.note}</p>
                      </div>
                    ),
                  }))}
                />
              </Card>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrderManagement; 