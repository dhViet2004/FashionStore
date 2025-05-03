import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaTruck, FaCreditCard, FaGift, FaCheck } from 'react-icons/fa';

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

  // Thông tin form
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    province: '',
    district: '',
    address: '',
    note: '',
  });
  const [shipping, setShipping] = useState(SHIPPING_METHODS[0]);
  const [payment, setPayment] = useState(PAYMENT_METHODS[0]);
  const [voucherCode, setVoucherCode] = useState(order?.voucher || '');
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherError, setVoucherError] = useState('');
  const [availableVouchers, setAvailableVouchers] = useState([]);
  const [userVouchers, setUserVouchers] = useState([]);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeStep, setActiveStep] = useState(1);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;
    fetchVouchers(user.id);
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

  // Tổng tiền sản phẩm
  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  // Tổng thanh toán cuối cùng
  const total = subtotal + shipping.fee - discount;

  // Áp dụng voucher
  const handleApplyVoucher = async () => {
    setVoucherError('');
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;
    try {
      const response = await fetch(`${API_URL}/vouchers`);
      if (!response.ok) throw new Error('Failed to check voucher');
      const allVouchers = await response.json();
      const voucher = allVouchers.find(v => v.code === voucherCode.toUpperCase());
      if (!voucher) {
        setVoucherError('Mã giảm giá không tồn tại');
        setAppliedVoucher(null);
        setDiscount(0);
        return;
      }
      if (voucher.userId && voucher.userId !== user.id) {
        setVoucherError('Bạn không có quyền sử dụng voucher này');
        setAppliedVoucher(null);
        setDiscount(0);
        return;
      }
      const currentDate = new Date();
      const startDate = new Date(voucher.startDate);
      const endDate = new Date(voucher.endDate);
      if (currentDate < startDate) {
        setVoucherError('Mã giảm giá chưa có hiệu lực');
        setAppliedVoucher(null);
        setDiscount(0);
        return;
      }
      if (currentDate > endDate) {
        setVoucherError('Mã giảm giá đã hết hạn');
        setAppliedVoucher(null);
        setDiscount(0);
        return;
      }
      if (subtotal < voucher.minOrder) {
        setVoucherError(`Đơn hàng tối thiểu ${formatCurrency(voucher.minOrder)} để áp dụng mã này`);
        setAppliedVoucher(null);
        setDiscount(0);
        return;
      }
      if (voucher.usedBy && voucher.usedBy.includes(user.id)) {
        setVoucherError('Bạn đã sử dụng mã giảm giá này');
        setAppliedVoucher(null);
        setDiscount(0);
        return;
      }
      setAppliedVoucher(voucher);
      setVoucherError('');
      setDiscount(voucher.type === 'fixed' ? voucher.discount : (subtotal * voucher.discount) / 100);
    } catch (error) {
      setVoucherError('Có lỗi xảy ra khi áp dụng mã giảm giá');
      setAppliedVoucher(null);
      setDiscount(0);
    }
  };

  const handleSelectVoucher = (voucher) => {
    setVoucherCode(voucher.code);
    setShowVoucherModal(false);
    setVoucherError('');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const handlePlaceOrder = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      alert('Đặt hàng thành công!');
      navigate('/');
    }, 1200);
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
            <div key={step} className="flex flex-col items-center">
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
                <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
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
            <h3 className="text-xl font-semibold mb-4">Thông tin giao hàng</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                <input
                  type="tel"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tỉnh/Thành phố</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={form.province}
                  onChange={e => setForm(f => ({ ...f, province: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quận/Huyện</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={form.district}
                  onChange={e => setForm(f => ({ ...f, district: e.target.value }))}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ cụ thể</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={form.address}
                  onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                />
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
          </div>

          {/* Shipping Method */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">Phương thức vận chuyển</h3>
            <div className="space-y-4">
              {SHIPPING_METHODS.map(method => (
                <label
                  key={method.value}
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
                  key={method.value}
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
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Đang xử lý...' : 'Đặt hàng'}
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
                    key={voucher.id}
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
                      HSD: {new Date(voucher.endDate).toLocaleDateString('vi-VN')}
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
    </div>
  );
} 