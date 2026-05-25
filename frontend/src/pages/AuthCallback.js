import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AuthCallback = () => {
  const { processGoogleSession } = useAuth();
  const navigate = useNavigate();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent double-processing under StrictMode
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const hash = window.location.hash;
    const match = hash.match(/session_id=([^&]+)/);

    if (!match) {
      navigate('/login');
      return;
    }

    const sessionId = match[1];

    processGoogleSession(sessionId).then((result) => {
      // Clear hash from URL
      window.history.replaceState({}, document.title, window.location.pathname);
      if (result.success) {
        if (result.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/perfil');
        }
      } else {
        navigate('/login');
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center" data-testid="auth-callback">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-[#9C6AB0] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-[#AFA8B3]">Iniciando sesión...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
