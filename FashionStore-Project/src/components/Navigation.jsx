import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaShoppingCart, FaUser, FaBars, FaTimes, FaSignOutAlt } from 'react-icons/fa';
import { Dropdown } from 'antd';
import LoginModal from './LoginModal';
import { useCart } from '../context/CartContext';

const Navigation = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const { cartItems } = useCart();

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Điều hướng đến trang Products và truyền query qua URL
    navigate(`/products?q=${encodeURIComponent(query.trim())}`);
  };

  const handleSearchClick = () => {
    // Điều hướng đến trang Products khi nhấn vào icon search
    navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
    window.location.reload();
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="drop-container mx-auto px-2 sm:px-4">
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
                onChange={handleSearchChange} // Lọc sản phẩm khi thay đổi input
                className="w-48 sm:w-64 px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              />
              <FaSearch
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500 hover:cursor-pointer"
                onClick={handleSearchClick} // Lọc sản phẩm khi nhấn vào icon search
              />
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {user ? (
              <>
                {user.role !== 'admin' && (
                  <Link
                    to="/cart"
                    className="text-gray-600 hover:text-blue-500 flex items-center relative"
                    title="Cart"
                  >
                    <FaShoppingCart className="mr-1" />
                    <span className="hidden sm:inline">Cart</span>
                    {cartItems.length > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {cartItems.length}
                      </span>
                    )}
                  </Link>
                )}
                <Dropdown
                  menu={{
                    items: [
                      {
                        key: 'profile',
                        label: (
                          <Link to="/profile" className="flex items-center">
                            <FaUser className="mr-2" />
                            Profile
                          </Link>
                        ),
                      },
                      {
                        key: 'logout',
                        label: (
                          <button onClick={() => handleLogout()} className="flex items-center w-full">
                            <FaSignOutAlt className="mr-2" />
                            Logout
                          </button>
                        ),
                      },
                    ],
                  }}
                  trigger={['click']}
                  placement="bottomRight"
                >
                  <div className="flex items-center cursor-pointer hover:text-blue-500">
                    {user.imageUrl ? (
                      <img
                        src={user.imageUrl}
                        alt="Profile"
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full mr-1 sm:mr-2 object-cover"
                      />
                    ) : (
                      <FaUser className="mr-1" />
                    )}
                    <span className="hidden sm:inline">{user.name || 'User'}</span>
                  </div>
                </Dropdown>
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
              className="md:hidden text-gray-600 hover:text-blue-500"
            >
              {isMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
    </nav>
  );
};

export default Navigation;
