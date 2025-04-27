import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Row, Col, Statistic, Typography, Avatar, Badge, Button, Table, Tag, Space, Tooltip } from 'antd';
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
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { FaShoppingBag, FaUsers, FaChartLine, FaCog, FaBox, FaTags, FaClipboardList } from 'react-icons/fa';
import ProductManager from '../../components/ProductManager';

const { Title, Text } = Typography;

const Admin = () => {
  const [activeSection, setActiveSection] = useState(null);

  const handleSectionClick = (section) => {
    setActiveSection(section);
  };

  // Sample data for dashboard
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
    },
    {
      title: 'Action',
      key: 'action',
      render: () => (
        <Space size="middle">
          <Button type="link" size="small">View</Button>
          <Button type="link" size="small">Edit</Button>
        </Space>
      ),
    },
  ];

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'products':
        return <ProductManager />;
      case 'orders':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">Order Management</h2>
            <Table 
              dataSource={recentOrders} 
              columns={orderColumns} 
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </div>
        );
      case 'categories':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">Category Management</h2>
            <p className="text-gray-600">Category management functionality coming soon.</p>
          </div>
        );
      case 'users':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">User Management</h2>
            <p className="text-gray-600">User management functionality coming soon.</p>
          </div>
        );
      case 'analytics':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">Analytics</h2>
            <p className="text-gray-600">Analytics functionality coming soon.</p>
          </div>
        );
      case 'settings':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">Settings</h2>
            <p className="text-gray-600">Settings functionality coming soon.</p>
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium opacity-80">Total Sales</p>
                    <h3 className="text-2xl font-bold mt-1">$11,280</h3>
                    <p className="text-xs mt-2 opacity-80">+12% from last month</p>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-full p-3">
                    <DollarOutlined className="text-xl" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium opacity-80">Total Orders</p>
                    <h3 className="text-2xl font-bold mt-1">93</h3>
                    <p className="text-xs mt-2 opacity-80">+8% from last month</p>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-full p-3">
                    <ShoppingCartOutlined className="text-xl" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium opacity-80">Total Products</p>
                    <h3 className="text-2xl font-bold mt-1">42</h3>
                    <p className="text-xs mt-2 opacity-80">+5% from last month</p>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-full p-3">
                    <ShoppingOutlined className="text-xl" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium opacity-80">Total Customers</p>
                    <h3 className="text-2xl font-bold mt-1">128</h3>
                    <p className="text-xs mt-2 opacity-80">+15% from last month</p>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-full p-3">
                    <TeamOutlined className="text-xl" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Recent Orders */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800">Recent Orders</h2>
              </div>
              <div className="p-6">
                <Table 
                  dataSource={recentOrders} 
                  columns={orderColumns} 
                  rowKey="id"
                  pagination={{ pageSize: 5 }}
                  size="small"
                />
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 rounded-full p-3">
                    <FaShoppingBag className="text-blue-500 text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Add New Product</h3>
                    <p className="text-sm text-gray-500">Create a new product listing</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center space-x-4">
                  <div className="bg-purple-100 rounded-full p-3">
                    <FaClipboardList className="text-purple-500 text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">View Reports</h3>
                    <p className="text-sm text-gray-500">Access sales and analytics</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center space-x-4">
                  <div className="bg-green-100 rounded-full p-3">
                    <FaCog className="text-green-500 text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Settings</h3>
                    <p className="text-sm text-gray-500">Configure store settings</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Product Management Card */}
        <div 
          className={`bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer ${activeSection === 'products' ? 'ring-2 ring-blue-500' : ''}`}
          onClick={() => handleSectionClick('products')}
        >
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 rounded-full p-3">
              <FaBox className="text-blue-500 text-xl" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Product Management</h2>
              <p className="text-gray-600 mt-1">Manage your products, add new items, and update existing ones</p>
            </div>
          </div>
        </div>

        {/* Order Management Card */}
        <div 
          className={`bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer ${activeSection === 'orders' ? 'ring-2 ring-blue-500' : ''}`}
          onClick={() => handleSectionClick('orders')}
        >
          <div className="flex items-center space-x-4">
            <div className="bg-purple-100 rounded-full p-3">
              <FaClipboardList className="text-purple-500 text-xl" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Order Management</h2>
              <p className="text-gray-600 mt-1">View and manage customer orders</p>
            </div>
          </div>
        </div>

        {/* Category Management Card */}
        <div 
          className={`bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer ${activeSection === 'categories' ? 'ring-2 ring-blue-500' : ''}`}
          onClick={() => handleSectionClick('categories')}
        >
          <div className="flex items-center space-x-4">
            <div className="bg-green-100 rounded-full p-3">
              <FaTags className="text-green-500 text-xl" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Category Management</h2>
              <p className="text-gray-600 mt-1">Organize your product categories</p>
            </div>
          </div>
        </div>

        {/* User Management Card */}
        <div 
          className={`bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer ${activeSection === 'users' ? 'ring-2 ring-blue-500' : ''}`}
          onClick={() => handleSectionClick('users')}
        >
          <div className="flex items-center space-x-4">
            <div className="bg-red-100 rounded-full p-3">
              <FaUsers className="text-red-500 text-xl" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">User Management</h2>
              <p className="text-gray-600 mt-1">Manage user accounts and permissions</p>
            </div>
          </div>
        </div>

        {/* Analytics Card */}
        <div 
          className={`bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer ${activeSection === 'analytics' ? 'ring-2 ring-blue-500' : ''}`}
          onClick={() => handleSectionClick('analytics')}
        >
          <div className="flex items-center space-x-4">
            <div className="bg-yellow-100 rounded-full p-3">
              <FaChartLine className="text-yellow-500 text-xl" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Analytics</h2>
              <p className="text-gray-600 mt-1">View sales and performance metrics</p>
            </div>
          </div>
        </div>

        {/* Settings Card */}
        <div 
          className={`bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer ${activeSection === 'settings' ? 'ring-2 ring-blue-500' : ''}`}
          onClick={() => handleSectionClick('settings')}
        >
          <div className="flex items-center space-x-4">
            <div className="bg-gray-100 rounded-full p-3">
              <FaCog className="text-gray-500 text-xl" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Settings</h2>
              <p className="text-gray-600 mt-1">Configure store settings and preferences</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Section Content */}
      {activeSection && (
        <div className="mt-8">
          {renderActiveSection()}
        </div>
      )}
    </div>
  );
};

export default Admin; 