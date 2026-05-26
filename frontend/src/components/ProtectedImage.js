import React, { useState } from 'react';

/**
 * ProtectedImage - imagen con copyright superpuesto y bloqueo de descarga
 *
 * Características anti-descarga:
 * - Desactiva click derecho
 * - Desactiva drag & drop
 * - CSS user-select: none, -webkit-user-drag: none
 * - Copyright "© PasionCofrade" superpuesto en diagonal
 *
 * Props:
 *   fit: 'cover' (default, tarjetas) | 'contain' (modal, sobre nosotros)
 *   watermarkSize: 'sm' | 'md' | 'lg'
 */
const ProtectedImage = ({ src, alt, className = '', watermarkSize = 'md', fit = 'cover', ...props }) => {
  const [loaded, setLoaded] = useState(false);

  const watermarkClass = {
    sm: 'text-xs',
    md: 'text-base md:text-lg',
    lg: 'text-2xl md:text-4xl',
  }[watermarkSize] || 'text-base md:text-lg';

  const objectFitClass = fit === 'contain' ? 'object-contain' : 'object-cover';

  return (
    <div className={`relative overflow-hidden select-none bg-[#0C0A0D] ${className}`} {...props}>
      <img
        src={src}
        alt={alt}
        className={`w-full h-full ${objectFitClass} pointer-events-none select-none transition-opacity duration-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        draggable={false}
        style={{
          WebkitUserDrag: 'none',
          WebkitUserSelect: 'none',
          userSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
        }}
        loading="lazy"
      />

      {/* Loading shimmer */}
      {!loaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A171D] via-[#252129] to-[#1A171D] animate-pulse" aria-hidden="true" />
      )}

      {/* Watermark Tile Pattern */}
      <div
        className="absolute inset-0 pointer-events-none select-none flex items-center justify-center"
        aria-hidden="true"
      >
        <div className="absolute inset-0 flex flex-wrap items-center justify-around -rotate-[20deg] opacity-25">
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={i}
              className={`${watermarkClass} font-light tracking-widest text-white whitespace-nowrap px-8 py-4`}
              style={{ textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}
            >
              © PasionCofrade
            </span>
          ))}
        </div>
      </div>

      {/* Invisible overlay to block right-click and drag */}
      <div
        className="absolute inset-0"
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        style={{ background: 'transparent' }}
      />
    </div>
  );
};

export default ProtectedImage;
