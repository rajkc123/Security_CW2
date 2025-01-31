import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import AboutUs from './pages/about/Aboutus';
import AdminDashboard from './pages/admin/adminDashboard';
import Homepage from './pages/homepage/homepage';
import Login from './pages/login/login';
import Practice from './pages/practice/practice';
import Pricing from './pages/pricing/pricing';
import Profile from './pages/profile/Profile';
import Register from './pages/register/register';

// 1. Import the PrivateRoute component
import PrivateRoute from './components/PrivateRoutes';

const App = () => {
  return (
    <Router>
      <Routes>

        {/* Public / Unprotected Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Example of a protected route for /practice */}
        <Route
          path="/practice"
          element={
            <PrivateRoute>
              <Practice />
            </PrivateRoute>
          }
        />

        <Route
          path="/home"
          element={
            <PrivateRoute>
              <Homepage />
            </PrivateRoute>
          }
        />


        <Route
          path="/pricing"
          element={
            <PrivateRoute>
              <Pricing />
            </PrivateRoute>
          }
        />


        <Route
          path="/about"
          element={
            <PrivateRoute>
              <AboutUs/>
            </PrivateRoute>
          }
        />

        {/* Example of a protected route for /admin */}
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          }
        />

        {/* Example of a protected route for /profile */}
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />

      </Routes>
    </Router>
  );
};

export default App;
