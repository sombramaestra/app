import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Mail, Phone, Instagram } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${API}/contact`, formData);
      toast.success('¡Mensaje enviado! Te contactaremos pronto.');
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      toast.error('Error al enviar el mensaje. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-24">
      <div className="px-6 md:px-12 lg:px-24">
        {/* Header */}
        <div className="mb-16 text-center">
          <p className="text-xs tracking-[0.2em] uppercase text-[#9C6AB0] mb-4" data-testid="contact-overline">Ponte en Contacto</p>
          <h1 className="text-5xl md:text-6xl tracking-tighter leading-none font-light mb-6" data-testid="contact-title">Contacto</h1>
        </div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div>
            <h2 className="text-3xl md:text-4xl tracking-tight leading-tight font-normal mb-8">
              ¿Tienes alguna pregunta?
            </h2>
            <p className="text-base leading-relaxed text-[#AFA8B3] mb-8">
              Estamos aquí para ayudarte. Contáctanos para consultas sobre fotografías, servicios personalizados o cualquier otra información.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <Mail className="text-[#9C6AB0] mt-1" size={24} />
                <div>
                  <h3 className="font-medium mb-2">Email</h3>
                  <div className="space-y-1">
                    <a href="mailto:gonzalolaramacias@gmail.com" className="block text-[#AFA8B3] hover:text-[#F8F7F9] transition-colors duration-200">
                      gonzalolaramacias@gmail.com <span className="text-xs text-[#9C6AB0]">(Gonzalo)</span>
                    </a>
                    <a href="mailto:manuelgfotos@gmail.com" className="block text-[#AFA8B3] hover:text-[#F8F7F9] transition-colors duration-200">
                      manuelgfotos@gmail.com <span className="text-xs text-[#9C6AB0]">(Manuel)</span>
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Phone className="text-[#9C6AB0] mt-1" size={24} />
                <div>
                  <h3 className="font-medium mb-2">Teléfono</h3>
                  <div className="space-y-1">
                    <a href="tel:+34622242137" className="block text-[#AFA8B3] hover:text-[#F8F7F9] transition-colors duration-200">
                      622 242 137 <span className="text-xs text-[#9C6AB0]">(Gonzalo)</span>
                    </a>
                    <a href="tel:+34687836768" className="block text-[#AFA8B3] hover:text-[#F8F7F9] transition-colors duration-200">
                      687 836 768 <span className="text-xs text-[#9C6AB0]">(Manuel)</span>
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Instagram className="text-[#9C6AB0] mt-1" size={24} />
                <div>
                  <h3 className="font-medium mb-2">Instagram</h3>
                  <div className="space-y-1">
                    <a
                      href="https://instagram.com/gonzalo_0702"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-[#AFA8B3] hover:text-[#F8F7F9] transition-colors duration-200"
                    >
                      @gonzalo_0702
                    </a>
                    <a
                      href="https://instagram.com/_manugfotos"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-[#AFA8B3] hover:text-[#F8F7F9] transition-colors duration-200"
                    >
                      @_manugfotos
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-[#1A171D] border border-white/5 p-8">
            <form onSubmit={handleSubmit} data-testid="contact-form">
              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#252129] border border-[#2C2631] text-[#F8F7F9] px-4 py-3 focus:outline-none focus:border-[#9C6AB0]"
                    data-testid="contact-name-input"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#252129] border border-[#2C2631] text-[#F8F7F9] px-4 py-3 focus:outline-none focus:border-[#9C6AB0]"
                    data-testid="contact-email-input"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-[#252129] border border-[#2C2631] text-[#F8F7F9] px-4 py-3 focus:outline-none focus:border-[#9C6AB0]"
                    data-testid="contact-phone-input"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2">
                    Mensaje *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full bg-[#252129] border border-[#2C2631] text-[#F8F7F9] px-4 py-3 focus:outline-none focus:border-[#9C6AB0] resize-none"
                    data-testid="contact-message-input"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#522A4E] hover:bg-[#6D3B68] disabled:bg-[#252129] disabled:text-[#AFA8B3] text-white py-3 transition-colors duration-200"
                  data-testid="contact-submit-button"
                >
                  {loading ? 'Enviando...' : 'Enviar Mensaje'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
