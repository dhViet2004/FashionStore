import { FaStar, FaRegStar, FaShoppingCart, FaCreditCard, FaHeart } from 'react-icons/fa'; // Import thêm icon
import { useNavigate } from 'react-router-dom'; // Sử dụng useNavigate thay vì history.push
import { useNotify } from '../context/notifyContext';
import { useCart } from '../context/CartContext';
import { useEffect, useState } from 'react';
import { Button, Tooltip, message } from 'antd';
import { ShoppingCartOutlined, CreditCardOutlined } from '@ant-design/icons';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const ProductCard = ({ product, onPayNow }) => {
  const { addToCart } = useCart();
  const { showNotification } = useNotify();
  const navigate = useNavigate(); // Hook để điều hướng đến trang chi tiết sản phẩm
  const [isFavorite, setIsFavorite] = useState(false); // Trạng thái yêu thích

  useEffect(() => {
    // Kiểm tra xem sản phẩm có nằm trong danh sách yêu thích không
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.favourite) {
      const isFav = user.favourite.some((item) => item.id === product.id);
      setIsFavorite(isFav);
    }
  }, [product.id]);

  const handleAddToCart = async () => {
    if (!product) return;

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      message.error('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      navigate('/login');
      return;
    }

    const cartItem = {
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      size: "M",
      imageUrl: product.imageUrl,
      stock: product.stock,
      sizes: {
        size: "M",
        stock: product.stock - 1,
      }
    };

    const success = await addToCart(cartItem);
    if (success) {
      showNotification(
        <div className="flex items-center">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-8 h-8 rounded mr-2 object-cover"
          />
          <div>
            <p className="font-medium">Đã thêm vào giỏ hàng</p>
            <p className="text-sm">
              {product.name} (Size: M)
            </p>
          </div>
        </div>,
        'success'
      );
    }
  };

  const handleToggleFavorite = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      message.error('Vui lòng đăng nhập để thêm sản phẩm vào danh sách yêu thích');
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      navigate('/login');
      return;
    }

    const updatedFavorites = user.favourite || [];
    const isFav = updatedFavorites.some((item) => item.id === product.id);

    if (isFav) {
      // Nếu sản phẩm đã có trong danh sách yêu thích, xóa nó
      const newFavorites = updatedFavorites.filter((item) => item.id !== product.id);
      user.favourite = newFavorites;
      setIsFavorite(false);
      showNotification(
        <div className="flex items-center">
          <FaHeart className="text-gray-400 mr-2" />
          <p className="font-medium">{product.name} đã được xóa khỏi danh sách yêu thích!</p>
        </div>,
        'info'
      );
    } else {
      // Nếu sản phẩm chưa có trong danh sách yêu thích, thêm nó
      updatedFavorites.push(product);
      user.favourite = updatedFavorites;
      setIsFavorite(true);
      showNotification(
        <div className="flex items-center">
          <FaHeart className="text-pink-500 mr-2" />
          <p className="font-medium">{product.name} đã được thêm vào danh sách yêu thích!</p>
        </div>,
        'success'
      );
    }

    // Cập nhật localStorage
    localStorage.setItem('user', JSON.stringify(user));
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<FaStar key={i} className="text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<FaStar key={i} className="text-yellow-400" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-yellow-400" />);
      }
    }
    return stars;
  };

  const handleProductClick = () => {
    navigate(`/products/${product.id}`); // Điều hướng tới trang chi tiết sản phẩm
  };

  return (
    <div
      className="relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:scale-105 hover:translate-y-2 cursor-pointer"
    >
      <div className="relative" onClick={handleProductClick}>
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-72 object-cover"
        />
        {product.stock < 10 && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
            Low Stock
          </span>
        )}
      </div>
      <div className="p-4 h-66 flex flex-col justify-between">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{product.name}</h3>
        <p className="text-blue-600 font-bold mb-2">{formatCurrency(product.price)}</p>
        <span
          className={`absolute right-2 top-2 text-2xl cursor-pointer ${
            isFavorite ? 'text-pink-500' : 'text-gray-400'
          }`}
          onClick={(e) => {
            e.stopPropagation(); // Ngăn chặn sự kiện click vào sản phẩm
            handleToggleFavorite(); // Gọi hàm toggle yêu thích
          }}
        >
          <FaHeart />
        </span>
        <p className="text-sm text-gray-600 mb-2">{product.description}</p>
        <div className="flex items-center mb-2">
          <div className="flex mr-2">{renderStars(product.rating)}</div>
          <span className="text-sm text-gray-500">({product.reviews} reviews)</span>
        </div>
        <div className="flex justify-between items-center text-sm mb-4">
          <span className="text-gray-600">Category: {product.category}</span>
          <span
            className={`font-medium ${product.stock > 10 ? 'text-green-600' : 'text-red-600'}`}
          >
            Stock: {product.stock}
          </span>
        </div>
        <div className="flex space-x-2 justify-center mt-4">
          <Tooltip title="Thêm vào giỏ hàng">
            <Button
              type="default"
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart(product);
              }}
              className="flex items-center justify-center w-1/2 h-10 bg-white text-blue-600 border border-blue-600 rounded-lg transition-all duration-300 hover:bg-blue-50 hover:scale-105"
            >
              <ShoppingCartOutlined className="text-lg mr-2" />
              <span className="text-sm font-medium">Giỏ hàng</span>
            </Button>
          </Tooltip>
          <Tooltip title="Thanh toán nhanh">
            <Button
              type="primary"
              onClick={(e) => {
                e.stopPropagation();
                onPayNow(product);
              }}
              className="flex items-center justify-center w-1/2 h-10 bg-gradient-to-r from-blue-600 via-indigo-700 to-indigo-800 hover:from-blue-700 hover:via-indigo-800 hover:to-indigo-900 text-white border-none rounded-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <CreditCardOutlined className="text-lg mr-2" />
              <span className="text-sm font-medium">Mua ngay</span>
            </Button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;