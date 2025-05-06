import React, { useState, useRef, useEffect } from 'react';
import { Button, Avatar, Modal, Tooltip } from 'antd';
import { 
  GiftOutlined,
  MinusCircleOutlined,
  LoadingOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { FaGift } from 'react-icons/fa';

const prizes = [
  { id: 1, name: '50K', probability: 0.1, color: '#FF6B6B' },
  { id: 2, name: '100K', probability: 0.05, color: '#4ECDC4' },
  { id: 3, name: '200K', probability: 0.02, color: '#45B7D1' },
  { id: 4, name: 'Free Ship', probability: 0.15, color: '#96CEB4' },
  { id: 5, name: 'Chúc may mắn', probability: 0.68, color: '#FFEEAD' },
];

const Random = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [rotation, setRotation] = useState(0);
  const wheelRef = useRef(null);
  const [pressStart, setPressStart] = useState(null);
  const [pendingSpin, setPendingSpin] = useState(false);

  // Hàm xử lý khi bắt đầu nhấn giữ nút quay
  const handleSpinPress = () => {
    setPressStart(Date.now());
    setPendingSpin(true);
  };

  // Hàm xử lý khi thả nút quay
  const handleSpinRelease = () => {
    if (!pendingSpin) return;
    setPendingSpin(false);
    const now = Date.now();
    const holdMs = Math.min(now - pressStart, 3000); // Giới hạn tối đa 3s
    const minRounds = 8;
    const maxRounds = 20;
    // Số vòng tỷ lệ thuận với thời gian giữ
    const spinRounds = minRounds + Math.round((maxRounds - minRounds) * (holdMs / 3000));
    spinWheel(spinRounds);
  };

  // Sửa spinWheel nhận số vòng làm tham số
  const spinWheel = (spinRounds = 8 + Math.floor(Math.random() * 5)) => {
    if (isSpinning) return;
    setIsSpinning(true);
    setResult(null);

    // 1. Đầu tiên chọn phần thưởng dựa trên xác suất, đảm bảo khác với kết quả trước
    let selectedPrize;
    do {
      const random = Math.random();
      let cumulativeProbability = 0;
      selectedPrize = prizes[prizes.length - 1];
      for (const prize of prizes) {
        cumulativeProbability += prize.probability;
        if (random <= cumulativeProbability) {
          selectedPrize = prize;
          break;
        }
      }
    } while (result && selectedPrize.id === result.id);

    // 2. Tính toán góc quay để phần thưởng trúng nằm ở vị trí mũi tên trên cùng
    const prizeIndex = prizes.findIndex(p => p.id === selectedPrize.id);
    const sectorAngle = 360 / prizes.length;
    // Tính góc để phần thưởng nằm ở vị trí mũi tên (180 độ)
    const targetAngle = 180 - (prizeIndex * sectorAngle + sectorAngle / 2);
    // Thêm một chút ngẫu nhiên để tạo hiệu ứng tự nhiên
    const jitter = (Math.random() - 0.5) * 10;
    // Luôn quay đúng 3 vòng (1080 độ) trước khi dừng
    const finalRotation = 360 * 3 + targetAngle + jitter;

    // Reset rotation về 0 trước khi quay
    setRotation(0);
    // Đợi một chút để reset hoàn tất
    setTimeout(() => {
      setRotation(finalRotation);
      // Thời gian quay cố định 6 giây (2 giây cho mỗi vòng)
      const spinDuration = 6000;
      setTimeout(() => {
        setIsSpinning(false);
        setResult(selectedPrize);
      }, spinDuration);
    }, 50);
  };

  // Hỗ trợ phím tắt Ctrl+Enter để quay
  useEffect(() => {
    if (!isModalOpen) return;
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'Enter') {
        spinWheel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, isSpinning]);

  // Nội dung vòng quay trong modal
  const renderWheel = () => (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-[500px] h-[500px] mx-auto mb-8">
        <div
          ref={wheelRef}
          className="w-full h-full rounded-full border-[12px] border-gray-200 shadow-2xl relative"
          style={{
            transform: `rotate(${rotation}deg)`,
            background: `conic-gradient(${prizes.map((prize, index) =>
              `${prize.color} ${(index * 100) / prizes.length}% ${((index + 1) * 100) / prizes.length}%`
            ).join(', ')})`,
            transition: 'transform 6s cubic-bezier(0.17, 0.67, 0.83, 0.67)',
            transformOrigin: 'center',
            willChange: 'transform'
          }}
        >
          {prizes.map((prize, index) => {
            const angle = (360 / prizes.length) * (index + 0.5);
            // Đặt label ra xa tâm, luôn nằm ngang
            return (
              <div
                key={prize.id}
                className="absolute left-1/2 top-1/2"
                style={{
                  transform: `rotate(${angle}deg) translateY(-175px) rotate(${-angle}deg)`,
                  // 175px ~ 70% bán kính (500px/2*0.7)
                  width: '120px',
                  marginLeft: '-60px', // căn giữa label
                  textAlign: 'center',
                  pointerEvents: 'none',
                }}
              >
                <span
                  className="font-bold text-3xl px-2"
                  style={{
                    color: index % 2 === 0 ? '#222' : '#333',
                    textShadow: '2px 2px 8px rgba(255,255,255,0.7)',
                    background: 'rgba(255,255,255,0.6)',
                    borderRadius: '12px',
                    display: 'inline-block',
                  }}
                >
                  {prize.name}
                </span>
              </div>
            );
          })}
        </div>
        {/* Mũi tên chỉ */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[24px] border-r-[24px] border-t-[48px] border-l-transparent border-r-transparent border-t-yellow-400 drop-shadow-lg"></div>
        {/* Hướng dẫn ở giữa vòng quay */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center font-extrabold text-3xl text-white select-none pointer-events-none"
          style={{
            textShadow: '3px 3px 12px #000, 0 0 8px #fff',
            lineHeight: 1.2,
            background: 'rgba(0,0,0,0.25)',
            borderRadius: '16px',
            padding: '8px 16px',
          }}
        >
          Click để quay<br />hoặc nhấn <span style={{color:'#ffe600'}}>ctrl+enter</span>
        </div>
      </div>
      {/* Kết quả */}
      {result && (
        <div className="text-center mb-6">
          <p className="text-3xl font-bold text-green-600 drop-shadow">Chúc mừng!</p>
          <p className="text-4xl font-extrabold text-red-500 drop-shadow-lg">{result.name}</p>
        </div>
      )}
      {/* Nút quay */}
      <Button
        type="primary"
        size="large"
        className="w-60 h-16 text-2xl bg-red-500 hover:bg-red-600 shadow-xl"
        onMouseDown={handleSpinPress}
        onMouseUp={handleSpinRelease}
        onMouseLeave={handleSpinRelease}
        onTouchStart={handleSpinPress}
        onTouchEnd={handleSpinRelease}
        disabled={isSpinning}
        icon={isSpinning ? <LoadingOutlined className="text-2xl" /> : <GiftOutlined className="text-2xl" />}
      >
        {isSpinning ? 'Đang quay...' : 'Quay ngay'}
      </Button>
      {/* Thể lệ */}
      <div className="mt-8 text-lg text-gray-600">
        <p className="font-bold mb-2">Thể lệ:</p>
        <ul className="list-disc list-inside space-y-2">
          <li>Mỗi người chỉ được quay 1 lần/ngày</li>
          <li>Phần thưởng sẽ được gửi qua email</li>
          <li>Voucher có hiệu lực trong 30 ngày</li>
        </ul>
      </div>
    </div>
  );

  return (
    <div className="fixed bottom-5 left-6 z-50">
      <Tooltip title="Vòng quay may mắn">
        <Button
          type="primary"
          shape="circle"
          size="large"
          icon={<FaGift className="text-3xl" />}
          className="bg-red-500 hover:bg-red-600 shadow-lg transition-all duration-300 hover:scale-110 w-24 h-24"
          aria-label="Open Lucky Wheel"
          onClick={() => setIsModalOpen(true)}
        />
      </Tooltip>
      <Modal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        centered
        width={700}
        closeIcon={<CloseOutlined style={{ fontSize: 32, color: '#ff4d4f' }} />}
        bodyStyle={{ padding: 0, background: 'linear-gradient(135deg, #222 60%, #ffe600 100%)', borderRadius: 24 }}
        maskStyle={{ background: 'rgba(0,0,0,0.5)' }}
        className="lucky-wheel-modal"
      >
        <div className="p-10 flex flex-col items-center justify-center">
          {renderWheel()}
        </div>
      </Modal>
      <style>{`
        .lucky-wheel-modal .ant-modal-content {
          border-radius: 24px;
          box-shadow: 0 8px 40px rgba(0,0,0,0.25);
        }
        .lucky-wheel-modal .ant-modal-close {
          top: 24px;
          right: 24px;
        }
      `}</style>
    </div>
  );
};

export default Random;
