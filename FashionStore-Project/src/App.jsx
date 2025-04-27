import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

import ProductsList from './components/ProductsList';
import Admin from './components/Admin';
import Navigation from './components/Navigation';
import BannerHeader from './components/BannerHeader';
import Products from './components/ProductCard';
import DetailProduct from './components/DetailProduct';
import Profile from './components/Profile';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <Routes>
          <Route
            path="/"
            element={
              <>
                <BannerHeader />
                <ProductsList />
              </>
            }
          />
          <Route
            path="/admin"
            element={
              user?.role === 'admin' ? (
                <Admin />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          <Route             
            path="/products"
            element= {<ProductsList />}
          />

          <Route 
            path="/products/:productId" 
            element={<DetailProduct />} 
          />

          <Route
            path='/profile'
            element={<Profile/>}
          />

        </Routes>
      </div>
    </Router>
  );
}

export default App;
