import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { Toaster } from './components/ui/sonner';
import Header from './components/Header';
import Footer from './components/Footer';
import CartSidebar from './components/CartSidebar';
import Chatbot from './components/Chatbot';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import About from './pages/About';
import Contact from './pages/Contact';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import UserProfile from './pages/UserProfile';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

function AppRouter() {
  const location = useLocation();
  // Synchronous check for OAuth callback - must process BEFORE other routes
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/galeria" element={<Gallery />} />
      <Route path="/sobre-nosotros" element={<About />} />
      <Route path="/contacto" element={<Contact />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin/login" element={<Login />} />
      <Route path="/perfil" element={<UserProfile />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <div className="App bg-[#0C0A0D] text-[#F8F7F9] min-h-screen">
            <Header />
            <AppRouter />
            <Footer />
            <CartSidebar />
            <Chatbot />
            <Toaster position="top-right" />
          </div>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
