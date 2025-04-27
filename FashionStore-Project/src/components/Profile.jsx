import React, { useEffect, useState } from 'react';

const Profile = () => {
  const [user, setUser] = useState(null); // State để lưu trữ dữ liệu người dùng
  const [loading, setLoading] = useState(true); // State để xử lý trạng thái loading
  const [error, setError] = useState(''); // State để xử lý lỗi
  const [isModalOpen, setIsModalOpen] = useState(false); // State để mở/đóng modal
  const [editedUser, setEditedUser] = useState({ ...user }); // State để lưu thông tin chỉnh sửa của người dùng

  useEffect(() => {
    const storedUser = localStorage.getItem('user'); // Lấy dữ liệu từ localStorage
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData); // Lưu dữ liệu vào state
      setEditedUser(userData); // Cập nhật state editedUser với dữ liệu hiện tại
      setLoading(false); // Set trạng thái loading là false
    } else {
      setError('No user data found');
      setLoading(false);
    }
  }, []);

  const handleEditProfile = () => {
    setIsModalOpen(true); // Mở modal khi click nút Edit Profile
  };

  const handleCloseModal = () => {
    setIsModalOpen(false); // Đóng modal
  };

  const handleSaveChanges = () => {
    // Lưu thay đổi vào localStorage
    localStorage.setItem('user', JSON.stringify(editedUser));
    setUser(editedUser); // Cập nhật lại dữ liệu người dùng
    setIsModalOpen(false); // Đóng modal
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-xl text-blue-600">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        <span>{error}</span>
      </div>
    );
  }

  // Hàm để định dạng ngày theo kiểu ngày-tháng-năm
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN'); // Sử dụng 'vi-VN' để định dạng ngày tháng năm theo kiểu Việt Nam
  };

  return (
    <div className="container mx-auto px-4 py-8 relative">
      {/* Main Profile Section */}
      <div className="flex flex-col md:flex-row items-center bg-white p-6 rounded-lg shadow-lg mb-8">
        {/* Left: Profile Image */}
        <div className="md:w-1/4 mb-6 md:mb-0">
          <img
            src={user.imageUrl}
            alt={user.name}
            className="w-full h-auto object-cover rounded-full border-4 border-blue-500 mb-4"
          />
        </div>

        {/* Right: Profile Info */}
        <div className="md:w-1/2 ml-0 md:ml-12">
          {/* Profile Name */}
          <h2 className="text-3xl font-semibold text-gray-800">{user.name}</h2>
          <p className="text-lg text-gray-600">@{user.username}</p>
          <p className="text-sm text-gray-500 mt-2">{user.role}</p>

          {/* Additional Info */}
          <div className="mt-6 text-left flex flex-col ">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600 font-semibold">Birthday:</span>
              <span className="text-gray-800">{formatDate(user.birthday)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600 font-semibold">Phone Number:</span>
              <span className="text-gray-800">{user.phoneNumber}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600 font-semibold">Address:</span>
              <span className="text-gray-800">{user.address}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600 font-semibold">Account Created:</span>
              <span className="text-gray-800">{formatDate(user.dateCreate)}</span>
            </div>
            
            {/* Edit Profile Button */}
            <div className="flex justify-end">
                <button
                className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-200"
                onClick={handleEditProfile}
                >
                Edit Profile
                </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Edit Profile</h3>

            {/* Edit Form */}
            <div>
              <label className="block mb-2">Name</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md mb-4"
                value={editedUser.name}
                onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
              />

              <label className="block mb-2">Birth day</label>
              <input
                type="date"
                className="w-full p-2 border border-gray-300 rounded-md mb-4"
                value={editedUser.birthday}
                onChange={(e) => setEditedUser({ ...editedUser, birthday: e.target.value })}
              />

              <label className="block mb-2">Phone Number</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md mb-4"
                value={editedUser.phoneNumber}
                onChange={(e) => setEditedUser({ ...editedUser, phoneNumber: e.target.value })}
              />

              <label className="block mb-2">Address</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md mb-4"
                value={editedUser.address}
                onChange={(e) => setEditedUser({ ...editedUser, address: e.target.value })}
              />

              {/* Save and Cancel buttons */}
              <div className="flex justify-between mt-4">
                <button
                  className="px-6 py-2 bg-red-500 text-white rounded-lg"
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>
                <button
                  className="px-6 py-2 bg-green-500 text-white rounded-lg"
                  onClick={handleSaveChanges}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
