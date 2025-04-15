import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTimes } from 'react-icons/fa';

const LoginModal = ({ onClose, onLogin }) => {
  const navigate = useNavigate();
  const [rightPanelActive, setRightPanelActive] = useState(false);
  const [signupData, setSignupData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    role: 'user' // Default role for new users
  });

  const [signinData, setSigninData] = useState({
    username: '',
    password: '',
  });

  const handleSignUp = async () => {
    try {
      // First check if user already exists
      const checkResponse = await fetch(`http://localhost:3001/users?username=${signupData.username}`);
      const existingUsers = await checkResponse.json();

      if (existingUsers.length > 0) {
        alert('Username already exists!');
        return;
      }

      const response = await fetch('http://localhost:3001/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupData),
      });

      if (response.ok) {
        alert('Registration successful!');
        setRightPanelActive(false); // Switch to sign in form
        // Clear the form
        setSignupData({
          username: '',
          email: '',
          password: '',
          full_name: '',
          role: 'user'
        });
      } else {
        alert('Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Signup error:', err);
      alert('Server connection error');
    }
  };

  const handleSignIn = async () => {
    try {
      const response = await fetch(`http://localhost:3001/users?username=${signinData.username}`);
      const users = await response.json();
      const user = users.find(u => u.username === signinData.username && u.password === signinData.password);

      if (user) {
        alert('Login successful!');
        localStorage.setItem('user', JSON.stringify(user));
        onLogin(user);
        onClose();
        if (user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/products');
        }
      } else {
        alert('Invalid username or password');
      }
    } catch (err) {
      console.error('Signin error:', err);
      alert('Server connection error');
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url("https://res.cloudinary.com/dh1o42tjk/image/upload/v1744710728/16be05d672b4da505d38cad34b1e2ddf_hgulp2.jpg")' }}>
        <div className="absolute inset-0 bg-opacity-50"></div>
      </div>
      <div className="relative w-full max-w-4xl min-h-[480px] bg-white rounded-xl shadow-lg overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-50"
        >
          <FaTimes />
        </button>

        {/* Sign Up Form */}
        <div className={`absolute top-0 h-full w-1/2 transition-all duration-600 ease-in-out flex items-center justify-center ${rightPanelActive ? 'translate-x-full opacity-100 z-10' : 'opacity-0 z-0'}`}>
          <form className="flex flex-col items-center w-4/5" onSubmit={(e) => { e.preventDefault(); handleSignUp(); }}>
            <h1 className="text-2xl mb-5 text-gray-800">Create Account</h1>
            <input
              type="text"
              placeholder="Name"
              value={signupData.full_name}
              onChange={(e) => setSignupData({ ...signupData, full_name: e.target.value })}
              className="w-full p-3 my-2 border border-gray-200 rounded focus:outline-none focus:border-gray-400"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={signupData.email}
              onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
              className="w-full p-3 my-2 border border-gray-200 rounded focus:outline-none focus:border-gray-400"
              required
            />
            <input
              type="text"
              placeholder="Username"
              value={signupData.username}
              onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
              className="w-full p-3 my-2 border border-gray-200 rounded focus:outline-none focus:border-gray-400"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={signupData.password}
              onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
              className="w-full p-3 my-2 border border-gray-200 rounded focus:outline-none focus:border-gray-400"
              required
            />

            <button
              type="submit"
              className="rounded-full border border-gray-700 bg-gray-700 text-white text-xs font-medium py-3 px-11 my-3 uppercase tracking-wider transition-all duration-300 hover:bg-gray-800 active:scale-95 focus:outline-none hover:cursor-pointer"
            >
              Sign Up
            </button>
          </form>
        </div>

        {/* Sign In Form */}
        <div className={`absolute top-0 h-full w-1/2 transition-all duration-600 ease-in-out flex items-center justify-center ${rightPanelActive ? 'translate-x-full opacity-0 z-0' : 'opacity-100 z-10'}`}>
          <form className="flex flex-col items-center w-4/5" onSubmit={(e) => { e.preventDefault(); handleSignIn(); }}>
            <h1 className="text-2xl mb-5 text-gray-800">Sign in</h1>
            <input
              type="text"
              placeholder="Username"
              value={signinData.username}
              onChange={(e) => setSigninData({ ...signinData, username: e.target.value })}
              className="w-full p-3 my-2 border border-gray-200 rounded focus:outline-none focus:border-gray-400"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={signinData.password}
              onChange={(e) => setSigninData({ ...signinData, password: e.target.value })}
              className="w-full p-3 my-2 border border-gray-200 rounded focus:outline-none focus:border-gray-400"
              required
            />
            <button
              type="submit"
              className="rounded-full border border-gray-700 bg-gray-700 text-white text-xs font-medium py-3 px-11 my-3 uppercase tracking-wider transition-all duration-300 hover:bg-gray-800 active:scale-95 focus:outline-none hover:cursor-pointer"
            >
              Sign In
            </button>
          </form>
        </div>

        {/* Overlay Container */}
        <div className={`absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-600 ease-in-out z-50 ${rightPanelActive ? '-translate-x-full' : ''}`}>
          <div className={`relative -left-full h-full w-[200%] bg-gradient-to-r from-gray-500 to-gray-600 text-white transition-transform duration-600 ease-in-out ${rightPanelActive ? 'translate-x-1/2' : 'translate-x-0'}`}>
            {/* Overlay Left */}
            <div className={`absolute flex flex-col items-center justify-center text-center top-0 h-full w-1/2 p-10 transition-transform duration-600 ease-in-out ${rightPanelActive ? 'translate-x-0' : '-translate-x-1/5'}`}>
              <h1 className="text-2xl mb-5">Welcome Back!</h1>
              <p className="text-sm mb-5 leading-5">To keep connected with us please login with your personal info</p>
              <button
                onClick={() => setRightPanelActive(false)}
                className="rounded-full border border-white bg-transparent text-white text-xs font-medium py-3 px-11 my-3 uppercase tracking-wider transition-all duration-300 hover:bg-gray-700 hover:cursor-pointer hover:bg-opacity-20 focus:outline-none"
              >
                Sign In
              </button>
            </div>

            {/* Overlay Right */}
            <div className={`absolute flex flex-col items-center justify-center text-center top-0 right-0 h-full w-1/2 p-10 transition-transform duration-600 ease-in-out ${rightPanelActive ? 'translate-x-1/5' : 'translate-x-0'}`}>
              <h1 className="text-2xl mb-5">Hello, Friend!</h1>
              <p className="text-sm mb-5 leading-5">Enter your personal details and start journey with us</p>
              <button
                onClick={() => setRightPanelActive(true)}
                className="rounded-full border border-white bg-transparent text-white text-xs font-medium py-3 px-11 my-3 uppercase tracking-wider transition-all duration-300 hover:bg-gray-700 hover:bg-opacity-20 focus:outline-none hover:cursor-pointer"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal; 