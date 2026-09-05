import React, { useState, useEffect } from 'react';
import { 
  X, 
  Building2, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  MapPin, 
  Mail, 
  Phone, 
  FileText, 
  ShieldCheck,
  Globe
} from 'lucide-react';
import { ClientMasterItem } from '../types';
import { LogoUploader } from './LogoUploader';
import { formatRut, validateRut, CHILE_COMUNAS, COMMON_GIROS_SII } from '../utils/siiUtils';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: ClientMasterItem | null;
  onSave: (client: ClientMasterItem) => void;
}

export const ClientModal: React.FC<ClientModalProps> = ({
  isOpen,
  onClose,
  client,
  onSave
}) => {
  const isEditing = !!client;

  const [companyName, setCompanyName] = useState('');
  const [fantasyName, setFantasyName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [businessActivity, setBusinessActivity] = useState('');
  const [siiActivityCode, setSiiActivityCode] = useState('');
  const [taxAddress, setTaxAddress] = useState('');
  const [comuna, setComuna] = useState('Las Condes');
  const [city, setCity] = useState('Santiago');
  const [country, setCountry] = useState('Chile');
  const [contactName, setContactName] = useState('');
  const [contactRole, setContactRole] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [billingEmail, setBillingEmail] = useState('');
  const [industry, setIndustry] = useState('Servicios Financieros & Inversiones');
  const [logoUrl, setLogoUrl] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (client) {
      setCompanyName(client.companyName || '');
      setFantasyName(client.fantasyName || '');
      setTaxId(client.taxId || '');
      setBusinessActivity(client.businessActivity || '');
      setSiiActivityCode(client.siiActivityCode || '');
      setTaxAddress(client.taxAddress || '');
      setComuna(client.comuna || 'Las Condes');
      setCity(client.city || 'Santiago');
      setCountry(client.country || 'Chile');
      setContactName(client.contactName || '');
      setContactRole(client.contactRole || '');
      setContactEmail(client.contactEmail || '');
      setContactPhone(client.contactPhone || '');
      setBillingEmail(client.billingEmail || '');
      setIndustry(client.industry || 'Servicios Financieros & Inversiones');
      setLogoUrl(client.logoUrl || '');
      setNotes(client.notes || '');
    } else {
      setCompanyName('');
      setFantasyName('');
      setTaxId('');
      setBusinessActivity('');
      setSiiActivityCode('');
      setTaxAddress('');
      setComuna('Las Condes');
      setCity('Santiago');
      setCountry('Chile');
      setContactName('');
      setContactRole('');
      setContactEmail('');
      setContactPhone('');
      setBillingEmail('');
      setIndustry('Servicios Financieros & Inversiones');
      setLogoUrl('');
      setNotes('');
    }
  }, [client, isOpen]);

  if (!isOpen) return null;

  const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatRut(e.target.value);
    setTaxId(formatted);
  };

  const isRutValid = taxId ? validateRut(taxId) : false;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const saved: ClientMasterItem = {
      id: client ? client.id : `client-${Date.now()}`,
      companyName: companyName.trim(),
      fantasyName: fantasyName.trim() || companyName.trim(),
      taxId: taxId.trim(),
      businessActivity: businessActivity.trim(),
      siiActivityCode: siiActivityCode.trim(),
      taxAddress: taxAddress.trim(),
      comuna: comuna.trim(),
      city: city.trim(),
      country: country.trim() || 'Chile',
      contactName: contactName.trim(),
      contactRole: contactRole.trim(),
      contactEmail: contactEmail.trim(),
      contactPhone: contactPhone.trim(),
      billingEmail: billingEmail.trim() || contactEmail.trim(),
      industry: industry.trim(),
      logoUrl: logoUrl.trim(),
      notes: notes.trim(),
      createdAt: client ? client.createdAt : new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
      active: true
    };

    onSave(saved);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                {isEditing ? `Editar Cliente: ${client.companyName}` : 'Registrar Nuevo Cliente en Maestro SII'}
              </h2>
              <p className="text-xs text-slate-400">
                Ficha maestra tributaria del cliente según normas del Servicio de Impuestos Internos (SII) de Chile
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-slate-800 text-xs">
          
          {/* Logo Section */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <LogoUploader
              currentLogo={logoUrl}
              onLogoChange={setLogoUrl}
              label="Logo Oficial de la Empresa Cliente"
              description="Este logo se exhibirá en el extremo superior derecho del dossier comercial y en la carátula de cotización."
              recommendedSize="Recomendado: 350x120 px con fondo transparente (PNG o SVG)"
              previewBg="light"
            />
          </div>

          {/* Bloque 1: Datos Tributarios SII */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs">
                1. Datos Tributarios & Facturación SII (Chile)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Razón Social (Registrada en SII) *
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  placeholder="ej. Twin Ducks Capital SpA"
                  required
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nombre de Fantasía / Comercial
                </label>
                <input
                  type="text"
                  value={fantasyName}
                  onChange={e => setFantasyName(e.target.value)}
                  placeholder="ej. Twin Ducks Capital"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Usado en la carátula principal del documento comercial
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  RUT del Cliente (con formato y DV) *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={taxId}
                    onChange={handleRutChange}
                    placeholder="ej. 76.982.415-K"
                    required
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  {taxId && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {isRutValid ? (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          RUT Válido
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Formato
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Código de Actividad SII (Opcional)
                </label>
                <input
                  type="text"
                  value={siiActivityCode}
                  onChange={e => setSiiActivityCode(e.target.value)}
                  placeholder="ej. 649900"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-slate-700">
                    Giro Comercial según SII *
                  </label>
                  <select
                    onChange={e => e.target.value && setBusinessActivity(e.target.value)}
                    className="text-[11px] text-blue-600 font-semibold bg-transparent border-0 cursor-pointer focus:outline-none"
                  >
                    <option value="">+ Seleccionar giro habitual</option>
                    {COMMON_GIROS_SII.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <input
                  type="text"
                  value={businessActivity}
                  onChange={e => setBusinessActivity(e.target.value)}
                  placeholder="ej. Sociedad de Inversiones, Asesorías Comerciales y Financieras"
                  required
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Bloque 2: Domicilio Legal & Ubicación */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs">
                2. Domicilio Tributario & Comuna
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Dirección Tributaria (Calle, Número, Of./Depto)
                </label>
                <input
                  type="text"
                  value={taxAddress}
                  onChange={e => setTaxAddress(e.target.value)}
                  placeholder="ej. Av. Isidora Goyenechea 3000, Of. 2101"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Comuna (Chile)
                </label>
                <input
                  type="text"
                  list="comunas-list"
                  value={comuna}
                  onChange={e => setComuna(e.target.value)}
                  placeholder="ej. Las Condes"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <datalist id="comunas-list">
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
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="ej. Santiago"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  País
                </label>
                <input
                  type="text"
                  value={country}
                  onChange={e => setCountry(e.target.value)}
                  placeholder="ej. Chile"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Rubro / Industria
                </label>
                <select
                  value={industry}
                  onChange={e => setIndustry(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Servicios Financieros & Inversiones">Servicios Financieros & Inversiones</option>
                  <option value="Minería & Recursos Naturales">Minería & Recursos Naturales</option>
                  <option value="Forestal, Celulosa & Manufactura">Forestal, Celulosa & Manufactura</option>
                  <option value="Consumo Masivo & Bebidas">Consumo Masivo & Bebidas</option>
                  <option value="Alimentos & Agroindustria">Alimentos & Agroindustria</option>
                  <option value="Retail & Distribución">Retail & Distribución</option>
                  <option value="Tecnología & Telecomunicaciones">Tecnología & Telecomunicaciones</option>
                  <option value="Energía & Utilities">Energía & Utilities</option>
                  <option value="Salud & Farmacéutica">Salud & Farmacéutica</option>
                  <option value="Construcción & Inmobiliaria">Construcción & Inmobiliaria</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bloque 3: Contacto Principal & Facturación Electrónica */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <Mail className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs">
                3. Interlocutor Comercial & Facturación Electrónica (DTE)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nombre Contacto Principal
                </label>
                <input
                  type="text"
                  value={contactName}
                  onChange={e => setContactName(e.target.value)}
                  placeholder="ej. Matías Edwards R."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Cargo / Rol
                </label>
                <input
                  type="text"
                  value={contactRole}
                  onChange={e => setContactRole(e.target.value)}
                  placeholder="ej. Chief Investment Officer"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Correo Electrónico Comercial
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={e => setContactEmail(e.target.value)}
                  placeholder="ej. medwards@twinducks.cl"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Teléfono / Móvil de Contacto
                </label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={e => setContactPhone(e.target.value)}
                  placeholder="ej. +56 9 8765 4321"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Email de Facturación Electrónica (DTE / e-Factura SII)
                </label>
                <input
                  type="email"
                  value={billingEmail}
                  onChange={e => setBillingEmail(e.target.value)}
                  placeholder="ej. facturacion@twinducks.cl"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Buzón de recepción de DTE para envío de facturas electrónicas de consultoría
                </span>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Notas Internas del Cliente (Opcional)
                </label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Particularidades de negociación, ERP SAP actual, preferencias de facturación..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-700 hover:bg-slate-100 font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isEditing ? 'Guardar Cambios del Cliente' : 'Registrar en Maestro de Clientes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
