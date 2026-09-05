import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Link as LinkIcon, Check } from 'lucide-react';

interface LogoUploaderProps {
  currentLogo?: string;
  onLogoChange: (logoUrl: string) => void;
  label?: string;
  description?: string;
  recommendedSize?: string;
  previewBg?: 'light' | 'dark' | 'transparent';
}

export const LogoUploader: React.FC<LogoUploaderProps> = ({
  currentLogo,
  onLogoChange,
  label = 'Logo Corporativo',
  description = 'Suba un archivo PNG, JPG o SVG con fondo transparente para mejor calidad en portadas y documentos.',
  recommendedSize = 'Recomendado: 400x160 px o superior (máx. 2MB)',
  previewBg = 'light'
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileProcess = (file: File) => {
    setErrorMessage('');
    if (!file.type.startsWith('image/')) {
      setErrorMessage('El archivo seleccionado no es una imagen válida.');
      return;
    }

    if (file.size > 2.5 * 1024 * 1024) {
      setErrorMessage('La imagen no debe superar los 2.5 MB para un rendimiento óptimo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = e => {
      const result = e.target?.result as string;
      if (result) {
        onLogoChange(result);
      }
    };
    reader.onerror = () => {
      setErrorMessage('Ocurrió un error al leer el archivo.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleApplyUrl = () => {
    if (customUrl.trim()) {
      onLogoChange(customUrl.trim());
      setShowUrlInput(false);
      setCustomUrl('');
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
          {label}
        </label>
        {currentLogo && (
          <button
            type="button"
            onClick={() => onLogoChange('')}
            className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            Remover logo
          </button>
        )}
      </div>

      {currentLogo ? (
        /* Preview with Action Overlay */
        <div className="flex flex-col sm:flex-row items-center gap-4 p-3.5 rounded-xl border border-slate-200 bg-slate-50">
          <div 
            className={`w-40 h-20 rounded-lg flex items-center justify-center p-2 border border-slate-200 overflow-hidden shadow-xs shrink-0 ${
              previewBg === 'dark' ? 'bg-slate-900' : 'bg-white'
            }`}
          >
            <img
              src={currentLogo}
              alt="Logo cargado"
              className="max-h-full max-w-full object-contain"
              onError={() => setErrorMessage('No se pudo cargar la imagen desde la URL provista.')}
            />
          </div>

          <div className="flex-1 space-y-1.5 text-xs">
            <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
              <Check className="w-4 h-4" />
              <span>Logo cargado exitosamente</span>
            </div>
            <p className="text-slate-500 text-[11px]">
              Este logo se insertará automáticamente en el encabezado de la cotización, la portada estilo dossier y los documentos PDF.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold rounded-md shadow-xs transition-colors cursor-pointer"
              >
                Cambiar imagen
              </button>
              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="text-[11px] text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
              >
                Ingresar URL directa
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Drag & Drop Area */
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
            isDragging
              ? 'border-blue-500 bg-blue-50/50 scale-[0.99]'
              : 'border-slate-300 hover:border-blue-400 bg-slate-50/60 hover:bg-slate-50'
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shadow-xs">
            <Upload className="w-5 h-5" />
          </div>

          <div className="space-y-0.5">
            <p className="text-xs font-bold text-slate-800">
              Haga clic para subir o arrastre el archivo aquí
            </p>
            <p className="text-[11px] text-slate-500">
              Formatos soportados: PNG, SVG, JPG o WebP
            </p>
            <p className="text-[10px] text-slate-400">
              {recommendedSize}
            </p>
          </div>

          <div className="pt-1">
            <span
              onClick={e => {
                e.stopPropagation();
                setShowUrlInput(!showUrlInput);
              }}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
            >
              <LinkIcon className="w-3 h-3" />
              O ingresar enlace de imagen web
            </span>
          </div>
        </div>
      )}

      {/* Hidden Native File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/svg+xml, image/webp"
        onChange={e => {
          if (e.target.files && e.target.files.length > 0) {
            handleFileProcess(e.target.files[0]);
          }
        }}
        className="hidden"
      />

      {/* Direct URL Input Modal/Bar */}
      {showUrlInput && (
        <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl space-y-2 animate-in fade-in">
          <label className="block text-[11px] font-bold text-blue-950">
            Ingresar URL directa de la imagen (HTTPS)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="url"
              value={customUrl}
              onChange={e => setCustomUrl(e.target.value)}
              placeholder="https://ejemplo.com/logos/empresa.png"
              className="flex-1 text-xs px-3 py-1.5 bg-white border border-blue-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={handleApplyUrl}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs cursor-pointer"
            >
              Cargar
            </button>
            <button
              type="button"
              onClick={() => setShowUrlInput(false)}
              className="px-2 py-1.5 text-xs text-slate-600 hover:text-slate-800 font-medium cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {errorMessage && (
        <p className="text-[11px] font-semibold text-rose-600 animate-in fade-in">
          {errorMessage}
        </p>
      )}

      <p className="text-[11px] text-slate-400 leading-tight">
        {description}
      </p>
    </div>
  );
};
