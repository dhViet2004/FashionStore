import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Card, Row, Col, Statistic, Typography, Avatar, Badge, Button, Table, Tag, Space, Tooltip, Progress, Spin, message, Modal, Form, Input, Select } from 'antd';
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
  FallOutlined,
  SyncOutlined,
  EditOutlined,
  DeleteOutlined,
  EditFilled
} from '@ant-design/icons';
import { FaShoppingBag, FaUsers, FaChartLine, FaCog, FaBox, FaTags, FaClipboardList } from 'react-icons/fa';
import ProductManager from '../../components/ProductManager';
import OrderManagement from '../../components/admin/OrderManagement';

const { Title, Text } = Typography;

// Memoized Order Table component
const OrderTable = React.memo(({ dataSource, columns }) => (
  <Table 
    dataSource={dataSource} 
    columns={columns} 
    rowKey="id"
    pagination={{ pageSize: 5 }}
    size="small"
  />
));

// Memoized Overview Card component
const OverviewCard = React.memo(({ title, value, change, trend, icon, iconColor }) => (
  <Card className="shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <Text className="text-gray-500">{title}</Text>
        <div className="flex items-center mt-1">
          <Title level={4} className="m-0 mr-2">{value}</Title>
          <Tag color={trend === 'up' ? 'success' : 'error'} className="flex items-center">
            {trend === 'up' ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            {change}%
          </Tag>
        </div>
      </div>
      <div className={`bg-${iconColor}-50 rounded-full p-2`}>
        {icon}
      </div>
    </div>
  </Card>
));

const Admin = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [selectedCard, setSelectedCard] = useState(null);
  const [overviewData, setOverviewData] = useState({
    turnover: {
      current: 0,
      previous: 0,
      change: 0,
      trend: 'up'
    },
    profit: {
      current: 0,
      previous: 0,
      change: 0,
      trend: 'up'
    },
    orders: {
      current: 0,
      previous: 0,
      change: 0,
      trend: 'up'
    },
    customers: {
      current: 0,
      previous: 0,
      change: 0,
      trend: 'up'
    }
  });
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [users, setUsers] = useState([]);
  const [currentMonthOrders, setCurrentMonthOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();
  const [promotions, setPromotions] = useState([]);
  const [isPromotionModalVisible, setIsPromotionModalVisible] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [promotionForm] = Form.useForm();

  const fetchData = useCallback(async () => {
    try {
      const [ordersResponse, usersResponse] = await Promise.all([
        fetch('http://localhost:3001/orders'),
        fetch('http://localhost:3001/users')
      ]);

      const ordersData = await ordersResponse.json();
      const usersData = await usersResponse.json();
      setUsers(usersData);
      setAllOrders(ordersData);

      // Calculate overview data
      const currentMonthOrdersData = ordersData.filter(order => {
        const orderDate = new Date(order.createdAt || order.date);
        const currentDate = new Date();
        const isCurrentMonth = orderDate.getMonth() === currentDate.getMonth() && 
                             orderDate.getFullYear() === currentDate.getFullYear();
        const isDelivered = order.status === 'delivered';
        return isCurrentMonth && isDelivered;
      });
      setCurrentMonthOrders(currentMonthOrdersData);

      const previousMonthOrdersData = ordersData.filter(order => {
        const orderDate = new Date(order.createdAt || order.date);
        const currentDate = new Date();
        const previousMonth = currentDate.getMonth() === 0 ? 11 : currentDate.getMonth() - 1;
        const previousYear = currentDate.getMonth() === 0 ? currentDate.getFullYear() - 1 : currentDate.getFullYear();
        const isPreviousMonth = orderDate.getMonth() === previousMonth && 
                              orderDate.getFullYear() === previousYear;
        const isDelivered = order.status === 'delivered';
        return isPreviousMonth && isDelivered;
      });

      const currentTurnover = currentMonthOrdersData.reduce((sum, order) => {
        return sum + (Number(order.total) || 0);
      }, 0);
      
      const previousTurnover = previousMonthOrdersData.reduce((sum, order) => {
        return sum + (Number(order.total) || 0);
      }, 0);

      const turnoverChange = previousTurnover === 0 ? 100 : 
        ((currentTurnover - previousTurnover) / previousTurnover) * 100;

      // Update overview data
      setOverviewData({
        turnover: {
          current: currentTurnover.toLocaleString('vi-VN') + '₫',
          previous: previousTurnover.toLocaleString('vi-VN') + '₫',
          change: Math.round(turnoverChange),
          trend: turnoverChange >= 0 ? 'up' : 'down'
        },
        profit: {
          current: Math.round(currentTurnover * 0.3).toLocaleString('vi-VN') + '₫',
          previous: Math.round(previousTurnover * 0.3).toLocaleString('vi-VN') + '₫',
          change: Math.round(turnoverChange),
          trend: turnoverChange >= 0 ? 'up' : 'down'
        },
        orders: {
          current: currentMonthOrdersData.length,
          previous: previousMonthOrdersData.length,
          change: previousMonthOrdersData.length === 0 ? 100 : 
            Math.round(((currentMonthOrdersData.length - previousMonthOrdersData.length) / previousMonthOrdersData.length) * 100),
          trend: currentMonthOrdersData.length >= previousMonthOrdersData.length ? 'up' : 'down'
        },
        customers: {
          current: usersData.length,
          previous: Math.round(usersData.length * 0.9),
          change: 10,
          trend: 'up'
        }
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshKey]);

  const handleRefresh = () => {
    setLoading(true);
    setRefreshKey(prev => prev + 1);
  };

  const handleSectionClick = (section) => {
    setActiveSection(section);
  };

  const handleCardClick = (cardType) => {
    setSelectedCard(selectedCard === cardType ? null : cardType);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    form.setFieldsValue({
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      phoneNumber: user.phoneNumber,
      address: user.address
    });
    setIsEditModalVisible(true);
  };

  const handleEditModalOk = async () => {
    try {
      const values = await form.validateFields();
      const updatedUser = {
        ...editingUser,
        ...values
      };

      const response = await fetch(`http://localhost:3001/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedUser),
      });
      
      if (response.ok) {
        message.success('User updated successfully');
        setIsEditModalVisible(false);
        fetchData(); // Refresh data
      } else {
        message.error('Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      message.error('Error updating user');
    }
  };

  const handleEditModalCancel = () => {
    setIsEditModalVisible(false);
    form.resetFields();
  };

  const handlePromotionSubmit = async () => {
    try {
      const values = await promotionForm.validateFields();
      const voucherData = {
        ...values,
        id: editingPromotion?.id || Date.now().toString(),
        usedBy: editingPromotion?.usedBy || []
      };

      if (editingPromotion) {
        // Update existing voucher
        const response = await fetch(`http://localhost:3001/vouchers/${editingPromotion.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(voucherData),
        });
        
        if (response.ok) {
          message.success('Voucher updated successfully');
          setPromotions(promotions.map(p => p.id === editingPromotion.id ? voucherData : p));
        }
      } else {
        // Create new voucher
        const response = await fetch('http://localhost:3001/vouchers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(voucherData),
        });
        
        if (response.ok) {
          message.success('Voucher created successfully');
          setPromotions([...promotions, voucherData]);
        }
      }
      
      setIsPromotionModalVisible(false);
      promotionForm.resetFields();
      setEditingPromotion(null);
    } catch (error) {
      console.error('Error saving voucher:', error);
      message.error('Error saving voucher');
    }
  };

  const handleDeletePromotion = async (id) => {
    try {
      const response = await fetch(`http://localhost:3001/vouchers/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        message.success('Voucher deleted successfully');
        setPromotions(promotions.filter(p => p.id !== id));
      }
    } catch (error) {
      console.error('Error deleting voucher:', error);
      message.error('Error deleting voucher');
    }
  };

  const handleEditPromotion = (promotion) => {
    setEditingPromotion(promotion);
    promotionForm.setFieldsValue({
      code: promotion.code,
      discount: promotion.discount,
      type: promotion.type,
      minOrder: promotion.minOrder,
      startDate: promotion.startDate,
      endDate: promotion.endDate
    });
    setIsPromotionModalVisible(true);
  };

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const response = await fetch('http://localhost:3001/vouchers');
        if (response.ok) {
          const data = await response.json();
          setPromotions(data);
        }
      } catch (error) {
        console.error('Error fetching vouchers:', error);
      }
    };

    if (activeSection === 'promotions') {
      fetchVouchers();
    }
  }, [activeSection]);

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverview();
      case 'products':
        return <ProductManager />;
      case 'orders':
        return <OrderManagement />;
      case 'promotions':
        return (
          <div className="space-y-6">
            <Card title="Voucher Management" className="shadow-sm">
              <div className="mb-4">
                <Button 
                  type="primary" 
                  onClick={() => {
                    setEditingPromotion(null);
                    promotionForm.resetFields();
                    setIsPromotionModalVisible(true);
                  }}
                >
                  Add New Voucher
                </Button>
              </div>
              <Table 
                dataSource={promotions}
                columns={[
                  {
                    title: 'Code',
                    dataIndex: 'code',
                    key: 'code',
                  },
                  {
                    title: 'Discount',
                    dataIndex: 'discount',
                    key: 'discount',
                    render: (discount, record) => 
                      record.type === 'percentage' ? `${discount}%` : `${discount.toLocaleString('vi-VN')}₫`,
                  },
                  {
                    title: 'Type',
                    dataIndex: 'type',
                    key: 'type',
                    render: (type) => (
                      <Tag color={type === 'percentage' ? 'blue' : 'green'}>
                        {type.toUpperCase()}
                      </Tag>
                    ),
                  },
                  {
                    title: 'Min Order',
                    dataIndex: 'minOrder',
                    key: 'minOrder',
                    render: (minOrder) => `${minOrder.toLocaleString('vi-VN')}₫`,
                  },
                  {
                    title: 'Start Date',
                    dataIndex: 'startDate',
                    key: 'startDate',
                    render: (date) => new Date(date).toLocaleDateString(),
                  },
                  {
                    title: 'End Date',
                    dataIndex: 'endDate',
                    key: 'endDate',
                    render: (date) => new Date(date).toLocaleDateString(),
                  },
                  {
                    title: 'Actions',
                    key: 'actions',
                    render: (_, record) => (
                      <Space>
                        <Tooltip title="Edit">
                          <Button 
                            icon={<EditFilled style={{ color: '#1890ff' }} />} 
                            onClick={() => handleEditPromotion(record)}
                            className="border-blue-500 text-blue-500 hover:bg-blue-50"
                          />
                        </Tooltip>
                        <Tooltip title="Delete">
                          <Button 
                            danger 
                            icon={<DeleteOutlined />}
                            onClick={() => handleDeletePromotion(record.id)}
                          />
                        </Tooltip>
                      </Space>
                    ),
                  }
                ]}
                rowKey="id"
                pagination={{ pageSize: 5 }}
              />
            </Card>
          </div>
        );
      default:
        return renderOverview();
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      ) : (
        <>
          <div className="flex justify-end mb-4">
            <Button type="primary" onClick={handleRefresh} icon={<SyncOutlined />}>
              Refresh Data
            </Button>
          </div>
          
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div onClick={() => handleCardClick('turnover')}>
              <OverviewCard
                title="Total Turnover"
                value={overviewData.turnover.current}
                change={overviewData.turnover.change}
                trend={overviewData.turnover.trend}
                icon={<DollarOutlined className="text-blue-500 text-lg" />}
                iconColor="blue"
              />
            </div>
            <div onClick={() => handleCardClick('profit')}>
              <OverviewCard
                title="Total Profit"
                value={overviewData.profit.current}
                change={overviewData.profit.change}
                trend={overviewData.profit.trend}
                icon={<RiseOutlined className="text-green-500 text-lg" />}
                iconColor="green"
              />
            </div>
            <div onClick={() => handleCardClick('orders')}>
              <OverviewCard
                title="Total Orders"
                value={overviewData.orders.current}
                change={overviewData.orders.change}
                trend={overviewData.orders.trend}
                icon={<ShoppingCartOutlined className="text-purple-500 text-lg" />}
                iconColor="purple"
              />
            </div>
            <div onClick={() => handleCardClick('customers')}>
              <OverviewCard
                title="Total Customers"
                value={overviewData.customers.current}
                change={overviewData.customers.change}
                trend={overviewData.customers.trend}
                icon={<TeamOutlined className="text-red-500 text-lg" />}
                iconColor="red"
              />
            </div>
          </div>

          {/* Detailed Tables */}
          {selectedCard === 'turnover' && (
            <Card title="Turnover Details" className="shadow-sm">
              <Table 
                dataSource={Array.from({ length: 12 }, (_, i) => {
                  const month = new Date();
                  month.setMonth(month.getMonth() + i);
                  const monthName = month.toLocaleString('en-US', { month: 'long' });
                  const year = month.getFullYear();
                  
                  const monthOrders = allOrders.filter(order => {
                    const orderDate = new Date(order.createdAt || order.date);
                    return orderDate.getMonth() === month.getMonth() && 
                           orderDate.getFullYear() === year &&
                           order.status === 'delivered';
                  });
                  
                  const turnover = monthOrders.reduce((sum, order) => 
                    sum + (Number(order.total) || 0), 0);
                  
                  return {
                    key: i,
                    month: monthName,
                    year: year,
                    turnover: turnover,
                    orderCount: monthOrders.length
                  };
                }).filter(item => item.orderCount > 0)}
                columns={[
                  {
                    title: 'Month',
                    dataIndex: 'month',
                    key: 'month',
                  },
                  {
                    title: 'Year',
                    dataIndex: 'year',
                    key: 'year',
                  },
                  {
                    title: 'Turnover',
                    dataIndex: 'turnover',
                    key: 'turnover',
                    render: (turnover) => `${turnover.toLocaleString('vi-VN')}₫`,
                  },
                  {
                    title: 'Order Count',
                    dataIndex: 'orderCount',
                    key: 'orderCount',
                  }
                ]}
                pagination={false}
              />
            </Card>
          )}

          {selectedCard === 'profit' && (
            <Card title="Profit Details" className="shadow-sm">
              <Table 
                dataSource={Array.from({ length: 12 }, (_, i) => {
                  const month = new Date();
                  month.setMonth(month.getMonth() + i);
                  const monthName = month.toLocaleString('en-US', { month: 'long' });
                  const year = month.getFullYear();
                  
                  const monthOrders = allOrders.filter(order => {
                    const orderDate = new Date(order.createdAt || order.date);
                    return orderDate.getMonth() === month.getMonth() && 
                           orderDate.getFullYear() === year &&
                           order.status === 'delivered';
                  });
                  
                  const turnover = monthOrders.reduce((sum, order) => 
                    sum + (Number(order.total) || 0), 0);
                  
                  const profit = Math.round(turnover * 0.3);
                  
                  return {
                    key: i,
                    month: monthName,
                    year: year,
                    turnover: turnover,
                    profit: profit,
                    orderCount: monthOrders.length
                  };
                }).filter(item => item.orderCount > 0)}
                columns={[
                  {
                    title: 'Month',
                    dataIndex: 'month',
                    key: 'month',
                  },
                  {
                    title: 'Year',
                    dataIndex: 'year',
                    key: 'year',
                  },
                  {
                    title: 'Turnover',
                    dataIndex: 'turnover',
                    key: 'turnover',
                    render: (turnover) => `${turnover.toLocaleString('vi-VN')}₫`,
                  },
                  {
                    title: 'Profit (30%)',
                    dataIndex: 'profit',
                    key: 'profit',
                    render: (profit) => `${profit.toLocaleString('vi-VN')}₫`,
                  },
                  {
                    title: 'Order Count',
                    dataIndex: 'orderCount',
                    key: 'orderCount',
                  }
                ]}
                pagination={false}
              />
            </Card>
          )}

          {selectedCard === 'orders' && (
            <Card title="Order Details" className="shadow-sm">
              <Table 
                dataSource={currentMonthOrders}
                columns={[
                  {
                    title: 'Order ID',
                    dataIndex: 'id',
                    key: 'id',
                  },
                  {
                    title: 'Customer',
                    dataIndex: 'userId',
                    key: 'userId',
                    render: (userId) => {
                      const user = users.find(u => u.id === userId);
                      return user ? user.name : 'Unknown';
                    }
                  },
                  {
                    title: 'Amount',
                    dataIndex: 'total',
                    key: 'total',
                    render: (total) => `${Number(total).toLocaleString('vi-VN')}₫`,
                  },
                  {
                    title: 'Status',
                    dataIndex: 'status',
                    key: 'status',
                    render: (status) => {
                      const statusValue = status || 'pending';
                      let color = 'green';
                      let icon = <CheckCircleOutlined />;
                      
                      if (statusValue === 'pending') {
                        color = 'gold';
                        icon = <ClockCircleOutlined />;
                      } else if (statusValue === 'processing') {
                        color = 'blue';
                        icon = <ClockCircleOutlined />;
                      } else if (statusValue === 'cancelled') {
                        color = 'red';
                        icon = <ExclamationCircleOutlined />;
                      }
                      
                      return (
                        <Tag color={color} icon={icon}>
                          {statusValue.toUpperCase()}
                        </Tag>
                      );
                    },
                  },
                  {
                    title: 'Date',
                    dataIndex: 'createdAt',
                    key: 'createdAt',
                    render: (date) => new Date(date).toLocaleDateString('vi-VN'),
                  }
                ]}
                rowKey="id"
                pagination={{ pageSize: 5 }}
              />
            </Card>
          )}

          {selectedCard === 'customers' && (
            <Card title="Customer Management" className="shadow-sm">
              <Table 
                dataSource={users}
                columns={[
                  {
                    title: 'ID',
                    dataIndex: 'id',
                    key: 'id',
                    width: 80,
                  },
                  {
                    title: 'Avatar',
                    dataIndex: 'imageUrl',
                    key: 'imageUrl',
                    width: 80,
                    render: (imageUrl) => (
                      <Avatar 
                        src={imageUrl || 'https://joeschmoe.io/api/v1/random'} 
                        size="large"
                      />
                    ),
                  },
                  {
                    title: 'Name',
                    dataIndex: 'name',
                    key: 'name',
                    render: (name) => name || 'Not provided',
                  },
                  {
                    title: 'Username',
                    dataIndex: 'username',
                    key: 'username',
                  },
                  {
                    title: 'Email',
                    dataIndex: 'email',
                    key: 'email',
                    render: (email) => email || 'Not provided',
                  },
                  {
                    title: 'Role',
                    dataIndex: 'role',
                    key: 'role',
                    width: 100,
                    render: (role) => (
                      <Tag color={role === 'admin' ? 'blue' : 'green'}>
                        {role.toUpperCase()}
                      </Tag>
                    ),
                  },
                  {
                    title: 'Join Date',
                    dataIndex: 'dateCreate',
                    key: 'dateCreate',
                    render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : 'Not provided',
                  },
                  {
                    title: 'Phone',
                    dataIndex: 'phoneNumber',
                    key: 'phoneNumber',
                    render: (phone) => phone || 'Not provided',
                  },
                  {
                    title: 'Address',
                    dataIndex: 'address',
                    key: 'address',
                    render: (address) => address || 'Not provided',
                  },
                  {
                    title: 'Actions',
                    key: 'actions',
                    width: 120,
                    render: (_, record) => (
                      <Space>
                        <Button 
                          type="primary" 
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => handleEditUser(record)}
                        >
                          Edit
                        </Button>
                      </Space>
                    ),
                  }
                ]}
                rowKey="id"
                pagination={{ pageSize: 5 }}
              />
            </Card>
          )}
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow">
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
              className={`bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer ${activeSection === 'promotions' ? 'ring-1 ring-blue-500' : ''}`}
              onClick={() => handleSectionClick('promotions')}
            >
              <div className="flex items-center space-x-3">
                <div className="bg-red-50 rounded-full p-2">
                  <TagsOutlined className="text-red-500 text-lg" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-800">Promotions</h2>
                  <p className="text-sm text-gray-500">Manage promotions</p>
                </div>
              </div>
            </div>
          </div>

          {/* Active Section Content */}
          <div className="mt-6 mb-24">
            {renderActiveSection()}
          </div>
        </div>
      </div>

      <Modal
        title="Edit User"
        open={isEditModalVisible}
        onOk={handleEditModalOk}
        onCancel={handleEditModalCancel}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please input the name!' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: 'Please input the username!' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please input the email!' },
              { type: 'email', message: 'Please input a valid email!' }
            ]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Please select the role!' }]}
          >
            <Select>
              <Select.Option value="user">User</Select.Option>
              <Select.Option value="admin">Admin</Select.Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="phoneNumber"
            label="Phone Number"
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="address"
            label="Address"
          >
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Add Promotion Modal */}
      <Modal
        title={editingPromotion ? "Edit Voucher" : "Add New Voucher"}
        open={isPromotionModalVisible}
        onOk={handlePromotionSubmit}
        onCancel={() => {
          setIsPromotionModalVisible(false);
          promotionForm.resetFields();
          setEditingPromotion(null);
        }}
        width={600}
      >
        <Form
          form={promotionForm}
          layout="vertical"
        >
          <Form.Item
            name="code"
            label="Voucher Code"
            rules={[{ required: true, message: 'Please input the voucher code!' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="type"
            label="Discount Type"
            rules={[{ required: true, message: 'Please select the discount type!' }]}
          >
            <Select>
              <Select.Option value="percentage">Percentage</Select.Option>
              <Select.Option value="fixed">Fixed Amount</Select.Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="discount"
            label="Discount Value"
            rules={[
              { required: true, message: 'Please input the discount value!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const type = getFieldValue('type');
                  const numValue = Number(value);
                  if (type === 'percentage') {
                    if (numValue < 0 || numValue > 100) {
                      return Promise.reject(new Error('Percentage must be between 0 and 100!'));
                    }
                  } else {
                    if (numValue <= 0) {
                      return Promise.reject(new Error('Fixed amount must be greater than 0!'));
                    }
                  }
                  return Promise.resolve();
                },
              }),
            ]}
            getValueFromEvent={(e) => Number(e.target.value)}
          >
            <Input 
              type="number" 
              addonAfter={({ getFieldValue }) => getFieldValue('type') === 'percentage' ? '%' : 'VNĐ'}
              formatter={(value, { getFieldValue }) => {
                const type = getFieldValue('type');
                if (type === 'percentage') {
                  return `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                }
                return `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
              }}
              parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>
          
          <Form.Item
            name="minOrder"
            label="Minimum Order Amount (VNĐ)"
            rules={[
              { required: true, message: 'Please input the minimum order amount!' },
              {
                validator(_, value) {
                  const numValue = Number(value);
                  if (isNaN(numValue) || numValue < 0) {
                    return Promise.reject(new Error('Minimum order must be greater than or equal to 0!'));
                  }
                  return Promise.resolve();
                },
              },
            ]}
            getValueFromEvent={(e) => Number(e.target.value)}
          >
            <Input 
              type="number" 
              min={0} 
              addonAfter="VNĐ"
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>
          
          <Form.Item
            name="startDate"
            label="Start Date"
            rules={[{ required: true, message: 'Please select the start date!' }]}
          >
            <Input type="date" />
          </Form.Item>
          
          <Form.Item
            name="endDate"
            label="End Date"
            rules={[{ required: true, message: 'Please select the end date!' }]}
          >
            <Input type="date" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Admin; 