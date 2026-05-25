import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const DEFAULT_HERO = 'https://static.prod-images.emergentagent.com/jobs/b5da26db-13e2-4e17-8f3f-c11ef203eca3/images/daf358add6815190f33c82769320d747986a92b41c4bbe6f08c5a460a345eec5.png';

const Home = () => {
  const [heroUrl, setHeroUrl] = useState(DEFAULT_HERO);

  useEffect(() => {
    axios.get(`${API}/settings/hero`).then(({ data }) => {
      if (data.is_custom) {
        setHeroUrl(`${process.env.REACT_APP_BACKEND_URL}${data.url}`);
      } else {
        setHeroUrl(data.url);
      }
    }).catch(() => setHeroUrl(DEFAULT_HERO));
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center" data-testid="hero-section">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${heroUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-[#0C0A0D]"></div>
        </div>

        <div className="relative z-10 text-center px-6 md:px-12 lg:px-24">
          <p className="text-xs tracking-[0.2em] uppercase text-[#9C6AB0] mb-6" data-testid="hero-overline">
            Fotografía Cofrade Profesional
          </p>
          <h1 className="text-5xl md:text-6xl tracking-tighter leading-none font-light mb-6" data-testid="hero-title">
            Capturando la Pasión<br />de Sevilla
          </h1>
          <p className="text-base leading-relaxed text-[#AFA8B3] max-w-2xl mx-auto mb-8" data-testid="hero-description">
            Descubre nuestra colección exclusiva de fotografías de Semana Santa y eventos cofrades de Sevilla y sus pueblos.
          </p>
          <Link
            to="/galeria"
            className="inline-flex items-center gap-2 bg-[#522A4E] hover:bg-[#6D3B68] text-white px-8 py-4 transition-colors duration-200"
            data-testid="hero-cta-button"
          >
            <span>Explorar Galería</span>
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Featured Section */}
      <section className="py-24 md:py-32 px-6 md:px-12 lg:px-24 bg-[#1A171D]" data-testid="featured-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs tracking-[0.2em] uppercase text-[#9C6AB0] mb-4">Nuestro Trabajo</p>
            <h2 className="text-3xl md:text-4xl tracking-tight leading-tight font-normal">Imágenes que Cuentan Historias</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#252129] border border-white/5 p-8" data-testid="feature-card-1">
              <h3 className="text-xl md:text-2xl tracking-normal font-medium mb-4">Hermandades</h3>
              <p className="text-base leading-relaxed text-[#AFA8B3]">
                Fotografías profesionales de todas las hermandades de Sevilla y sus pueblos.
              </p>
            </div>
            <div className="bg-[#252129] border border-white/5 p-8" data-testid="feature-card-2">
              <h3 className="text-xl md:text-2xl tracking-normal font-medium mb-4">Eventos Especiales</h3>
              <p className="text-base leading-relaxed text-[#AFA8B3]">
                Cobertura completa de eventos cofrades y celebraciones religiosas.
              </p>
            </div>
            <div className="bg-[#252129] border border-white/5 p-8" data-testid="feature-card-3">
              <h3 className="text-xl md:text-2xl tracking-normal font-medium mb-4">Alta Calidad</h3>
              <p className="text-base leading-relaxed text-[#AFA8B3]">
                Formato digital y físico disponible con la máxima resolución.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-32 px-6 md:px-12 lg:px-24" data-testid="cta-section">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl tracking-tight leading-tight font-normal mb-6">
            ¿Buscas un fotógrafo para tu hermandad?
          </h2>
          <p className="text-base leading-relaxed text-[#AFA8B3] mb-8">
            Ofrecemos servicios profesionales de fotografía para hermandades y eventos cofrades.
          </p>
          <Link
            to="/contacto"
            className="inline-flex items-center gap-2 bg-[#522A4E] hover:bg-[#6D3B68] text-white px-8 py-4 transition-colors duration-200"
            data-testid="cta-contact-button"
          >
            <span>Contáctanos</span>
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
