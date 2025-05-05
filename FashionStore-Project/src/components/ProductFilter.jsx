import React, { useState } from "react";

const ProductFilter = ({ onFilterChange, onResetFilters }) => {
  const [tempPriceRange, setTempPriceRange] = useState([0, 1000000]);
  const [tempCategories, setTempCategories] = useState([]);
  const [tempRatings, setTempRatings] = useState([]);

  const handleApplyFilters = () => {
    onFilterChange({
      priceRange: tempPriceRange,
      categories: tempCategories,
      ratings: tempRatings,
    });
  };

  const handleResetFilters = () => {
    setTempPriceRange([0, 1000000]);
    setTempCategories([]);
    setTempRatings([]);
    onResetFilters(); // Gọi hàm reset từ parent
  };

  const handlePriceChange = (e, index) => {
    const newRange = [...tempPriceRange];
    const value = Number(e.target.value) * 1000; // Nhân giá trị nhập vào với 1000 để chuyển sang đơn vị VND
    newRange[index] = value;
    setTempPriceRange(newRange);
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    const checked = e.target.checked;
    const updatedCategories = checked
      ? [...tempCategories, value]
      : tempCategories.filter((category) => category !== value);
    setTempCategories(updatedCategories);
  };

  const handleRatingChange = (e) => {
    const value = Number(e.target.value);
    const checked = e.target.checked;
    const updatedRatings = checked
      ? [...tempRatings, value]
      : tempRatings.filter((rating) => rating !== value);
    setTempRatings(updatedRatings);
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Bộ lọc sản phẩm</h3>

      {/* Lọc theo giá */}
      <div className="mb-6">
        <h4 className="text-md font-medium mb-2">Khoảng giá (nghìn VND)</h4>
        <div className="flex items-center space-x-4">
          <input
            type="number"
            className="w-20 p-2 border border-gray-300 rounded"
            value={tempPriceRange[0] / 1000} // Hiển thị giá trị theo đơn vị nghìn
            onChange={(e) => handlePriceChange(e, 0)}
            min="0"
          />
          <span>-</span>
          <input
            type="number"
            className="w-20 p-2 border border-gray-300 rounded"
            value={tempPriceRange[1] / 1000} // Hiển thị giá trị theo đơn vị nghìn
            onChange={(e) => handlePriceChange(e, 1)}
            min="0"
          />
        </div>
      </div>

      {/* Lọc theo danh mục */}
      <div className="mb-6">
        <h4 className="text-md font-medium mb-2">Danh mục</h4>
        <div className="flex flex-col space-y-2">
          <label>
            <input
              type="checkbox"
              value="Jeans"
              onChange={handleCategoryChange}
              checked={tempCategories.includes("Jeans")}
              className="mr-2"
            />
            Jeans
          </label>
          <label>
            <input
              type="checkbox"
              value="Jackets"
              onChange={handleCategoryChange}
              checked={tempCategories.includes("Jackets")}
              className="mr-2"
            />
            Jackets
          </label>
          {/* Add more categories as needed */}
        </div>
      </div>

      {/* Lọc theo đánh giá */}
      <div className="mb-6">
        <h4 className="text-md font-medium mb-2">Đánh giá</h4>
        <div className="flex flex-col space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => (
            <label key={rating}>
              <input
                type="checkbox"
                value={rating}
                onChange={handleRatingChange}
                checked={tempRatings.includes(rating)} // Kiểm tra xem rating có được chọn không
                className="mr-2"
              />
              {rating} sao
            </label>
          ))}
        </div>
      </div>

      {/* Nút Hủy và Áp dụng */}
      <div className="flex space-x-4">
        <button
          onClick={handleResetFilters}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
        >
          Hủy
        </button>
        <button
          onClick={handleApplyFilters}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Áp dụng
        </button>
      </div>
    </div>
  );
};

export default ProductFilter;