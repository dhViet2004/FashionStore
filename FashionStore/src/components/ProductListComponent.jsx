import React, { useState, useEffect } from 'react';
import { Card, List, Select, Button, Space, Tag, Spin, Alert, Image, Divider } from 'antd';
import { 
  AppstoreOutlined, 
  UnorderedListOutlined,
  ShoppingCartOutlined,
  EyeOutlined,
  FilterOutlined
} from '@ant-design/icons';

const { Meta } = Card;
const { Option } = Select;

// Hàm định dạng tiền tệ VNĐ
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

const ProductListComponent = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedType, setSelectedType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('https://67cbd91f3395520e6af66c0e.mockapi.io/products');
        if (!response.ok) throw new Error('Không thể tải dữ liệu sản phẩm');
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Lấy danh sách loại sản phẩm duy nhất
  const productTypes = ['all', ...new Set(products.map(product => product.type))];

  // Lọc sản phẩm theo loại và tìm kiếm
  const filteredProducts = products.filter(product => {
    const matchesType = selectedType === 'all' || product.type === selectedType;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <Spin size="large" tip="Đang tải sản phẩm..." />
    </div>
  );

  if (error) return (
    <div className="p-4">
      <Alert 
        message="Lỗi tải dữ liệu" 
        description={error} 
        type="error" 
        showIcon 
        closable 
      />
    </div>
  );

  // Component Card sản phẩm
  const ProductGridItem = ({ product }) => (
    <Card
      hoverable
      cover={
        <Image
          alt={product.name}
          src={product.image || 'https://via.placeholder.com/300'}
          className="h-48 object-cover"
          preview={false}
          fallback="https://via.placeholder.com/300"
        />
      }
      actions={[
        <Button type="primary" icon={<ShoppingCartOutlined />} block>
          Thêm giỏ hàng
        </Button>,
        <Button icon={<EyeOutlined />} block>
          Chi tiết
        </Button>
      ]}
    >
      <Meta
        title={<span className="font-medium">{product.name}</span>}
        description={
          <div className="space-y-2 mt-2">
            <Tag color="blue" className="mb-2">{product.type}</Tag>
            <p className="text-gray-600 line-clamp-2 text-sm">{product.description}</p>
            <Divider className="my-2" />
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Size: {product.size.join(', ')}</span>
              <span className="text-gray-500">Còn: {product.quantity}</span>
            </div>
            <div className="text-lg font-bold text-red-600 mt-2">
              {formatCurrency(product.price)}
            </div>
          </div>
        }
      />
    </Card>
  );

  // Component List sản phẩm
  const ProductListItem = ({ product }) => (
    <List.Item
      className="hover:bg-gray-50 p-4"
      extra={
        <Image
          width={160}
          height={120}
          alt={product.name}
          src={product.image}
          className="rounded-lg object-cover"
          preview={false}
        />
      }
      actions={[
        <Button type="primary" icon={<ShoppingCartOutlined />}>Mua ngay</Button>,
        <Button icon={<EyeOutlined />}>Xem nhanh</Button>
      ]}
    >
      <List.Item.Meta
        title={
          <div className="flex items-center gap-2">
            <span className="font-medium">{product.name}</span>
            <Tag color="blue">{product.type}</Tag>
          </div>
        }
        description={
          <div className="space-y-2">
            <p className="text-gray-600 text-sm">{product.description}</p>
            <div className="flex gap-4 text-sm text-gray-500">
              <span>Size: {product.size.join(', ')}</span>
              <span>Tồn kho: {product.quantity}</span>
            </div>
            <div className="text-lg font-bold text-red-600">
              {formatCurrency(product.price)}
            </div>
          </div>
        }
      />
    </List.Item>
  );

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header và bộ lọc */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Cửa hàng thời trang</h1>
        
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <Space>
            <Button 
              icon={<AppstoreOutlined />} 
              type={viewMode === 'grid' ? 'primary' : 'default'}
              onClick={() => setViewMode('grid')}
            >
              Dạng lưới
            </Button>
            <Button 
              icon={<UnorderedListOutlined />} 
              type={viewMode === 'list' ? 'primary' : 'default'}
              onClick={() => setViewMode('list')}
            >
              Dạng danh sách
            </Button>
          </Space>

          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <Select
              suffixIcon={<FilterOutlined />}
              placeholder="Lọc theo danh mục"
              style={{ width: 200 }}
              onChange={setSelectedType}
              value={selectedType}
            >
              {productTypes.map(type => (
                <Option key={type} value={type}>
                  {type === 'all' ? 'Tất cả sản phẩm' : type}
                </Option>
              ))}
            </Select>

            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              className="border rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Thống kê */}
      <div className="mb-4 text-sm text-gray-600">
        Hiển thị <span className="font-medium">{filteredProducts.length}</span> sản phẩm
      </div>

      {/* Hiển thị sản phẩm */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-10">
          <Image
            src="https://cdn-icons-png.flaticon.com/512/4076/4076478.png"
            width={120}
            preview={false}
          />
          <p className="text-gray-500 mt-4">Không tìm thấy sản phẩm phù hợp</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <ProductGridItem key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <List
            itemLayout="vertical"
            dataSource={filteredProducts}
            renderItem={product => <ProductListItem product={product} />}
          />
        </div>
      )}
    </div>
  );
};

export default ProductListComponent;