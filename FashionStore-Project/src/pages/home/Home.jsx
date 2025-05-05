import React, { useState, useEffect } from "react";
import BannerHeader from "../../components/BannerHeader";
import ProductsList from "../../components/ProductsList";

const Home = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Fetch sản phẩm từ API
    const fetchProducts = async () => {
      const response = await fetch("http://localhost:3001/products");
      const data = await response.json();
      setProducts(data.slice(0, 8)); // Lấy 8 sản phẩm đầu tiên
    };
    fetchProducts();
  }, []);

  return (
    <div>
      <BannerHeader />
      <ProductsList data={products} itemsPerPage={8} />
    </div>
  );
};

export default Home;