import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaStar, FaRegStar } from 'react-icons/fa';

const DetailProduct = () => {
  const { productId } = useParams();
  const navigate = useNavigate(); // Hook để điều hướng
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1); // Số lượng sản phẩm

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
      {/* Nút Trở về */}
      <div className="mb-4">
        <button
          onClick={() => navigate(-1)}  // Quay lại trang trước
          className="px-6 py-3 bg-gray-600 text-white rounded-lg shadow-md hover:bg-gray-700 transition duration-200"
        >
          Trở về
        </button>
      </div>

      {/* Main Product Section */}
      <div className="flex flex-col md:flex-row items-center bg-white p-6 rounded-lg shadow-lg mb-8">
        {/* Left: Product Image */}
        <div className="md:w-1/4 mb-6 md:mb-0">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-auto object-cover rounded-lg shadow-md transition-transform duration-300 transform hover:scale-105"
          />
        </div>

        {/* Right: Product Info */}
        <div className="md:w-1/2 ml-0 md:ml-12">
          {/* Product Name */}
          <h2 className="text-3xl font-semibold text-gray-800">{product.name}</h2>
          <span className='text-gray-600'>{product.description}</span>

          <div className="flex flex-col mb-2">
            <div className="flex items-center">
              <div className="flex mr-2">{renderStars(product.rating)}</div>
              <span className="text-sm text-gray-600">({product.rating})</span>
            </div>

            <span className="text-sm text-gray-500">({product.reviews} reviews)</span>
          </div>

          {/* Product Price */}
          <p className="text-2xl text-blue-600 my-4">${product.price}</p>

          {/* Product Size */}
          <div className="flex items-center mb-4">
            <span className="text-gray-600">Size: </span>
            <select className="ml-11 border border-gray-300 rounded-md p-2">
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
            </select>
          </div>

          {/* Product Quantity */}
          <div className="flex items-center mb-4 ">
            <span>Số lượng: </span>
            <div className="ml-2">
              <button
                className='border p-2  border-gray-300'
                onClick={() => {
                  if (quantity > 1)
                    setQuantity(quantity - 1)
                }}
              >-</button>
              <input
                type="number"
                defaultValue={1}
                min="1"
                className="w-12 p-2 border border-gray-300"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
              <button
                className='border p-2  border-gray-300'
                onClick={() => setQuantity(quantity + 1)}
              >+</button>
            </div>

            <span className='text-gray-600 ml-2 text-sm'>({product.stock} in stock)</span>
          </div>

          {/* Add to Cart and Buy Now Buttons */}
          <div className="flex space-x-4">
            <button className="w-full md:w-1/2 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-200">
              Add to Cart
            </button>
            <button className="w-full md:w-1/2 px-6 py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition duration-200">
              Buy Now
            </button>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {/* <div className="mt-12">
        <h3 className="text-2xl font-semibold text-gray-800 mb-6">Related Products</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* Bạn có thể thêm các sản phẩm liên quan ở đây */}
        {/* </div> */}
      {/* // </div>  */} 
    </div>
  );
};

export default DetailProduct;
