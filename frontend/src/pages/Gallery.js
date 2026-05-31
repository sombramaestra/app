import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCart } from '../contexts/CartContext';
import { toast } from 'sonner';
import { Search, X, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { HERMANDADES_POR_DIA, DIAS_SEMANA_SANTA } from '../data/hermandades';
import ProtectedImage from '../components/ProtectedImage';
import { PUEBLOS_POR_COMARCA, COMARCAS_SEVILLA, HERMANDADES_POR_PUEBLO } from '../data/pueblos';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Gallery = () => {
  const [photos, setPhotos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedHermandad, setSelectedHermandad] = useState(null);
  const [selectedComarca, setSelectedComarca] = useState(null);
  const [selectedPueblo, setSelectedPueblo] = useState(null);
  const [selectedHermandadPueblo, setSelectedHermandadPueblo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showHermandadesPanel, setShowHermandadesPanel] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchCategories();
    fetchFeatured();
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchPhotos();
  }, [selectedCategory, selectedDay, selectedHermandad, selectedComarca, selectedPueblo, selectedHermandadPueblo, debouncedSearch]);

  // Autoplay carrusel destacados
  useEffect(() => {
    if (featured.length <= 1) return;
    const timer = setInterval(() => {
      setCarouselIndex(i => (i + 1) % Math.min(featured.length, 8));
    }, 5000);
    return () => clearInterval(timer);
  }, [featured.length]);

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(`${API}/categories`);
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchFeatured = async () => {
    try {
      const { data } = await axios.get(`${API}/featured`);
      setFeatured(data);
    } catch (error) {
      console.error('Error fetching featured:', error);
    }
  };

  const fetchPhotos = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedDay) params.append('subcategory', selectedDay);
      if (selectedHermandad) params.append('hermandad', selectedHermandad);
      if (selectedComarca) params.append('comarca', selectedComarca);
      if (selectedPueblo) params.append('pueblo', selectedPueblo);
      if (selectedHermandadPueblo) params.append('hermandad', selectedHermandadPueblo);
      if (debouncedSearch) params.append('search', debouncedSearch);

      const url = `${API}/photos?${params.toString()}`;
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

  const handleCategoryChange = (categorySlug) => {
    setSelectedCategory(categorySlug);
    setSelectedDay(null);
    setSelectedHermandad(null);
    setSelectedComarca(null);
    setSelectedPueblo(null);
    setSelectedHermandadPueblo(null);
    setShowHermandadesPanel(categorySlug === 'hermandades' || categorySlug === 'pueblos');
  };

  const handleClearFilters = () => {
    setSelectedCategory(null);
    setSelectedDay(null);
    setSelectedHermandad(null);
    setSelectedComarca(null);
    setSelectedPueblo(null);
    setSelectedHermandadPueblo(null);
    setSearchTerm('');
    setShowHermandadesPanel(false);
  };

  const hasActiveFilters = selectedCategory || selectedDay || selectedHermandad || selectedComarca || selectedPueblo || selectedHermandadPueblo || searchTerm;

  return (
    <div className="min-h-screen pt-24 pb-24">
      <div className="px-6 md:px-12 lg:px-24">
        {/* Header */}
        <div className="mb-12 text-center">
          <p className="text-xs tracking-[0.2em] uppercase text-[#9C6AB0] mb-4" data-testid="gallery-overline">Nuestra Colección</p>
          <h1 className="text-5xl md:text-6xl tracking-tighter leading-none font-light mb-6" data-testid="gallery-title">Galería Fotográfica</h1>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#AFA8B3]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar fotografía o hermandad..."
              className="w-full bg-[#1A171D] border border-[#2C2631] text-[#F8F7F9] pl-12 pr-10 py-3 text-sm focus:outline-none focus:border-[#9C6AB0] transition-colors"
              data-testid="gallery-search-input"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#AFA8B3] hover:text-[#F8F7F9]"
                data-testid="gallery-search-clear"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-3 mb-6 justify-center" data-testid="category-filters">
          <button
            onClick={() => { setSelectedCategory(null); setSelectedDay(null); setSelectedHermandad(null); setSelectedComarca(null); setSelectedPueblo(null); setShowHermandadesPanel(false); }}
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
              onClick={() => handleCategoryChange(category.slug)}
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
          {selectedCategory === 'hermandades' && (
            <button
              onClick={() => setShowHermandadesPanel(!showHermandadesPanel)}
              className="px-6 py-2 border border-[#9C6AB0] text-[#9C6AB0] hover:bg-[#9C6AB0] hover:text-white transition-colors duration-200 flex items-center gap-2"
              data-testid="toggle-hermandades-panel"
            >
              <span>Hermandades</span>
              <ChevronDown size={16} className={`transition-transform ${showHermandadesPanel ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>

        {/* Active Filters Indicator */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-6 justify-center text-sm">
            <span className="text-[#AFA8B3]">Filtros activos:</span>
            {selectedDay && (
              <span className="bg-[#252129] border border-[#9C6AB0] text-[#9C6AB0] px-3 py-1 text-xs" data-testid="active-filter-day">
                {selectedDay}
              </span>
            )}
            {selectedHermandad && (
              <span className="bg-[#252129] border border-[#9C6AB0] text-[#9C6AB0] px-3 py-1 text-xs" data-testid="active-filter-hermandad">
                {selectedHermandad}
              </span>
            )}
            {selectedComarca && (
              <span className="bg-[#252129] border border-[#9C6AB0] text-[#9C6AB0] px-3 py-1 text-xs" data-testid="active-filter-comarca">
                {selectedComarca}
              </span>
            )}
            {selectedPueblo && (
              <span className="bg-[#252129] border border-[#9C6AB0] text-[#9C6AB0] px-3 py-1 text-xs" data-testid="active-filter-pueblo">
                {selectedPueblo}
              </span>
            )}
            {selectedHermandadPueblo && (
              <span className="bg-[#252129] border border-[#9C6AB0] text-[#9C6AB0] px-3 py-1 text-xs" data-testid="active-filter-hermandad-pueblo">
                {selectedHermandadPueblo}
              </span>
            )}
            <button
              onClick={handleClearFilters}
              className="text-[#AFA8B3] hover:text-[#F8F7F9] underline text-xs"
              data-testid="clear-filters-button"
            >
              Limpiar todos
            </button>
          </div>
        )}

        {/* Hermandades Panel (jerárquico por día) */}
        {showHermandadesPanel && selectedCategory === 'hermandades' && (
          <div className="bg-[#1A171D] border border-[#2C2631] p-6 mb-12" data-testid="hermandades-panel">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {DIAS_SEMANA_SANTA.map((dia) => (
                <div key={dia} className="border border-[#2C2631] p-4" data-testid={`day-section-${dia}`}>
                  <h3
                    onClick={() => {
                      setSelectedDay(selectedDay === dia ? null : dia);
                      setSelectedHermandad(null);
                    }}
                    className={`text-xs tracking-[0.2em] uppercase mb-3 cursor-pointer transition-colors ${
                      selectedDay === dia ? 'text-[#9C6AB0]' : 'text-[#AFA8B3] hover:text-[#F8F7F9]'
                    }`}
                  >
                    {dia}
                  </h3>
                  <ul className="space-y-1.5">
                    {HERMANDADES_POR_DIA[dia].map((hermandad) => (
                      <li key={hermandad}>
                        <button
                          onClick={() => {
                            setSelectedDay(dia);
                            setSelectedHermandad(hermandad === selectedHermandad ? null : hermandad);
                          }}
                          className={`text-sm text-left transition-colors ${
                            selectedHermandad === hermandad
                              ? 'text-[#9C6AB0] font-medium'
                              : 'text-[#AFA8B3] hover:text-[#F8F7F9]'
                          }`}
                          data-testid={`hermandad-${hermandad.replace(/\s+/g, '-').toLowerCase()}`}
                        >
                          {hermandad}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pueblos Panel (jerárquico por comarca → pueblo → hermandad) */}
        {showHermandadesPanel && selectedCategory === 'pueblos' && (
          <div className="bg-[#1A171D] border border-[#2C2631] p-6 mb-12" data-testid="pueblos-panel">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {COMARCAS_SEVILLA.map((comarca) => (
                <div key={comarca} className="border border-[#2C2631] p-4" data-testid={`comarca-section-${comarca}`}>
                  <h3
                    onClick={() => {
                      setSelectedComarca(selectedComarca === comarca ? null : comarca);
                      setSelectedPueblo(null);
                      setSelectedHermandadPueblo(null);
                    }}
                    className={`text-xs tracking-[0.2em] uppercase mb-3 cursor-pointer transition-colors ${
                      selectedComarca === comarca ? 'text-[#9C6AB0]' : 'text-[#AFA8B3] hover:text-[#F8F7F9]'
                    }`}
                  >
                    {comarca}
                  </h3>
                  <ul className="space-y-1.5">
                    {PUEBLOS_POR_COMARCA[comarca].map((pueblo) => (
                      <li key={pueblo}>
                        <button
                          onClick={() => {
                            setSelectedComarca(comarca);
                            setSelectedPueblo(pueblo === selectedPueblo ? null : pueblo);
                            setSelectedHermandadPueblo(null);
                          }}
                          className={`text-sm text-left transition-colors ${
                            selectedPueblo === pueblo
                              ? 'text-[#9C6AB0] font-medium'
                              : 'text-[#AFA8B3] hover:text-[#F8F7F9]'
                          }`}
                          data-testid={`pueblo-${pueblo.replace(/\s+/g, '-').toLowerCase()}`}
                        >
                          {pueblo}
                        </button>
                        {selectedPueblo === pueblo && HERMANDADES_POR_PUEBLO[pueblo] && (
                          <ul className="mt-1.5 ml-3 space-y-1">
                            {HERMANDADES_POR_PUEBLO[pueblo].map((hermandad) => (
                              <li key={hermandad}>
                                <button
                                  onClick={() => {
                                    setSelectedHermandadPueblo(hermandad === selectedHermandadPueblo ? null : hermandad);
                                  }}
                                  className={`text-xs text-left transition-colors ${
                                    selectedHermandadPueblo === hermandad
                                      ? 'text-[#9C6AB0] font-medium'
                                      : 'text-[#AFA8B3] hover:text-[#F8F7F9]'
                                  }`}
                                >
                                  {hermandad}
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sección Destacados — carrusel de 8 fotos */}
        {!hasActiveFilters && featured.length > 0 && (
          <div className="mb-16" data-testid="featured-section">
            <h2 className="text-xs tracking-[0.3em] uppercase text-[#AFA8B3] mb-8">Destacados</h2>
            <div className="relative overflow-hidden bg-[#1A171D] border border-white/5" style={{ height: '520px' }}>
              {featured.slice(0, 8).map((photo, i) => (
                <div
                  key={photo.id}
                  className="absolute inset-0 transition-opacity duration-700"
                  style={{ opacity: i === carouselIndex ? 1 : 0, zIndex: i === carouselIndex ? 10 : 0 }}
                  data-testid={`featured-card-${photo.id}`}
                >
                  <div
                    className="group cursor-pointer w-full h-full"
                    onClick={() => setSelectedPhoto(photo)}
                  >
                    <img
                      src={`${process.env.REACT_APP_BACKEND_URL}${photo.thumb_url || photo.image_url}`}
                      alt={photo.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-8">
                      <p className="text-[#F8F7F9] font-medium text-lg">{photo.title}</p>
                      {photo.hermandad && <p className="text-[#AFA8B3] text-sm mt-1">{photo.hermandad}</p>}
                    </div>
                  </div>
                </div>
              ))}
              {featured.length > 1 && (
                <>
                  <button
                    onClick={() => setCarouselIndex(i => (i - 1 + Math.min(featured.length, 8)) % Math.min(featured.length, 8))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/80 border border-white/10 text-white p-2 transition-colors duration-200"
                    style={{ transform: 'translateY(-50%)' }}
                    aria-label="Anterior"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={() => setCarouselIndex(i => (i + 1) % Math.min(featured.length, 8))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/80 border border-white/10 text-white p-2 transition-colors duration-200"
                    style={{ transform: 'translateY(-50%)' }}
                    aria-label="Siguiente"
                  >
                    <ChevronRight size={24} />
                  </button>
                  <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-2">
                    {featured.slice(0, 8).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCarouselIndex(i)}
                        className="h-2 rounded-full transition-all duration-300"
                        style={{
                          width: i === carouselIndex ? '16px' : '8px',
                          backgroundColor: i === carouselIndex ? '#9C6AB0' : 'rgba(255,255,255,0.3)'
                        }}
                        aria-label={`Ir a foto ${i + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
            <div className="border-b border-white/5 mt-16 mb-16" />
          </div>
        )}

        {/* Gallery Grid */}
        {loading ? (
          <div className="text-center py-20" data-testid="gallery-loading">
            <p className="text-[#AFA8B3]">Cargando fotografías...</p>
          </div>
        ) : (() => {
          const featuredIds = new Set(featured.map(f => f.id));
          const allPhotos = !hasActiveFilters
            ? [...featured, ...photos.filter(p => !featuredIds.has(p.id))]
            : photos;
          return allPhotos.length === 0 ? (
            <div className="text-center py-20" data-testid="gallery-empty">
              <p className="text-[#AFA8B3]">No hay fotografías disponibles con estos filtros.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" data-testid="gallery-grid">
              {allPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="group cursor-pointer"
                  onClick={() => setSelectedPhoto(photo)}
                  data-testid={`photo-card-${photo.id}`}
                >
                  <div className="relative overflow-hidden bg-[#1A171D] border border-white/5 aspect-[3/4]">
                    <ProtectedImage
                      src={`${process.env.REACT_APP_BACKEND_URL}${photo.thumb_url || photo.image_url}`}
                      alt={photo.title}
                      className="w-full h-full group-hover:scale-105 transition-transform duration-500"
                      watermarkSize="md"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h3 className="text-xl font-medium mb-2">{photo.title}</h3>
                        {photo.hermandad && (
                          <p className="text-xs text-[#9C6AB0] mb-1">{photo.hermandad}</p>
                        )}
                        <p className="text-sm text-[#AFA8B3]">{photo.category}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
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
              className="bg-[#1A171D] border border-white/10 max-w-5xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
              data-testid="photo-modal"
            >
              <div className="bg-[#0C0A0D] flex items-center justify-center" style={{ maxHeight: '70vh', minHeight: '300px' }}>
                <ProtectedImage
                  src={`${process.env.REACT_APP_BACKEND_URL}${selectedPhoto.image_url}`}
                  alt={selectedPhoto.title}
                  className="w-full"
                  watermarkSize="lg"
                  fit="contain"
                  style={{ height: '70vh' }}
                />
              </div>
              <div className="p-8">
                <h2 className="text-3xl md:text-4xl tracking-tight font-normal mb-4">{selectedPhoto.title}</h2>
                {selectedPhoto.description && (
                  <p className="text-base leading-relaxed text-[#AFA8B3] mb-6">{selectedPhoto.description}</p>
                )}
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="text-xs tracking-[0.2em] uppercase text-[#9C6AB0]">{selectedPhoto.category}</span>
                  {selectedPhoto.subcategory && (
                    <span className="text-xs tracking-[0.2em] uppercase text-[#AFA8B3]">• {selectedPhoto.subcategory}</span>
                  )}
                  {selectedPhoto.hermandad && (
                    <span className="text-xs tracking-[0.2em] uppercase text-[#AFA8B3]">• {selectedPhoto.hermandad}</span>
                  )}
                </div>

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