import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
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
} from './ui/alert-dialog';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

/**
 * ImageSettingCard - reusable card for managing a site image setting.
 * Props:
 *   settingKey: backend key ('hero_image' | 'about_image')
 *   title: display title
 *   description: text under title
 *   previewHeight: tailwind h-* class for preview
 *   testIdPrefix: prefix for data-testids
 */
const ImageSettingCard = ({ settingKey, title, description, previewHeight = 'h-64', testIdPrefix }) => {
  const [info, setInfo] = useState({ url: '', is_custom: false });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settingKey]);

  const fetchInfo = async () => {
    try {
      const { data } = await axios.get(`${API}/settings/${settingKey}`);
      setInfo(data);
    } catch (error) {
      console.error(`Error fetching ${settingKey}:`, error);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Selecciona una imagen primero');
      return;
    }
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      await axios.post(`${API}/settings/${settingKey}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });
      toast.success('Imagen actualizada');
      setFile(null);
      fetchInfo();
    } catch (error) {
      toast.error('Error al actualizar la imagen');
    } finally {
      setUploading(false);
    }
  };

  const handleReset = async () => {
    try {
      await axios.delete(`${API}/settings/${settingKey}`, { withCredentials: true });
      toast.success('Imagen restaurada');
      fetchInfo();
    } catch (error) {
      toast.error('Error al restaurar la imagen');
    }
  };

  const imgSrc = info.is_custom ? `${process.env.REACT_APP_BACKEND_URL}${info.url}` : info.url;

  return (
    <div className="bg-[#1A171D] border border-white/5 p-8" data-testid={`${testIdPrefix}-section`}>
      <h2 className="text-2xl font-medium mb-2">{title}</h2>
      <p className="text-sm text-[#AFA8B3] mb-6">{description}</p>

      {/* Current Preview */}
      <div className="mb-6">
        <p className="text-xs tracking-[0.2em] uppercase text-[#9C6AB0] mb-3">
          Imagen Actual {info.is_custom ? '(Personalizada)' : '(Por defecto)'}
        </p>
        <div className={`relative w-full ${previewHeight} bg-[#0C0A0D] border border-[#2C2631] overflow-hidden flex items-center justify-center`}>
          {imgSrc && (
            <img
              src={imgSrc}
              alt={`Vista previa ${title}`}
              className="max-w-full max-h-full w-auto h-auto object-contain"
              data-testid={`${testIdPrefix}-preview`}
            />
          )}
        </div>
      </div>

      {/* Upload Form */}
      <form onSubmit={handleUpload} className="space-y-4">
        <div>
          <label htmlFor={`file_${settingKey}`} className="block text-sm font-medium mb-2">
            Nueva imagen
          </label>
          <input
            type="file"
            id={`file_${settingKey}`}
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full bg-[#252129] border border-[#2C2631] text-[#F8F7F9] px-4 py-3 focus:outline-none focus:border-[#9C6AB0]"
            data-testid={`${testIdPrefix}-file-input`}
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={uploading || !file}
            className="bg-[#522A4E] hover:bg-[#6D3B68] disabled:bg-[#252129] disabled:text-[#AFA8B3] text-white px-6 py-3 transition-colors duration-200"
            data-testid={`${testIdPrefix}-upload-button`}
          >
            {uploading ? 'Subiendo...' : 'Actualizar Imagen'}
          </button>

          {info.is_custom && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  type="button"
                  className="border border-[#2C2631] text-[#AFA8B3] hover:border-[#9C6AB0] hover:text-[#F8F7F9] px-6 py-3 transition-colors duration-200"
                  data-testid={`${testIdPrefix}-reset-button`}
                >
                  Restaurar Original
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-[#1A171D] border-[#2C2631] text-[#F8F7F9]">
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Restaurar imagen original?</AlertDialogTitle>
                  <AlertDialogDescription className="text-[#AFA8B3]">
                    La web volverá a mostrar la imagen por defecto.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-[#252129] border-[#2C2631] text-[#F8F7F9] hover:bg-[#2C2631]">Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleReset} className="bg-red-600 hover:bg-red-700 text-white">
                    Restaurar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </form>
    </div>
  );
};

export default ImageSettingCard;
