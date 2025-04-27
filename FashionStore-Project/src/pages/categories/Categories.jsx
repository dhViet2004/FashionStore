import React from 'react';
import { Link } from 'react-router-dom';

const Categories = () => {
  const categories = [
    {
      id: 1,
      name: "Men's Clothing",
      image: "men.jpg",
      description: "Discover our latest men's fashion collection"
    },
    {
      id: 2,
      name: "Women's Clothing",
      image: "women.jpg",
      description: "Explore our women's fashion line"
    },
    {
      id: 3,
      name: "Accessories",
      image: "accessories.jpg",
      description: "Complete your look with our accessories"
    },
    {
      id: 4,
      name: "Footwear",
      image: "footwear.jpg",
      description: "Step into style with our footwear collection"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shop by Category</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((category) => (
          <Link
            key={category.id}
            to={`/products?category=${category.name.toLowerCase()}`}
            className="group"
          >
            <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 group-hover:transform group-hover:scale-105">
              <div className="h-48 bg-gray-200"></div>
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