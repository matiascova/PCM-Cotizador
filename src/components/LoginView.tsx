/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Pantalla de Acceso & Login Corporativo ERP Twin Ducks
 * Administrador Principal: pcovarrubias@twinducks.cl / Paty140976*
 */

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle, 
  Sparkles, 
  Building2, 
  CheckCircle2, 
  Users, 
  UserCheck,
  Zap,
  Globe2
} from 'lucide-react';
import { AppUser } from '../types';

interface LoginViewProps {
  onLoginSuccess: (user: AppUser) => void;
  users: AppUser[];
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLoginSuccess,
  users
}) => {
  const [email, setEmail] = useState('pcovarrubias@twinducks.cl');
  const [password, setPassword] = useState('Paty140976*');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      const cleanEmail = email.trim().toLowerCase();
      const cleanPass = password.trim();

      const foundUser = users.find(u => u.email.toLowerCase() === cleanEmail);

      if (!foundUser) {
        setErrorMessage('El correo electrónico no se encuentra registrado en el sistema.');
        setIsLoading(false);
        return;
      }

      if (foundUser.status === 'inactive') {
        setErrorMessage('Esta cuenta se encuentra temporalmente desactivada. Contacte al Administrador.');
        setIsLoading(false);
        return;
      }

      // Check password
      if (foundUser.password !== cleanPass) {
        setErrorMessage('Contraseña incorrecta. Verifique sus credenciales e intente nuevamente.');
        setIsLoading(false);
        return;
      }

      // Success
      setIsLoading(false);
      onLoginSuccess(foundUser);
    }, 300);
  };

  const handleQuickLogin = (userEmail: string, userPass: string) => {
    setEmail(userEmail);
    setPassword(userPass);
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative overflow-hidden selection:bg-blue-500 selection:text-white">
      {/* Background Decorative Gradient Orbs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-96 bg-cyan-600/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-linear-to-tr from-blue-600 via-indigo-600 to-blue-500 text-white shadow-xl shadow-blue-500/20 border border-blue-400/30">
            <Building2 className="w-8 h-8" />
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs font-black uppercase tracking-widest text-blue-400">
              Twin Ducks Capital & Consulting
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Módulo de Acceso ERP
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Sistema de Cotizaciones & Gestión de Recursos SAP
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {errorMessage && (
            <div className="flex items-start gap-3 p-3.5 bg-rose-950/50 border border-rose-800/80 rounded-2xl text-rose-300 text-xs leading-relaxed animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Correo Electrónico */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Correo Institucional
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="pcovarrubias@twinducks.cl"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-3 bg-slate-950 border border-slate-700 rounded-xl text-sm font-medium text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 outline-hidden transition-all"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Contraseña de Acceso
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono font-medium text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 outline-hidden transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1.5 text-slate-400 hover:text-white absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500/30 w-4 h-4 cursor-pointer"
                />
                <span>Mantener sesión iniciada</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-linear-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30 hover:shadow-blue-500/50 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Ingresar al Sistema ERP</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Access Credentials helper */}
          <div className="pt-4 border-t border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Credenciales Rápidas de Acceso:
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {/* Main Admin Account */}
              <button
                type="button"
                onClick={() => handleQuickLogin('pcovarrubias@twinducks.cl', 'Paty140976*')}
                className="p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-blue-500/50 text-left transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-500/40 text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0">
                    👑
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-200 group-hover:text-blue-300 truncate">
                      Patricia Covarrubias
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 truncate">
                      pcovarrubias@twinducks.cl
                    </div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 border border-indigo-500/40 text-[10px] font-bold text-indigo-300">
                  Administrador
                </span>
              </button>

              {/* Sample Supervisor */}
              <button
                type="button"
                onClick={() => handleQuickLogin('rvalenzuela@twinducks.cl', 'Supervisor2026*')}
                className="p-2 rounded-xl bg-slate-950/50 hover:bg-slate-800/60 border border-slate-800 text-left transition-all flex items-center justify-between group cursor-pointer text-xs"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-slate-400">🛡️</span>
                  <span className="text-slate-300 truncate">rvalenzuela@twinducks.cl</span>
                </div>
                <span className="text-[10px] font-semibold text-sky-400">Supervisor</span>
              </button>

              {/* Sample Usuario */}
              <button
                type="button"
                onClick={() => handleQuickLogin('csilva@twinducks.cl', 'Usuario2026*')}
                className="p-2 rounded-xl bg-slate-950/50 hover:bg-slate-800/60 border border-slate-800 text-left transition-all flex items-center justify-between group cursor-pointer text-xs"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-slate-400">👤</span>
                  <span className="text-slate-300 truncate">csilva@twinducks.cl</span>
                </div>
                <span className="text-[10px] font-semibold text-emerald-400">Usuario</span>
              </button>
            </div>
          </div>
        </div>

        {/* Security / System Footer */}
        <div className="flex items-center justify-center gap-4 text-slate-500 text-xs">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Validación NIF/RUT Multipaís</span>
          </div>
          <span>•</span>
          <div>SAP ERP S/4HANA Ready</div>
        </div>
      </div>
    </div>
  );
};
