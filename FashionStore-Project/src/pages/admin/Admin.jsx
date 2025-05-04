import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Row, Col, Statistic, Typography, Avatar, Badge, Button, Table, Tag, Space, Tooltip, Progress } from 'antd';
import { 
  ShoppingOutlined, 
  UserOutlined, 
  ShoppingCartOutlined, 
  TagsOutlined, 
  BarChartOutlined, 
  SettingOutlined,
  DashboardOutlined,
  DollarOutlined,
  TeamOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  RiseOutlined,
  FallOutlined
} from '@ant-design/icons';
import { FaShoppingBag, FaUsers, FaChartLine, FaCog, FaBox, FaTags, FaClipboardList } from 'react-icons/fa';
import ProductManager from '../../components/ProductManager';
import OrderManagement from '../../components/admin/OrderManagement';

const { Title, Text } = Typography;

const Admin = () => {
  const [activeSection, setActiveSection] = useState('overview');

  const handleSectionClick = (section) => {
    setActiveSection(section);
  };

  // Sample data for dashboard
  const overviewData = {
    turnover: {
      current: 11280,
      previous: 10080,
      change: 12,
      trend: 'up'
    },
    profit: {
      current: 5640,
      previous: 5040,
      change: 11.9,
      trend: 'up'
    },
    orders: {
      current: 93,
      previous: 86,
      change: 8.1,
      trend: 'up'
    },
    customers: {
      current: 128,
      previous: 111,
      change: 15.3,
      trend: 'up'
    }
  };

  const recentOrders = [
    { id: 1, customer: 'John Doe', amount: 129.99, status: 'completed', date: '2023-05-15' },
    { id: 2, customer: 'Jane Smith', amount: 89.50, status: 'pending', date: '2023-05-14' },
    { id: 3, customer: 'Robert Johnson', amount: 249.99, status: 'processing', date: '2023-05-13' },
    { id: 4, customer: 'Emily Davis', amount: 75.25, status: 'completed', date: '2023-05-12' },
    { id: 5, customer: 'Michael Wilson', amount: 199.99, status: 'cancelled', date: '2023-05-11' },
  ];

  const orderColumns = [
    {
      title: 'Order ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Customer',
      dataIndex: 'customer',
      key: 'customer',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `$${amount.toFixed(2)}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'green';
        let icon = <CheckCircleOutlined />;
        
        if (status === 'pending') {
          color = 'gold';
          icon = <ClockCircleOutlined />;
        } else if (status === 'processing') {
          color = 'blue';
          icon = <ClockCircleOutlined />;
        } else if (status === 'cancelled') {
          color = 'red';
          icon = <ExclamationCircleOutlined />;
        }
        
        return (
          <Tag color={color} icon={icon}>
            {status.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <Text className="text-gray-500">Total Turnover</Text>
              <div className="flex items-center mt-1">
                <Title level={4} className="m-0 mr-2">${overviewData.turnover.current.toLocaleString()}</Title>
                <Tag color={overviewData.turnover.trend === 'up' ? 'success' : 'error'} className="flex items-center">
                  {overviewData.turnover.trend === 'up' ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                  {overviewData.turnover.change}%
                </Tag>
              </div>
            </div>
            <div className="bg-blue-50 rounded-full p-2">
              <DollarOutlined className="text-blue-500 text-lg" />
            </div>
          </div>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <Text className="text-gray-500">Total Profit</Text>
              <div className="flex items-center mt-1">
                <Title level={4} className="m-0 mr-2">${overviewData.profit.current.toLocaleString()}</Title>
                <Tag color={overviewData.profit.trend === 'up' ? 'success' : 'error'} className="flex items-center">
                  {overviewData.profit.trend === 'up' ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                  {overviewData.profit.change}%
                </Tag>
              </div>
            </div>
            <div className="bg-green-50 rounded-full p-2">
              <RiseOutlined className="text-green-500 text-lg" />
            </div>
          </div>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <Text className="text-gray-500">Total Orders</Text>
              <div className="flex items-center mt-1">
                <Title level={4} className="m-0 mr-2">{overviewData.orders.current}</Title>
                <Tag color={overviewData.orders.trend === 'up' ? 'success' : 'error'} className="flex items-center">
                  {overviewData.orders.trend === 'up' ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                  {overviewData.orders.change}%
                </Tag>
              </div>
            </div>
            <div className="bg-purple-50 rounded-full p-2">
              <ShoppingCartOutlined className="text-purple-500 text-lg" />
            </div>
          </div>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <Text className="text-gray-500">Total Customers</Text>
              <div className="flex items-center mt-1">
                <Title level={4} className="m-0 mr-2">{overviewData.customers.current}</Title>
                <Tag color={overviewData.customers.trend === 'up' ? 'success' : 'error'} className="flex items-center">
                  {overviewData.customers.trend === 'up' ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                  {overviewData.customers.change}%
                </Tag>
              </div>
            </div>
            <div className="bg-red-50 rounded-full p-2">
              <TeamOutlined className="text-red-500 text-lg" />
            </div>
          </div>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Profit Margin" className="shadow-sm">
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <Text>Current Month</Text>
                <Text strong>50%</Text>
              </div>
              <Progress percent={50} status="active" strokeColor="#52c41a" size="small" />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <Text>Last Month</Text>
                <Text strong>45%</Text>
              </div>
              <Progress percent={45} strokeColor="#1890ff" size="small" />
            </div>
          </div>
        </Card>

        <Card title="Order Status" className="shadow-sm">
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <Text>Completed</Text>
                <Text strong>65%</Text>
              </div>
              <Progress percent={65} status="active" strokeColor="#52c41a" size="small" />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <Text>Processing</Text>
                <Text strong>20%</Text>
              </div>
              <Progress percent={20} strokeColor="#1890ff" size="small" />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <Text>Pending</Text>
                <Text strong>15%</Text>
              </div>
              <Progress percent={15} strokeColor="#faad14" size="small" />
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card title="Recent Orders" className="shadow-sm">
        <Table 
          dataSource={recentOrders} 
          columns={orderColumns} 
          rowKey="id"
          pagination={{ pageSize: 5 }}
          size="small"
        />
      </Card>
    </div>
  );

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverview();
      case 'products':
        return <ProductManager />;
      case 'orders':
        return <OrderManagement />;
      case 'categories':
        return (
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-xl font-semibold mb-4">Category Management</h2>
            <p className="text-gray-600">Category management functionality coming soon.</p>
          </div>
        );
      case 'users':
        return (
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-xl font-semibold mb-4">User Management</h2>
            <p className="text-gray-600">User management functionality coming soon.</p>
          </div>
        );
      default:
        return renderOverview();
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div 
          className={`bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer ${activeSection === 'overview' ? 'ring-1 ring-blue-500' : ''}`}
          onClick={() => handleSectionClick('overview')}
        >
          <div className="flex items-center space-x-3">
            <div className="bg-blue-50 rounded-full p-2">
              <DashboardOutlined className="text-blue-500 text-lg" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-800">Overview</h2>
              <p className="text-sm text-gray-500">Dashboard</p>
            </div>
          </div>
        </div>

        <div 
          className={`bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer ${activeSection === 'products' ? 'ring-1 ring-blue-500' : ''}`}
          onClick={() => handleSectionClick('products')}
        >
          <div className="flex items-center space-x-3">
            <div className="bg-blue-50 rounded-full p-2">
              <FaBox className="text-blue-500 text-lg" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-800">Products</h2>
              <p className="text-sm text-gray-500">Manage products</p>
            </div>
          </div>
        </div>

        <div 
          className={`bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer ${activeSection === 'orders' ? 'ring-1 ring-blue-500' : ''}`}
          onClick={() => handleSectionClick('orders')}
        >
          <div className="flex items-center space-x-3">
            <div className="bg-purple-50 rounded-full p-2">
              <FaClipboardList className="text-purple-500 text-lg" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-800">Orders</h2>
              <p className="text-sm text-gray-500">Manage orders</p>
            </div>
          </div>
        </div>

        <div 
          className={`bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer ${activeSection === 'users' ? 'ring-1 ring-blue-500' : ''}`}
          onClick={() => handleSectionClick('users')}
        >
          <div className="flex items-center space-x-3">
            <div className="bg-red-50 rounded-full p-2">
              <FaUsers className="text-red-500 text-lg" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-800">Users</h2>
              <p className="text-sm text-gray-500">Manage users</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Section Content */}
      <div className="mt-6">
        {renderActiveSection()}
      </div>
    </div>
  );
};

export default Admin; 