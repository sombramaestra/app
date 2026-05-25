import React from 'react';
import { Instagram, Camera } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen pt-24 pb-24">
      <div className="px-6 md:px-12 lg:px-24">
        {/* Header */}
        <div className="mb-16 text-center">
          <p className="text-xs tracking-[0.2em] uppercase text-[#9C6AB0] mb-4" data-testid="about-overline">Quiénes Somos</p>
          <h1 className="text-5xl md:text-6xl tracking-tighter leading-none font-light mb-6" data-testid="about-title">Sobre Nosotros</h1>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          {/* Image Section */}
          <div className="mb-16">
            <img
              src="https://static.prod-images.emergentagent.com/jobs/b5da26db-13e2-4e17-8f3f-c11ef203eca3/images/496a1dd0cf44431a6b4ea01e7b53287e1bbc2b54d62e8ce3fe8e7a2a37e7c1bd.png"
              alt="Gonzalo Lara y Manuel Gómez"
              className="w-full h-[400px] md:h-[600px] object-cover border border-white/5"
              data-testid="about-photo"
            />
          </div>

          {/* Description */}
          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div>
              <h2 className="text-3xl md:text-4xl tracking-tight leading-tight font-normal mb-6">
                PasionCofrade
              </h2>
              <p className="text-base leading-relaxed text-[#AFA8B3] mb-6">
                Somos dos fotógrafos apasionados por la Semana Santa y los eventos cofrades de Sevilla y sus pueblos. Con años de experiencia capturando los momentos más emotivos y significativos de estas celebraciones, nos dedicamos a preservar la belleza y la devoción de estas tradiciones.
              </p>
              <p className="text-base leading-relaxed text-[#AFA8B3]">
                Nuestro trabajo no solo documenta eventos, sino que cuenta historias a través de imágenes que transmiten la pasión y el fervor de nuestra tierra.
              </p>
            </div>
            <div>
              <h3 className="text-xl md:text-2xl tracking-normal font-medium mb-6">
                Nuestros Servicios
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Camera size={20} className="text-[#9C6AB0] mt-1 flex-shrink-0" />
                  <span className="text-base leading-relaxed text-[#AFA8B3]">
                    Fotografía profesional de Semana Santa y procesiones
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Camera size={20} className="text-[#9C6AB0] mt-1 flex-shrink-0" />
                  <span className="text-base leading-relaxed text-[#AFA8B3]">
                    Cobertura de eventos cofrades y celebraciones religiosas
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Camera size={20} className="text-[#9C6AB0] mt-1 flex-shrink-0" />
                  <span className="text-base leading-relaxed text-[#AFA8B3]">
                    Venta de fotografías en formato digital y físico
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Camera size={20} className="text-[#9C6AB0] mt-1 flex-shrink-0" />
                  <span className="text-base leading-relaxed text-[#AFA8B3]">
                    Servicios personalizados para hermandades
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Photographers */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-[#1A171D] border border-white/5 p-8" data-testid="photographer-card-gonzalo">
              <h3 className="text-2xl font-medium mb-4">Gonzalo Lara</h3>
              <p className="text-base leading-relaxed text-[#AFA8B3] mb-6">
                Fotógrafo especializado en Semana Santa de Sevilla y sus pueblos. Capturando la esencia de la devoción cofrade desde hace más de 10 años.
              </p>
              <a
                href="https://instagram.com/gonzalo_0702"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#9C6AB0] hover:text-[#F8F7F9] transition-colors duration-200"
                data-testid="gonzalo-instagram"
              >
                <Instagram size={20} />
                <span>@gonzalo_0702</span>
              </a>
            </div>

            <div className="bg-[#1A171D] border border-white/5 p-8" data-testid="photographer-card-manuel">
              <h3 className="text-2xl font-medium mb-4">Manuel Gómez</h3>
              <p className="text-base leading-relaxed text-[#AFA8B3] mb-6">
                Fotógrafo cofrade con gran experiencia en eventos religiosos y procesiones. Su trabajo refleja la pasión por las tradiciones andaluzas.
              </p>
              <a
                href="https://instagram.com/_manugfotos"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#9C6AB0] hover:text-[#F8F7F9] transition-colors duration-200"
                data-testid="manuel-instagram"
              >
                <Instagram size={20} />
                <span>@_manugfotos</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
