import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaTruck, FaCreditCard, FaGift, FaCheck, FaCheckCircle } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useCart } from '../hooks/useCart';
import { Modal, Form, Input, Select, Button } from 'antd';

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

  // Form state
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

  // Address state
  const [shippingAddresses, setShippingAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isNewAddress, setIsNewAddress] = useState(true);
  const [showAddressModal, setShowAddressModal] = useState(false);

  // Shipping & Payment state
  const [shipping, setShipping] = useState(SHIPPING_METHODS[0]);
  const [payment, setPayment] = useState(PAYMENT_METHODS[0]);

  // Voucher state
  const [voucherCode, setVoucherCode] = useState(order?.voucher || '');
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherError, setVoucherError] = useState('');
  const [availableVouchers, setAvailableVouchers] = useState([]);
  const [userVouchers, setUserVouchers] = useState([]);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [discount, setDiscount] = useState(0);

  // Order state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Error state
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessages, setErrorMessages] = useState([]);
  const [formErrors, setFormErrors] = useState({
    name: '',
    phone: '',
    email: '',
    province: '',
    district: '',
    ward: '',
    address: '',
  });

  // Address data state
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Memoized calculations
  const subtotal = useMemo(() => 
    order.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [order.items]
  );

  const total = useMemo(() => 
    subtotal + shipping.fee - discount,
    [subtotal, shipping.fee, discount]
  );

  // Fetch user data on mount
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;
    fetchVouchers(user.id);
    fetchShippingAddresses(user.id);
    fetchProvinces();
  }, []);

  // Fetch vouchers
  const fetchVouchers = useCallback(async (userId) => {
    try {
      const response = await fetch(`${API_URL}/vouchers`);
      if (!response.ok) throw new Error('Failed to fetch vouchers');
      const allVouchers = await response.json();
      const userSpecificVouchers = allVouchers.filter(voucher => {
        if (voucher.userIds && voucher.userIds.length > 0) {
          if (!voucher.userIds.includes(userId)) {
            console.log(`${voucher.code}: Filtered out - Not in userIds list`);
            return false;
          }
        } else {
          console.log(`${voucher.code}: Available for all users`);
        }

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
  }, []);

  // Fetch shipping addresses
  const fetchShippingAddresses = useCallback(async (userId) => {
    try {
      const userResponse = await fetch(`${API_URL}/users/${userId}`);
      if (!userResponse.ok) throw new Error('Failed to fetch user');
      const user = await userResponse.json();
      
      const addresses = user.addresses || [];
      setShippingAddresses(addresses);
      
      const defaultAddress = addresses.find(addr => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress._id);
        setForm(defaultAddress);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      setShippingAddresses([]);
    }
  }, []);

  // Fetch provinces
  const fetchProvinces = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/vietnam-addresses`);
      if (!response.ok) throw new Error('Failed to fetch provinces');
      const data = await response.json();
      setProvinces(data['vietnam-addresses'] || []);
    } catch (error) {
      console.error('Error fetching provinces:', error);
      setProvinces([]);
    }
  }, []);

  // Handle province change
  const handleProvinceChange = useCallback((provinceId) => {
    const selectedProvince = provinces.find(p => p.Id === provinceId);
    if (selectedProvince) {
      setDistricts(selectedProvince.Districts || []);
      setWards([]);
      setForm(prev => ({
        ...prev,
        province: selectedProvince.Name,
        district: '',
        ward: ''
      }));
    }
  }, [provinces]);

  // Handle district change
  const handleDistrictChange = useCallback((districtId) => {
    const selectedDistrict = districts.find(d => d.Id === districtId);
    if (selectedDistrict) {
      setWards(selectedDistrict.Wards || []);
      setForm(prev => ({
        ...prev,
        district: selectedDistrict.Name,
        ward: ''
      }));
    }
  }, [districts]);

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

      // Kiểm tra voucher có userIds không
      if (voucher.userIds && voucher.userIds.length > 0) {
        // Nếu có userIds, kiểm tra user hiện tại có trong danh sách không
        if (!voucher.userIds.includes(user.id)) {
          setVoucherError('Bạn không có quyền sử dụng voucher này');
          toast.error('Bạn không có quyền sử dụng voucher này');
          setAppliedVoucher(null);
          setDiscount(0);
          return;
        }
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

      // Kiểm tra voucher có userIds không
      if (voucher.userIds && voucher.userIds.length > 0) {
        // Nếu có userIds, kiểm tra user hiện tại có trong danh sách không
        if (!voucher.userIds.includes(user.id)) {
          setVoucherError('Bạn không có quyền sử dụng voucher này');
          toast.error('Bạn không có quyền sử dụng voucher này');
          return;
        }
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

  const validateOrderConditions = () => {
    const errors = [];
    
    // Kiểm tra form
    if (!validateForm()) {
      errors.push('Vui lòng điền đầy đủ thông tin giao hàng');
    }

    // Kiểm tra địa chỉ
    if (shippingAddresses.length === 0) {
      errors.push('Vui lòng thêm ít nhất một địa chỉ giao hàng');
    }

    // Kiểm tra số lượng đơn hàng đang xử lý
    if (isProcessing) {
      errors.push('Đang xử lý đơn hàng, vui lòng đợi');
    }

    // Kiểm tra voucher nếu có
    if (appliedVoucher) {
      const orderTotal = subtotal + shipping.fee;
      if (orderTotal < appliedVoucher.minOrder) {
        const remaining = appliedVoucher.minOrder - orderTotal;
        errors.push(`Đơn hàng tối thiểu ${formatCurrency(appliedVoucher.minOrder)} để áp dụng mã này. Bạn cần thêm ${formatCurrency(remaining)}`);
      }
    }

    setErrorMessages(errors);
    return errors.length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validateOrderConditions()) {
      setShowErrorModal(true);
      return;
    }

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      setErrorMessages(['Vui lòng đăng nhập để đặt hàng']);
      setShowErrorModal(true);
      return;
    }

    // Kiểm tra nếu là phương thức thanh toán trực tuyến
    if (payment.value === 'qr' || payment.value === 'bank' || payment.value === 'e-wallet' || payment.value === 'card') {
      setShowPaymentModal(true);
      return;
    }

    // Nếu là COD thì tiếp tục đặt hàng
    try {
      setIsProcessing(true);
      const existingOrderResponse = await fetch(`${API_URL}/orders?userId=${user.id}&status=pending`);
      const existingOrders = await existingOrderResponse.json();
      
      if (existingOrders.length >= 5) {
        setErrorMessages(['Bạn đã có 5 đơn hàng đang xử lý. Vui lòng đợi các đơn hàng hiện tại hoàn thành.']);
        setShowErrorModal(true);
        setIsProcessing(false);
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
          status: 'Completed' // Đã thanh toán vì là thanh toán trực tuyến
        },
        voucher: appliedVoucher ? {
          code: appliedVoucher.code,
          discount: discount
        } : null,
        status: 'pending',
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
        
        // Cập nhật số lượng sản phẩm
        for (const item of order.items) {
          try {
            // Lấy thông tin sản phẩm hiện tại
            const productResponse = await fetch(`${API_URL}/products/${item.id}`);
            if (!productResponse.ok) throw new Error('Failed to fetch product');
            const product = await productResponse.json();

            // Cập nhật số lượng sản phẩm
            const updatedQuantity = product.quantity - item.quantity;
            const updateProductResponse = await fetch(`${API_URL}/products/${item.id}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                quantity: updatedQuantity
              })
            });

            if (!updateProductResponse.ok) {
              console.error(`Failed to update quantity for product ${item.id}`);
            }
          } catch (error) {
            console.error(`Error updating product quantity for ${item.id}:`, error);
          }
        }
        
        // Nếu có áp dụng voucher, thêm userId vào usedBy của voucher
        if (appliedVoucher) {
          try {
            const voucherResponse = await fetch(`${API_URL}/vouchers/${appliedVoucher.id}`);
            if (!voucherResponse.ok) throw new Error('Failed to fetch voucher');
            
            const voucher = await voucherResponse.json();
            const updatedUsedBy = [...(voucher.usedBy || []), user.id];
            
            const updateVoucherResponse = await fetch(`${API_URL}/vouchers/${appliedVoucher.id}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                usedBy: updatedUsedBy
              })
            });
            
            if (!updateVoucherResponse.ok) {
              console.error('Failed to update voucher usedBy');
            }
          } catch (error) {
            console.error('Error updating voucher usedBy:', error);
          }
        }
        
        // Xóa các sản phẩm đã đặt hàng khỏi giỏ hàng
        for (const itemId of order.items.map(item => item.id)) {
          await fetch(`${API_URL}/cart/${itemId}?userId=${user.id}`, { method: 'DELETE' });
        }
        
        // Cập nhật số lượng giỏ hàng ngay lập tức
        updateCountImmediately(0);
        toast.success('Đặt hàng thành công! Cảm ơn bạn đã mua hàng.');
      } else {
        throw new Error('Failed to place order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      setErrorMessages(['Không thể đặt hàng. Vui lòng thử lại sau.']);
      setShowErrorModal(true);
    } finally {
      setLoading(false);
      setIsProcessing(false);
    }
  };

  // Thêm hàm xử lý xác nhận thanh toán
  const handleConfirmPayment = async () => {
    setShowPaymentModal(false);
    try {
      setIsProcessing(true);
      const existingOrderResponse = await fetch(`${API_URL}/orders?userId=${user.id}&status=pending`);
      const existingOrders = await existingOrderResponse.json();
      
      if (existingOrders.length >= 5) {
        setErrorMessages(['Bạn đã có 5 đơn hàng đang xử lý. Vui lòng đợi các đơn hàng hiện tại hoàn thành.']);
        setShowErrorModal(true);
        setIsProcessing(false);
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
          status: 'Completed' // Đã thanh toán vì là thanh toán trực tuyến
        },
        voucher: appliedVoucher ? {
          code: appliedVoucher.code,
          discount: discount
        } : null,
        status: 'pending',
        createdAt: formatDate(new Date())
      };

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
        
        // Cập nhật số lượng sản phẩm
        for (const item of order.items) {
          try {
            // Lấy thông tin sản phẩm hiện tại
            const productResponse = await fetch(`${API_URL}/products/${item.id}`);
            if (!productResponse.ok) throw new Error('Failed to fetch product');
            const product = await productResponse.json();

            // Cập nhật số lượng sản phẩm
            const updatedQuantity = product.quantity - item.quantity;
            const updateProductResponse = await fetch(`${API_URL}/products/${item.id}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                quantity: updatedQuantity
              })
            });

            if (!updateProductResponse.ok) {
              console.error(`Failed to update quantity for product ${item.id}`);
            }
          } catch (error) {
            console.error(`Error updating product quantity for ${item.id}:`, error);
          }
        }
        
        // Nếu có áp dụng voucher, thêm userId vào usedBy của voucher
        if (appliedVoucher) {
          try {
            const voucherResponse = await fetch(`${API_URL}/vouchers/${appliedVoucher.id}`);
            if (!voucherResponse.ok) throw new Error('Failed to fetch voucher');
            
            const voucher = await voucherResponse.json();
            const updatedUsedBy = [...(voucher.usedBy || []), user.id];
            
            const updateVoucherResponse = await fetch(`${API_URL}/vouchers/${appliedVoucher.id}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                usedBy: updatedUsedBy
              })
            });
            
            if (!updateVoucherResponse.ok) {
              console.error('Failed to update voucher usedBy');
            }
          } catch (error) {
            console.error('Error updating voucher usedBy:', error);
          }
        }
        
        // Xóa các sản phẩm đã đặt hàng khỏi giỏ hàng
        for (const itemId of order.items.map(item => item.id)) {
          await fetch(`${API_URL}/cart/${itemId}?userId=${user.id}`, { method: 'DELETE' });
        }
        
        // Cập nhật số lượng giỏ hàng ngay lập tức
        updateCountImmediately(0);
        toast.success('Đặt hàng thành công! Cảm ơn bạn đã mua hàng.');
      } else {
        throw new Error('Failed to place order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      setErrorMessages(['Không thể đặt hàng. Vui lòng thử lại sau.']);
      setShowErrorModal(true);
    } finally {
      setLoading(false);
      setIsProcessing(false);
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
      {/* Error Modal */}
      <Modal
        title="Không thể đặt hàng"
        open={showErrorModal}
        onCancel={() => setShowErrorModal(false)}
        footer={[
          <Button key="close" onClick={() => setShowErrorModal(false)}>
            Đóng
          </Button>
        ]}
        width={500}
        className="error-modal"
        style={{ top: 20 }}
        bodyStyle={{ padding: '24px' }}
      >
        <style>
          {`
            .error-modal .ant-modal-content {
              border-radius: 12px;
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            }
            .error-modal .ant-modal-header {
              border-bottom: 2px solid #f0f0f0;
              padding: 16px 24px;
            }
            .error-modal .ant-modal-title {
              font-size: 20px;
              font-weight: 600;
              color: #ff4d4f;
            }
            .error-modal .error-list {
              list-style: none;
              padding: 0;
              margin: 0;
            }
            .error-modal .error-item {
              display: flex;
              align-items: flex-start;
              gap: 8px;
              padding: 8px 0;
              color: #666;
            }
            .error-modal .error-item:not(:last-child) {
              border-bottom: 1px solid #f0f0f0;
            }
            .error-modal .error-icon {
              color: #ff4d4f;
              font-size: 16px;
              margin-top: 2px;
            }
          `}
        </style>
        <div className="error-list">
          {errorMessages.map((message, index) => (
            <div key={index} className="error-item">
              <span className="error-icon">•</span>
              <span>{message}</span>
            </div>
          ))}
        </div>
      </Modal>

      {/* Success Payment Modal */}
      <Modal
        open={orderSuccess}
        footer={null}
        closable={false}
        width={400}
        className="success-payment-modal"
        style={{ top: '20%' }}
      >
        <style>
          {`
            .success-payment-modal .ant-modal-content {
              border-radius: 16px;
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
              overflow: hidden;
            }
            .success-payment-modal .success-icon {
              animation: scaleIn 0.5s ease-out;
            }
            .success-payment-modal .success-text {
              animation: fadeIn 0.5s ease-out 0.3s both;
            }
            @keyframes scaleIn {
              0% {
                transform: scale(0);
                opacity: 0;
              }
              50% {
                transform: scale(1.2);
              }
              100% {
                transform: scale(1);
                opacity: 1;
              }
            }
            @keyframes fadeIn {
              from {
                opacity: 0;
                transform: translateY(10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}
        </style>
        <div className="text-center py-8">
          <div className="success-icon mb-6">
            <FaCheckCircle className="text-green-500 text-6xl mx-auto" />
          </div>
          <div className="success-text">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Thanh toán thành công!</h3>
            <p className="text-gray-600 mb-6">Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đang được xử lý.</p>
            <div className="space-y-2 text-sm text-gray-500">
              <p>Mã đơn hàng: #{orderId}</p>
              <p>Thời gian đặt hàng: {formatDate(new Date())}</p>
            </div>
            <div className="mt-8">
              <button
                onClick={() => {
                  setOrderSuccess(false);
                  navigate('/');
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      </Modal>

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
                className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium add-address-btn"
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
                    <div className="flex gap-2 address-actions">
                      {!address.isDefault && (
                        <button
                          onClick={() => handleSetDefaultAddress(address._id)}
                          className="default-btn hover:text-green-600"
                        >
                          Đặt làm mặc định
                        </button>
                      )}
                      <button
                        onClick={() => handleEditAddress(address)}
                        className="edit-btn hover:text-blue-600"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteAddress(address._id)}
                        className="delete-btn hover:text-red-600"
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 add-address-btn"
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
                    className="cursor-pointer"
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
                    className="cursor-pointer"
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
              <style>
                {`
                  .voucher-item {
                    border: 1px solid #f0f0f0;
                    border-radius: 8px;
                    padding: 16px;
                    margin-bottom: 12px;
                    transition: all 0.3s ease;
                    position: relative;
                  }
                  .voucher-item:hover {
                    border-color: #40a9ff;
                    box-shadow: 0 2px 8px rgba(24, 144, 255, 0.15);
                    transform: translateY(-2px);
                  }
                  .voucher-item .voucher-code {
                    font-size: 18px;
                    font-weight: 600;
                    color: #1890ff;
                  }
                  .voucher-item .voucher-discount {
                    color: #52c41a;
                    font-weight: 500;
                  }
                  .voucher-item .voucher-min-order {
                    color: #666;
                    font-size: 13px;
                  }
                  .voucher-item .voucher-expiry {
                    color: #999;
                    font-size: 12px;
                    margin-top: 8px;
                  }
                  .voucher-item .voucher-exclusive {
                    color: #1890ff;
                    font-size: 12px;
                    margin-top: 4px;
                  }
                `}
              </style>
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
                  className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-text"
                />
                <button
                  onClick={() => setShowVoucherModal(true)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer"
                >
                  <FaGift />
                </button>
              </div>
              {voucherError && (
                <p className="mt-2 text-sm text-red-500">{voucherError}</p>
              )}
              {appliedVoucher && (
                <div className="mt-3 voucher-item">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="voucher-code">{appliedVoucher.code}</div>
                      <div className="voucher-discount mt-1">
                        {appliedVoucher.type === 'percentage'
                          ? `Giảm ${appliedVoucher.discount}%`
                          : `Giảm ${formatCurrency(appliedVoucher.discount)}`}
                      </div>
                      {appliedVoucher.userId && (
                        <div className="voucher-exclusive">
                          Voucher dành riêng cho bạn
                        </div>
                      )}
                    </div>
                    <div className="voucher-min-order">
                      Đơn tối thiểu: {formatCurrency(appliedVoucher.minOrder)}
                    </div>
                  </div>
                  <div className="voucher-expiry">
                    HSD: {formatDate(appliedVoucher.endDate)}
                  </div>
                  <button
                    onClick={() => {
                      setAppliedVoucher(null);
                      setVoucherCode('');
                      setDiscount(0);
                    }}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
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
              className="w-full mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer"
              onClick={handlePlaceOrder}
              disabled={isSubmitting || shippingAddresses.length === 0 || isProcessing}
            >
              {isProcessing ? 'Đang xử lý...' : isSubmitting ? 'Đang xử lý...' : shippingAddresses.length === 0 ? 'Vui lòng thêm địa chỉ giao hàng' : 'Đặt hàng'}
            </button>
          </div>
        </div>
      </div>

      {/* Voucher Modal */}
      {showVoucherModal && (
        <Modal
          title="Mã giảm giá của bạn"
          open={showVoucherModal}
          onCancel={() => setShowVoucherModal(false)}
          footer={null}
          width={500}
          className="voucher-modal"
          style={{ top: 20 }}
          bodyStyle={{ padding: '24px' }}
        >
          <style>
            {`
              .voucher-modal .ant-modal-content {
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
              }
              .voucher-modal .ant-modal-header {
                border-bottom: 2px solid #f0f0f0;
                padding: 16px 24px;
              }
              .voucher-modal .ant-modal-title {
                font-size: 20px;
                font-weight: 600;
              }
              .voucher-modal .voucher-item {
                border: 1px solid #f0f0f0;
                border-radius: 8px;
                padding: 16px;
                margin-bottom: 12px;
                transition: all 0.3s ease;
                cursor: pointer;
              }
              .voucher-modal .voucher-item:hover {
                border-color: #40a9ff;
                box-shadow: 0 2px 8px rgba(24, 144, 255, 0.15);
                transform: translateY(-2px);
              }
              .voucher-modal .voucher-item .voucher-code {
                font-size: 18px;
                font-weight: 600;
                color: #1890ff;
              }
              .voucher-modal .voucher-item .voucher-discount {
                color: #52c41a;
                font-weight: 500;
              }
              .voucher-modal .voucher-item .voucher-min-order {
                color: #666;
                font-size: 13px;
              }
              .voucher-modal .voucher-item .voucher-expiry {
                color: #999;
                font-size: 12px;
                margin-top: 8px;
              }
              .voucher-modal .voucher-item .voucher-exclusive {
                color: #1890ff;
                font-size: 12px;
                margin-top: 4px;
              }
            `}
          </style>
          <div className="max-h-96 overflow-y-auto">
            {userVouchers.length > 0 ? (
              userVouchers.map((voucher) => (
                <div
                  key={`voucher-${voucher.id}`}
                  className="voucher-item"
                  onClick={() => handleSelectVoucher(voucher)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="voucher-code">{voucher.code}</div>
                      <div className="voucher-discount mt-1">
                        {voucher.type === 'percentage'
                          ? `Giảm ${voucher.discount}%`
                          : `Giảm ${formatCurrency(voucher.discount)}`}
                      </div>
                      {voucher.userId && (
                        <div className="voucher-exclusive">
                          Voucher dành riêng cho bạn
                        </div>
                      )}
                    </div>
                    <div className="voucher-min-order">
                      Đơn tối thiểu: {formatCurrency(voucher.minOrder)}
                    </div>
                  </div>
                  <div className="voucher-expiry">
                    HSD: {formatDate(voucher.endDate)}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                Bạn chưa có voucher nào
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Address Modal */}
      <Modal
        title={isNewAddress ? 'Thêm địa chỉ mới' : 'Chỉnh sửa địa chỉ'}
        open={showAddressModal}
        onCancel={() => setShowAddressModal(false)}
        footer={null}
        width={800}
        className="address-modal"
        style={{ top: 20 }}
        bodyStyle={{ padding: '24px' }}
      >
        <style>
          {`
            .address-modal .ant-modal-content {
              border-radius: 12px;
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            }
            .address-modal .ant-modal-header {
              border-bottom: 2px solid #f0f0f0;
              padding: 16px 24px;
            }
            .address-modal .ant-modal-title {
              font-size: 20px;
              font-weight: 600;
            }
            .address-modal .ant-form-item-label > label {
              font-weight: 500;
            }
            .address-modal .ant-input,
            .address-modal .ant-select-selector {
              border-radius: 8px !important;
              border: 1px solid #d9d9d9;
              cursor: text;
            }
            .address-modal .ant-input:hover,
            .address-modal .ant-select-selector:hover {
              border-color: #40a9ff !important;
            }
            .address-modal .ant-input:focus,
            .address-modal .ant-select-focused .ant-select-selector {
              border-color: #1890ff !important;
              box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1) !important;
            }
            .address-modal .ant-btn {
              border-radius: 8px;
              height: 40px;
              font-weight: 500;
              cursor: pointer;
            }
            .address-modal .ant-btn-primary {
              background: #1890ff;
              box-shadow: 0 2px 6px rgba(24, 144, 255, 0.35);
            }
            .address-modal .ant-btn-primary:hover {
              background: #40a9ff;
              box-shadow: 0 4px 12px rgba(24, 144, 255, 0.45);
            }

            /* Address management styles */
            .address-actions button {
              cursor: pointer;
              transition: all 0.2s ease;
            }
            .address-actions button:hover {
              opacity: 0.8;
            }
            .address-actions .edit-btn {
              color: #1890ff;
            }
            .address-actions .delete-btn {
              color: #ff4d4f;
            }
            .address-actions .default-btn {
              color: #52c41a;
            }
            .add-address-btn {
              cursor: pointer;
              transition: all 0.2s ease;
            }
            .add-address-btn:hover {
              opacity: 0.8;
            }
          `}
        </style>
        <Form
          layout="vertical"
          initialValues={form}
          onFinish={handleSaveAddress}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="name"
              label="Họ tên"
              rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
            >
              <Input placeholder="Nhập họ tên" />
            </Form.Item>

            <Form.Item
              name="phone"
              label="Số điện thoại"
              rules={[
                { required: true, message: 'Vui lòng nhập số điện thoại' },
                { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ' }
              ]}
            >
              <Input placeholder="Nhập số điện thoại" />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Vui lòng nhập email' },
                { type: 'email', message: 'Email không hợp lệ' }
              ]}
            >
              <Input placeholder="Nhập email" />
            </Form.Item>

            <Form.Item
              name="province"
              label="Tỉnh/Thành phố"
              rules={[{ required: true, message: 'Vui lòng chọn tỉnh/thành phố' }]}
            >
              <Select
                placeholder="Chọn tỉnh/thành phố"
                onChange={handleProvinceChange}
                options={provinces.map(province => ({
                  value: province.Id,
                  label: province.Name
                }))}
              />
            </Form.Item>

            <Form.Item
              name="district"
              label="Quận/Huyện"
              rules={[{ required: true, message: 'Vui lòng chọn quận/huyện' }]}
            >
              <Select
                placeholder="Chọn quận/huyện"
                onChange={handleDistrictChange}
                options={districts.map(district => ({
                  value: district.Id,
                  label: district.Name
                }))}
                disabled={!form.province}
              />
            </Form.Item>

            <Form.Item
              name="ward"
              label="Phường/Xã"
              rules={[{ required: true, message: 'Vui lòng chọn phường/xã' }]}
            >
              <Select
                placeholder="Chọn phường/xã"
                options={wards.map(ward => ({
                  value: ward.Id,
                  label: ward.Name
                }))}
                disabled={!form.district}
              />
            </Form.Item>

            <Form.Item
              name="address"
              label="Địa chỉ cụ thể"
              rules={[{ required: true, message: 'Vui lòng nhập địa chỉ cụ thể' }]}
              className="md:col-span-2"
            >
              <Input placeholder="Nhập địa chỉ cụ thể" />
            </Form.Item>

            <Form.Item
              name="note"
              label="Ghi chú"
              className="md:col-span-2"
            >
              <Input.TextArea rows={3} placeholder="Nhập ghi chú (nếu có)" />
            </Form.Item>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <Button onClick={() => setShowAddressModal(false)}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit">
              {isNewAddress ? 'Thêm địa chỉ' : 'Lưu thay đổi'}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Payment QR Modal */}
      <Modal
        title="Thanh toán trực tuyến"
        open={showPaymentModal}
        onCancel={() => setShowPaymentModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowPaymentModal(false)}>
            Hủy
          </Button>,
          <Button 
            key="confirm" 
            type="primary" 
            onClick={handleConfirmPayment}
          >
            Xác nhận thanh toán
          </Button>
        ]}
        width={400}
        className="payment-modal"
        style={{ top: 20 }}
        bodyStyle={{ padding: '24px' }}
      >
        <style>
          {`
            .payment-modal .ant-modal-content {
              border-radius: 12px;
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            }
            .payment-modal .ant-modal-header {
              border-bottom: 2px solid #f0f0f0;
              padding: 16px 24px;
            }
            .payment-modal .ant-modal-title {
              font-size: 20px;
              font-weight: 600;
            }
            .payment-modal .qr-container {
              text-align: center;
              padding: 20px;
              background: #fafafa;
              border-radius: 8px;
              margin-bottom: 20px;
            }
            .payment-modal .qr-code {
              width: 200px;
              height: 200px;
              margin: 0 auto;
              background: #fff;
              padding: 10px;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }
            .payment-modal .payment-info {
              margin-top: 16px;
              padding: 16px;
              background: #f5f5f5;
              border-radius: 8px;
            }
            .payment-modal .payment-info-item {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
              color: #666;
            }
            .payment-modal .payment-info-item:last-child {
              margin-bottom: 0;
              padding-top: 8px;
              border-top: 1px solid #e8e8e8;
              font-weight: 600;
              color: #333;
            }
            .payment-modal .payment-note {
              margin-top: 16px;
              padding: 12px;
              background: #fffbe6;
              border: 1px solid #ffe58f;
              border-radius: 8px;
              color: #666;
              font-size: 13px;
            }
          `}
        </style>
        <div className="qr-container">
          <div className="qr-code">
            {/* Demo QR Code - Thay thế bằng QR code thật khi tích hợp */}
            <div style={{ 
              width: '100%', 
              height: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              background: '#f0f0f0',
              borderRadius: '4px'
            }}>
              <span style={{ color: '#999', fontSize: '14px' }}>QR Code Demo</span>
            </div>
          </div>
        </div>
        <div className="payment-info">
          <div className="payment-info-item">
            <span>Số tiền:</span>
            <span>{formatCurrency(total)}</span>
          </div>
          <div className="payment-info-item">
            <span>Phương thức:</span>
            <span>{payment.label}</span>
          </div>
          <div className="payment-info-item">
            <span>Mã đơn hàng:</span>
            <span>#{Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}</span>
          </div>
        </div>
        <div className="payment-note">
          <p>Lưu ý: Đây là giao diện demo. Trong môi trường thực tế, bạn sẽ thấy:</p>
          <ul style={{ margin: '8px 0 0 20px', padding: 0 }}>
            <li>QR code thật để quét thanh toán</li>
            <li>Thông tin tài khoản ngân hàng (nếu chọn chuyển khoản)</li>
            <li>Form nhập thông tin thẻ (nếu chọn thẻ tín dụng)</li>
          </ul>
        </div>
      </Modal>
    </div>
  );
} 