// project.config.js — Configuración de AHA CRM
window.APP_CONFIG = {
  app: {
    id: 'aha-crm',
    nombre: 'AHA CRM',
    version: '1.0.0',
    tipo: 'crm',
    descripcion: 'CRM minimalista offline con pipeline Kanban'
  },
  perfil: 'lite',
  iaJutia: { perfil: false },
  plan: 'lite',
  usuarioActual: null,
  modulosActivos: ['contacto', 'pipeline', 'cotizaciones', 'facturacion', 'reportes'],
  tema: {
    modo: 'light',
    colores: {
      primary: '#2563eb',
      'primary-content': '#ffffff',
      secondary: '#1d4ed8',
      'secondary-content': '#ffffff',
      accent: '#3b82f6',
      'accent-content': '#ffffff',
      neutral: '#1e293b',
      'neutral-content': '#f8fafc',
      'base-100': '#ffffff',
      'base-200': '#f1f5f9',
      'base-300': '#e2e8f0',
      'base-content': '#0f172a'
    },
    tipografia: {
      familia: 'Inter, system-ui, sans-serif',
      escalas: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem'
      }
    }
  },
  cifrado: {
    camposSensibles: ['email', 'telefono'],
    storageKey: 'aha-crm-key'
  },
  ui: {
    formsMode: 'modal',
    alerts: 'toast',
    confirmDelete: true,
    avatars: true,
    avatarDefault: 'data/defaults/avatar.svg'
  },
  data: {
    dir: 'data/',
    maxFileSize: 10 * 1024 * 1024,
    tipos: ['avatar', 'foto', 'doc', 'logo', 'backup'],
    avatars: { default: 'data/defaults/avatar.svg', size: 200, calidad: 0.8 }
  },
  sync: {
    primaryFormat: 'json',
    secondaryFormats: [],
    includeFiles: true,
    encrypt: true,
    maxExportSize: 50 * 1024 * 1024
  },
  modulos: {
    contacto: { titulo: 'Contactos', icono: 'bi-people', activo: true },
    pipeline: { titulo: 'Pipeline', icono: 'bi-kanban', activo: true },
    cotizaciones: { titulo: 'Cotizaciones', icono: 'bi-file-text', activo: true },
    facturacion: { titulo: 'Facturación', icono: 'bi-receipt', activo: true },
    reportes: { titulo: 'Reportes', icono: 'bi-bar-chart', activo: true }
  }
};
