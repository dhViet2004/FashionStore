import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Categories = () => {
  const [favoriteImage, setFavoriteImage] = useState("favorites.jpg"); // Ảnh mặc định cho Yêu thích
  const [jeansImage, setJeansImage] = useState("jeans.jpg"); // Ảnh mặc định cho Jeans
  const [jacketsImage, setJacketsImage] = useState("jackets.jpg"); // Ảnh mặc định cho Jackets
  const [shoesImage, setShoesImage] = useState("shoes.jpg"); // Ảnh mặc định cho Shoes

  useEffect(() => {
    // Lấy thông tin người dùng từ localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.favourite && user.favourite.length > 0) {
      // Lấy ảnh đầu tiên trong danh sách yêu thích
      setFavoriteImage(user.favourite[0]?.imageUrl || "favorites.jpg");
    }

    // Fetch dữ liệu sản phẩm từ API
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:3001/products');
        const products = await response.json();

        // Lấy ảnh đầu tiên của từng loại sản phẩm
        const jeans = products.find((item) => item.category === 'Jeans');
        const jackets = products.find((item) => item.category === 'Jackets');
        const shoes = products.find((item) => item.category === 'Shoes');

        setJeansImage(jeans?.imageUrl || "jeans.jpg");
        setJacketsImage(jackets?.imageUrl || "jackets.jpg");
        setShoesImage(shoes?.imageUrl || "shoes.jpg");
      } catch (error) {
        console.error('Lỗi khi fetch dữ liệu sản phẩm:', error);
      }
    };

    fetchProducts();
  }, []);

  const categories = [
    {
      id: 1,
      name: "Yêu thích",
      image: favoriteImage, // Sử dụng ảnh từ danh sách yêu thích
      description: "Xem các sản phẩm bạn đã yêu thích",
      link: "/favorites"
    },
    {
      id: 2,
      name: "Jeans",
      image: jeansImage, // Sử dụng ảnh từ API
      description: "Khám phá các sản phẩm quần Jeans thời trang",
      link: "/products?category=jeans"
    },
    {
      id: 3,
      name: "Jackets",
      image: jacketsImage, // Sử dụng ảnh từ API
      description: "Khám phá các sản phẩm áo khoác phong cách",
      link: "/products?category=jackets"
    },
    {
      id: 4,
      name: "Shoes",
      image: shoesImage, // Sử dụng ảnh từ API
      description: "Khám phá các sản phẩm giày thời trang",
      link: "/products?category=shoes"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Khám phá</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((category) => (
          <Link
            key={category.id}
            to={category.link}
            className="group"
          >
            <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 group-hover:transform group-hover:scale-105">
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                <img
                  src={category.image}
                  alt={category.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{category.name}</h2>
                <p className="text-gray-600">{category.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Categories;