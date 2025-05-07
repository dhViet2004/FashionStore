import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ProductsList from "../../components/ProductsList";
import ProductFilter from "../../components/ProductFilter";
import { useProducts } from "../../context/ProductContext";
import { useOrders } from "../../context/OrderContext";

const Products = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const location = useLocation();
  const navigate = useNavigate();
  const { products, loading: productsLoading, getCategories, refreshProducts } = useProducts();
  const { hasPurchasedProduct, loading: ordersLoading } = useOrders();

  // Lấy query params từ URL
  const queryParams = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return {
      searchQuery: params.get("q") || "",
      categoryParam: params.get("category") || "",
      minPrice: parseInt(params.get("minPrice") || "0", 10),
      maxPrice: parseInt(params.get("maxPrice") || "1000000", 10),
      ratingsParam: params.get("ratings") || ""
    };
  }, [location.search]);

  // Chỉ fetch dữ liệu khi có thay đổi về lọc
  useEffect(() => {
    const hasFilters = Object.values(queryParams).some(value => 
      value !== "" && value !== 0 && value !== 1000000
    );
    
    if (hasFilters) {
      refreshProducts();
    }
  }, [queryParams, refreshProducts]);

  // Lọc sản phẩm dựa trên query params
  const filteredProducts = useMemo(() => {
    if (!products) return [];

    let filtered = [...products];

    if (queryParams.searchQuery) {
      const searchLower = queryParams.searchQuery.toLowerCase();
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchLower)
      );
    }

    if (queryParams.categoryParam) {
      filtered = filtered.filter(
        (product) => product.category.toLowerCase() === queryParams.categoryParam.toLowerCase()
      );
    }

    filtered = filtered.filter(
      (product) => product.price >= queryParams.minPrice && product.price <= queryParams.maxPrice
    );

    if (queryParams.ratingsParam) {
      const ratingsArray = queryParams.ratingsParam.split(",").map(Number);
      filtered = filtered.filter((product) =>
        ratingsArray.includes(Math.floor(product.rating))
      );
    }

    return filtered;
  }, [products, queryParams]);

  // Tính toán phân trang
  const pagination = useMemo(() => {
    const indexOfLastProduct = currentPage * itemsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

    return {
      currentProducts,
      totalPages
    };
  }, [filteredProducts, currentPage, itemsPerPage]);

  const handleFilterChange = (filters) => {
    const { priceRange, categories, ratings } = filters;
    const queryParams = new URLSearchParams(location.search);

    if (priceRange) {
      queryParams.set("minPrice", priceRange[0]);
      queryParams.set("maxPrice", priceRange[1]);
    }

    if (categories.length > 0) {
      queryParams.set("category", categories.join(","));
    } else {
      queryParams.delete("category");
    }

    if (ratings.length > 0) {
      queryParams.set("ratings", ratings.join(","));
    } else {
      queryParams.delete("ratings");
    }

    navigate(`?${queryParams.toString()}`);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    navigate("?");
    setCurrentPage(1);
  };

  // Chỉ hiển thị loading khi đang fetch dữ liệu mới
  const isLoading = (productsLoading && Object.values(queryParams).some(value => 
    value !== "" && value !== 0 && value !== 1000000
  )) || ordersLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 py-8">
      <div className="flex">
        {/* Thanh filter */}
        <div className="w-1/5 pr-4">
          <ProductFilter
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            categories={getCategories()}
          />
        </div>

        {/* Danh sách sản phẩm */}
        <div className="flex-1">
          <ProductsList
            data={pagination.currentProducts}
            itemsPerPage={itemsPerPage}
            hasPurchasedProduct={hasPurchasedProduct}
          />

          {/* Phân trang */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <nav>
                <ul className="flex space-x-2">
                  <li>
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50 ${
                        currentPage === 1 ? "" : "cursor-pointer"
                      } select-none`}
                    >
                      &lt;
                    </button>
                  </li>
                  {Array.from({ length: pagination.totalPages }, (_, index) => (
                    <li key={index}>
                      <button
                        onClick={() => setCurrentPage(index + 1)}
                        className={`px-4 py-2 ${
                          currentPage === index + 1
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-gray-700"
                        } rounded-md cursor-pointer select-none`}
                      >
                        {index + 1}
                      </button>
                    </li>
                  ))}
                  <li>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                      disabled={currentPage === pagination.totalPages}
                      className={`px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50 ${
                        currentPage < pagination.totalPages ? "cursor-pointer" : ""
                      } select-none`}
                    >
                      &gt;
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;