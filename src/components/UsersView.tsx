/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Módulo de Gestión y Acceso de Usuarios ERP
 * Soporte de Roles: Administrador, Supervisor, Usuario
 * Validación de NIF/RUT según país (Chile, España, México, Colombia, Argentina, Perú, Brasil, etc.)
 */

import React, { useState, useMemo } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  ShieldAlert, 
  Search, 
  Filter, 
  Phone, 
  Mail, 
  Building2, 
  CheckCircle2, 
  XCircle, 
  Edit, 
  Trash2, 
  KeyRound, 
  Eye, 
  EyeOff, 
  UserCheck, 
  Crown, 
  Briefcase, 
  FileCheck2,
  Globe2,
  Lock,
  Unlock,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ArrowRightLeft
} from 'lucide-react';
import { AppUser, UserRole } from '../types';
import { SUPPORTED_COUNTRIES, SupportedCountryCode, validateTaxIdByCountry } from '../utils/nifValidator';
import { UserModal } from './UserModal';

interface UsersViewProps {
  users: AppUser[];
  currentUser: AppUser | null;
  onUpdateUsers: (users: AppUser[]) => void;
  onSwitchUser?: (user: AppUser) => void;
}

export const UsersView: React.FC<UsersViewProps> = ({
  users,
  currentUser,
  onUpdateUsers,
  onSwitchUser
}) => {
  // Filter & Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [countryFilter, setCountryFilter] = useState<'all' | string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<AppUser | null>(null);

  // Quick Password Reset Modal
  const [passwordModalUser, setPasswordModalUser] = useState<AppUser | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Delete Confirmation
  const [userToDelete, setUserToDelete] = useState<AppUser | null>(null);

  const isAdmin = currentUser?.role === 'administrador';
  const isSupervisor = currentUser?.role === 'supervisor';

  // Metrics
  const stats = useMemo(() => {
    const total = users.length;
    const admins = users.filter(u => u.role === 'administrador').length;
    const supervisors = users.filter(u => u.role === 'supervisor').length;
    const standardUsers = users.filter(u => u.role === 'usuario').length;
    const active = users.filter(u => u.status === 'active').length;
    return { total, admins, supervisors, standardUsers, active };
  }, [users]);

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.taxId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.department && u.department.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      const matchesCountry = countryFilter === 'all' || u.country === countryFilter;
      const matchesStatus = statusFilter === 'all' || u.status === statusFilter;

      return matchesSearch && matchesRole && matchesCountry && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, countryFilter, statusFilter]);

  // Create / Update User Handler
  const handleSaveUser = (savedUser: AppUser) => {
    const exists = users.some(u => u.id === savedUser.id);
    let updated: AppUser[];
    if (exists) {
      updated = users.map(u => u.id === savedUser.id ? savedUser : u);
    } else {
      updated = [savedUser, ...users];
    }
    onUpdateUsers(updated);
    setIsModalOpen(false);
    setUserToEdit(null);
  };

  // Delete User Handler
  const confirmDeleteUser = () => {
    if (!userToDelete) return;
    if (userToDelete.email.toLowerCase() === 'pcovarrubias@twinducks.cl') {
      alert('El usuario administrador principal no puede ser eliminado del sistema.');
      setUserToDelete(null);
      return;
    }
    const updated = users.filter(u => u.id !== userToDelete.id);
    onUpdateUsers(updated);
    setUserToDelete(null);
  };

  // Quick Password Change Handler
  const handleSaveNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModalUser || !newPassword.trim()) return;

    const updated = users.map(u => 
      u.id === passwordModalUser.id ? { ...u, password: newPassword.trim(), updatedAt: new Date().toISOString() } : u
    );
    onUpdateUsers(updated);
    setPasswordModalUser(null);
    setNewPassword('');
  };

  // Toggle Status Handler
  const handleToggleStatus = (user: AppUser) => {
    if (user.email.toLowerCase() === 'pcovarrubias@twinducks.cl') {
      alert('La cuenta del Administrador Principal no puede desactivarse.');
      return;
    }
    const nextStatus = user.status === 'active' ? 'inactive' : 'active';
    const updated = users.map(u => u.id === user.id ? { ...u, status: nextStatus, updatedAt: new Date().toISOString() } : u);
    onUpdateUsers(updated);
  };

  const getCountryInfo = (countryCode: string) => {
    return SUPPORTED_COUNTRIES.find(c => c.code === countryCode) || SUPPORTED_COUNTRIES[0];
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'administrador':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Crown className="w-3.5 h-3.5 text-indigo-600" />
            <span>Administrador</span>
          </span>
        );
      case 'supervisor':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
            <span>Supervisor</span>
          </span>
        );
      case 'usuario':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
            <span>Usuario</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-extrabold uppercase tracking-wider">
                Control de Acceso & Seguridad
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-xs font-medium text-slate-500">Módulo ERP Twin Ducks</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <Users className="w-6 h-6 text-blue-600" />
              <span>Gestión de Usuarios & Roles</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Administración de cuentas de acceso, roles corporativos (Administrador, Supervisor, Usuario) y validación de NIF/RUT multipaís.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start lg:self-center">
            {isAdmin && (
              <button
                type="button"
                onClick={() => {
                  setUserToEdit(null);
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-200 transition-all cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Nuevo Usuario</span>
              </button>
            )}
          </div>
        </div>

        {/* Metrics Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Usuarios</div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">{stats.total}</div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">{stats.active} activos</div>
          </div>
          <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
            <div className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1">
              <Crown className="w-3.5 h-3.5" /> Administradores
            </div>
            <div className="text-xl sm:text-2xl font-black text-indigo-950 mt-0.5">{stats.admins}</div>
            <div className="text-[11px] text-indigo-600 font-semibold mt-0.5">Acceso Total</div>
          </div>
          <div className="p-3 bg-sky-50/50 rounded-xl border border-sky-100">
            <div className="text-[11px] font-bold text-sky-700 uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Supervisores
            </div>
            <div className="text-xl sm:text-2xl font-black text-sky-950 mt-0.5">{stats.supervisors}</div>
            <div className="text-[11px] text-sky-600 font-semibold mt-0.5">Revisión & Aprobación</div>
          </div>
          <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
            <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5" /> Usuarios
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-950 mt-0.5">{stats.standardUsers}</div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">Cotizadores</div>
          </div>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nombre, correo, RUT/NIF, celular, área..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
            />
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value as any)}
              className="w-full md:w-auto px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:bg-white focus:border-blue-500 outline-hidden transition-all cursor-pointer"
            >
              <option value="all">Todos los Roles</option>
              <option value="administrador">👑 Administradores</option>
              <option value="supervisor">🛡️ Supervisores</option>
              <option value="usuario">👤 Usuarios</option>
            </select>

            {/* Country Filter */}
            <select
              value={countryFilter}
              onChange={e => setCountryFilter(e.target.value)}
              className="w-full md:w-auto px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:bg-white focus:border-blue-500 outline-hidden transition-all cursor-pointer"
            >
              <option value="all">Todos los Países (NIF)</option>
              {SUPPORTED_COUNTRIES.map(c => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.countryName}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="w-full md:w-auto px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:bg-white focus:border-blue-500 outline-hidden transition-all cursor-pointer"
            >
              <option value="all">Todos los Estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">Usuario & Área</th>
                <th className="py-3.5 px-4">RUT / NIF (País)</th>
                <th className="py-3.5 px-4">Celular & Contacto</th>
                <th className="py-3.5 px-4">Rol de Acceso</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-bold text-slate-600">No se encontraron usuarios</p>
                    <p className="text-xs text-slate-400 mt-1">Ajuste los filtros o agregue un nuevo usuario al sistema.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => {
                  const countryInfo = getCountryInfo(user.country);
                  const isCurrent = currentUser?.id === user.id;
                  const isMainAdmin = user.email.toLowerCase() === 'pcovarrubias@twinducks.cl';

                  return (
                    <tr key={user.id} className={`hover:bg-slate-50/80 transition-colors ${!user.status || user.status === 'inactive' ? 'opacity-60 bg-slate-50/50' : ''}`}>
                      {/* Name & Avatar */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img
                              src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2563eb&color=fff&bold=true`}
                              alt={user.name}
                              className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                            />
                            {user.role === 'administrador' && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center text-[10px] text-white shadow-xs">
                                👑
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">{user.name}</span>
                              {isCurrent && (
                                <span className="px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-extrabold">
                                  Tú
                                </span>
                              )}
                              {isMainAdmin && (
                                <span className="px-1.5 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                                  Principal
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 font-medium">
                              {user.department || 'Consultoría SAP'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* RUT / NIF */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-base" title={countryInfo.countryName}>{countryInfo.flag}</span>
                          <div>
                            <div className="font-mono font-bold text-slate-800 text-xs">
                              {user.taxId}
                            </div>
                            <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                              <FileCheck2 className="w-3 h-3 text-emerald-500" />
                              <span>{countryInfo.taxIdName}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Phone & Email */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <a 
                            href={`mailto:${user.email}`} 
                            className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 hover:underline font-medium"
                          >
                            <Mail className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                            <span>{user.email}</span>
                          </a>
                          <a 
                            href={`https://wa.me/${user.phone.replace(/[^0-9]/g, '')}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs text-slate-700 hover:text-emerald-700 font-mono"
                          >
                            <Phone className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                            <span>{user.phone}</span>
                          </a>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-4 px-4">
                        {getRoleBadge(user.role)}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(user)}
                          disabled={!isAdmin || isMainAdmin}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                            user.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-300'
                          } ${!isAdmin || isMainAdmin ? 'cursor-default' : 'cursor-pointer'}`}
                          title={isAdmin && !isMainAdmin ? 'Clic para cambiar estado' : undefined}
                        >
                          {user.status === 'active' ? (
                            <>
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                              <span>Activo</span>
                            </>
                          ) : (
                            <>
                              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                              <span>Inactivo</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Impersonate / Switch Session (for quick testing) */}
                          {onSwitchUser && (
                            <button
                              type="button"
                              onClick={() => onSwitchUser(user)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title={`Iniciar sesión como ${user.name} (${user.role})`}
                            >
                              <ArrowRightLeft className="w-4 h-4" />
                            </button>
                          )}

                          {/* Quick Password Reset */}
                          {(isAdmin || isCurrent) && (
                            <button
                              type="button"
                              onClick={() => {
                                setPasswordModalUser(user);
                                setNewPassword('');
                              }}
                              className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                              title="Cambiar contraseña de acceso"
                            >
                              <KeyRound className="w-4 h-4" />
                            </button>
                          )}

                          {/* Edit User */}
                          {(isAdmin || isCurrent) && (
                            <button
                              type="button"
                              onClick={() => {
                                setUserToEdit(user);
                                setIsModalOpen(true);
                              }}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="Editar datos del usuario"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}

                          {/* Delete User */}
                          {isAdmin && !isMainAdmin && (
                            <button
                              type="button"
                              onClick={() => setUserToDelete(user)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Eliminar usuario"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Card about Multi-Country Tax ID Validation */}
      <div className="bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/10 rounded-xl border border-white/20">
              <Globe2 className="w-6 h-6 text-blue-300" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm sm:text-base">
                Motor de Validación NIF/RUT Internacional Integrado
              </h3>
              <p className="text-xs text-blue-200 mt-0.5">
                Valida algorítmicamente RUT chileno (Módulo 11 SII), DNI/NIE de España (Módulo 23), CUIT de Argentina, NIT de Colombia (DIAN) y RFC de México.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SUPPORTED_COUNTRIES.map(c => (
              <span key={c.code} className="px-2 py-1 rounded-lg bg-white/10 border border-white/10 text-xs font-semibold">
                {c.flag} {c.taxIdName.split(' ')[0]}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Create / Edit User Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setUserToEdit(null);
        }}
        onSave={handleSaveUser}
        userToEdit={userToEdit}
        currentUserRole={currentUser?.role}
      />

      {/* Password Reset Modal */}
      {passwordModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Cambiar Contraseña</h3>
                  <p className="text-xs text-slate-500">{passwordModalUser.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPasswordModalUser(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNewPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    placeholder="Mínimo 6 caracteres"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPasswordModalUser(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Guardar Contraseña
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-50 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">¿Eliminar Usuario de Acceso?</h3>
                <p className="text-xs text-slate-500">Esta acción no se puede deshacer.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              ¿Estás seguro de que deseas eliminar la cuenta de <span className="font-bold text-slate-900">{userToDelete.name}</span> ({userToDelete.email})? El usuario ya no podrá iniciar sesión en la plataforma.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDeleteUser}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Sí, Eliminar Usuario
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
