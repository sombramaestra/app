import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { Check } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Checkout = () => {
  const { cartItems, getTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    payment_method: 'Bizum',
  });
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const orderData = {
      items: cartItems.map(item => ({
        photo_id: item.photo_id,
        photo_title: item.photo_title,
        format_type: item.format_type,
        price: item.price,
      })),
      customer_name: formData.customer_name,
      customer_email: formData.customer_email,
      customer_phone: formData.customer_phone,
      payment_method: formData.payment_method,
      total: getTotal(),
    };

    try {
      const { data } = await axios.post(`${API}/orders`, orderData);
      setOrderNumber(data.order_number);
      setOrderComplete(true);
      clearCart();
      toast.success('¡Pedido realizado con éxito!');
    } catch (error) {
      toast.error('Error al procesar el pedido. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0 && !orderComplete) {
    return (
      <div className="min-h-screen pt-24 pb-24 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl tracking-tight font-normal mb-4">Tu carrito está vacío</h1>
          <p className="text-[#AFA8B3] mb-8">Añade fotografías desde la galería para continuar</p>
          <button
            onClick={() => navigate('/galeria')}
            className="bg-[#522A4E] hover:bg-[#6D3B68] text-white px-8 py-3 transition-colors duration-200"
          >
            Ir a la Galería
          </button>
        </div>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen pt-24 pb-24 flex items-center justify-center" data-testid="order-complete">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <div className="w-20 h-20 bg-[#522A4E] rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={40} />
          </div>
          <h1 className="text-3xl md:text-4xl tracking-tight font-normal mb-4">¡Pedido Realizado!</h1>
          <p className="text-[#AFA8B3] mb-2">Número de pedido: <span className="text-[#9C6AB0] font-medium">{orderNumber}</span></p>
          <p className="text-[#AFA8B3] mb-8">
            Hemos recibido tu pedido. Te contactaremos pronto para confirmar el pago {formData.payment_method === 'Bizum' ? 'por Bizum' : 'en efectivo'} y coordinar la entrega.
          </p>
          <div className="space-x-4">
            <button
              onClick={() => navigate('/galeria')}
              className="bg-[#522A4E] hover:bg-[#6D3B68] text-white px-8 py-3 transition-colors duration-200"
            >
              Seguir Comprando
            </button>
            <button
              onClick={() => navigate('/')}
              className="border border-[#2C2631] text-[#F8F7F9] hover:border-[#9C6AB0] px-8 py-3 transition-colors duration-200"
            >
              Volver al Inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-24">
      <div className="px-6 md:px-12 lg:px-24">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl tracking-tight font-normal mb-12" data-testid="checkout-title">Finalizar Compra</h1>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Form */}
            <div>
              <form onSubmit={handleSubmit} data-testid="checkout-form">
                <div className="space-y-6">
                  <div>
                    <label htmlFor="customer_name" className="block text-sm font-medium mb-2">
                      Nombre completo *
                    </label>
                    <input
                      type="text"
                      id="customer_name"
                      name="customer_name"
                      value={formData.customer_name}
                      onChange={handleChange}
                      required
                      className="w-full bg-[#252129] border border-[#2C2631] text-[#F8F7F9] px-4 py-3 focus:outline-none focus:border-[#9C6AB0]"
                      data-testid="checkout-name-input"
                    />
                  </div>

                  <div>
                    <label htmlFor="customer_email" className="block text-sm font-medium mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="customer_email"
                      name="customer_email"
                      value={formData.customer_email}
                      onChange={handleChange}
                      required
                      className="w-full bg-[#252129] border border-[#2C2631] text-[#F8F7F9] px-4 py-3 focus:outline-none focus:border-[#9C6AB0]"
                      data-testid="checkout-email-input"
                    />
                  </div>

                  <div>
                    <label htmlFor="customer_phone" className="block text-sm font-medium mb-2">
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      id="customer_phone"
                      name="customer_phone"
                      value={formData.customer_phone}
                      onChange={handleChange}
                      required
                      className="w-full bg-[#252129] border border-[#2C2631] text-[#F8F7F9] px-4 py-3 focus:outline-none focus:border-[#9C6AB0]"
                      data-testid="checkout-phone-input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Método de pago *</label>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="payment_method"
                          value="Bizum"
                          checked={formData.payment_method === 'Bizum'}
                          onChange={handleChange}
                          className="w-4 h-4"
                          data-testid="payment-bizum"
                        />
                        <span>Bizum</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="payment_method"
                          value="Efectivo"
                          checked={formData.payment_method === 'Efectivo'}
                          onChange={handleChange}
                          className="w-4 h-4"
                          data-testid="payment-efectivo"
                        />
                        <span>Efectivo</span>
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#522A4E] hover:bg-[#6D3B68] disabled:bg-[#252129] disabled:text-[#AFA8B3] text-white py-3 transition-colors duration-200"
                    data-testid="checkout-submit-button"
                  >
                    {loading ? 'Procesando...' : 'Realizar Pedido'}
                  </button>
                </div>
              </form>
            </div>

            {/* Order Summary */}
            <div>
              <div className="bg-[#1A171D] border border-white/5 p-8">
                <h2 className="text-2xl font-medium mb-6">Resumen del Pedido</h2>
                <div className="space-y-4 mb-6">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm" data-testid={`summary-item-${item.id}`}>
                      <div>
                        <p className="font-medium">{item.photo_title}</p>
                        <p className="text-[#AFA8B3]">{item.format_type}</p>
                      </div>
                      <p className="text-[#9C6AB0]">{item.price.toFixed(2)}€</p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-[#2C2631] pt-4">
                  <div className="flex justify-between text-lg font-medium">
                    <span>Total</span>
                    <span className="text-[#9C6AB0]" data-testid="checkout-total">{getTotal().toFixed(2)}€</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
