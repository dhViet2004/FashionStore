import React, { useEffect, useState } from 'react';
import ProductCard from '../../components/ProductCard'; // Đường dẫn tới ProductCard

const Favourite = () => {
  const [favourites, setFavourites] = useState([]); // Danh sách yêu thích

  useEffect(() => {
    // Lấy thông tin người dùng từ localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.favourite) {
      setFavourites(user.favourite); // Gán danh sách yêu thích từ user
    }
  }, []);

  // Phân loại sản phẩm theo danh mục
  const categorizedFavourites = {
    Jeans: favourites.filter((item) => item.category === 'Jeans'),
    Jackets: favourites.filter((item) => item.category === 'Jackets'),
    Shoes: favourites.filter((item) => item.category === 'Shoes'),
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Sản phẩm yêu thích</h1>

      {favourites.length > 0 ? (
        <>
          {/* Jeans */}
          {categorizedFavourites.Jeans.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Jeans</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {categorizedFavourites.Jeans.map((item) => (
                  <ProductCard
                    key={item.id}
                    product={item} // Truyền sản phẩm vào ProductCard
                    onAddToCart={() => console.log(`Thêm vào giỏ hàng: ${item.name}`)} // Hàm xử lý thêm vào giỏ hàng
                    onPayNow={() => console.log(`Thanh toán ngay: ${item.name}`)} // Hàm xử lý thanh toán
                  />
                ))}
              </div>
            </div>
          )}

          {/* Jackets */}
          {categorizedFavourites.Jackets.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Jackets</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {categorizedFavourites.Jackets.map((item) => (
                  <ProductCard
                    key={item.id}
                    product={item} // Truyền sản phẩm vào ProductCard
                    onAddToCart={() => console.log(`Thêm vào giỏ hàng: ${item.name}`)} // Hàm xử lý thêm vào giỏ hàng
                    onPayNow={() => console.log(`Thanh toán ngay: ${item.name}`)} // Hàm xử lý thanh toán
                  />
                ))}
              </div>
            </div>
          )}

          {/* Shoes */}
          {categorizedFavourites.Shoes.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Shoes</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {categorizedFavourites.Shoes.map((item) => (
                  <ProductCard
                    key={item.id}
                    product={item} // Truyền sản phẩm vào ProductCard
                    onAddToCart={() => console.log(`Thêm vào giỏ hàng: ${item.name}`)} // Hàm xử lý thêm vào giỏ hàng
                    onPayNow={() => console.log(`Thanh toán ngay: ${item.name}`)} // Hàm xử lý thanh toán
                  />
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <p className="text-gray-600">Bạn chưa có sản phẩm yêu thích nào.</p>
      )}
    </div>
  );
};

export default Favourite;