import { DossierColorPaletteId } from '../types';

export interface DossierPaletteConfig {
  id: DossierColorPaletteId;
  name: string;
  tagline: string;
  description: string;
  recommendedFor: string;
  isDark: boolean;
  colors: {
    primary: string;       // Header / Dominant
    accent: string;        // Interactive / Buttons / Accent
    success: string;       // States / Positive / Emerald or Mint
    surface: string;       // Card or panel soft background
    background: string;    // Page background
    border: string;        // Border lines
    textPrimary: string;   // Main headings and titles
    textSecondary: string; // Subtitles and muted labels
    badgeBg: string;       // Header pill badge bg
    badgeBorder: string;   // Header pill badge border
    badgeText: string;     // Header pill badge text
    tableHeaderBg: string; // Data table headers
    highlightBoxBg: string;// Key summary boxes
    highlightBoxBorder: string;
  };
  imageFilter: string;     // CSS filter applied to cover/backcover images
  imageOverlay: string;    // CSS linear gradient overlay on top of images
  previewGradient: string; // Gradient used for preview swatches
}

export const DOSSIER_COLOR_PALETTES: Record<DossierColorPaletteId, DossierPaletteConfig> = {
  'enterprise-logistics': {
    id: 'enterprise-logistics',
    name: 'Enterprise Logistics',
    tagline: 'Azul Corporativo, Verde Operativo y Neutros Claros',
    description: 'Diseño limpio y sobrio para gestión logística. Azul marino profundo para elementos principales, azul moderno de acento y verde esmeralda para confirmación de estados.',
    recommendedFor: 'Entornos corporativos, logística, distribución y operaciones de alta confianza.',
    isDark: false,
    colors: {
      primary: '#1E3A8A',       // Azul marino profundo
      accent: '#3B82F6',        // Azul moderno/industrial
      success: '#10B981',       // Verde esmeralda fresco
      surface: '#F8FAFC',       // Gris azulado muy claro
      background: '#FFFFFF',
      border: '#E2E8F0',
      textPrimary: '#0F172A',
      textSecondary: '#64748B',
      badgeBg: 'rgba(30, 58, 138, 0.08)',
      badgeBorder: 'rgba(59, 130, 246, 0.3)',
      badgeText: '#1E3A8A',
      tableHeaderBg: '#F1F5F9',
      highlightBoxBg: '#EFF6FF',
      highlightBoxBorder: '#BFDBFE',
    },
    imageFilter: 'contrast(106%) saturate(92%) hue-rotate(-5deg) brightness(98%)',
    imageOverlay: 'linear-gradient(140deg, rgba(30, 58, 138, 0.88) 0%, rgba(15, 23, 42, 0.85) 55%, rgba(16, 185, 129, 0.35) 100%)',
    previewGradient: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 50%, #10B981 100%)'
  },

  'eco-cool-chain': {
    id: 'eco-cool-chain',
    name: 'Eco-Cool Chain',
    tagline: 'Frío, Verde Menta y Azul Glaciar',
    description: 'Evoca frescura, control de calidad, cámaras de congelado (-18°C) y sostenibilidad. Combina pasteles glaciar con acentos verde menta y tecnología fría.',
    recommendedFor: 'Agroindustria, retail refrigerado, cadena de frío, sostenibilidad y farmacéutica.',
    isDark: false,
    colors: {
      primary: '#0F766E',       // Verde azulado nórdico profundo
      accent: '#059669',        // Verde esmeralda/menta
      success: '#10B981',       // Verde fresco
      surface: '#E0F2FE',       // Azul glaciar pastel suave
      background: '#FFFFFF',
      border: '#BAE6FD',
      textPrimary: '#0F172A',   // Slate oscuro para máxima legibilidad
      textSecondary: '#475569',
      badgeBg: 'rgba(224, 242, 254, 0.6)',
      badgeBorder: 'rgba(56, 189, 248, 0.4)',
      badgeText: '#0369A1',
      tableHeaderBg: '#E0F2FE',
      highlightBoxBg: '#F0FDF4',
      highlightBoxBorder: '#A7F3D0',
    },
    imageFilter: 'contrast(108%) saturate(98%) hue-rotate(28deg) brightness(100%)',
    imageOverlay: 'linear-gradient(140deg, rgba(14, 116, 144, 0.86) 0%, rgba(15, 23, 42, 0.82) 48%, rgba(52, 211, 153, 0.45) 100%)',
    previewGradient: 'linear-gradient(135deg, #0284C7 0%, #E0F2FE 40%, #059669 100%)'
  },

  'minimal-industrial': {
    id: 'minimal-industrial',
    name: 'Minimal Industrial Pastels',
    tagline: 'UI Minimalista Moderno & Pasteles Profesionales',
    description: 'Diseño minimalista estilo SaaS de alta gama. Utiliza pasteles en azul cielo y verde salvia con tipografías y bordes en azul acero para evitar saturar la vista.',
    recommendedFor: 'Consultorías tecnológicas, SaaS empresarial, manufactura moderna y proyectos de transformación digital.',
    isDark: false,
    colors: {
      primary: '#334155',       // Slate / Azul acero profundo
      accent: '#475569',        // Azul acero estructurado
      success: '#0D9488',       // Salvia esmeralda
      surface: '#DBEAFE',       // Azul pastel tenue
      background: '#F8FAFC',
      border: '#CBD5E1',        // Bordes suaves
      textPrimary: '#1E293B',
      textSecondary: '#64748B',
      badgeBg: 'rgba(219, 234, 254, 0.5)',
      badgeBorder: 'rgba(147, 197, 253, 0.5)',
      badgeText: '#1E40AF',
      tableHeaderBg: '#F1F5F9',
      highlightBoxBg: '#D1FAE5', // Verde pastel / salvia
      highlightBoxBorder: '#A7F3D0',
    },
    imageFilter: 'contrast(98%) saturate(82%) sepia(8%) hue-rotate(-8deg) brightness(96%)',
    imageOverlay: 'linear-gradient(140deg, rgba(71, 85, 105, 0.88) 0%, rgba(30, 41, 59, 0.90) 62%, rgba(209, 250, 229, 0.38) 100%)',
    previewGradient: 'linear-gradient(135deg, #475569 0%, #DBEAFE 50%, #D1FAE5 100%)'
  },

  'deep-ocean-neon': {
    id: 'deep-ocean-neon',
    name: 'Deep Ocean & Neon Mint',
    tagline: 'Modo Oscuro / Terminales Industriales',
    description: 'Contraste premium en modo oscuro para terminales y plantas industriales: fondo azul noche profundo (#0F172A), tarjetas en gris azulado (#1E293B) y acentos en verde menta neón (#4ADE80).',
    recommendedFor: 'Terminales de radiofrecuencia, bodegas oscuras, centros de distribución 24/7 y proyectos de alta tecnología.',
    isDark: true,
    colors: {
      primary: '#0F172A',       // Azul noche muy profundo
      accent: '#60A5FA',        // Azul neón UI
      success: '#4ADE80',       // Verde menta neón brillante
      surface: '#1E293B',       // Azul grisáceo oscuro
      background: '#0F172A',
      border: '#334155',
      textPrimary: '#F8FAFC',   // Texto claro de alto contraste
      textSecondary: '#94A3B8',
      badgeBg: 'rgba(30, 41, 59, 0.8)',
      badgeBorder: 'rgba(96, 165, 250, 0.4)',
      badgeText: '#60A5FA',
      tableHeaderBg: '#1E293B',
      highlightBoxBg: 'rgba(30, 41, 59, 0.7)',
      highlightBoxBorder: '#334155',
    },
    imageFilter: 'contrast(122%) saturate(125%) hue-rotate(18deg) brightness(82%)',
    imageOverlay: 'linear-gradient(140deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.88) 55%, rgba(74, 222, 128, 0.38) 100%)',
    previewGradient: 'linear-gradient(135deg, #0F172A 0%, #1E293B 40%, #60A5FA 75%, #4ADE80 100%)'
  }
};

export const DEFAULT_DOSSIER_PALETTE_ID: DossierColorPaletteId = 'enterprise-logistics';

export function getDossierPalette(id?: DossierColorPaletteId): DossierPaletteConfig {
  if (id && DOSSIER_COLOR_PALETTES[id]) {
    return DOSSIER_COLOR_PALETTES[id];
  }
  return DOSSIER_COLOR_PALETTES[DEFAULT_DOSSIER_PALETTE_ID];
}
