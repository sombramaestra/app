import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCart } from '../contexts/CartContext';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Gallery = () => {
  const [photos, setPhotos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchCategories();
    fetchPhotos();
  }, []);

  useEffect(() => {
    fetchPhotos(selectedCategory);
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(`${API}/categories`);
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchPhotos = async (category = null) => {
    setLoading(true);
    try {
      const url = category ? `${API}/photos?category=${category}` : `${API}/photos`;
      const { data } = await axios.get(url);
      setPhotos(data);
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (photo, formatType, price) => {
    addToCart(photo, formatType, price);
    toast.success('Añadido al carrito');
    setSelectedPhoto(null);
  };

  return (
    <div className="min-h-screen pt-24 pb-24">
      <div className="px-6 md:px-12 lg:px-24">
        {/* Header */}
        <div className="mb-16 text-center">
          <p className="text-xs tracking-[0.2em] uppercase text-[#9C6AB0] mb-4" data-testid="gallery-overline">Nuestra Colección</p>
          <h1 className="text-5xl md:text-6xl tracking-tighter leading-none font-light mb-6" data-testid="gallery-title">Galería Fotográfica</h1>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-12 justify-center" data-testid="category-filters">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-6 py-2 border transition-colors duration-200 ${
              selectedCategory === null
                ? 'bg-[#522A4E] border-[#522A4E] text-white'
                : 'border-[#2C2631] text-[#AFA8B3] hover:border-[#9C6AB0] hover:text-[#F8F7F9]'
            }`}
            data-testid="category-filter-all"
          >
            Todas
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.slug)}
              className={`px-6 py-2 border transition-colors duration-200 ${
                selectedCategory === category.slug
                  ? 'bg-[#522A4E] border-[#522A4E] text-white'
                  : 'border-[#2C2631] text-[#AFA8B3] hover:border-[#9C6AB0] hover:text-[#F8F7F9]'
              }`}
              data-testid={`category-filter-${category.slug}`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="text-center py-20" data-testid="gallery-loading">
            <p className="text-[#AFA8B3]">Cargando fotografías...</p>
          </div>
        ) : photos.length === 0 ? (
          <div className="text-center py-20" data-testid="gallery-empty">
            <p className="text-[#AFA8B3]">No hay fotografías disponibles en esta categoría.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" data-testid="gallery-grid">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="group cursor-pointer"
                onClick={() => setSelectedPhoto(photo)}
                data-testid={`photo-card-${photo.id}`}
              >
                <div className="relative overflow-hidden bg-[#1A171D] border border-white/5 aspect-[3/4]">
                  <img
                    src={`${process.env.REACT_APP_BACKEND_URL}${photo.image_url}`}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="text-xl font-medium mb-2">{photo.title}</h3>
                      <p className="text-sm text-[#AFA8B3]">{photo.category}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Photo Detail Modal */}
      {selectedPhoto && (
        <>
          <div
            className="fixed inset-0 bg-black/70 z-50"
            onClick={() => setSelectedPhoto(null)}
            data-testid="photo-modal-overlay"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelectedPhoto(null)}>
            <div
              className="bg-[#1A171D] border border-white/10 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
              data-testid="photo-modal"
            >
              <img
                src={`${process.env.REACT_APP_BACKEND_URL}${selectedPhoto.image_url}`}
                alt={selectedPhoto.title}
                className="w-full h-auto"
              />
              <div className="p-8">
                <h2 className="text-3xl md:text-4xl tracking-tight font-normal mb-4">{selectedPhoto.title}</h2>
                {selectedPhoto.description && (
                  <p className="text-base leading-relaxed text-[#AFA8B3] mb-6">{selectedPhoto.description}</p>
                )}
                <p className="text-xs tracking-[0.2em] uppercase text-[#9C6AB0] mb-6">Categoría: {selectedPhoto.category}</p>

                <div className="space-y-4">
                  <h3 className="text-xl font-medium mb-4">Selecciona Formato</h3>
                  <button
                    onClick={() => handleAddToCart(selectedPhoto, 'Digital', selectedPhoto.price_digital)}
                    className="w-full flex items-center justify-between bg-[#252129] hover:bg-[#522A4E] border border-white/5 p-4 transition-colors duration-200"
                    data-testid="add-to-cart-digital"
                  >
                    <span>Formato Digital</span>
                    <span className="text-[#9C6AB0] font-medium">{selectedPhoto.price_digital.toFixed(2)}€</span>
                  </button>
                  <button
                    onClick={() => handleAddToCart(selectedPhoto, 'Físico', selectedPhoto.price_physical)}
                    className="w-full flex items-center justify-between bg-[#252129] hover:bg-[#522A4E] border border-white/5 p-4 transition-colors duration-200"
                    data-testid="add-to-cart-physical"
                  >
                    <span>Formato Físico</span>
                    <span className="text-[#9C6AB0] font-medium">{selectedPhoto.price_physical.toFixed(2)}€</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Gallery;
