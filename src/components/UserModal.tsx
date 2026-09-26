/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Modal para Crear y Editar Usuarios con Validación de RUT/NIF según País
 */

import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  ShieldCheck, 
  KeyRound, 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Sparkles,
  Globe2,
  FileCheck2,
  Lock
} from 'lucide-react';
import { AppUser, UserRole } from '../types';
import { 
  SUPPORTED_COUNTRIES, 
  SupportedCountryCode, 
  validateTaxIdByCountry, 
  ValidationResult 
} from '../utils/nifValidator';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: AppUser) => void;
  userToEdit?: AppUser | null;
  currentUserRole?: UserRole;
}

export const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  onSave,
  userToEdit,
  currentUserRole = 'administrador'
}) => {
  const isEditMode = !!userToEdit;

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState<SupportedCountryCode>('CL');
  const [taxId, setTaxId] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('usuario');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [notes, setNotes] = useState('');

  // NIF Validation State
  const [taxValidation, setTaxValidation] = useState<ValidationResult>({
    isValid: false,
    formatted: '',
    taxIdType: 'RUT / RUN (Chile)'
  });
  const [isTaxDirty, setIsTaxDirty] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Load existing user or initialize defaults
  useEffect(() => {
    if (userToEdit) {
      setName(userToEdit.name || '');
      setEmail(userToEdit.email || '');
      const validCountry = (userToEdit.country as SupportedCountryCode) || 'CL';
      setCountry(validCountry);
      setTaxId(userToEdit.taxId || '');
      setPhone(userToEdit.phone || '');
      setRole(userToEdit.role || 'usuario');
      setPassword(userToEdit.password || '');
      setDepartment(userToEdit.department || '');
      setStatus(userToEdit.status || 'active');
      setNotes(userToEdit.notes || '');

      // Run initial validation on loaded taxId
      if (userToEdit.taxId) {
        const res = validateTaxIdByCountry(userToEdit.taxId, validCountry);
        setTaxValidation(res);
        setIsTaxDirty(true);
      }
    } else {
      // Default new user
      setName('');
      setEmail('');
      setCountry('CL');
      setTaxId('');
      setPhone('+56 9 ');
      setRole('usuario');
      setPassword('');
      setDepartment('Consultoría SAP');
      setStatus('active');
      setNotes('');
      setTaxValidation({
        isValid: false,
        formatted: '',
        taxIdType: 'RUT / RUN (Chile)'
      });
      setIsTaxDirty(false);
    }
    setErrorMessage('');
  }, [userToEdit, isOpen]);

  // Re-run taxId validation when taxId or country changes
  const handleCountryChange = (newCountry: SupportedCountryCode) => {
    setCountry(newCountry);
    if (taxId.trim()) {
      const res = validateTaxIdByCountry(taxId, newCountry);
      setTaxValidation(res);
    } else {
      const config = SUPPORTED_COUNTRIES.find(c => c.code === newCountry);
      setTaxValidation({
        isValid: false,
        formatted: '',
        taxIdType: config?.taxIdName || 'NIF'
      });
    }

    // Auto-adjust default phone prefix if creating new user
    if (!isEditMode) {
      if (newCountry === 'CL' && (!phone || phone.startsWith('+'))) setPhone('+56 9 ');
      else if (newCountry === 'ES' && (!phone || phone.startsWith('+'))) setPhone('+34 ');
      else if (newCountry === 'MX' && (!phone || phone.startsWith('+'))) setPhone('+52 ');
      else if (newCountry === 'CO' && (!phone || phone.startsWith('+'))) setPhone('+57 ');
      else if (newCountry === 'AR' && (!phone || phone.startsWith('+'))) setPhone('+54 9 ');
      else if (newCountry === 'PE' && (!phone || phone.startsWith('+'))) setPhone('+51 ');
      else if (newCountry === 'BR' && (!phone || phone.startsWith('+'))) setPhone('+55 ');
      else if (newCountry === 'US' && (!phone || phone.startsWith('+'))) setPhone('+1 ');
    }
  };

  const handleTaxIdChange = (val: string) => {
    setTaxId(val);
    setIsTaxDirty(true);
    const res = validateTaxIdByCountry(val, country);
    setTaxValidation(res);
  };

  const handleTaxIdBlur = () => {
    if (taxValidation.isValid && taxValidation.formatted) {
      setTaxId(taxValidation.formatted);
    }
  };

  // Generate a random strong password
  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%*';
    let res = '';
    for (let i = 0; i < 10; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(res);
    setShowPassword(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Validations
    if (!name.trim()) {
      setErrorMessage('Por favor ingrese el nombre completo del usuario.');
      return;
    }

    if (!email.trim() || !email.includes('@') || !email.includes('.')) {
      setErrorMessage('Por favor ingrese un correo electrónico válido.');
      return;
    }

    if (!taxId.trim()) {
      setErrorMessage('Por favor ingrese el RUT o NIF del usuario.');
      return;
    }

    // Check taxId validation according to country algorithm
    const valRes = validateTaxIdByCountry(taxId, country);
    if (!valRes.isValid) {
      setErrorMessage(valRes.errorMessage || 'El RUT/NIF ingresado no es válido según las reglas del país seleccionado.');
      return;
    }

    if (!phone.trim() || phone.trim().length < 6) {
      setErrorMessage('Por favor ingrese un número de celular o teléfono válido.');
      return;
    }

    if (!password.trim() || password.trim().length < 6) {
      setErrorMessage('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    const currentConfig = SUPPORTED_COUNTRIES.find(c => c.code === country);

    const updatedUser: AppUser = {
      id: userToEdit ? userToEdit.id : `USR-${Date.now().toString().slice(-6)}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      taxId: valRes.formatted || taxId.trim(),
      taxIdType: currentConfig?.taxIdName || 'NIF / RUT',
      country,
      phone: phone.trim(),
      role,
      password: password.trim(),
      status,
      department: department.trim() || 'Consultoría SAP',
      avatarUrl: userToEdit?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name.trim())}&background=2563eb&color=fff&bold=true`,
      notes: notes.trim(),
      createdAt: userToEdit?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(updatedUser);
    onClose();
  };

  if (!isOpen) return null;

  const currentCountryConfig = SUPPORTED_COUNTRIES.find(c => c.code === country) || SUPPORTED_COUNTRIES[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-linear-to-r from-slate-900 via-blue-950 to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600/30 border border-blue-400/30 text-blue-300">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {isEditMode ? 'Editar Usuario de Acceso' : 'Nuevo Usuario de Acceso'}
              </h3>
              <p className="text-xs text-slate-300">
                {isEditMode 
                  ? `Modificando credenciales y perfil de ${userToEdit?.name}` 
                  : 'Registrar nuevo usuario con validación de NIF/RUT por país'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMessage && (
            <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs leading-relaxed animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {/* Section 1: Personal & Country Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nombre Completo */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nombre Completo <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="ej. Patricia Covarrubias"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
                />
              </div>
            </div>

            {/* País de Validación Tributaria */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                País de Identificación (NIF/RUT) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={country}
                  onChange={e => handleCountryChange(e.target.value as SupportedCountryCode)}
                  className="w-full pl-3.5 pr-8 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all appearance-none cursor-pointer"
                >
                  {SUPPORTED_COUNTRIES.map(c => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.countryName} — ({c.taxIdName})
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                  ▼
                </div>
              </div>
            </div>

            {/* RUT / NIF con Validación en Tiempo Real */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {currentCountryConfig.taxIdName} <span className="text-rose-500">*</span>
                </label>
                {isTaxDirty && taxId.trim() && (
                  <span className={`text-[11px] font-bold flex items-center gap-1 ${
                    taxValidation.isValid ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {taxValidation.isValid ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Válido ({currentCountryConfig.code})</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Inválido</span>
                      </>
                    )}
                  </span>
                )}
              </div>

              <div className="relative">
                <FileCheck2 className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
                  isTaxDirty && taxId.trim()
                    ? taxValidation.isValid ? 'text-emerald-500' : 'text-rose-400'
                    : 'text-slate-400'
                }`} />
                <input
                  type="text"
                  required
                  placeholder={`ej. ${currentCountryConfig.placeholder}`}
                  value={taxId}
                  onChange={e => handleTaxIdChange(e.target.value)}
                  onBlur={handleTaxIdBlur}
                  className={`w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm font-mono font-medium text-slate-900 focus:bg-white outline-hidden transition-all ${
                    isTaxDirty && taxId.trim()
                      ? taxValidation.isValid 
                        ? 'border-emerald-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 bg-emerald-50/20'
                        : 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-100 bg-rose-50/20'
                      : 'border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                  }`}
                />
              </div>

              {/* Validation helper text */}
              {isTaxDirty && !taxValidation.isValid && taxValidation.errorMessage ? (
                <p className="mt-1 text-[11px] text-rose-600 font-medium leading-tight">
                  {taxValidation.errorMessage}
                </p>
              ) : (
                <p className="mt-1 text-[11px] text-slate-400 leading-tight">
                  {currentCountryConfig.description}
                </p>
              )}
            </div>

            {/* Correo Electrónico */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Correo Electrónico <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="ej. pcovarrubias@twinducks.cl"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
                />
              </div>
            </div>

            {/* Celular */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Celular / Teléfono Móvil <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  placeholder="ej. +56 9 9414 0976"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Role, Security & Status */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Rol de Acceso (administrador, supervisor, usuario) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Rol en el Sistema <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value as UserRole)}
                    className="w-full pl-3.5 pr-8 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all appearance-none cursor-pointer"
                  >
                    <option value="administrador">👑 Administrador (Acceso Total & Gestión)</option>
                    <option value="supervisor">🛡️ Supervisor (Aprobación & Visualización)</option>
                    <option value="usuario">👤 Usuario (Cotizador & Consultor)</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                    ▼
                  </div>
                </div>
                <div className="mt-1 text-[11px] text-slate-500 font-medium">
                  {role === 'administrador' && 'Privilegios completos de creación, edición, borrado y gestión de usuarios.'}
                  {role === 'supervisor' && 'Supervisión de cotizaciones, tarifas, compras y directorio de usuarios.'}
                  {role === 'usuario' && 'Generación de propuestas comerciales y consulta de catálogos.'}
                </div>
              </div>

              {/* Estado */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Estado de la Cuenta
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus('active')}
                    className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      status === 'active'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Activo
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('inactive')}
                    className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      status === 'inactive'
                        ? 'bg-slate-700 text-white border-slate-700 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    Inactivo
                  </button>
                </div>
              </div>

              {/* Contraseña */}
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Contraseña de Acceso <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    Generar Contraseña Segura
                  </button>
                </div>

                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Mínimo 6 caracteres (ej. Paty140976*)"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-mono font-medium text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Departamento / Área */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Área / Departamento
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="ej. Dirección General, Consultoría SAP, PMO"
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-200 transition-all flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isEditMode ? 'Actualizar Usuario' : 'Guardar Usuario'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
