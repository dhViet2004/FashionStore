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

  // Get the display name from user object, handling both regular and Google login
  const getUserDisplayName = () => {
    if (!user) return '';
    // Check for name first (regular login), then full_name (Google login)
    return user.name || user.full_name || user.username || 'User';
  };

  // Get the user's avatar URL
  const getUserAvatar = () => {
    if (!user) return '';
    
    // Check for Google profile picture first
    if (user.google_id && user.picture) {
      return user.picture;
    }
    
    // Fall back to imageUrl for regular login
    return user.imageUrl || '';
  };

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
    if (query.trim()) {
      navigate(`/products?q=${encodeURIComponent(query.trim())}`);
    } else {
      navigate(`/products`);
    }
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-2 sm:px-4">
        {/* Top Bar */}
        <div className="flex items-center justify-between py-2 sm:py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-xl sm:text-2xl font-bold text-blue-600">FashionStore</span>
          </Link>

          {/* Desktop Navigation and Search */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-8 flex-1 justify-center">
            <Link to="/" className="text-gray-600 hover:text-blue-500 px-2 py-1 rounded transition-colors">
              Home
            </Link>
            <Link to="/products" className="text-gray-600 hover:text-blue-500 px-2 py-1 rounded transition-colors">
              Products
            </Link>
            <Link to="/categories" className="text-gray-600 hover:text-blue-500 px-2 py-1 rounded transition-colors">
              Categories
            </Link>
            {user && user.role === 'admin' && (
              <Link to="/admin" className="text-gray-600 hover:text-blue-500 px-2 py-1 rounded transition-colors">
                Admin Panel
              </Link>
            )}
            
            {/* Search Bar */}
            <div className="relative ml-4 lg:ml-8">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-48 sm:w-64 px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              />
              <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500" />
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="text-gray-600 hover:text-blue-500 flex items-center"
                  title="Profile"
                >
                  {getUserAvatar() ? (
                    <img 
                      src={getUserAvatar()} 
                      alt="Profile" 
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full mr-1 sm:mr-2 object-cover"
                    />
                  ) : (
                    <FaUser className="mr-1" />
                  )}
                  <span className="hidden sm:inline">{getUserDisplayName()}</span>
                </Link>
                <Link
                  to="/cart"
                  className="text-gray-600 hover:text-blue-500 flex items-center"
                  title="Cart"
                >
                  <FaShoppingCart className="mr-1" />
                  <span className="hidden sm:inline">Cart</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-blue-500 flex items-center"
                  title="Logout"
                >
                  <FaSignOutAlt className="mr-1" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="text-gray-600 hover:text-blue-500 px-2 py-1 rounded transition-colors"
              >
                Login
              </button>
            )}
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-gray-600 hover:text-blue-500 p-1"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-3 border-t">
            <nav className="flex flex-col space-y-3">
              <Link
                to="/"
                className="text-gray-600 hover:text-blue-500 px-2 py-1 rounded transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/products"
                className="text-gray-600 hover:text-blue-500 px-2 py-1 rounded transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Products
              </Link>
              <Link
                to="/categories"
                className="text-gray-600 hover:text-blue-500 px-2 py-1 rounded transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Categories
              </Link>
              {user && user.role === 'admin' && (
                <Link
                  to="/admin"
                  className="text-gray-600 hover:text-blue-500 px-2 py-1 rounded transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin Panel
                </Link>
              )}
            </nav>
            {/* Mobile Search Bar */}
            <form onSubmit={handleSearch} className="mt-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
