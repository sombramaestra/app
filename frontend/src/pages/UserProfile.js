import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { User, Package, Mail, Calendar, ChevronRight } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const UserProfile = () => {
  const { user, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/login');
        return;
      }
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
        return;
      }
      fetchMyOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const fetchMyOrders = async () => {
    try {
      const { data } = await axios.get(`${API}/orders/my`, { withCredentials: true });
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[#AFA8B3]">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-24">
      <div className="px-6 md:px-12 lg:px-24">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <p className="text-xs tracking-[0.2em] uppercase text-[#9C6AB0] mb-4" data-testid="profile-overline">Mi Cuenta</p>
            <h1 className="text-4xl md:text-5xl tracking-tighter leading-none font-light" data-testid="profile-title">
              Bienvenido, {user.name.split(' ')[0]}
            </h1>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* User Info Card */}
            <div className="md:col-span-1">
              <div className="bg-[#1A171D] border border-white/5 p-8" data-testid="user-info-card">
                <div className="flex flex-col items-center text-center mb-6">
                  {user.picture ? (
                    <img
                      src={user.picture}
                      alt={user.name}
                      referrerPolicy="no-referrer"
                      className="w-24 h-24 rounded-full mb-4 object-cover border-2 border-[#522A4E]"
                      data-testid="user-avatar"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full mb-4 bg-[#522A4E] flex items-center justify-center">
                      <User size={40} />
                    </div>
                  )}
                  <h2 className="text-xl font-medium mb-1">{user.name}</h2>
                  <p className="text-sm text-[#AFA8B3]">{user.email}</p>
                </div>

                <div className="space-y-3 pt-6 border-t border-[#2C2631]">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail size={16} className="text-[#9C6AB0]" />
                    <span className="text-[#AFA8B3]">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <User size={16} className="text-[#9C6AB0]" />
                    <span className="text-[#AFA8B3]">
                      {user.auth_provider === 'google' ? 'Cuenta de Google' : 'Cuenta de Email'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full mt-6 border border-[#2C2631] text-[#AFA8B3] hover:border-[#9C6AB0] hover:text-[#F8F7F9] py-3 transition-colors duration-200"
                  data-testid="profile-logout-button"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>

            {/* Orders */}
            <div className="md:col-span-2">
              <div className="bg-[#1A171D] border border-white/5 p-8" data-testid="orders-section">
                <div className="flex items-center gap-3 mb-6">
                  <Package size={24} className="text-[#9C6AB0]" />
                  <h2 className="text-2xl font-medium">Mis Pedidos</h2>
                </div>

                {loadingOrders ? (
                  <p className="text-[#AFA8B3]">Cargando pedidos...</p>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12" data-testid="empty-orders">
                    <p className="text-[#AFA8B3] mb-4">Aún no has realizado ningún pedido</p>
                    <button
                      onClick={() => navigate('/galeria')}
                      className="inline-flex items-center gap-2 bg-[#522A4E] hover:bg-[#6D3B68] text-white px-6 py-3 transition-colors duration-200"
                    >
                      <span>Explorar Galería</span>
                      <ChevronRight size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="border border-[#2C2631] p-6" data-testid={`my-order-${order.id}`}>
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-medium">Pedido #{order.order_number}</h3>
                            <div className="flex items-center gap-2 text-xs text-[#AFA8B3] mt-1">
                              <Calendar size={12} />
                              <span>{new Date(order.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-[#9C6AB0] font-medium text-lg">{order.total.toFixed(2)}€</p>
                            <span className={`text-xs uppercase tracking-wider ${
                              order.status === 'pending' ? 'text-yellow-400' : 'text-green-400'
                            }`}>
                              {order.status === 'pending' ? 'Pendiente' : order.status}
                            </span>
                          </div>
                        </div>
                        <div className="text-sm space-y-1">
                          <p className="text-[#AFA8B3]">Pago: <span className="text-[#F8F7F9]">{order.payment_method}</span></p>
                          <p className="text-[#AFA8B3]">Artículos:</p>
                          <ul className="ml-4 space-y-1">
                            {order.items.map((item, idx) => (
                              <li key={idx} className="text-sm text-[#F8F7F9]">
                                · {item.photo_title} ({item.format_type}) - {item.price.toFixed(2)}€
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
