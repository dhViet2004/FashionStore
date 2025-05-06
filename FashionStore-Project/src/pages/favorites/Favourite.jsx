import React, { useEffect, useState } from 'react';
import ProductCard from '../../components/ProductCard'; // Đường dẫn tới ProductCard

const Favourite = () => {
  const [favourites, setFavourites] = useState([]); // Danh sách yêu thích

  useEffect(() => {
    // Lấy thông tin người dùng từ localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.favorite) {
      // Lọc ra các sản phẩm có đầy đủ thông tin (không phải chỉ là ID)
      const fullProducts = user.favorite.filter(item => typeof item === 'object' && item.imageUrl);
      setFavourites(fullProducts);
    }
  }, []);

  // Phân loại sản phẩm theo danh mục
  const categorizedFavourites = favourites.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Sản phẩm yêu thích</h1>

      {favourites.length > 0 ? (
        Object.entries(categorizedFavourites).map(([category, products]) => (
          <div key={category} className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{category}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((item) => (
                <ProductCard
                  key={item.id}
                  product={item} // Truyền sản phẩm vào ProductCard
                  onAddToCart={() => console.log(`Thêm vào giỏ hàng: ${item.name}`)} // Hàm xử lý thêm vào giỏ hàng
                  onPayNow={() => console.log(`Thanh toán ngay: ${item.name}`)} // Hàm xử lý thanh toán
                />
              ))}
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-600">Bạn chưa có sản phẩm yêu thích nào.</p>
      )}
    </div>
  );
};

export default Favourite;