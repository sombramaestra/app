import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { Upload, Package, Image as ImageIcon, Trash2, Settings, Calendar, Pencil } from 'lucide-react';
import { HERMANDADES_POR_DIA, DIAS_SEMANA_SANTA } from '../data/hermandades';
import AdminCalendar from '../components/AdminCalendar';
import ImageSettingCard from '../components/ImageSettingCard';
import { PUEBLOS_POR_COMARCA, COMARCAS_SEVILLA, HERMANDADES_POR_PUEBLO } from '../data/pueblos';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../components/ui/alert-dialog';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upload');
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [featuredIds, setFeaturedIds] = useState(['', '', '', '', '', '', '', '']);
  const [featuredSaving, setFeaturedSaving] = useState(false);
  const [featuredSuccess, setFeaturedSuccess] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editSaving, setEditSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    hermandad: '',
    comarca: '',
    pueblo: '',
    price_digital: '',
    price_physical: '',
  });
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchCategories();
      fetchOrders();
      fetchPhotos();
      fetchFeatured();
    }
  }, [user]);

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(`${API}/categories`);
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get(`${API}/orders`, { withCredentials: true });
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchPhotos = async () => {
    try {
      const { data } = await axios.get(`${API}/photos`);
      setPhotos(data);
    } catch (error) {
      console.error('Error fetching photos:', error);
    }
  };

  const fetchFeatured = async () => {
    try {
      const { data } = await axios.get(`${API}/featured`);
      const ids = data.map(p => p.id);
      setFeaturedIds([ids[0]||'', ids[1]||'', ids[2]||'', ids[3]||'', ids[4]||'', ids[5]||'', ids[6]||'', ids[7]||'']);
    } catch (error) {
      console.error('Error fetching featured:', error);
    }
  };

  const handleSaveFeatured = async () => {
    setFeaturedSaving(true);
    try {
      const ids = featuredIds.filter(id => id !== '');
      await axios.post(`${API}/featured`, { photo_ids: ids }, { withCredentials: true });
      setFeaturedSuccess(true);
      setTimeout(() => setFeaturedSuccess(false), 3000);
    } catch (error) {
      toast.error('Error al guardar destacados');
    } finally {
      setFeaturedSaving(false);
    }
  };

  const handleDeletePhoto = async (photoId) => {
    try {
      await axios.delete(`${API}/photos/${photoId}`, { withCredentials: true });
      toast.success('Fotografía eliminada');
      fetchPhotos();
    } catch (error) {
      toast.error('Error al eliminar la fotografía');
    }
  };

  const handleSaveEdit = async () => {
    if (!editingPhoto) return;
    setEditSaving(true);
    try {
      await axios.put(`${API}/photos/${editingPhoto.id}`, editForm, { withCredentials: true });
      toast.success('Fotografía actualizada');
      setEditingPhoto(null);
      fetchPhotos();
    } catch (error) {
      toast.error('Error al guardar cambios');
    } finally {
      setEditSaving(false);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      await axios.delete(`${API}/orders/${orderId}`, { withCredentials: true });
      toast.success('Pedido eliminado');
      fetchOrders();
    } catch (error) {
      toast.error('Error al eliminar el pedido');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Si cambia categoría o día, resetea los campos dependientes
    if (name === 'category') {
      setFormData({ ...formData, category: value, subcategory: '', hermandad: '', comarca: '', pueblo: '' });
    } else if (name === 'subcategory') {
      setFormData({ ...formData, subcategory: value, hermandad: '' });
    } else if (name === 'comarca') {
      setFormData({ ...formData, comarca: value, pueblo: '' });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Por favor selecciona una imagen');
      return;
    }

    setUploadLoading(true);
    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('category', formData.category);
    if (formData.subcategory) formDataToSend.append('subcategory', formData.subcategory);
    if (formData.hermandad) formDataToSend.append('hermandad', formData.hermandad);
    if (formData.comarca) formDataToSend.append('comarca', formData.comarca);
    if (formData.pueblo) formDataToSend.append('pueblo', formData.pueblo);
    formDataToSend.append('price_digital', formData.price_digital);
    formDataToSend.append('price_physical', formData.price_physical);
    formDataToSend.append('file', file);

    try {
      await axios.post(`${API}/photos`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });
      toast.success('¡Fotografía subida con éxito!');
      setFormData({ title: '', description: '', category: '', subcategory: '', hermandad: '', comarca: '', pueblo: '', price_digital: '', price_physical: '' });
      setFile(null);
      fetchPhotos();
    } catch (error) {
      toast.error('Error al subir la fotografía');
    } finally {
      setUploadLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[#AFA8B3]">Cargando...</p>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen pt-24 pb-24">
      <div className="px-6 md:px-12 lg:px-24">
        <h1 className="text-3xl md:text-4xl tracking-tight font-normal mb-8" data-testid="admin-dashboard-title">
          Panel de Administración
        </h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-[#2C2631]">
          <button
            onClick={() => setActiveTab('upload')}
            className={`pb-4 px-2 transition-colors duration-200 ${
              activeTab === 'upload'
                ? 'border-b-2 border-[#522A4E] text-[#F8F7F9]'
                : 'text-[#AFA8B3] hover:text-[#F8F7F9]'
            }`}
            data-testid="tab-upload"
          >
            <Upload size={20} className="inline mr-2" />
            Subir Fotografía
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-4 px-2 transition-colors duration-200 ${
              activeTab === 'orders'
                ? 'border-b-2 border-[#522A4E] text-[#F8F7F9]'
                : 'text-[#AFA8B3] hover:text-[#F8F7F9]'
            }`}
            data-testid="tab-orders"
          >
            <Package size={20} className="inline mr-2" />
            Pedidos ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('photos')}
            className={`pb-4 px-2 transition-colors duration-200 ${
              activeTab === 'photos'
                ? 'border-b-2 border-[#522A4E] text-[#F8F7F9]'
                : 'text-[#AFA8B3] hover:text-[#F8F7F9]'
            }`}
            data-testid="tab-photos"
          >
            <ImageIcon size={20} className="inline mr-2" />
            Fotografías ({photos.length})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-4 px-2 transition-colors duration-200 ${
              activeTab === 'settings'
                ? 'border-b-2 border-[#522A4E] text-[#F8F7F9]'
                : 'text-[#AFA8B3] hover:text-[#F8F7F9]'
            }`}
            data-testid="tab-settings"
          >
            <Settings size={20} className="inline mr-2" />
            Configuración
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`pb-4 px-2 transition-colors duration-200 ${
              activeTab === 'calendar'
                ? 'border-b-2 border-[#522A4E] text-[#F8F7F9]'
                : 'text-[#AFA8B3] hover:text-[#F8F7F9]'
            }`}
            data-testid="tab-calendar"
          >
            <Calendar size={20} className="inline mr-2" />
            Calendario
          </button>
        </div>

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="max-w-2xl" data-testid="upload-section">
            <form onSubmit={handleSubmit} className="bg-[#1A171D] border border-white/5 p-8">
              <div className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium mb-2">
                    Título *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#252129] border border-[#2C2631] text-[#F8F7F9] px-4 py-3 focus:outline-none focus:border-[#9C6AB0]"
                    data-testid="upload-title-input"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium mb-2">
                    Descripción
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full bg-[#252129] border border-[#2C2631] text-[#F8F7F9] px-4 py-3 focus:outline-none focus:border-[#9C6AB0] resize-none"
                    data-testid="upload-description-input"
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium mb-2">
                    Categoría *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#252129] border border-[#2C2631] text-[#F8F7F9] px-4 py-3 focus:outline-none focus:border-[#9C6AB0]"
                    data-testid="upload-category-select"
                  >
                    <option value="">Selecciona una categoría</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.slug}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.category === 'hermandades' && (
                  <>
                    <div>
                      <label htmlFor="subcategory" className="block text-sm font-medium mb-2">
                        Día de Semana Santa
                      </label>
                      <select
                        id="subcategory"
                        name="subcategory"
                        value={formData.subcategory}
                        onChange={handleChange}
                        className="w-full bg-[#252129] border border-[#2C2631] text-[#F8F7F9] px-4 py-3 focus:outline-none focus:border-[#9C6AB0]"
                        data-testid="upload-subcategory-select"
                      >
                        <option value="">Selecciona un día</option>
                        {DIAS_SEMANA_SANTA.map((dia) => (
                          <option key={dia} value={dia}>
                            {dia}
                          </option>
                        ))}
                      </select>
                    </div>

                    {formData.subcategory && (
                      <div>
                        <label htmlFor="hermandad" className="block text-sm font-medium mb-2">
                          Hermandad
                        </label>
                        <select
                          id="hermandad"
                          name="hermandad"
                          value={formData.hermandad}
                          onChange={handleChange}
                          className="w-full bg-[#252129] border border-[#2C2631] text-[#F8F7F9] px-4 py-3 focus:outline-none focus:border-[#9C6AB0]"
                          data-testid="upload-hermandad-select"
                        >
                          <option value="">Selecciona una hermandad</option>
                          {HERMANDADES_POR_DIA[formData.subcategory].map((h) => (
                            <option key={h} value={h}>
                              {h}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </>
                )}

                {formData.category === 'pueblos' && (
                  <>
                    <div>
                      <label htmlFor="comarca" className="block text-sm font-medium mb-2">
                        Comarca
                      </label>
                      <select
                        id="comarca"
                        name="comarca"
                        value={formData.comarca}
                        onChange={handleChange}
                        className="w-full bg-[#252129] border border-[#2C2631] text-[#F8F7F9] px-4 py-3 focus:outline-none focus:border-[#9C6AB0]"
                        data-testid="upload-comarca-select"
                      >
                        <option value="">Selecciona una comarca</option>
                        {COMARCAS_SEVILLA.map((comarca) => (
                          <option key={comarca} value={comarca}>
                            {comarca}
                          </option>
                        ))}
                      </select>
                    </div>

                    {formData.comarca && (
                      <div>
                        <label htmlFor="pueblo" className="block text-sm font-medium mb-2">
                          Pueblo
                        </label>
                        <select
                          id="pueblo"
                          name="pueblo"
                          value={formData.pueblo}
                          onChange={handleChange}
                          className="w-full bg-[#252129] border border-[#2C2631] text-[#F8F7F9] px-4 py-3 focus:outline-none focus:border-[#9C6AB0]"
                          data-testid="upload-pueblo-select"
                        >
                          <option value="">Selecciona un pueblo</option>
                          {PUEBLOS_POR_COMARCA[formData.comarca].map((pueblo) => (
                            <option key={pueblo} value={pueblo}>
                              {pueblo}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {formData.pueblo && HERMANDADES_POR_PUEBLO[formData.pueblo] && (
                      <div>
                        <label htmlFor="hermandad_pueblo" className="block text-sm font-medium mb-2">
                          Hermandad
                        </label>
                        <select
                          id="hermandad_pueblo"
                          name="hermandad"
                          value={formData.hermandad}
                          onChange={handleChange}
                          className="w-full bg-[#252129] border border-[#2C2631] text-[#F8F7F9] px-4 py-3 focus:outline-none focus:border-[#9C6AB0]"
                          data-testid="upload-hermandad-pueblo-select"
                        >
                          <option value="">Selecciona una hermandad</option>
                          {HERMANDADES_POR_PUEBLO[formData.pueblo].map((h) => (
                            <option key={h} value={h}>
                              {h}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="price_digital" className="block text-sm font-medium mb-2">
                      Precio Digital (€) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      id="price_digital"
                      name="price_digital"
                      value={formData.price_digital}
                      onChange={handleChange}
                      required
                      className="w-full bg-[#252129] border border-[#2C2631] text-[#F8F7F9] px-4 py-3 focus:outline-none focus:border-[#9C6AB0]"
                      data-testid="upload-price-digital-input"
                    />
                  </div>

                  <div>
                    <label htmlFor="price_physical" className="block text-sm font-medium mb-2">
                      Precio Físico (€) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      id="price_physical"
                      name="price_physical"
                      value={formData.price_physical}
                      onChange={handleChange}
                      required
                      className="w-full bg-[#252129] border border-[#2C2631] text-[#F8F7F9] px-4 py-3 focus:outline-none focus:border-[#9C6AB0]"
                      data-testid="upload-price-physical-input"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="file" className="block text-sm font-medium mb-2">
                    Imagen *
                  </label>
                  <input
                    type="file"
                    id="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    required
                    className="w-full bg-[#252129] border border-[#2C2631] text-[#F8F7F9] px-4 py-3 focus:outline-none focus:border-[#9C6AB0]"
                    data-testid="upload-file-input"
                  />
                </div>

                <button
                  type="submit"
                  disabled={uploadLoading}
                  className="w-full bg-[#522A4E] hover:bg-[#6D3B68] disabled:bg-[#252129] disabled:text-[#AFA8B3] text-white py-3 transition-colors duration-200"
                  data-testid="upload-submit-button"
                >
                  {uploadLoading ? 'Subiendo...' : 'Subir Fotografía'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div data-testid="orders-section">
            {orders.length === 0 ? (
              <p className="text-[#AFA8B3]">No hay pedidos todavía.</p>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="bg-[#1A171D] border border-white/5 p-6" data-testid={`order-${order.id}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-medium text-lg">Pedido #{order.order_number}</h3>
                        <p className="text-sm text-[#AFA8B3]">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[#9C6AB0] font-medium text-lg">{order.total.toFixed(2)}€</span>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button
                              className="text-[#AFA8B3] hover:text-red-400 transition-colors p-2"
                              data-testid={`delete-order-${order.id}`}
                              aria-label="Eliminar pedido"
                            >
                              <Trash2 size={18} />
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-[#1A171D] border-[#2C2631] text-[#F8F7F9]">
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Eliminar este pedido?</AlertDialogTitle>
                              <AlertDialogDescription className="text-[#AFA8B3]">
                                Esta acción no se puede deshacer. Se eliminará el pedido <strong>{order.order_number}</strong> permanentemente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-[#252129] border-[#2C2631] text-[#F8F7F9] hover:bg-[#2C2631]">Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteOrder(order.id)}
                                className="bg-red-600 hover:bg-red-700 text-white"
                                data-testid={`confirm-delete-order-${order.id}`}
                              >
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-[#AFA8B3]">Cliente:</span> {order.customer_name}</p>
                      <p><span className="text-[#AFA8B3]">Email:</span> {order.customer_email}</p>
                      <p><span className="text-[#AFA8B3]">Teléfono:</span> {order.customer_phone}</p>
                      <p><span className="text-[#AFA8B3]">Pago:</span> {order.payment_method}</p>
                      <p><span className="text-[#AFA8B3]">Estado:</span> {order.status}</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-[#2C2631]">
                      <h4 className="text-sm font-medium mb-2">Artículos:</h4>
                      <ul className="text-sm space-y-1">
                        {order.items.map((item, idx) => (
                          <li key={idx} className="text-[#AFA8B3]">
                            {item.photo_title} - {item.format_type} ({item.price.toFixed(2)}€)
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Photos Tab */}
        {activeTab === 'photos' && (
          <div data-testid="photos-section">
            {photos.length === 0 ? (
              <p className="text-[#AFA8B3]">No hay fotografías todavía.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {photos.map((photo) => (
                  <div key={photo.id} className="bg-[#1A171D] border border-white/5 relative group" data-testid={`photo-${photo.id}`}>
                    <div className="w-full h-48 bg-[#0C0A0D] flex items-center justify-center overflow-hidden">
                      <img
                        src={`${process.env.REACT_APP_BACKEND_URL}${photo.thumb_url || photo.image_url}`}
                        alt={photo.title}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <button
                      onClick={() => { setEditingPhoto(photo); setEditForm({ title: photo.title, description: photo.description || '', category: photo.category, subcategory: photo.subcategory || '', hermandad: photo.hermandad || '', price_digital: photo.price_digital, price_physical: photo.price_physical }); }}
                      className="absolute top-2 left-2 bg-[#522A4E] hover:bg-[#9C6AB0] text-white p-2 rounded-full transition-colors"
                      aria-label="Editar fotografía"
                    >
                      <Pencil size={16} />
                    </button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          className="absolute top-2 right-2 bg-black/70 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
                          data-testid={`delete-photo-${photo.id}`}
                          aria-label="Eliminar fotografía"
                        >
                          <Trash2 size={16} />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-[#1A171D] border-[#2C2631] text-[#F8F7F9]">
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar esta fotografía?</AlertDialogTitle>
                          <AlertDialogDescription className="text-[#AFA8B3]">
                            Esta acción no se puede deshacer. La fotografía <strong>{photo.title}</strong> dejará de aparecer en la galería.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-[#252129] border-[#2C2631] text-[#F8F7F9] hover:bg-[#2C2631]">Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeletePhoto(photo.id)}
                            className="bg-red-600 hover:bg-red-700 text-white"
                            data-testid={`confirm-delete-photo-${photo.id}`}
                          >
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <div className="p-4">
                      <h3 className="font-medium mb-1">{photo.title}</h3>
                      <p className="text-xs text-[#AFA8B3] mb-2">
                        {photo.category}
                        {photo.hermandad && ` · ${photo.hermandad}`}
                      </p>
                      <div className="text-xs text-[#9C6AB0]">
                        Digital: {photo.price_digital}€ | Físico: {photo.price_physical}€
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal Editar Foto */}
        {editingPhoto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setEditingPhoto(null)}>
            <div className="bg-[#1A171D] border border-[#2C2631] p-8 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-medium">Editar fotografía</h2>
                <button onClick={() => setEditingPhoto(null)} className="text-[#AFA8B3] hover:text-white text-xl">✕</button>
              </div>
              <div className="flex gap-4 mb-6">
                <img
                  src={`${process.env.REACT_APP_BACKEND_URL}${editingPhoto.thumb_url || editingPhoto.image_url}`}
                  alt={editingPhoto.title}
                  className="w-24 h-24 object-cover border border-[#2C2631] flex-shrink-0"
                />
                <div className="text-sm text-[#AFA8B3]">
                  <p className="text-xs uppercase tracking-widest mb-1">Vista previa</p>
                  <p>{editingPhoto.category}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-[#AFA8B3] uppercase tracking-widest mb-2">Título</label>
                  <input value={editForm.title || ''} onChange={e => setEditForm(f => ({...f, title: e.target.value}))} className="w-full bg-[#252129] border border-[#2C2631] text-[#F8F7F9] px-4 py-3 focus:outline-none focus:border-[#9C6AB0]" />
                </div>
                <div>
                  <label className="block text-xs text-[#AFA8B3] uppercase tracking-widest mb-2">Descripción</label>
                  <textarea value={editForm.description || ''} onChange={e => setEditForm(f => ({...f, description: e.target.value}))} rows={3} className="w-full bg-[#252129] border border-[#2C2631] text-[#F8F7F9] px-4 py-3 focus:outline-none focus:border-[#9C6AB0] resize-none" />
                </div>
                <div>
                  <label className="block text-xs text-[#AFA8B3] uppercase tracking-widest mb-2">Categoría</label>
                  <select value={editForm.category || ''} onChange={e => setEditForm(f => ({...f, category: e.target.value}))} className="w-full bg-[#252129] border border-[#2C2631] text-[#F8F7F9] px-4 py-3 focus:outline-none focus:border-[#9C6AB0]">
                    <option value="">— Sin categoría —</option>
                    {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[#AFA8B3] uppercase tracking-widest mb-2">Hermandad</label>
                  <input value={editForm.hermandad || ''} onChange={e => setEditForm(f => ({...f, hermandad: e.target.value}))} className="w-full bg-[#252129] border border-[#2C2631] text-[#F8F7F9] px-4 py-3 focus:outline-none focus:border-[#9C6AB0]" />
                </div>
                <div>
                  <label className="block text-xs text-[#AFA8B3] uppercase tracking-widest mb-2">Subcategoría</label>
                  <input value={editForm.subcategory || ''} onChange={e => setEditForm(f => ({...f, subcategory: e.target.value}))} className="w-full bg-[#252129] border border-[#2C2631] text-[#F8F7F9] px-4 py-3 focus:outline-none focus:border-[#9C6AB0]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[#AFA8B3] uppercase tracking-widest mb-2">Precio digital (€)</label>
                    <input type="number" step="0.01" value={editForm.price_digital || ''} onChange={e => setEditForm(f => ({...f, price_digital: parseFloat(e.target.value)}))} className="w-full bg-[#252129] border border-[#2C2631] text-[#F8F7F9] px-4 py-3 focus:outline-none focus:border-[#9C6AB0]" />
                  </div>
                  <div>
                    <label className="block text-xs text-[#AFA8B3] uppercase tracking-widest mb-2">Precio físico (€)</label>
                    <input type="number" step="0.01" value={editForm.price_physical || ''} onChange={e => setEditForm(f => ({...f, price_physical: parseFloat(e.target.value)}))} className="w-full bg-[#252129] border border-[#2C2631] text-[#F8F7F9] px-4 py-3 focus:outline-none focus:border-[#9C6AB0]" />
                  </div>
                </div>
              </div>
              <div className="flex gap-4 mt-8">
                <button onClick={() => setEditingPhoto(null)} className="flex-1 border border-[#2C2631] text-[#AFA8B3] py-3 hover:text-white transition-colors">Cancelar</button>
                <button onClick={handleSaveEdit} disabled={editSaving} className="flex-1 bg-[#522A4E] text-[#F8F7F9] py-3 hover:bg-[#6B3868] transition-colors disabled:opacity-50">
                  {editSaving ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="max-w-3xl space-y-8" data-testid="settings-section">
            <ImageSettingCard
              settingKey="hero_image"
              title="Imagen de Inicio (Hero)"
              description="Personaliza la imagen principal que aparece al entrar en la web. Recomendado: imagen horizontal de alta calidad (mínimo 1920x1080px)."
              previewHeight="h-64"
              testIdPrefix="hero"
            />
            <ImageSettingCard
              settingKey="about_image"
              title="Imagen Sobre Nosotros"
              description="Personaliza la imagen que aparece en la sección 'Sobre Nosotros'. Recomendado: foto de los fotógrafos o trabajo emblemático."
              previewHeight="h-64"
              testIdPrefix="about"
            />

            {/* Fotografías Destacadas */}
            <div className="bg-[#1A171D] border border-white/5 p-8">
              <h2 className="text-lg font-medium mb-2">Fotografías Destacadas</h2>
              <p className="text-[#AFA8B3] text-sm mb-8">
                Selecciona hasta 8 fotografías que aparecerán en el carrusel destacado de la galería.
              </p>
              <div className="space-y-6">
                {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
                  const selected = photos.find(p => p.id === featuredIds[i]);
                  return (
                    <div key={i} className="border border-[#2C2631] p-4">
                      <label className="block text-sm font-medium mb-3 text-[#AFA8B3]">
                        Destacada {i + 1}
                      </label>
                      <select
                        value={featuredIds[i]}
                        onChange={(e) => {
                          const newIds = [...featuredIds];
                          newIds[i] = e.target.value;
                          setFeaturedIds(newIds);
                        }}
                        className="w-full bg-[#252129] border border-[#2C2631] text-[#F8F7F9] px-4 py-3 focus:outline-none focus:border-[#9C6AB0] mb-3"
                      >
                        <option value="">— Sin seleccionar —</option>
                        {photos.map(p => (
                          <option key={p.id} value={p.id}>{p.title}</option>
                        ))}
                      </select>
                      {selected && (
                        <div className="flex items-center gap-4">
                          <img
                            src={selected.thumb_url || selected.image_url}
                            alt={selected.title}
                            className="w-20 h-20 object-cover border border-[#2C2631]"
                          />
                          <div className="text-sm text-[#AFA8B3]">
                            <p className="text-[#F8F7F9] font-medium">{selected.title}</p>
                            <p>{selected.subcategory || selected.category}</p>
                            {selected.hermandad && <p>{selected.hermandad}</p>}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <button
                onClick={handleSaveFeatured}
                disabled={featuredSaving}
                className="mt-8 w-full bg-[#522A4E] text-[#F8F7F9] py-3 px-6 hover:bg-[#6B3868] transition-colors disabled:opacity-50"
              >
                {featuredSaving ? 'Guardando...' : featuredSuccess ? '✓ Guardado' : 'Guardar Destacados'}
              </button>
            </div>
          </div>
        )}

        {/* Calendar Tab */}
        {activeTab === 'calendar' && (
          <AdminCalendar />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;