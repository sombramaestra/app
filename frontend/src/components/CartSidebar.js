import React from 'react';
import { X, Trash2 } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';

const CartSidebar = () => {
  const { cartItems, removeFromCart, getTotal, isCartOpen, setIsCartOpen } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  if (!isCartOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={() => setIsCartOpen(false)}
        data-testid="cart-overlay"
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full md:w-[400px] bg-[#1A171D] z-50 shadow-2xl" data-testid="cart-sidebar">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#2C2631]">
            <h2 className="text-2xl font-light tracking-tight">Carrito</h2>
            <button
              onClick={() => setIsCartOpen(false)}
              className="text-[#AFA8B3] hover:text-[#F8F7F9] transition-colors duration-200"
              data-testid="close-cart-button"
            >
              <X size={24} />
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {cartItems.length === 0 ? (
              <p className="text-[#AFA8B3] text-center mt-8" data-testid="empty-cart-message">Tu carrito está vacío</p>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 bg-[#252129] p-4 border border-white/5"
                    data-testid={`cart-item-${item.id}`}
                  >
                    <div className="w-20 h-20 bg-[#0C0A0D] flex items-center justify-center overflow-hidden flex-shrink-0">
                      <img
                        src={`${process.env.REACT_APP_BACKEND_URL}${item.photo_image}`}
                        alt={item.photo_title}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium mb-1">{item.photo_title}</h3>
                      <p className="text-xs text-[#AFA8B3] mb-2">{item.format_type}</p>
                      <p className="text-[#9C6AB0] font-medium">{item.price.toFixed(2)}€</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-[#AFA8B3] hover:text-red-400 transition-colors duration-200"
                      data-testid={`remove-item-${item.id}`}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {cartItems.length > 0 && (
            <div className="p-6 border-t border-[#2C2631]">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg">Total</span>
                <span className="text-2xl font-medium text-[#9C6AB0]" data-testid="cart-total">{getTotal().toFixed(2)}€</span>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full bg-[#522A4E] hover:bg-[#6D3B68] text-white py-3 transition-colors duration-200"
                data-testid="checkout-button"
              >
                Proceder al Pago
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartSidebar;
