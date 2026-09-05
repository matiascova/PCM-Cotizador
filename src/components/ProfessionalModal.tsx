import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  DollarSign, 
  ShieldCheck, 
  Sparkles,
  Layers,
  Award,
  Clock
} from 'lucide-react';
import { Professional, SapModuleCode, SeniorityLevel } from '../types';
import { SAP_CATALOG_MODULES } from '../data/sapModules';
import { getBenchmarkRate } from '../utils/currencies';

interface ProfessionalModalProps {
  isOpen: boolean;
  professional: Professional | null; // null if creating
  onClose: () => void;
  onSave: (professional: Professional) => void;
}

export const ProfessionalModal: React.FC<ProfessionalModalProps> = ({
  isOpen,
  professional,
  onClose,
  onSave
}) => {
  const isEditing = !!professional;

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [moduleCode, setModuleCode] = useState<SapModuleCode>('SAP_MM');
  const [seniority, setSeniority] = useState<SeniorityLevel>('Senior');
  const [location, setLocation] = useState('Santiago, Chile');
  const [modality, setModality] = useState<'Remoto' | 'Híbrido' | 'Presencial'>('Híbrido');
  const [status, setStatus] = useState<'Disponible' | 'En Asignación' | 'Parcial'>('Disponible');
  
  // Rates
  const [rateUF, setRateUF] = useState<number>(2.20);
  const [rateCLP, setRateCLP] = useState<number>(88000);
  const [rateUSD, setRateUSD] = useState<number>(95);
  const [rateMXN, setRateMXN] = useState<number>(1750);

  // Internal Cost Rates (optional)
  const [costCLP, setCostCLP] = useState<number>(55000);
  const [costUF, setCostUF] = useState<number>(1.40);

  const [skillsText, setSkillsText] = useState('');
  const [certificationsText, setCertificationsText] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    if (professional) {
      setName(professional.name);
      setCode(professional.code);
      setEmail(professional.email);
      setPhone(professional.phone || '');
      setRoleTitle(professional.roleTitle);
      setModuleCode(professional.moduleCode);
      setSeniority(professional.seniority);
      setLocation(professional.location);
      setModality(professional.modality);
      setStatus(professional.status);
      setRateUF(professional.rates?.UF ?? 2.20);
      setRateCLP(professional.rates?.CLP ?? 88000);
      setRateUSD(professional.rates?.USD ?? 95);
      setRateMXN(professional.rates?.MXN ?? 1750);
      setCostCLP(professional.costRates?.CLP ?? Math.round((professional.rates?.CLP ?? 88000) * 0.65));
      setCostUF(professional.costRates?.UF ?? Number(((professional.rates?.UF ?? 2.20) * 0.65).toFixed(2)));
      setSkillsText(professional.skills?.join(', ') || '');
      setCertificationsText(professional.certifications?.join(', ') || '');
      setBio(professional.bio || '');
    } else {
      // New professional defaults
      const randomId = Math.floor(Math.random() * 90) + 10;
      setName('');
      setCode(`CONS-SAP-${randomId}`);
      setEmail('');
      setPhone('+56 9 ');
      setRoleTitle('Consultor Senior SAP MM');
      setModuleCode('SAP_MM');
      setSeniority('Senior');
      setLocation('Santiago, Chile');
      setModality('Híbrido');
      setStatus('Disponible');
      
      const bUF = getBenchmarkRate('SAP_MM', 'Senior', 'UF');
      const bCLP = getBenchmarkRate('SAP_MM', 'Senior', 'CLP');
      const bUSD = getBenchmarkRate('SAP_MM', 'Senior', 'USD');
      const bMXN = getBenchmarkRate('SAP_MM', 'Senior', 'MXN');

      setRateUF(bUF);
      setRateCLP(bCLP);
      setRateUSD(bUSD);
      setRateMXN(bMXN);
      setCostCLP(Math.round(bCLP * 0.65));
      setCostUF(Number((bUF * 0.65).toFixed(2)));

      setSkillsText('S/4HANA 2023, Parametrización SPRO, Integración');
      setCertificationsText('SAP Certified Associate');
      setBio('');
    }
  }, [professional, isOpen]);

  // Recalculate suggested benchmark rates when module or seniority changes in new mode
  const handleAutoFillRatesFromBenchmark = () => {
    const bUF = getBenchmarkRate(moduleCode, seniority, 'UF');
    const bCLP = getBenchmarkRate(moduleCode, seniority, 'CLP');
    const bUSD = getBenchmarkRate(moduleCode, seniority, 'USD');
    const bMXN = getBenchmarkRate(moduleCode, seniority, 'MXN');

    setRateUF(bUF);
    setRateCLP(bCLP);
    setRateUSD(bUSD);
    setRateMXN(bMXN);
    setCostCLP(Math.round(bCLP * 0.65));
    setCostUF(Number((bUF * 0.65).toFixed(2)));
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Por favor ingrese el nombre del profesional');
      return;
    }

    const modObj = SAP_CATALOG_MODULES.find(m => m.code === moduleCode);

    const updatedProfessional: Professional = {
      id: professional?.id || `prof-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      code: code.trim() || `CONS-${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      roleTitle: roleTitle.trim() || `Consultor ${seniority} ${modObj?.shortName || 'SAP'}`,
      moduleCode,
      moduleName: modObj?.name || moduleCode,
      seniority,
      location: location.trim() || 'Santiago, Chile',
      modality,
      status,
      rates: {
        UF: Number(rateUF) || 2.20,
        CLP: Number(rateCLP) || 88000,
        USD: Number(rateUSD) || 95,
        MXN: Number(rateMXN) || 1750
      },
      costRates: {
        CLP: Number(costCLP) || 55000,
        UF: Number(costUF) || 1.40,
        USD: Number((Number(rateUSD) * 0.65).toFixed(0)),
        MXN: Number((Number(rateMXN) * 0.65).toFixed(0))
      },
      skills: skillsText
        .split(',')
        .map(s => s.trim())
        .filter(Boolean),
      certifications: certificationsText
        .split(',')
        .map(c => c.trim())
        .filter(Boolean),
      bio: bio.trim(),
      active: true
    };

    onSave(updatedProfessional);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8 max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 to-blue-950 px-6 py-4 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
              <User className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <h3 className="text-base font-bold leading-tight">
                {isEditing ? 'Editar Ficha y Tarifario del Profesional' : 'Registrar Nuevo Profesional en el Catálogo'}
              </h3>
              <p className="text-xs text-slate-300">
                Configure el perfil técnico y las tarifas preestablecidas para cotización directa
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          {/* Section 1: Información Personal y Contacto */}
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
              1. Datos del Profesional
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="ej. Camila Valenzuela"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Código de Identificación
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  placeholder="CONS-MM-01"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="cvalenzuela@consultora.cl"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Teléfono de Contacto
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+56 9 7831 4452"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Ubicación / País
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="Santiago, Chile"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Especialidad y Perfil Técnico */}
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
              2. Especialidad y Perfil SAP
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Título / Cargo Profesional *
                </label>
                <input
                  type="text"
                  value={roleTitle}
                  onChange={e => setRoleTitle(e.target.value)}
                  placeholder="ej. Consultora Senior SAP MM & Aprovisionamiento"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Módulo Principal SAP
                </label>
                <select
                  value={moduleCode}
                  onChange={e => {
                    const next = e.target.value as SapModuleCode;
                    setModuleCode(next);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                >
                  {SAP_CATALOG_MODULES.map(m => (
                    <option key={m.code} value={m.code}>
                      {m.code} - {m.shortName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Seniority
                </label>
                <select
                  value={seniority}
                  onChange={e => setSeniority(e.target.value as SeniorityLevel)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                >
                  <option value="Junior">Junior (1-2 años)</option>
                  <option value="Semi-Senior">Semi-Senior (3-5 años)</option>
                  <option value="Senior">Senior (6-9 años)</option>
                  <option value="Lead / Arquitecto">Lead / Arquitecto (+10 años)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Modalidad de Trabajo
                </label>
                <select
                  value={modality}
                  onChange={e => setModality(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                >
                  <option value="Remoto">Remoto</option>
                  <option value="Híbrido">Híbrido</option>
                  <option value="Presencial">Presencial</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Estado de Asignación
                </label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                >
                  <option value="Disponible">🟢 Disponible</option>
                  <option value="En Asignación">🔵 En Asignación</option>
                  <option value="Parcial">🟡 Disponibilidad Parcial</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: MATRIZ TARIFARIA PREESTABLECIDA (KEY REQUIREMENT) */}
          <div className="bg-blue-50/60 border border-blue-200 p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">
                  3. Tarifas Horarias Preestablecidas para Cotización
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Estas tarifas se asignarán automáticamente al incorporar a este profesional en cualquier cotización.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAutoFillRatesFromBenchmark}
                className="px-2.5 py-1 text-[11px] font-bold bg-white text-blue-700 hover:bg-blue-100 rounded-lg border border-blue-200 shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                title="Cargar tarifas de referencia estándar para este módulo y seniority"
              >
                <Sparkles className="w-3 h-3 text-blue-600" />
                <span>Sugerir Tarifas Benchmark</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Tarifa UF */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
                <label className="text-[10px] font-bold text-slate-600 block mb-1">
                  🇨🇱 Tarifa UF / Hora
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0.1"
                  value={rateUF}
                  onChange={e => setRateUF(Math.max(0, Number(e.target.value) || 0))}
                  required
                  className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded font-mono font-bold text-blue-700 text-sm focus:bg-white focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Estándar Chile (UF)</span>
              </div>

              {/* Tarifa CLP */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
                <label className="text-[10px] font-bold text-slate-600 block mb-1">
                  🇨🇱 Tarifa CLP / Hora ($)
                </label>
                <input
                  type="number"
                  step="1000"
                  min="1000"
                  value={rateCLP}
                  onChange={e => setRateCLP(Math.max(0, Number(e.target.value) || 0))}
                  required
                  className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded font-mono font-bold text-slate-800 text-sm focus:bg-white focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Pesos Chilenos</span>
              </div>

              {/* Tarifa USD */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
                <label className="text-[10px] font-bold text-slate-600 block mb-1">
                  🇺🇸 Tarifa USD / Hora ($)
                </label>
                <input
                  type="number"
                  step="5"
                  min="10"
                  value={rateUSD}
                  onChange={e => setRateUSD(Math.max(0, Number(e.target.value) || 0))}
                  required
                  className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded font-mono font-bold text-slate-800 text-sm focus:bg-white focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Uruguay / Brasil / LatAm</span>
              </div>

              {/* Tarifa MXN */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
                <label className="text-[10px] font-bold text-slate-600 block mb-1">
                  🇲🇽 Tarifa MXN / Hora ($)
                </label>
                <input
                  type="number"
                  step="50"
                  min="100"
                  value={rateMXN}
                  onChange={e => setRateMXN(Math.max(0, Number(e.target.value) || 0))}
                  required
                  className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded font-mono font-bold text-slate-800 text-sm focus:bg-white focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">México</span>
              </div>
            </div>

            {/* Costo interno de referencia (para margen) */}
            <div className="pt-2 border-t border-blue-200/60 flex items-center justify-between text-[11px] text-slate-600">
              <span>Costo Interno Hora Estimado (Base Margen):</span>
              <div className="flex items-center gap-3">
                <span>CLP: <strong>${new Intl.NumberFormat('es-CL').format(costCLP)}</strong></span>
                <span>•</span>
                <span>UF: <strong>{costUF} UF</strong></span>
                <span>•</span>
                <span className="text-emerald-700 font-bold">
                  Margen Bruto: ~{rateCLP > 0 ? Math.round(((rateCLP - costCLP) / rateCLP) * 100) : 35}%
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: Habilidades, Certificaciones y Reseña */}
          <div className="space-y-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Habilidades y Tecnologías Clave (separadas por coma)
              </label>
              <input
                type="text"
                value={skillsText}
                onChange={e => setSkillsText(e.target.value)}
                placeholder="ej. S/4HANA 2023, MRP, Gestión de Stocks, Integración FI-MM"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Certificaciones Oficiales SAP
              </label>
              <input
                type="text"
                value={certificationsText}
                onChange={e => setCertificationsText(e.target.value)}
                placeholder="ej. SAP Certified Application Associate - S/4HANA Sourcing"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Breve Resumen Profesional / Bio
              </label>
              <textarea
                rows={2}
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="Descripción de la trayectoria y experiencia destacada del consultor..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isEditing ? 'Guardar Cambios' : 'Registrar Profesional'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
