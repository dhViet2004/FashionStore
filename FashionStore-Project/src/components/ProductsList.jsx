import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FaShoppingBag, FaSpinner } from 'react-icons/fa';
import { IoAlertCircle } from 'react-icons/io5';
import ProductCard from './ProductCard';
import useProduct from '../hooks/useProduct';

const ProductsList = () => {
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('q') || '';
  const categoryParam = queryParams.get('category') || '';

  const { products, loading, error } = useProduct();

  useEffect(() => {
    let filtered = [...products];
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter by category
    if (categoryParam) {
      filtered = filtered.filter((product) =>
        product.category.toLowerCase() === categoryParam.toLowerCase()
      );
    }
    
    setFilteredProducts(filtered);
  }, [searchQuery, categoryParam, products]);

  // Calculate pagination
  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <FaSpinner className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2 text-lg">Loading products...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-red-500">
        <IoAlertCircle className="w-8 h-8 mr-2" />
        <span>Error: {error}</span>
      </div>
    );
  }

  return (
    <div className={`${isHomePage ? 'py-12 bg-gray-50' : 'py-8'}`}>
      <div className="container mx-auto px-4">
        {!isHomePage && (
          <div className="flex items-center mb-8">
            <FaShoppingBag className="w-6 h-6 mr-2 text-blue-500" />
            <h2 className="text-2xl font-bold text-gray-800">Products List</h2>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {currentProducts.length > 0 ? (
            currentProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500">No products found</div>
          )}
        </div>

        {/* Pagination - Only show on products page */}
        {!isHomePage && totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <nav>
              <ul className="flex space-x-2">
                <li>
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`${currentPage !== 1 ? "cursor-pointer" : ""} px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50`}
                  >
                    &lt;
                  </button>
                </li>
                {Array.from({ length: totalPages }, (_, index) => (
                  <li key={index}>
                    <button
                      onClick={() => paginate(index + 1)}
                      className={`px-4 py-2 ${currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'} rounded-md cursor-pointer`}
                    >
                      {index + 1}
                    </button>
                  </li>
                ))}
                <li>
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`${currentPage !== totalPages ? 'cursor-pointer' : ""} px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50`}
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
  );
};

export default ProductsList;
