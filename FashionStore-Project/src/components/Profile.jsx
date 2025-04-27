import React, { useState, useEffect, useRef } from 'react';
import { Card, Avatar, Button, Modal, Form, Input, DatePicker, message, Tabs, Table, Tag, Badge, Upload } from 'antd';
import { UserOutlined, EditOutlined, ShoppingCartOutlined, HistoryOutlined, TruckOutlined, MenuOutlined, CameraOutlined, UploadOutlined } from '@ant-design/icons';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaIdCard } from 'react-icons/fa';
import { format as formatDate, isValid, parseISO } from 'date-fns';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAvatarModalVisible, setIsAvatarModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('profile');
  const [cartItems, setCartItems] = useState([]);
  const [orderHistory, setOrderHistory] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [avatarUrl, setAvatarUrl] = useState('');
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const loadUser = () => {
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          setUser(JSON.parse(userData));
    } else {
      setError('No user data found');
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        setError('Error loading user data');
      } finally {
      setLoading(false);
    }
    };

    loadUser();
  }, []);

  // Mock data for cart, order history, and active orders
  useEffect(() => {
    if (user && user.role === 'user') {
      // Mock cart items
      setCartItems([
        { id: 1, name: 'Classic White T-Shirt', price: 29.99, quantity: 2, image: 'https://res.cloudinary.com/dh1o42tjk/image/upload/v1744644438/VayNgan-Xam_sh0xst.jpg' },
        { id: 2, name: 'Slim Fit Jeans', price: 59.99, quantity: 1, image: 'https://res.cloudinary.com/dh1o42tjk/image/upload/v1744644438/Vay-Trung-Den_gdsj9u.jpg' },
      ]);

      // Mock order history
      setOrderHistory([
        { id: 'ORD-001', date: '2023-05-15', total: 119.97, status: 'Delivered', items: 3 },
        { id: 'ORD-002', date: '2023-04-22', total: 89.99, status: 'Delivered', items: 2 },
        { id: 'ORD-003', date: '2023-03-10', total: 199.99, status: 'Delivered', items: 1 },
      ]);

      // Mock active orders
      setActiveOrders([
        { id: 'ORD-004', date: '2023-06-01', total: 149.99, status: 'Processing', items: 2, estimatedDelivery: '2023-06-05' },
        { id: 'ORD-005', date: '2023-06-10', total: 79.99, status: 'Shipped', items: 1, estimatedDelivery: '2023-06-12', trackingNumber: 'TRK123456789' },
      ]);
    }
  }, [user]);

  const formatDateSafely = (dateString, format) => {
    if (!dateString || dateString === "Not provided") return "Not provided";
    try {
      const date = parseISO(dateString);
      return isValid(date) ? formatDate(date, format) : "Not provided";
    } catch (error) {
      console.error('Error formatting date:', error);
      return "Not provided";
    }
  };

  const handleEdit = () => {
    form.setFieldsValue({
      name: user.name || user.full_name,
      birthday: user.birthday ? new Date(user.birthday) : null,
      phone: user.phoneNumber,
      address: user.address,
      email: user.email
    });
    setIsModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const updatedUser = {
        ...user,
        name: values.name,
        full_name: values.name,
        birthday: values.birthday ? formatDate(values.birthday, 'yyyy-MM-dd') : null,
        phoneNumber: values.phone,
        address: values.address,
        email: values.email
      };

      // Update user in the database
      const response = await fetch(`http://localhost:3001/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser),
      });

      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setIsModalVisible(false);
        message.success('Profile updated successfully');
      } else {
        message.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      message.error('Failed to update profile');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered':
        return 'green';
      case 'Processing':
        return 'blue';
      case 'Shipped':
        return 'purple';
      case 'Cancelled':
        return 'red';
      default:
        return 'default';
    }
  };

  const cartColumns = [
    {
      title: 'Product',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div className="flex items-center">
          <img src={record.image} alt={text} className="w-12 h-12 object-cover rounded mr-3" />
          <span>{text}</span>
        </div>
      ),
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
    {
      title: 'Action',
      key: 'action',
      render: () => (
        <Button type="link" danger>Remove</Button>
      ),
    },
  ];

  const orderColumns = [
    {
      title: 'Order ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => formatDateSafely(date, 'MMM d, yyyy'),
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (total) => `$${total.toFixed(2)}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
    },
  ];

  const activeOrderColumns = [
    ...orderColumns,
    {
      title: 'Estimated Delivery',
      dataIndex: 'estimatedDelivery',
      key: 'estimatedDelivery',
      render: (date) => formatDateSafely(date, 'MMM d, yyyy'),
    },
    {
      title: 'Tracking',
      dataIndex: 'trackingNumber',
      key: 'trackingNumber',
      render: (tracking) => tracking ? (
        <Button type="link" size="small">View</Button>
      ) : null,
    },
  ];

  // Mobile-optimized columns
  const mobileCartColumns = [
    {
      title: 'Product',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div className="flex items-center">
          <img src={record.image} alt={text} className="w-10 h-10 object-cover rounded mr-2" />
          <div>
            <div className="font-medium">{text}</div>
            <div className="text-xs text-gray-500">Qty: {record.quantity} × ${record.price.toFixed(2)}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: () => (
        <Button type="link" danger size="small">Remove</Button>
      ),
    },
  ];

  const mobileOrderColumns = [
    {
      title: 'Order',
      dataIndex: 'id',
      key: 'id',
      render: (id, record) => (
        <div>
          <div className="font-medium">{id}</div>
          <div className="text-xs text-gray-500">{formatDateSafely(record.date, 'MMM d, yyyy')}</div>
          <div className="text-xs">Items: {record.items} | ${record.total.toFixed(2)}</div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
    },
  ];

  const mobileActiveOrderColumns = [
    {
      title: 'Order',
      dataIndex: 'id',
      key: 'id',
      render: (id, record) => (
        <div>
          <div className="font-medium">{id}</div>
          <div className="text-xs text-gray-500">{formatDateSafely(record.date, 'MMM d, yyyy')}</div>
          <div className="text-xs">Items: {record.items} | ${record.total.toFixed(2)}</div>
          <div className="text-xs text-gray-500">Est. Delivery: {formatDateSafely(record.estimatedDelivery, 'MMM d')}</div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <div>
          <Tag color={getStatusColor(status)}>{status}</Tag>
          {record.trackingNumber && (
            <Button type="link" size="small" className="p-0 mt-1">Track</Button>
          )}
        </div>
      ),
    },
  ];

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setIsUploading(true);
        
        // Create a local URL for immediate preview
        const localImageUrl = URL.createObjectURL(file);
        setAvatarUrl(localImageUrl);
        
        // Convert the file to base64 for storage
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64String = reader.result;
          
          // Update user with new avatar
          const updatedUser = {
            ...user,
            imageUrl: base64String
          };
          
          // Update in localStorage
          localStorage.setItem('user', JSON.stringify(updatedUser));
          
          // Update in db.json via JsonServer
          try {
            const response = await fetch(`http://localhost:3001/users/${user.id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(updatedUser),
            });
            
            if (response.ok) {
              setUser(updatedUser);
              message.success('Avatar updated successfully');
              setIsAvatarModalVisible(false);
            } else {
              throw new Error('Failed to update avatar in database');
            }
          } catch (error) {
            console.error('Error updating avatar in database:', error);
            message.error('Failed to save avatar to database');
          } finally {
            setIsUploading(false);
          }
        };
        
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Error processing avatar:', error);
        message.error('Failed to process avatar');
        setIsUploading(false);
      }
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  const items = [
    {
      key: 'profile',
      label: (
        <span>
          <UserOutlined />
          <span className="hidden sm:inline ml-1">Profile</span>
        </span>
      ),
      children: (
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="bg-navy-600 rounded-t-xl p-4 sm:p-6 text-white shadow-lg">
            <div className="flex flex-col sm:flex-row items-center">
              <div className="mb-4 sm:mb-0 sm:mr-6 relative">
                <Avatar
                  size={isMobile ? 80 : 120}
            src={user.imageUrl}
                  icon={<UserOutlined />}
                  className="border-4 border-white shadow-lg"
          />
                <div 
                  className="absolute bottom-0 right-0 bg-navy-600 rounded-full p-1 cursor-pointer border-2 border-white"
                  onClick={() => setIsAvatarModalVisible(true)}
                >
                  <CameraOutlined className="text-white text-sm sm:text-base" />
        </div>
            </div>
              <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold">{user.name || user.full_name}</h1>
                <p className="text-lg sm:text-xl opacity-90">@{user.username}</p>
            </div>
            </div>
            </div>
            
          {/* Profile Content */}
          <div className="bg-white rounded-b-xl shadow-lg p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3 sm:mb-0">Profile Information</h2>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={handleEdit}
                className="bg-navy-600 hover:bg-navy-700 w-full sm:w-auto"
                >
                Edit Profile
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="flex items-center p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="bg-navy-100 p-2 sm:p-3 rounded-full mr-3 sm:mr-4">
                    <FaUser className="text-navy-600 text-lg sm:text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Username</p>
                    <p className="font-medium">{user.username}</p>
                  </div>
                </div>

                <div className="flex items-center p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="bg-navy-100 p-2 sm:p-3 rounded-full mr-3 sm:mr-4">
                    <FaEnvelope className="text-navy-600 text-lg sm:text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{user.email || "Not provided"}</p>
                  </div>
                </div>

                <div className="flex items-center p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="bg-navy-100 p-2 sm:p-3 rounded-full mr-3 sm:mr-4">
                    <FaCalendarAlt className="text-navy-600 text-lg sm:text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Birthday</p>
                    <p className="font-medium">{formatDateSafely(user.birthday, 'MMMM d, yyyy')}</p>
          </div>
        </div>
      </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div className="flex items-center p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="bg-navy-100 p-2 sm:p-3 rounded-full mr-3 sm:mr-4">
                    <FaPhone className="text-navy-600 text-lg sm:text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="font-medium">{user.phoneNumber || "Not provided"}</p>
                  </div>
                </div>

                <div className="flex items-center p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="bg-navy-100 p-2 sm:p-3 rounded-full mr-3 sm:mr-4">
                    <FaMapMarkerAlt className="text-navy-600 text-lg sm:text-xl" />
                  </div>
            <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium">{user.address || "Not provided"}</p>
                  </div>
                </div>

                <div className="flex items-center p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="bg-navy-100 p-2 sm:p-3 rounded-full mr-3 sm:mr-4">
                    <FaIdCard className="text-navy-600 text-lg sm:text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Member Since</p>
                    <p className="font-medium">{formatDateSafely(user.dateCreate, 'MMMM d, yyyy')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  // Add shopping cart tab for users
  if (user && user.role === 'user') {
    items.push({
      key: 'cart',
      label: (
        <span>
          <ShoppingCartOutlined />
          <span className="hidden sm:inline ml-1">Cart</span>
          <Badge count={cartItems.length} style={{ marginLeft: '8px' }} />
        </span>
      ),
      children: (
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6">Shopping Cart</h2>
          {cartItems.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <Table 
                  columns={isMobile ? mobileCartColumns : cartColumns} 
                  dataSource={cartItems} 
                  rowKey="id"
                  pagination={false}
                  className="border border-gray-200"
                  size={isMobile ? "small" : "default"}
                />
              </div>
              <div className="flex justify-end mt-4 sm:mt-6">
                <Button type="primary" size={isMobile ? "middle" : "large"} className="bg-navy-600 hover:bg-navy-700">
                  Proceed to Checkout
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-6 sm:py-8">
              <ShoppingCartOutlined className="text-4xl sm:text-5xl text-gray-300 mb-3 sm:mb-4" />
              <p className="text-lg sm:text-xl text-gray-500">Your cart is empty</p>
              <Button type="primary" className="mt-3 sm:mt-4 bg-navy-600 hover:bg-navy-700">
                Start Shopping
              </Button>
            </div>
          )}
        </div>
      ),
    });

    // Add order history tab
    items.push({
      key: 'history',
      label: (
        <span>
          <HistoryOutlined />
          <span className="hidden sm:inline ml-1">History</span>
        </span>
      ),
      children: (
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6">Order History</h2>
          <div className="overflow-x-auto">
            <Table 
              columns={isMobile ? mobileOrderColumns : orderColumns} 
              dataSource={orderHistory} 
              rowKey="id"
              className="border border-gray-200"
              size={isMobile ? "small" : "default"}
            />
          </div>
        </div>
      ),
    });

    // Add active orders tab
    items.push({
      key: 'orders',
      label: (
        <span>
          <TruckOutlined />
          <span className="hidden sm:inline ml-1">Orders</span>
          <Badge count={activeOrders.length} style={{ marginLeft: '8px' }} />
        </span>
      ),
      children: (
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6">Active Orders</h2>
          {activeOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <Table 
                columns={isMobile ? mobileActiveOrderColumns : activeOrderColumns} 
                dataSource={activeOrders} 
                rowKey="id"
                pagination={false}
                className="border border-gray-200"
                size={isMobile ? "small" : "default"}
              />
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8">
              <TruckOutlined className="text-4xl sm:text-5xl text-gray-300 mb-3 sm:mb-4" />
              <p className="text-lg sm:text-xl text-gray-500">No active orders</p>
        </div>
      )}
        </div>
      ),
    });
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <style>
        {`
          .bg-navy-100 {
            background-color: #e6f0ff;
          }
          .bg-navy-600 {
            background-color: #1a365d;
          }
          .bg-navy-700 {
            background-color: #153e75;
          }
          .text-navy-600 {
            color: #1a365d;
          }
        `}
      </style>
      
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab} 
        items={items}
        className="mb-4 sm:mb-6"
        tabPosition={isMobile ? "top" : "top"}
        centered={isMobile}
      />

      <Modal
        title="Edit Profile"
        open={isModalVisible}
        onOk={handleSave}
        onCancel={() => setIsModalVisible(false)}
        okText="Save"
        cancelText="Cancel"
        width={isMobile ? "95%" : 600}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please input your name!' }]}
          >
            <Input prefix={<UserOutlined />} />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input prefix={<FaEnvelope className="text-gray-400" />} />
          </Form.Item>
          <Form.Item
            name="birthday"
            label="Birthday"
          >
            <DatePicker className="w-full" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Phone Number"
          >
            <Input prefix={<FaPhone className="text-gray-400" />} />
          </Form.Item>
          <Form.Item
            name="address"
            label="Address"
          >
            <Input.TextArea rows={3} prefix={<FaMapMarkerAlt className="text-gray-400" />} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Change Profile Picture"
        open={isAvatarModalVisible}
        onCancel={() => setIsAvatarModalVisible(false)}
        footer={null}
        width={isMobile ? "95%" : 400}
      >
        <div className="flex flex-col items-center">
          <div className="mb-4">
            <Avatar
              size={120}
              src={avatarUrl || user.imageUrl}
              icon={<UserOutlined />}
              className="border-4 border-navy-600 shadow-lg"
            />
          </div>
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleAvatarChange}
            accept="image/*"
            style={{ display: 'none' }}
          />
          <Button 
            icon={<UploadOutlined />} 
            className="bg-navy-600 hover:bg-navy-700 text-white"
            onClick={handleAvatarClick}
            loading={isUploading}
            disabled={isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload New Picture'}
          </Button>
          <p className="text-gray-500 text-sm mt-2">
            Recommended: Square image, at least 200x200 pixels
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default Profile;
