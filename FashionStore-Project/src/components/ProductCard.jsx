import { FaStar, FaRegStar } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';  // Sử dụng useNavigate thay vì history.push

const ProductCard = ({ product }) => {
  const navigate = useNavigate();  // Hook để điều hướng đến trang chi tiết sản phẩm

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

  // Handle click vào sản phẩm
  const handleProductClick = () => {
    navigate(`/products/${product.id}`);  // Điều hướng tới trang chi tiết sản phẩm
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:scale-105 hover:translate-y-2 cursor-pointer"
      onClick={handleProductClick}  // Khi click vào sản phẩm, sẽ mở trang chi tiết
    >
      <div className="relative">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
        {product.stock < 10 && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
            Low Stock
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{product.name}</h3>
        <p className="text-blue-600 font-bold mb-2">${product.price.toFixed(2)}</p>
        <p className="text-sm text-gray-600 mb-2">{product.description}</p>
        <div className="flex items-center mb-2">
          <div className="flex mr-2">{renderStars(product.rating)}</div>
          <span className="text-sm text-gray-500">({product.reviews} reviews)</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Category: {product.category}</span>
          <span
            className={`font-medium ${product.stock > 10 ? 'text-green-600' : 'text-red-600'}`}
          >
            Stock: {product.stock}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
