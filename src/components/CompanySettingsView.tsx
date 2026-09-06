import React, { useState } from 'react';
import { 
  Building2, 
  Save, 
  CheckCircle2, 
  ShieldCheck, 
  MapPin, 
  Mail, 
  Phone, 
  Globe, 
  FileText, 
  UserCheck, 
  RotateCcw,
  Sparkles,
  Eye,
  Handshake,
  Layers
} from 'lucide-react';
import { CompanyProfile } from '../types';
import { LogoUploader } from './LogoUploader';
import { formatRut, validateRut, CHILE_COMUNAS, COMMON_GIROS_SII } from '../utils/siiUtils';
import { DEFAULT_COMPANY_PROFILE } from '../data/companyProfile';
import { 
  TWIN_DUCKS_LOGO_SVG, 
  MINERA_ANDINA_LOGO_SVG, 
  ALIMENTOS_PACIFICO_LOGO_SVG, 
  LOGISTICA_CONO_SUR_LOGO_SVG 
} from '../data/defaultClientLogos';

interface CompanySettingsViewProps {
  companyProfile: CompanyProfile;
  onUpdateCompanyProfile: (updated: CompanyProfile) => void;
}

const PREVIEW_CLIENT_OPTIONS = [
  {
    fantasyName: 'TWIN DUCKS CAPITAL',
    companyName: 'Twin Ducks Capital SpA',
    taxId: '76.982.415-K',
    industry: 'Servicios Financieros & Inversiones',
    subheading: 'INVESTMENT & ADVISORY GROUP',
    logoUrl: TWIN_DUCKS_LOGO_SVG
  },
  {
    fantasyName: 'MINERA ANDINA',
    companyName: 'Minera Andina del Cobre S.A.',
    taxId: '76.452.890-3',
    industry: 'Gran Minería del Cobre',
    subheading: 'DIVISIÓN OPERACIONES NORTE',
    logoUrl: MINERA_ANDINA_LOGO_SVG
  },
  {
    fantasyName: 'ALIMENTOS DEL PACÍFICO',
    companyName: 'Alimentos del Pacífico S.A.',
    taxId: '89.031.500-K',
    industry: 'Agroindustria & Exportación',
    subheading: 'FOODS & BEVERAGES DIVISION',
    logoUrl: ALIMENTOS_PACIFICO_LOGO_SVG
  },
  {
    fantasyName: 'LOGÍSTICA CONO SUR',
    companyName: 'Logística & Bebidas Cono Sur S.A.',
    taxId: '76.120.340-5',
    industry: 'Cadena de Suministro & Logística',
    subheading: 'SUPPLY CHAIN & DISTRIBUTION',
    logoUrl: LOGISTICA_CONO_SUR_LOGO_SVG
  }
];

