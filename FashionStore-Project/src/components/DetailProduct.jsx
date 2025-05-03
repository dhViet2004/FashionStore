import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaStar, FaRegStar } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';

const DetailProduct = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState('M');

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await fetch(`http://localhost:3001/products/${productId}`);
        if (!response.ok) {
          throw new Error('Product not found');
        }
        const data = await response.json();
        setProduct(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch product details');
        setLoading(false);
      }
    };
    fetchProductDetails();
  }, [productId]);

  const handleAddToCart = async () => {
    if (!product) return;

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      toast.error('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      navigate('/login');
      return;
    }

    const cartItem = {
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      size: size,
      imageUrl: product.imageUrl,
      stock: product.stock
    };

    const success = await addToCart(cartItem);
    if (success) {
      setProduct(prev => ({
        ...prev,
        stock: prev.stock - quantity
      }));
    }
  };

  const handleBuyNow = async () => {
    const success = await handleAddToCart();
    if (success) {
      navigate('/cart');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-xl text-blue-600">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        <span>{error}</span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        <span>Product not found</span>
      </div>
    );
  }

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg shadow-md hover:bg-gray-700 transition duration-200"
        >
          Trở về
        </button>
      </div>

      <div className="flex flex-col md:flex-row items-center bg-white p-6 rounded-lg shadow-lg mb-8">
        <div className="md:w-1/4 mb-6 md:mb-0">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-auto object-cover rounded-lg shadow-md transition-transform duration-300 transform hover:scale-105"
          />
        </div>

        <div className="md:w-1/2 ml-0 md:ml-12">
          <h2 className="text-3xl font-semibold text-gray-800">{product.name}</h2>
          <span className='text-gray-600'>{product.description}</span>

          <div className="flex flex-col mb-2">
            <div className="flex items-center">
              <div className="flex mr-2">{renderStars(product.rating)}</div>
              <span className="text-sm text-gray-600">({product.rating})</span>
            </div>
            <span className="text-sm text-gray-500">({product.reviews} reviews)</span>
          </div>

          <p className="text-2xl text-blue-600 my-4">
            {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(product.price)}
          </p>

          <div className="flex items-center mb-4">
            <span className="text-gray-600">Size: </span>
            <select 
              className="ml-11 border border-gray-300 rounded-md p-2"
              value={size}
              onChange={(e) => setSize(e.target.value)}
            >
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
            </select>
          </div>

          <div className="flex items-center mb-4">
            <span>Số lượng: </span>
            <div className="ml-2">
              <button
                className='border p-2 border-gray-300'
                onClick={() => {
                  if (quantity > 1)
                    setQuantity(quantity - 1)
                }}
              >-</button>
              <input
                type="number"
                min="1"
                max={product.stock}
                className="w-12 p-2 border border-gray-300"
                value={quantity}
                onChange={(e) => {
                  const value = Math.min(Math.max(1, Number(e.target.value)), product.stock);
                  setQuantity(value);
                }}
              />
              <button
                className='border p-2 border-gray-300'
                onClick={() => {
                  if (quantity < product.stock)
                    setQuantity(quantity + 1)
                }}
              >+</button>
            </div>
            <span className='text-gray-600 ml-2 text-sm'>({product.stock} in stock)</span>
          </div>

          <div className="flex space-x-4">
            <button 
              className="w-full md:w-1/2 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-200"
              onClick={handleAddToCart}
            >
              Thêm vào giỏ hàng
            </button>
            <button 
              className="w-full md:w-1/2 px-6 py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition duration-200"
              onClick={handleBuyNow}
            >
              Mua ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailProduct;
