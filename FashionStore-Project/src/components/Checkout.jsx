import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaTruck, FaCreditCard, FaGift, FaCheck } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useCart } from '../hooks/useCart';

const API_URL = 'http://localhost:3001';
const SHIPPING_METHODS = [
  { label: 'Giao hàng tiêu chuẩn', value: 'standard', fee: 30000, estimate: '3-5 ngày', icon: <FaTruck className="text-blue-500" /> },
  { label: 'Giao hàng nhanh', value: 'express', fee: 60000, estimate: '1-2 ngày', icon: <FaTruck className="text-green-500" /> },
  { label: 'Lấy tại cửa hàng', value: 'store', fee: 0, estimate: 'Trong ngày', icon: <FaTruck className="text-orange-500" /> },
];
const PAYMENT_METHODS = [
  { label: 'Thanh toán khi nhận hàng (COD)', value: 'cod', icon: <FaCreditCard className="text-blue-500" /> },
  { label: 'Chuyển khoản ngân hàng', value: 'bank', icon: <FaCreditCard className="text-green-500" /> },
  { label: 'Ví điện tử', value: 'e-wallet', icon: <FaCreditCard className="text-purple-500" /> },
  { label: 'Thẻ tín dụng/Ghi nợ', value: 'card', icon: <FaCreditCard className="text-red-500" /> },
  { label: 'QR code thanh toán', value: 'qr', icon: <FaCreditCard className="text-yellow-500" /> },
];

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;
  const { updateCartCount, updateCountImmediately } = useCart();

  // Thông tin form
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    province: '',
    district: '',
    ward: '',
    address: '',
    note: '',
  });
  const [shippingAddresses, setShippingAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isNewAddress, setIsNewAddress] = useState(true);
  const [shipping, setShipping] = useState(SHIPPING_METHODS[0]);
  const [payment, setPayment] = useState(PAYMENT_METHODS[0]);
  const [voucherCode, setVoucherCode] = useState(order?.voucher || '');
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherError, setVoucherError] = useState('');
  const [availableVouchers, setAvailableVouchers] = useState([]);
  const [userVouchers, setUserVouchers] = useState([]);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [formErrors, setFormErrors] = useState({
    name: '',
    phone: '',
    email: '',
    province: '',
    district: '',
    ward: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;
    fetchVouchers(user.id);
    fetchShippingAddresses(user.id);
    fetchProvinces();
  }, []);

  const fetchVouchers = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/vouchers`);
      if (!response.ok) throw new Error('Failed to fetch vouchers');
      const allVouchers = await response.json();
      const userSpecificVouchers = allVouchers.filter(voucher => {
        if (voucher.userId && voucher.userId !== userId) return false;
        const currentDate = new Date();
        const endDate = new Date(voucher.endDate);
        if (currentDate > endDate) return false;
        if (voucher.usedBy && voucher.usedBy.includes(userId)) return false;
        return true;
      });
      setAvailableVouchers(allVouchers);
      setUserVouchers(userSpecificVouchers);
    } catch (error) {
      setAvailableVouchers([]);
      setUserVouchers([]);
    }
  };

  const fetchShippingAddresses = async (userId) => {
    try {
      // First check if the user exists
      const userResponse = await fetch(`${API_URL}/users/${userId}`);
      if (!userResponse.ok) throw new Error('Failed to fetch user');
      const user = await userResponse.json();
      
      // Use the addresses from the user object
      const addresses = user.addresses || [];
      setShippingAddresses(addresses);
      
      // Set default address if exists
      const defaultAddress = addresses.find(addr => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress._id);
        setForm(defaultAddress);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      setShippingAddresses([]);
    }
  };

  const fetchProvinces = async () => {
    try {
      const response = await fetch(`${API_URL}/vietnam-addresses`);
      if (!response.ok) throw new Error('Failed to fetch provinces');
      const data = await response.json();
      // Access the vietnam-addresses array from the response
      setProvinces(data['vietnam-addresses'] || []);
    } catch (error) {
      console.error('Error fetching provinces:', error);
      setProvinces([]);
    }
  };

  const handleProvinceChange = (provinceId) => {
    const selectedProvince = provinces.find(p => p.Id === provinceId);
    if (selectedProvince) {
      setDistricts(selectedProvince.Districts || []);
      setWards([]); // Reset wards when province changes
      setForm(prev => ({
        ...prev,
        province: selectedProvince.Name,
        district: '', // Reset district when province changes
        ward: '' // Reset ward when province changes
      }));
    }
  };

  const handleDistrictChange = (districtId) => {
    const selectedDistrict = districts.find(d => d.Id === districtId);
    if (selectedDistrict) {
      setWards(selectedDistrict.Wards || []);
      setForm(prev => ({
        ...prev,
        district: selectedDistrict.Name,
        ward: '' // Reset ward when district changes
      }));
    }
  };

  const handleSaveAddress = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;

    try {
      const addressData = {
        ...form,
        userId: user.id,
        isDefault: shippingAddresses.length === 0 // Make first address default
      };

      if (isNewAddress) {
        // Create new address by updating the user object
        const response = await fetch(`${API_URL}/users/${user.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            addresses: [...shippingAddresses, addressData]
          })
        });
        if (!response.ok) throw new Error('Failed to save address');
        const updatedUser = await response.json();
        setShippingAddresses(updatedUser.addresses || []);
        setSelectedAddressId(addressData._id);
      } else {
        // Update existing address
        const updatedAddresses = shippingAddresses.map(addr => 
          addr._id === selectedAddressId ? addressData : addr
        );
        
        const response = await fetch(`${API_URL}/users/${user.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            addresses: updatedAddresses
          })
        });
        if (!response.ok) throw new Error('Failed to update address');
        const updatedUser = await response.json();
        setShippingAddresses(updatedUser.addresses || []);
      }
      setShowAddressModal(false);
    } catch (error) {
      console.error('Error saving address:', error);
      alert('Có lỗi xảy ra khi lưu địa chỉ');
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;

    try {
      const updatedAddresses = shippingAddresses.map(addr => ({
        ...addr,
        isDefault: addr._id === addressId
      }));

      const response = await fetch(`${API_URL}/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          addresses: updatedAddresses
        })
      });
      if (!response.ok) throw new Error('Failed to set default address');
      
      const updatedUser = await response.json();
      setShippingAddresses(updatedUser.addresses || []);
      setSelectedAddressId(addressId);
    } catch (error) {
      console.error('Error setting default address:', error);
      alert('Có lỗi xảy ra khi đặt địa chỉ mặc định');
    }
  };

  const handleDeleteAddress = async (addressId) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;

    try {
      const updatedAddresses = shippingAddresses.filter(addr => addr._id !== addressId);
      
      const response = await fetch(`${API_URL}/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          addresses: updatedAddresses
        })
      });
      if (!response.ok) throw new Error('Failed to delete address');
      
      const updatedUser = await response.json();
      setShippingAddresses(updatedUser.addresses || []);
      
      if (selectedAddressId === addressId) {
        const remainingAddress = updatedAddresses[0];
        if (remainingAddress) {
          setSelectedAddressId(remainingAddress._id);
          setForm(remainingAddress);
        } else {
          setSelectedAddressId(null);
          setForm({
            name: '',
            phone: '',
            email: '',
            province: '',
            district: '',
            ward: '',
            address: '',
            note: '',
          });
        }
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      alert('Có lỗi xảy ra khi xóa địa chỉ');
    }
  };

  const handleEditAddress = (address) => {
    setForm(address);
    setSelectedAddressId(address._id);
    setIsNewAddress(false);
    setShowAddressModal(true);
  };

  const handleAddNewAddress = () => {
    setForm({
      name: '',
      phone: '',
      email: '',
      province: '',
      district: '',
      address: '',
      note: '',
    });
    setSelectedAddressId(null);
    setIsNewAddress(true);
    setShowAddressModal(true);
  };

  // Tổng tiền sản phẩm
  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  // Tổng thanh toán cuối cùng
  const total = subtotal + shipping.fee - discount;

  // Áp dụng voucher
  const handleApplyVoucher = async () => {
    setVoucherError('');
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      setVoucherError('Vui lòng đăng nhập để sử dụng voucher');
      toast.error('Vui lòng đăng nhập để sử dụng voucher');
      return;
    }
    try {
      const response = await fetch(`${API_URL}/vouchers`);
      if (!response.ok) throw new Error('Failed to check voucher');
      const allVouchers = await response.json();
      const voucher = allVouchers.find(v => v.code === voucherCode.toUpperCase());
      if (!voucher) {
        setVoucherError('Mã giảm giá không tồn tại');
        toast.error('Mã giảm giá không tồn tại');
        setAppliedVoucher(null);
        setDiscount(0);
        return;
      }
      if (voucher.userId && voucher.userId !== user.id) {
        setVoucherError('Bạn không có quyền sử dụng voucher này');
        toast.error('Bạn không có quyền sử dụng voucher này');
        setAppliedVoucher(null);
        setDiscount(0);
        return;
      }
      const currentDate = new Date();
      const startDate = new Date(voucher.startDate);
      const endDate = new Date(voucher.endDate);
      if (currentDate < startDate) {
        setVoucherError('Mã giảm giá chưa có hiệu lực');
        toast.error('Mã giảm giá chưa có hiệu lực');
        setAppliedVoucher(null);
        setDiscount(0);
        return;
      }
      if (currentDate > endDate) {
        setVoucherError('Mã giảm giá đã hết hạn');
        toast.error('Mã giảm giá đã hết hạn');
        setAppliedVoucher(null);
        setDiscount(0);
        return;
      }
      const orderTotal = subtotal + shipping.fee; // Tổng tiền đơn hàng bao gồm phí ship
      if (orderTotal < voucher.minOrder) {
        const remaining = voucher.minOrder - orderTotal;
        setVoucherError(`Đơn hàng tối thiểu ${formatCurrency(voucher.minOrder)} để áp dụng mã này. Bạn cần thêm ${formatCurrency(remaining)}`);
        toast.error(`Đơn hàng tối thiểu ${formatCurrency(voucher.minOrder)} để áp dụng mã này. Bạn cần thêm ${formatCurrency(remaining)}`);
        setAppliedVoucher(null);
        setDiscount(0);
        return;
      }
      if (voucher.usedBy && voucher.usedBy.includes(user.id)) {
        setVoucherError('Bạn đã sử dụng mã giảm giá này');
        toast.error('Bạn đã sử dụng mã giảm giá này');
        setAppliedVoucher(null);
        setDiscount(0);
        return;
      }
      setAppliedVoucher(voucher);
      setVoucherError('');
      setDiscount(voucher.type === 'fixed' ? voucher.discount : (orderTotal * voucher.discount) / 100);
      toast.success('Áp dụng mã giảm giá thành công');
    } catch (error) {
      setVoucherError('Có lỗi xảy ra khi áp dụng mã giảm giá');
      toast.error('Có lỗi xảy ra khi áp dụng mã giảm giá');
      setAppliedVoucher(null);
      setDiscount(0);
    }
  };

  const handleSelectVoucher = async (voucher) => {
    setVoucherCode(voucher.code);
    setShowVoucherModal(false);
    setVoucherError('');

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) {
        setVoucherError('Vui lòng đăng nhập để sử dụng voucher');
        toast.error('Vui lòng đăng nhập để sử dụng voucher');
        return;
      }

      // Kiểm tra voucher có dành riêng cho user này không
      if (voucher.userId && voucher.userId !== user.id) {
        setVoucherError('Bạn không có quyền sử dụng voucher này');
        toast.error('Bạn không có quyền sử dụng voucher này');
        return;
      }

      // Check voucher expiration
      const currentDate = new Date();
      const startDate = new Date(voucher.startDate);
      const endDate = new Date(voucher.endDate);

      if (currentDate < startDate) {
        setVoucherError('Mã giảm giá chưa có hiệu lực');
        toast.error('Mã giảm giá chưa có hiệu lực');
        return;
      }

      if (currentDate > endDate) {
        setVoucherError('Mã giảm giá đã hết hạn');
        toast.error('Mã giảm giá đã hết hạn');
        return;
      }

      // Kiểm tra điều kiện đơn hàng tối thiểu
      const orderTotal = subtotal + shipping.fee; // Tổng tiền đơn hàng bao gồm phí ship
      if (orderTotal < voucher.minOrder) {
        const remaining = voucher.minOrder - orderTotal;
        setVoucherError(`Đơn hàng tối thiểu ${formatCurrency(voucher.minOrder)} để áp dụng mã này. Bạn cần thêm ${formatCurrency(remaining)}`);
        toast.error(`Đơn hàng tối thiểu ${formatCurrency(voucher.minOrder)} để áp dụng mã này. Bạn cần thêm ${formatCurrency(remaining)}`);
        return;
      }

      // Check if voucher has been used
      if (voucher.usedBy && voucher.usedBy.includes(user.id)) {
        setVoucherError('Bạn đã sử dụng mã giảm giá này');
        toast.error('Bạn đã sử dụng mã giảm giá này');
        return;
      }

      // If all checks pass, apply the voucher
      setAppliedVoucher(voucher);
      setVoucherError('');
      setDiscount(voucher.type === 'fixed' ? voucher.discount : (orderTotal * voucher.discount) / 100);
      toast.success('Áp dụng mã giảm giá thành công');
    } catch (error) {
      console.error('Error applying voucher:', error);
      setVoucherError('Có lỗi xảy ra khi áp dụng mã giảm giá');
      toast.error('Có lỗi xảy ra khi áp dụng mã giảm giá');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (date) => {
    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    };
    return new Date(date).toLocaleString('vi-VN', options);
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    // Validate name
    if (!form.name.trim()) {
      errors.name = 'Vui lòng nhập họ tên';
      isValid = false;
    }

    // Validate phone
    if (!form.phone.trim()) {
      errors.phone = 'Vui lòng nhập số điện thoại';
      isValid = false;
    } else if (!/^[0-9]{10}$/.test(form.phone.trim())) {
      errors.phone = 'Số điện thoại không hợp lệ';
      isValid = false;
    }

    // Validate email
    if (!form.email.trim()) {
      errors.email = 'Vui lòng nhập email';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errors.email = 'Email không hợp lệ';
      isValid = false;
    }

    // Validate address fields
    if (!form.province) {
      errors.province = 'Vui lòng chọn tỉnh/thành phố';
      isValid = false;
    }
    if (!form.district) {
      errors.district = 'Vui lòng chọn quận/huyện';
      isValid = false;
    }
    if (!form.ward) {
      errors.ward = 'Vui lòng chọn phường/xã';
      isValid = false;
    }
    if (!form.address.trim()) {
      errors.address = 'Vui lòng nhập địa chỉ cụ thể';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      toast.error('Vui lòng đăng nhập để đặt hàng');
      navigate('/login');
      return;
    }

    // Kiểm tra xem đã có đơn hàng nào đang xử lý chưa
    try {
      const existingOrderResponse = await fetch(`${API_URL}/orders?userId=${user.id}&status=pending`);
      const existingOrders = await existingOrderResponse.json();
      
      if (existingOrders.length > 0) {
        toast.error('Bạn đã có đơn hàng đang xử lý. Vui lòng đợi đơn hàng hiện tại hoàn thành.');
        return;
      }

      setLoading(true);
      const orderData = {
        userId: user.id,
        items: order.items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          size: item.size,
          imageUrl: item.imageUrl
        })),
        total: total,
        subtotal: subtotal,
        shipping: {
          method: shipping.value,
          fee: shipping.fee,
          address: {
            name: form.name,
            phone: form.phone,
            email: form.email,
            province: form.province,
            district: form.district,
            ward: form.ward,
            address: form.address,
            note: form.note
          }
        },
        payment: {
          method: payment.value,
          status: 'completed'
        },
        voucher: appliedVoucher ? {
          code: appliedVoucher.code,
          discount: discount
        } : null,
        status: 'completed',
        createdAt: formatDate(new Date())
      };

      console.log('Sending order data:', orderData);

      // Lưu đơn hàng vào JSON server
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        const savedOrder = await response.json();
        console.log('Order saved successfully:', savedOrder);
        setOrderId(savedOrder.id);
        setOrderSuccess(true);
        
        // Xóa các sản phẩm đã đặt hàng khỏi giỏ hàng
        for (const itemId of order.items.map(item => item.id)) {
          await fetch(`${API_URL}/cart/${itemId}?userId=${user.id}`, { method: 'DELETE' });
        }
        
        // Cập nhật số lượng giỏ hàng ngay lập tức
        updateCountImmediately(0);
        toast.success('Đặt hàng thành công! Cảm ơn bạn đã mua hàng.');
        
        // Chuyển hướng về trang chủ sau 2 giây
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        throw new Error('Failed to place order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Không thể đặt hàng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-10 text-center">
        <h2 className="text-2xl font-bold mb-4">Không tìm thấy đơn hàng!</h2>
        <button
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          onClick={() => navigate('/')}
        >
          Về trang chủ
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -z-10"></div>
          {[1, 2, 3, 4].map((step) => (
            <div key={`step-${step}`} className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                activeStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {activeStep > step ? <FaCheck /> : step}
              </div>
              <span className="mt-2 text-sm font-medium text-gray-600">
                {step === 1 ? 'Giỏ hàng' : step === 2 ? 'Thông tin' : step === 3 ? 'Thanh toán' : 'Xác nhận'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Order Summary */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cart Items */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">Sản phẩm đã chọn</h3>
            <div className="space-y-4">
              {order.items.map(item => (
                <div key={`order-item-${item.id}`} className="flex items-center gap-4 p-4 border rounded-lg">
                  <img src={item.imageUrl} alt={item.name} className="w-20 h-20 object-cover rounded" />
                  <div className="flex-1">
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm text-gray-500">Size: {item.size}</p>
                    <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-600 font-semibold">{formatCurrency(item.price)}</p>
                    <p className="text-gray-500 text-sm">Tổng: {formatCurrency(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Thông tin giao hàng</h3>
              <button
                onClick={handleAddNewAddress}
                className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                Thêm địa chỉ mới
              </button>
            </div>
            
            {/* Address List */}
            <div className="space-y-4 mb-4">
              {shippingAddresses.map(address => (
                <div
                  key={`address-${address._id}`}
                  className={`p-4 border rounded-lg ${
                    selectedAddressId === address._id ? 'border-blue-500 bg-blue-50' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Họ tên:</span>
                        <span>{address.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Số điện thoại:</span>
                        <span>{address.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Email:</span>
                        <span>{address.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Địa chỉ:</span>
                        <span>{`${address.address}, ${address.district}, ${address.province}`}</span>
                      </div>
                      {address.note && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Ghi chú:</span>
                          <span>{address.note}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {!address.isDefault && (
                        <button
                          onClick={() => handleSetDefaultAddress(address._id)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          Đặt làm mặc định
                        </button>
                      )}
                      <button
                        onClick={() => handleEditAddress(address)}
                        className="text-gray-600 hover:text-gray-700"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteAddress(address._id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                  {address.isDefault && (
                    <div className="mt-2 text-sm text-blue-600">
                      Địa chỉ mặc định
                    </div>
                  )}
                </div>
              ))}
            </div>

            {shippingAddresses.length === 0 && (
              <div className="text-center py-4">
                <p className="text-red-500 mb-2">Bạn chưa có địa chỉ giao hàng nào</p>
                <button
                  onClick={handleAddNewAddress}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Thêm địa chỉ ngay
                </button>
              </div>
            )}
          </div>

          {/* Shipping Method */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">Phương thức vận chuyển</h3>
            <div className="space-y-4">
              {SHIPPING_METHODS.map(method => (
                <label
                  key={`shipping-${method.value}`}
                  className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                    shipping.value === method.value ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="shipping"
                    checked={shipping.value === method.value}
                    onChange={() => setShipping(method)}
                    className="hidden"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {method.icon}
                      <span className="font-medium">{method.label}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Dự kiến: {method.estimate}</p>
                  </div>
                  <span className="font-medium">
                    {method.fee === 0 ? 'Miễn phí' : formatCurrency(method.fee)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">Phương thức thanh toán</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PAYMENT_METHODS.map(method => (
                <label
                  key={`payment-${method.value}`}
                  className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                    payment.value === method.value ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={payment.value === method.value}
                    onChange={() => setPayment(method)}
                    className="hidden"
                  />
                  {method.icon}
                  <span className="font-medium">{method.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-4">
            <h3 className="text-xl font-semibold mb-4">Tóm tắt đơn hàng</h3>
            
            {/* Voucher Section */}
            <div className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nhập mã giảm giá"
                  value={voucherCode}
                  onChange={e => {
                    setVoucherCode(e.target.value);
                    setVoucherError('');
                  }}
                  onKeyPress={e => {
                    if (e.key === 'Enter') {
                      handleApplyVoucher();
                    }
                  }}
                  className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={() => setShowVoucherModal(true)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  <FaGift />
                </button>
              </div>
              {voucherError && (
                <p className="mt-2 text-sm text-red-500">{voucherError}</p>
              )}
              {appliedVoucher && (
                <div className="mt-2 flex items-center justify-between text-green-600">
                  <span>Đã áp dụng: {appliedVoucher.code}</span>
                  <button
                    onClick={() => {
                      setAppliedVoucher(null);
                      setVoucherCode('');
                      setDiscount(0);
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Tạm tính</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phí vận chuyển</span>
                <span>{shipping.fee === 0 ? 'Miễn phí' : formatCurrency(shipping.fee)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Giảm giá</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}
              <div className="border-t border-gray-200 my-3"></div>
              <div className="flex justify-between font-bold text-lg">
                <span>Tổng thanh toán</span>
                <span className="text-blue-600">{formatCurrency(total)}</span>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              className="w-full mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
              onClick={handlePlaceOrder}
              disabled={isSubmitting || shippingAddresses.length === 0}
            >
              {isSubmitting ? 'Đang xử lý...' : shippingAddresses.length === 0 ? 'Vui lòng thêm địa chỉ giao hàng' : 'Đặt hàng'}
            </button>
          </div>
        </div>
      </div>

      {/* Voucher Modal */}
      {showVoucherModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Mã giảm giá của bạn</h2>
              <button
                onClick={() => setShowVoucherModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {userVouchers.length > 0 ? (
                userVouchers.map((voucher) => (
                  <div
                    key={`voucher-${voucher.id}`}
                    className="p-4 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleSelectVoucher(voucher)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-lg">{voucher.code}</div>
                        <div className="text-sm text-gray-500 mt-1">
                          {voucher.type === 'percentage'
                            ? `Giảm ${voucher.discount}%`
                            : `Giảm ${formatCurrency(voucher.discount)}`}
                        </div>
                        {voucher.userId && (
                          <div className="text-xs text-blue-500 mt-1">
                            Voucher dành riêng cho bạn
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        Đơn tối thiểu: {formatCurrency(voucher.minOrder)}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 mt-2">
                      HSD: {formatDate(voucher.endDate)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  Bạn chưa có voucher nào
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {isNewAddress ? 'Thêm địa chỉ mới' : 'Chỉnh sửa địa chỉ'}
              </h2>
              <button
                onClick={() => setShowAddressModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên *</label>
                <input
                  type="text"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formErrors.name ? 'border-red-500' : ''
                  }`}
                  value={form.name}
                  onChange={e => {
                    setForm(f => ({ ...f, name: e.target.value }));
                    setFormErrors(prev => ({ ...prev, name: '' }));
                  }}
                />
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại *</label>
                <input
                  type="tel"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formErrors.phone ? 'border-red-500' : ''
                  }`}
                  value={form.phone}
                  onChange={e => {
                    setForm(f => ({ ...f, phone: e.target.value }));
                    setFormErrors(prev => ({ ...prev, phone: '' }));
                  }}
                />
                {formErrors.phone && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.phone}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formErrors.email ? 'border-red-500' : ''
                  }`}
                  value={form.email}
                  onChange={e => {
                    setForm(f => ({ ...f, email: e.target.value }));
                    setFormErrors(prev => ({ ...prev, email: '' }));
                  }}
                />
                {formErrors.email && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tỉnh/Thành phố *</label>
                <select
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formErrors.province ? 'border-red-500' : ''
                  }`}
                  value={Array.isArray(provinces) && provinces.find(p => p.Name === form.province)?.Id || ''}
                  onChange={(e) => {
                    handleProvinceChange(e.target.value);
                    setFormErrors(prev => ({ ...prev, province: '' }));
                  }}
                >
                  <option value="">Chọn tỉnh/thành phố</option>
                  {Array.isArray(provinces) && provinces.map(province => (
                    <option key={province.Id} value={province.Id}>
                      {province.Name}
                    </option>
                  ))}
                </select>
                {formErrors.province && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.province}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quận/Huyện *</label>
                <select
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formErrors.district ? 'border-red-500' : ''
                  }`}
                  value={Array.isArray(districts) && districts.find(d => d.Name === form.district)?.Id || ''}
                  onChange={(e) => {
                    handleDistrictChange(e.target.value);
                    setFormErrors(prev => ({ ...prev, district: '' }));
                  }}
                  disabled={!form.province}
                >
                  <option value="">Chọn quận/huyện</option>
                  {Array.isArray(districts) && districts.map(district => (
                    <option key={district.Id} value={district.Id}>
                      {district.Name}
                    </option>
                  ))}
                </select>
                {formErrors.district && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.district}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phường/Xã *</label>
                <select
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formErrors.ward ? 'border-red-500' : ''
                  }`}
                  value={Array.isArray(wards) && wards.find(w => w.Name === form.ward)?.Id || ''}
                  onChange={(e) => {
                    const selectedWard = Array.isArray(wards) && wards.find(w => w.Id === e.target.value);
                    if (selectedWard) {
                      setForm(prev => ({ ...prev, ward: selectedWard.Name }));
                      setFormErrors(prev => ({ ...prev, ward: '' }));
                    }
                  }}
                  disabled={!form.district}
                >
                  <option value="">Chọn phường/xã</option>
                  {Array.isArray(wards) && wards.map(ward => (
                    <option key={ward.Id} value={ward.Id}>
                      {ward.Name}
                    </option>
                  ))}
                </select>
                {formErrors.ward && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.ward}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ cụ thể *</label>
                <input
                  type="text"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formErrors.address ? 'border-red-500' : ''
                  }`}
                  value={form.address}
                  onChange={e => {
                    setForm(f => ({ ...f, address: e.target.value }));
                    setFormErrors(prev => ({ ...prev, address: '' }));
                  }}
                />
                {formErrors.address && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.address}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                <textarea
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={form.note}
                  onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                  rows="3"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={() => setShowAddressModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveAddress}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {isNewAddress ? 'Thêm địa chỉ' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 