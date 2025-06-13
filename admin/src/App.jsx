import React, { useContext } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Sidebar from './components/Sidebar/Sidebar';
import Add from './pages/Add/Add';
import List from './pages/List/List';
import Orders from './pages/Orders/Orders';
import Login from './pages/Login/Login';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, AuthContext } from './Context/AuthContext';

const url = import.meta.env.VITE_API_BASE_URL;

const ProtectedLayout = () => (
  <>
    <Navbar />
    <hr />
    <div className="app-content">
      <Sidebar />
      <Outlet />
    </div>
  </>
);

const AppRoutes = () => {
  const { auth } = useContext(AuthContext);

  return (
    <Routes>
      {/* Ruta pública */}
      <Route path="/login" element={
        auth.isAuthenticated ? <Navigate to="/dashboard" /> : <Login />
      } />

      {/* Rutas protegidas */}
      <Route element={auth.isAuthenticated ? <ProtectedLayout /> : <Navigate to="/login" />}>
        <Route path="/add" element={<Add url={url} />} />
        <Route path="/list" element={<List url={url} />} />
        <Route path="/orders" element={<Orders url={url} />} />
        <Route path="/dashboard" element={<Navigate to="/list" />} />
        <Route path="/" element={<Navigate to="/list" />} />
      </Route>

      {/* Redirección por defecto */}
      <Route path="*" element={
        auth.isAuthenticated ? <Navigate to="/list" /> : <Navigate to="/login" />
      } />
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <div>
        <ToastContainer />
        <AppRoutes />
      </div>
    </AuthProvider>
  );
};

export default App;
