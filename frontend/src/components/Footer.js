import React from 'react';
import { Instagram, Mail, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#1A171D] border-t border-[#2C2631] py-24 md:py-32">
      <div className="px-6 md:px-12 lg:px-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <h3 className="text-3xl md:text-4xl font-light tracking-tight mb-4">PasionCofrade</h3>
            <p className="text-base leading-relaxed text-[#AFA8B3]">
              Fotografía profesional de Semana Santa y eventos cofrades en Sevilla y sus pueblos.
            </p>
          </div>

          {/* Photographers */}
          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase text-[#9C6AB0] mb-4">Fotógrafos</h4>
            <div className="space-y-3">
              <a
                href="https://instagram.com/gonzalo_0702"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-[#AFA8B3] hover:text-[#F8F7F9] transition-colors duration-200"
                data-testid="instagram-gonzalo"
              >
                <Instagram size={20} />
                <span>Gonzalo Lara (@gonzalo_0702)</span>
              </a>
              <a
                href="https://instagram.com/_manugfotos"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-[#AFA8B3] hover:text-[#F8F7F9] transition-colors duration-200"
                data-testid="instagram-manuel"
              >
                <Instagram size={20} />
                <span>Manuel Gómez (@_manugfotos)</span>
              </a>
              <a
                href="https://instagram.com/a.ojeda_fotografia"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-[#AFA8B3] hover:text-[#F8F7F9] transition-colors duration-200"
              >
                <Instagram size={20} />
                <span>Álvaro Ojeda (@a.ojeda_fotografia)</span>
              </a>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase text-[#9C6AB0] mb-4">Contacto</h4>
            <div className="space-y-3">
              <a href="mailto:gonzalolaramacias@gmail.com" className="flex items-center gap-3 text-[#AFA8B3] hover:text-[#F8F7F9] transition-colors duration-200">
                <Mail size={20} />
                <span>gonzalolaramacias@gmail.com</span>
              </a>
              <a href="mailto:manuelgfotos@gmail.com" className="flex items-center gap-3 text-[#AFA8B3] hover:text-[#F8F7F9] transition-colors duration-200">
                <Mail size={20} />
                <span>manuelgfotos@gmail.com</span>
              </a>
              <a href="tel:+34622242137" className="flex items-center gap-3 text-[#AFA8B3] hover:text-[#F8F7F9] transition-colors duration-200">
                <Phone size={20} />
                <span>622 242 137 (Gonzalo)</span>
              </a>
              <a href="tel:+34687836768" className="flex items-center gap-3 text-[#AFA8B3] hover:text-[#F8F7F9] transition-colors duration-200">
                <Phone size={20} />
                <span>687 836 768 (Manuel)</span>
              </a>
              <a href="tel:+34622916721" className="flex items-center gap-3 text-[#AFA8B3] hover:text-[#F8F7F9] transition-colors duration-200">
                <Phone size={20} />
                <span>622 916 721 (Álvaro)</span>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[#2C2631] text-center text-[#AFA8B3] text-sm">
          <p>© {new Date().getFullYear()} PasionCofrade. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;