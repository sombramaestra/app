import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, ChevronDown } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAdminForm, setShowAdminForm] = useState(false);
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    if (result.success) {
      if (result.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/perfil');
      }
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-24 pb-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#522A4E] rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn size={32} />
          </div>
          <h1 className="text-3xl md:text-4xl tracking-tight font-normal mb-2" data-testid="login-title">Iniciar Sesión</h1>
          <p className="text-[#AFA8B3]">Accede a tu cuenta para comprar y ver tus pedidos</p>
        </div>

        <div className="bg-[#1A171D] border border-white/5 p-8">
          {/* Google Login Button */}
          <button
            onClick={googleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-900 py-3 px-4 transition-colors duration-200 font-medium"
            data-testid="google-login-button"
          >
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
              <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
              <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
              <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571.001-.001.002-.001.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
            </svg>
            <span>Continuar con Google</span>
          </button>

          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-[#2C2631]"></div>
            <span className="px-4 text-xs tracking-[0.2em] uppercase text-[#AFA8B3]">o</span>
            <div className="flex-1 h-px bg-[#2C2631]"></div>
          </div>

          {/* Admin Toggle */}
          <button
            onClick={() => setShowAdminForm(!showAdminForm)}
            className="w-full flex items-center justify-between text-sm text-[#AFA8B3] hover:text-[#F8F7F9] transition-colors py-2"
            data-testid="admin-toggle"
          >
            <span>Acceso Administrador</span>
            <ChevronDown size={16} className={`transition-transform ${showAdminForm ? 'rotate-180' : ''}`} />
          </button>

          {/* Admin Form */}
          {showAdminForm && (
            <form onSubmit={handleSubmit} className="mt-4" data-testid="admin-login-form">
              <div className="space-y-4">
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 text-sm" data-testid="login-error">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-[#252129] border border-[#2C2631] text-[#F8F7F9] px-4 py-3 focus:outline-none focus:border-[#9C6AB0]"
                    data-testid="admin-email-input"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium mb-2">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-[#252129] border border-[#2C2631] text-[#F8F7F9] px-4 py-3 focus:outline-none focus:border-[#9C6AB0]"
                    data-testid="admin-password-input"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#522A4E] hover:bg-[#6D3B68] disabled:bg-[#252129] disabled:text-[#AFA8B3] text-white py-3 transition-colors duration-200"
                  data-testid="admin-login-button"
                >
                  {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
