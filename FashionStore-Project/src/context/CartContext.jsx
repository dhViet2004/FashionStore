import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      fetchCartItems(user.id);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCartItems = async (userId) => {
    try {
      const response = await fetch(`http://localhost:3001/cart?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch cart items');
      const data = await response.json();
      setCartItems(data);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      toast.error('Không thể tải giỏ hàng');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (item) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) {
        toast.error('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
        return false;
      }

      // Kiểm tra sản phẩm đã có trong giỏ hàng chưa
      const existingItem = cartItems.find(
        cartItem => cartItem.productId === item.productId && cartItem.size === item.size
      );

      if (existingItem) {
        // Nếu đã có, cập nhật số lượng
        const newQuantity = existingItem.quantity + item.quantity;
        if (newQuantity > item.stock) {
          toast.error('Số lượng vượt quá tồn kho');
          return false;
        }

        const response = await fetch(`http://localhost:3001/cart/${existingItem.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantity: newQuantity }),
        });

        if (response.ok) {
          setCartItems(prevItems =>
            prevItems.map(cartItem =>
              cartItem.id === existingItem.id
                ? { ...cartItem, quantity: newQuantity }
                : cartItem
            )
          );
          toast.success('Cập nhật số lượng thành công!');
        }
      } else {
        // Nếu chưa có, thêm mới
        const response = await fetch('http://localhost:3001/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...item, userId: user.id }),
        });

        if (response.ok) {
          const newItem = await response.json();
          setCartItems(prevItems => [...prevItems, newItem]);
          toast.success('Thêm vào giỏ hàng thành công!');
        }
      }

      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Không thể thêm vào giỏ hàng');
      return false;
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const response = await fetch(`http://localhost:3001/cart/${itemId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
        toast.success('Xóa sản phẩm thành công');
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Không thể xóa sản phẩm');
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    try {
      const response = await fetch(`http://localhost:3001/cart/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (response.ok) {
        setCartItems(prevItems =>
          prevItems.map(item =>
            item.id === itemId ? { ...item, quantity: newQuantity } : item
          )
        );
        toast.success('Cập nhật số lượng thành công');
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Không thể cập nhật số lượng');
    }
  };

  const value = {
    cartItems,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 