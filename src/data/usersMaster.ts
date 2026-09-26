/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Maestro de Usuarios & Control de Acceso ERP
 * Usuario Administrador Principal: pcovarrubias@twinducks.cl / Paty140976*
 */

import { AppUser } from '../types';

export const USERS_STORAGE_KEY = 'twin_ducks_erp_users_v1';
export const CURRENT_USER_STORAGE_KEY = 'twin_ducks_erp_current_user_v1';

export const INITIAL_USERS: AppUser[] = [
  {
    id: 'USR-ADMIN-01',
    name: 'Patricia Covarrubias',
    email: 'pcovarrubias@twinducks.cl',
    taxId: '14.097.689-K',
    taxIdType: 'RUT / RUN (Chile)',
    country: 'CL',
    phone: '+56 9 9414 0976',
    role: 'administrador',
    password: 'Paty140976*',
    status: 'active',
    department: 'Dirección General & Administración',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-01-01T08:00:00.000Z',
    notes: 'Administrador principal del sistema con privilegios totales.'
  },
  {
    id: 'USR-SUP-02',
    name: 'Rodrigo Valenzuela Miranda',
    email: 'rvalenzuela@twinducks.cl',
    taxId: '15.842.193-4',
    taxIdType: 'RUT / RUN (Chile)',
    country: 'CL',
    phone: '+56 9 7821 4455',
    role: 'supervisor',
    password: 'Supervisor2026*',
    status: 'active',
    department: 'PMO & Supervisión Comercial',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-01-15T09:30:00.000Z',
    notes: 'Supervisor de cotizaciones, tarifas y flujo de aprobaciones.'
  },
  {
    id: 'USR-USR-03',
    name: 'Constanza Silva Morales',
    email: 'csilva@twinducks.cl',
    taxId: '18.632.741-9',
    taxIdType: 'RUT / RUN (Chile)',
    country: 'CL',
    phone: '+56 9 6533 1122',
    role: 'usuario',
    password: 'Usuario2026*',
    status: 'active',
    department: 'Consultoría & Staffing SAP',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-02-01T10:00:00.000Z',
    notes: 'Consultor comercial con acceso a generación de propuestas.'
  }
];

export function getStoredUsers(): AppUser[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    const parsed: AppUser[] = JSON.parse(raw);
    
    // Ensure the main administrator pcovarrubias@twinducks.cl is always available
    const hasAdmin = parsed.some(u => u.email.toLowerCase() === 'pcovarrubias@twinducks.cl');
    if (!hasAdmin) {
      const merged = [INITIAL_USERS[0], ...parsed];
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(merged));
      return merged;
    }
    return parsed;
  } catch (err) {
    console.error('Error loading users from localStorage:', err);
    return INITIAL_USERS;
  }
}

export function saveStoredUsers(users: AppUser[]): void {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Error saving users to localStorage:', err);
  }
}

export function getStoredCurrentUser(): AppUser | null {
  try {
    const raw = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
    if (!raw) {
      // Default to the main admin logged in for seamless immediate experience if desired
      return INITIAL_USERS[0];
    }
    const parsed = JSON.parse(raw);
    return parsed;
  } catch (err) {
    console.error('Error loading current user:', err);
    return INITIAL_USERS[0];
  }
}

export function saveStoredCurrentUser(user: AppUser | null): void {
  try {
    if (user) {
      localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
    }
  } catch (err) {
    console.error('Error saving current user:', err);
  }
}