export const CompanySettingsView: React.FC<CompanySettingsViewProps> = ({
  companyProfile,
  onUpdateCompanyProfile
}) => {
  const [profile, setProfile] = useState<CompanyProfile>(companyProfile);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [previewClientIndex, setPreviewClientIndex] = useState(0);

  const selectedPreviewClient = PREVIEW_CLIENT_OPTIONS[previewClientIndex];

  const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatRut(e.target.value);
    setProfile(prev => ({ ...prev, taxId: formatted }));
  };

  const handleRepRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatRut(e.target.value);
    setProfile(prev => ({
      ...prev,
      legalRepresentative: {
        ...(prev.legalRepresentative || { name: '', taxId: '', role: '' }),
        taxId: formatted
      }
    }));
  };

  const isRutValid = profile.taxId ? validateRut(profile.taxId) : false;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCompanyProfile(profile);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3500);
  };

  const handleResetDefaults = () => {
    if (window.confirm('¿Deseas restaurar la información y logos de la empresa a los valores por defecto?')) {
      setProfile(DEFAULT_COMPANY_PROFILE);
      onUpdateCompanyProfile(DEFAULT_COMPANY_PROFILE);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {showSuccessToast && (
        <div className="p-4 bg-emerald-600 text-white rounded-xl shadow-xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold">
            <CheckCircle2 className="w-5 h-5" />
            <span>Datos y Logo de Nuestra Empresa guardados correctamente. Se reflejarán en todas las cotizaciones y carátulas.</span>
          </div>
        </div>
      )}

      {/* Main Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Corporate Identity & Chilean SII Tax Profile
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Nuestra Empresa: Datos Emisor SII & Logotipo
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Configura el logo oficial y los datos tributarios de nuestra consultora que encabezan las propuestas, carátulas y contratos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restablecer Valores
          </button>

          <button
            onClick={handleSave}
            type="button"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Guardar Información
          </button>
        </div>
      </div>

      {/* Live Preview of Header Box - Redesigned Symmetrical Corporate Alliance */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 text-white shadow-2xl relative overflow-hidden space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
              <Eye className="w-4 h-4" />
              Previsualización en Vivo de la Carátula de Cotización
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Cabecera superior sincronizada con el Dossier Editorial y la exportación a PDF
            </span>
          </div>

          {/* Client Preview Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 px-2 uppercase font-semibold">Cliente:</span>
            {PREVIEW_CLIENT_OPTIONS.map((c, idx) => (
              <button
                key={c.taxId}
                type="button"
                onClick={() => setPreviewClientIndex(idx)}
                className={`px-2.5 py-1 text-[11px] font-mono font-semibold rounded-lg transition-all cursor-pointer ${
                  previewClientIndex === idx
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {c.fantasyName.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Carátula Header Card */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-900 rounded-xl p-5 border border-slate-800/90 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-inner">
          
          {/* Left: Our Company (Emisor) */}
          <div className="flex items-center gap-4 flex-1">
            {profile.logoUrl ? (
              <div className="h-14 w-auto min-w-[130px] max-w-[170px] p-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center overflow-hidden shadow-lg shrink-0">
                <img 
                  src={profile.logoUrl} 
                  alt={profile.name} 
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-2xl text-white tracking-wider shadow-lg shadow-blue-500/30 shrink-0">
                ⚡
              </div>
            )}
            <div className="space-y-0.5">
              <span className="text-[9px] font-mono font-bold tracking-widest text-blue-400 uppercase flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                CONSULTORÍA SAP · EMISOR
              </span>
              <span className="text-lg font-black tracking-tight text-white block leading-tight">
                {profile.name || 'SAP & TECH CONSULTING'}
              </span>
              <span className="text-[10px] tracking-widest text-slate-300 uppercase font-mono block">
                {profile.subheading || 'ENTERPRISE SOLUTIONS GROUP'}
              </span>
              <span className="text-[10px] text-slate-500 block font-mono">
                {profile.legalName} · RUT: {profile.taxId}
              </span>
            </div>
          </div>

          {/* Center: Alliance Badge Bridge */}
          <div className="hidden lg:flex flex-col items-center justify-center px-4 border-x border-slate-800 self-stretch">
            <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 flex items-center gap-1.5 text-[10px] font-mono text-slate-300 font-bold uppercase tracking-wider">
              <Handshake className="w-3.5 h-3.5 text-blue-400" />
              <span>Alianza Estratégica</span>
            </div>
            <span className="text-[9px] font-mono text-slate-500 mt-1">
              Propuesta Técnica SAP
            </span>
          </div>

          {/* Right: Selected Client (Destinatario) */}
          <div className="flex items-center gap-4 flex-1 lg:flex-row-reverse lg:text-right">
            <div className="h-14 w-auto min-w-[130px] max-w-[170px] p-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center overflow-hidden shadow-lg shrink-0">
              <img 
                src={selectedPreviewClient.logoUrl} 
                alt={selectedPreviewClient.fantasyName} 
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div className="space-y-0.5">
              <span className="text-[9px] font-mono font-bold tracking-widest text-emerald-400 uppercase flex items-center lg:justify-end gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                PREPARADO EXCLUSIVAMENTE PARA
              </span>
              <span className="text-lg font-black tracking-tight text-white block leading-tight">
                {selectedPreviewClient.fantasyName}
              </span>
              <span className="text-[10px] tracking-widest text-slate-300 uppercase font-mono block">
                {selectedPreviewClient.subheading}
              </span>
              <span className="text-[10px] text-slate-500 block font-mono">
                {selectedPreviewClient.companyName} · RUT: {selectedPreviewClient.taxId}
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Form Fields */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Logo Uploader */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <LogoUploader
            currentLogo={profile.logoUrl}
            onLogoChange={url => setProfile(prev => ({ ...prev, logoUrl: url }))}
            label="Logotipo Oficial de Nuestra Empresa / Consultora"
            description="Carga el logo que se desplegará en la esquina superior izquierda de todas las cotizaciones, dossieres y documentos PDF exportables."
            recommendedSize="Recomendado: 400x120 px con fondo transparente (PNG, SVG o WebP)"
            previewBg="dark"
          />
        </div>

        {/* Section 1: Brand & Fantasía */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs">
              1. Identidad de Marca & Títulos Comerciales
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nombre de Marca Comercial *
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={e => setProfile(prev => ({ ...prev, name: e.target.value }))}
                placeholder="ej. SAP & TECH CONSULTING"
                required
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Título prominente en carátula y encabezado de cotización
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Subtítulo / División *
              </label>
              <input
                type="text"
                value={profile.subheading}
                onChange={e => setProfile(prev => ({ ...prev, subheading: e.target.value }))}
                placeholder="ej. ENTERPRISE SOLUTIONS GROUP"
                required
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 uppercase font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Sub-etiqueta monoespaciada bajo el nombre de marca
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Datos Tributarios SII */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs">
              2. Datos Tributarios SII de la Consultora (Emisor)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Razón Social Oficial (según SII) *
              </label>
              <input
                type="text"
                value={profile.legalName}
                onChange={e => setProfile(prev => ({ ...prev, legalName: e.target.value }))}
                placeholder="ej. SAP & Tech Consulting SpA"
                required
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                RUT de la Consultora *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={profile.taxId}
                  onChange={handleRutChange}
                  placeholder="ej. 77.654.321-8"
                  required
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                {profile.taxId && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isRutValid ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        RUT Válido
                      </span>
                    ) : null}
                  </div>
                )}
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Giro Comercial Registrado en SII *
              </label>
              <input
                type="text"
                value={profile.businessActivity}
                onChange={e => setProfile(prev => ({ ...prev, businessActivity: e.target.value }))}
                placeholder="ej. Servicios Integrales de Consultoría en Tecnologías de la Información, Arquitectura SAP y Desarrollo de Sistemas"
                required
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Código Actividad Económica SII
              </label>
              <input
                type="text"
                value={profile.siiActivityCode || ''}
                onChange={e => setProfile(prev => ({ ...prev, siiActivityCode: e.target.value }))}
                placeholder="ej. 620200"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Dirección Tributaria / Domicilio Legal
              </label>
              <input
                type="text"
                value={profile.taxAddress}
                onChange={e => setProfile(prev => ({ ...prev, taxAddress: e.target.value }))}
                placeholder="ej. Av. Apoquindo 4501, Piso 14, Of. 1402"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Comuna
              </label>
              <input
                type="text"
                list="comunas-company"
                value={profile.comuna}
                onChange={e => setProfile(prev => ({ ...prev, comuna: e.target.value }))}
                placeholder="ej. Las Condes"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <datalist id="comunas-company">
                {CHILE_COMUNAS.map(c => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Ciudad / Región
              </label>
              <input
                type="text"
                value={profile.city}
                onChange={e => setProfile(prev => ({ ...prev, city: e.target.value }))}
                placeholder="ej. Santiago, Región Metropolitana"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Contact Channels */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <Globe className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs">
              3. Canales de Contacto Corporativo & Web
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Teléfono de Contacto
              </label>
              <input
                type="text"
                value={profile.phone}
                onChange={e => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="ej. +56 2 2987 6543"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Correo Electrónico Oficial
              </label>
              <input
                type="email"
                value={profile.email}
                onChange={e => setProfile(prev => ({ ...prev, email: e.target.value }))}
                placeholder="ej. contacto@techconsulting.cl"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Sitio Web Corporativo
              </label>
              <input
                type="text"
                value={profile.website}
                onChange={e => setProfile(prev => ({ ...prev, website: e.target.value }))}
                placeholder="ej. www.techconsulting.cl"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Representante Legal / Firmante */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <UserCheck className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs">
              4. Representante Legal & Firmante Oficial (Bloque de Firma)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nombre del Representante Legal
              </label>
              <input
                type="text"
                value={profile.legalRepresentative?.name || ''}
                onChange={e => setProfile(prev => ({
                  ...prev,
                  legalRepresentative: {
                    ...(prev.legalRepresentative || { name: '', taxId: '', role: '' }),
                    name: e.target.value
                  }
                }))}
                placeholder="ej. Diego Valenzuela M."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                RUT del Representante
              </label>
              <input
                type="text"
                value={profile.legalRepresentative?.taxId || ''}
                onChange={handleRepRutChange}
                placeholder="ej. 15.892.341-K"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Cargo / Rol Legal
              </label>
              <input
                type="text"
                value={profile.legalRepresentative?.role || ''}
                onChange={e => setProfile(prev => ({
                  ...prev,
                  legalRepresentative: {
                    ...(prev.legalRepresentative || { name: '', taxId: '', role: '' }),
                    role: e.target.value
                  }
                }))}
                placeholder="ej. Managing Partner & Principal SAP Advisor"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                value={profile.legalRepresentative?.email || ''}
                onChange={e => setProfile(prev => ({
                  ...prev,
                  legalRepresentative: {
                    ...(prev.legalRepresentative || { name: '', taxId: '', role: '' }),
                    email: e.target.value
                  }
                }))}
                placeholder="ej. dvalenzuela@techconsulting.cl"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Información & Logotipo de Nuestra Empresa</span>
          </button>
        </div>
      </form>
    </div>
  );
};
