export const API_URL = import.meta.env.VITE_API_URL;
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export const POST_RATE_LIMIT_MS = 1000;

export const MS_PER_SECOND = 1000;
export const MS_PER_MINUTE = 60 * MS_PER_SECOND;
export const MS_PER_HOUR = 60 * MS_PER_MINUTE;
export const MS_PER_DAY = 24 * MS_PER_HOUR;

export const AUTH_TIMEOUT_MS = MS_PER_DAY * 7;

export const AUTH_REFRESH_INTERVAL_MS = 5 * MS_PER_MINUTE;

export const QUERY_STALE_TIME_MS = 5 * MS_PER_MINUTE;

/** Offline-first: data considered fresh for 24 hours; only refetch when invalidated (e.g. after mutation). */
export const OFFLINE_STALE_TIME_MS = 24 * MS_PER_HOUR;

/** Weather forecast: cache for 6 hours for use on the trip day without constant refetch. */
export const WEATHER_STALE_TIME_MS = 6 * MS_PER_HOUR;

export const BASE_PATH = import.meta.env.BASE_URL;

export const API_TIMEOUT_MS = 30 * MS_PER_SECOND;

export const EDGE_ZONE = 80;

export const TOP_PULL_ZONE_PX = 56;

export const SWIPE_MIN_DISTANCE_PX = 50;

export const SWIPE_DELTA_PX = 10;

export const ALERTA_SEMANA_DIAS = 7;

export const TOAST_DEFAULT_DURATION_MS = 3000;

export const TOAST_ID_LENGTH = 9;

export const COUNTRIES = {
  general: {
    name: 'Geral',
    flag: '🌍',
    currency: 'BRL' as const,
    cities: []
  },
  japan: {
    name: 'Japão',
    flag: '🇯🇵',
    currency: 'JPY' as const,
    cities: ['Tóquio', 'Kyoto', 'Osaka', 'Nara', 'Hiroshima', 'Hakone']
  },
  'south-korea': {
    name: 'Coreia do Sul',
    flag: '🇰🇷',
    currency: 'KRW' as const,
    cities: ['Seul', 'Busan', 'Jeju', 'Incheon', 'Daegu']
  }
};

export const ATTRACTION_TYPES = {
  cultural: { label: 'Cultural', icon: '🎭' },
  entertainment: { label: 'Entretenimento', icon: '🎢' },
  viewpoint: { label: 'Mirante', icon: '🗼' },
  museum: { label: 'Museu', icon: '🏛️' },
  park: { label: 'Parque', icon: '🌳' },
  restaurant: { label: 'Restaurante', icon: '🍜' },
  shopping: { label: 'Shopping', icon: '🛍️' },
  temple: { label: 'Templo', icon: '⛩️' },
  other: { label: 'Outro', icon: '📍' }
};

export const EXPENSE_CATEGORIES = {
  food: { label: 'Alimentação', icon: '🍱' },
  attraction: { label: 'Atração', icon: '🎫' },
  shopping: { label: 'Compras', icon: '🛒' },
  cosmetics: { label: 'Cosméticos', icon: '✨' },
  electronics: { label: 'Eletrônicos', icon: '📱' },
  accommodation: { label: 'Hospedagem', icon: '🏨' },
  transport: { label: 'Transporte', icon: '🚄' },
  other: { label: 'Outros', icon: '💰' }
};

export function getCategoryFromLabel(label: string): keyof typeof EXPENSE_CATEGORIES {
  const entry = Object.entries(EXPENSE_CATEGORIES).find(([_, config]) => config.label === label);

  return (entry?.[0] as keyof typeof EXPENSE_CATEGORIES) || 'other';
};

/* Cores com contraste WCAG AA (texto legível em fundo claro e escuro) */
export const BUDGET_ORIGINS = {
  Diego: { label: 'Diego', icon: '👨', color: '#1d4ed8' },
  Pamela: { label: 'Pamela', icon: '👩', color: '#be185d' },
  Casal: { label: 'Casal', icon: '💑', color: '#5b21b6' },
  Alimentação: { label: 'Alimentação', icon: '🍱', color: '#991b1b' },
  Atrações: { label: 'Atrações', icon: '🎫', color: '#155e75' },
  Transporte: { label: 'Transporte', icon: '🚈', color: '#14532d' }
};

export function getBudgetOriginFromLabel(label: string): keyof typeof BUDGET_ORIGINS {
  const entry = Object.entries(BUDGET_ORIGINS).find(([_, config]) => config.label === label);

  return (entry?.[0] as keyof typeof BUDGET_ORIGINS) || 'Casal';
};

