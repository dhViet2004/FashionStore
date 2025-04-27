import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaShoppingCart, FaUser, FaBars, FaTimes, FaSignOutAlt } from 'react-icons/fa';
import LoginModal from './LoginModal';

const Navigation = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate(`/products`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
    window.location.reload();
  };

  const handleLogin = () => {
    window.location.reload();
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    // Tự động chuyển hướng khi người dùng nhập liệu
    if (query.trim()) {
      navigate(`/products?q=${encodeURIComponent(query.trim())}`);
    } else {
      navigate(`/products`);
    }
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        {/* Top Bar */}
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-blue-600">FashionStore</span>
          </Link>

          {/* Desktop Navigation and Search */}
          <div className="hidden md:flex items-center space-x-8 flex-1 justify-center">
            <Link to="/" className="text-gray-600 hover:text-blue-500">
              Home
            </Link>
            <Link to="/products" className="text-gray-600 hover:text-blue-500">
              Products
            </Link>
            <Link to="/categories" className="text-gray-600 hover:text-blue-500">
              Categories
            </Link>
            {user && user.role === 'admin' && (
              <Link to="/admin" className="text-gray-600 hover:text-blue-500">
                Admin Panel
              </Link>
            )}
            
            {/* Search Bar */}
            <div className="relative ml-8">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={handleSearchChange}  // Tìm kiếm theo thời gian thực
                className="w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500" />
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="text-gray-600 hover:text-blue-500 flex items-center"
                  title="Profile"
                >
                  <FaUser className="mr-1" />
                  <span className="hidden md:inline">{user.name}</span>
                </Link>
                <Link
                  to="/cart"
                  className="text-gray-600 hover:text-blue-500 flex items-center"
                  title="Cart"
                >
                  <FaShoppingCart className="mr-1" />
                  <span className="hidden md:inline">Cart</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-blue-500 flex items-center"
                  title="Logout"
                >
                  <FaSignOutAlt className="mr-1" />
                  <span className="hidden md:inline">Logout</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="text-gray-600 hover:text-blue-500"
              >
                Login
              </button>
            )}
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-gray-600 hover:text-blue-500"
            >
              {isMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-4">
              <Link
                to="/"
                className="text-gray-600 hover:text-blue-500"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/products"
                className="text-gray-600 hover:text-blue-500"
                onClick={() => setIsMenuOpen(false)}
              >
                Products
              </Link>
              <Link
                to="/categories"
                className="text-gray-600 hover:text-blue-500"
                onClick={() => setIsMenuOpen(false)}
              >
                Categories
              </Link>
              {user && user.role === 'admin' && (
                <Link
                  to="/admin"
                  className="text-gray-600 hover:text-blue-500"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin Panel
                </Link>
              )}
            </nav>
            {/* Mobile Search Bar */}
            <form onSubmit={handleSearch} className="mt-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={handleSearchChange}  // Tìm kiếm theo thời gian thực
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500"
                >
                  <FaSearch />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onLogin={handleLogin}
        />
      )}
    </nav>
  );
};

export default Navigation;
