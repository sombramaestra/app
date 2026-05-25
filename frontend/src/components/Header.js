import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const { cartItems, setIsCartOpen } = useCart();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glassmorphic bg-[#0C0A0D]/70 border-b border-white/10">
      <div className="px-6 md:px-12 lg:px-24 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center" data-testid="logo-link">
            <h1 className="text-2xl md:text-3xl font-light tracking-tighter text-[#F8F7F9]">PasionCofrade</h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-[#AFA8B3] hover:text-[#F8F7F9] transition-colors duration-200" data-testid="nav-home">Inicio</Link>
            <Link to="/galeria" className="text-[#AFA8B3] hover:text-[#F8F7F9] transition-colors duration-200" data-testid="nav-gallery">Galería</Link>
            <Link to="/sobre-nosotros" className="text-[#AFA8B3] hover:text-[#F8F7F9] transition-colors duration-200" data-testid="nav-about">Sobre Nosotros</Link>
            <Link to="/contacto" className="text-[#AFA8B3] hover:text-[#F8F7F9] transition-colors duration-200" data-testid="nav-contact">Contacto</Link>
            {user && user.role === 'admin' && (
              <Link to="/admin/dashboard" className="text-[#9C6AB0] hover:text-[#F8F7F9] transition-colors duration-200" data-testid="nav-admin">Admin</Link>
            )}
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-[#AFA8B3] hover:text-[#F8F7F9] transition-colors duration-200"
              data-testid="cart-button"
            >
              <ShoppingCart size={24} />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#522A4E] text-white text-xs w-5 h-5 flex items-center justify-center" data-testid="cart-count">
                  {cartItems.length}
                </span>
              )}
            </button>

            {user && (
              <button
                onClick={handleLogout}
                className="hidden md:block text-[#AFA8B3] hover:text-[#F8F7F9] transition-colors duration-200"
                data-testid="logout-button"
              >
                Salir
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-[#F8F7F9]"
              data-testid="mobile-menu-button"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden pt-4 pb-2 flex flex-col gap-4" data-testid="mobile-menu">
            <Link to="/" className="text-[#AFA8B3] hover:text-[#F8F7F9]" onClick={() => setMobileMenuOpen(false)}>Inicio</Link>
            <Link to="/galeria" className="text-[#AFA8B3] hover:text-[#F8F7F9]" onClick={() => setMobileMenuOpen(false)}>Galería</Link>
            <Link to="/sobre-nosotros" className="text-[#AFA8B3] hover:text-[#F8F7F9]" onClick={() => setMobileMenuOpen(false)}>Sobre Nosotros</Link>
            <Link to="/contacto" className="text-[#AFA8B3] hover:text-[#F8F7F9]" onClick={() => setMobileMenuOpen(false)}>Contacto</Link>
            {user && user.role === 'admin' && (
              <Link to="/admin/dashboard" className="text-[#9C6AB0] hover:text-[#F8F7F9]" onClick={() => setMobileMenuOpen(false)}>Admin</Link>
            )}
            {user && (
              <button onClick={handleLogout} className="text-left text-[#AFA8B3] hover:text-[#F8F7F9]">
                Salir
              </button>
            )}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