export const PERIODS = {
  morning: { label: 'Manhã', icon: '🌅', hours: '06:00-12:00' },
  afternoon: { label: 'Tarde', icon: '☀️', hours: '12:00-18:00' },
  evening: { label: 'Noite', icon: '🌆', hours: '18:00-22:00' },
  night: { label: 'Noturno', icon: '🌙', hours: '22:00-06:00' },
  'full-day': { label: 'Dia todo', icon: '🌍', hours: '00:00-23:59' }
};

export const PERIOD_START: Record<keyof typeof PERIODS, string | null> = {
  morning: '06:00',
  afternoon: '12:00',
  evening: '18:00',
  night: '22:00',
  'full-day': null
};

export const RESERVATION_STATUS = {
  'not-needed': { label: 'Não precisa', icon: '✓' },
  pending: { label: 'Pendente', icon: '⏳' },
  confirmed: { label: 'Confirmada', icon: '✅' },
  cancelled: { label: 'Cancelada', icon: '❌' }
};

export const WEEK_DAYS = {
  Sunday: { label: 'Domingo', short: 'Dom' },
  Monday: { label: 'Segunda', short: 'Seg' },
  Tuesday: { label: 'Terça', short: 'Ter' },
  Wednesday: { label: 'Quarta', short: 'Qua' },
  Thursday: { label: 'Quinta', short: 'Qui' },
  Friday: { label: 'Sexta', short: 'Sex' },
  Saturday: { label: 'Sábado', short: 'Sáb' }
};

export const BUDGET_CATEGORIES = [
  'Acomodação',
  'Transporte',
  'Alimentação',
  'Atrações',
  'Compras',
  'Outros'
];

/* Cores com contraste WCAG AA para badges em fundo claro */
export const CHECKLIST_CATEGORIES = {
  documents: { label: 'Documentos', icon: '📄', color: '#1d4ed8' },
  clothes: { label: 'Roupas', icon: '👕', color: '#be185d' },
  electronics: { label: 'Eletrônicos', icon: '🔌', color: '#4f46e5' },
  hygiene: { label: 'Higiene', icon: '🧴', color: '#0f766e' },
  medicines: { label: 'Medicamentos', icon: '💊', color: '#b91c1c' },
  accessories: { label: 'Acessórios', icon: '🎒', color: '#b45309' },
  entertainment: { label: 'Entretenimento', icon: '🎮', color: '#5b21b6' },
  other: { label: 'Outros', icon: '📦', color: '#4b5563' }
};

export const RESERVATION_TYPES = {
  activity: { label: 'Atividade', icon: '🎭', color: '#7c3aed' },
  document: { label: 'Documento', icon: '📄', color: '#6366f1' },
  accommodation: { label: 'Hospedagem', icon: '🏨', color: '#8b5cf6' },
  bus: { label: 'Ônibus', icon: '🚌', color: '#1927e9ff' },
  'transport-pass': { label: 'Passe', icon: '🎫', color: '#f59e0b' },
  train: { label: 'Trem', icon: '🚈', color: '#991219ff' },
  insurance: { label: 'Seguro', icon: '🛡️', color: '#10b981' },
  flight: { label: 'Voo', icon: '✈️', color: '#3b82f6' },
  other: { label: 'Outro', icon: '📋', color: '#6b7280' }
};

/* Cores com contraste WCAG AA para texto branco no badge */
export const BOOKING_STATUS = {
  pending: { label: 'Pendente', icon: '⏳', color: '#b45309' },
  confirmed: { label: 'Confirmado', icon: '✅', color: '#047857' },
  cancelled: { label: 'Cancelado', icon: '❌', color: '#b91c1c' },
  completed: { label: 'Concluído', icon: '✓', color: '#4b5563' }
};

export const LABELS = {
  countries: {
    japan: 'Japão',
    'south-korea': 'Coreia do Sul'
  },
  origins: {
    mine: 'Meu',
    partner: 'Pamela',
    shared: 'Casal'
  },
  periods: {
    morning: 'Manhã',
    afternoon: 'Tarde',
    evening: 'Noite',
    'full-day': 'Dia todo'
  },
  attractionTypes: {
    temple: 'Templo',
    museum: 'Museu',
    park: 'Parque',
    restaurant: 'Restaurante',
    shopping: 'Compras',
    show: 'Show',
    transport: 'Transporte',
    other: 'Outro'
  }
};

/** Ordem do swipe: da direita pra esquerda no array. Da home, swipe esquerda → gastos, reservas, atrações, orçamento; swipe direita → timeline, checklist, dashboard. */
export const SWIPE_ROUTES = [
  '/dashboard',
  '/checklist',
  '/timeline',
  '/',
  '/expenses',
  '/reservations',
  '/attractions',
  '/budgets'
];

export const TRIP_FILTER_KEY = 'trip_filter';