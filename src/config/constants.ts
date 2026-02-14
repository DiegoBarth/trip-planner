export const API_URL = import.meta.env.VITE_API_URL
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

/** Tempo mínimo entre requisições POST para evitar envios acidentais repetidos (em ms). */
export const POST_RATE_LIMIT_MS = 1000;

export const MS_PER_SECOND = 1000;
export const MS_PER_MINUTE = 60 * MS_PER_SECOND;
export const MS_PER_HOUR = 60 * MS_PER_MINUTE;
export const MS_PER_DAY = 24 * MS_PER_HOUR;

/** Tempo máximo da sessão (7 dias em ms). */
export const AUTH_TIMEOUT_MS = MS_PER_DAY * 7;

/** Intervalo para renovar o login_time no localStorage (5 min em ms). */
export const AUTH_REFRESH_INTERVAL_MS = 5 * MS_PER_MINUTE;

/** staleTime padrão do React Query (5 min em ms). */
export const QUERY_STALE_TIME_MS = 5 * MS_PER_MINUTE;

/** Base URL do app (ex.: /controle-financeiro/). Usado em assets. */
export const BASE_PATH = import.meta.env.BASE_URL;

/** Timeout das requisições à API (Apps Script), em ms. */
export const API_TIMEOUT_MS = 30 * MS_PER_SECOND;

/** Largura (em pixels) da área sensível nas bordas da tela. */
export const EDGE_ZONE = 80;

/** Distância mínima de swipe para acionar navegações. */
export const SWIPE_MIN_DISTANCE_PX = 50;

/** Delta do swipeable para detectar movimento. */
export const SWIPE_DELTA_PX = 10;

/** Dias usados no alerta semanal de compromissos. */
export const ALERTA_SEMANA_DIAS = 7;

/** Duração padrão dos toasts (em ms). */
export const TOAST_DEFAULT_DURATION_MS = 3000;

/** Comprimento do id gerado para toasts. */
export const TOAST_ID_LENGTH = 9;

export const COUNTRIES = {
   all: {
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
}

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
}

export const EXPENSE_CATEGORIES = {
   food: { label: 'Alimentação', icon: '🍱' },
   attraction: { label: 'Atração', icon: '🎫' },
   shopping: { label: 'Compras', icon: '🛒' },
   cosmetics: { label: 'Cosméticos', icon: '✨' },
   electronics: { label: 'Eletrônicos', icon: '📱' },
   accommodation: { label: 'Hospedagem', icon: '🏨' },
   transport: { label: 'Transporte', icon: '🚄' },
   other: { label: 'Outros', icon: '💰' }
}

// Helper to get category key from label
export function getCategoryFromLabel(label: string): keyof typeof EXPENSE_CATEGORIES {
   const entry = Object.entries(EXPENSE_CATEGORIES).find(([_, config]) => config.label === label)
   return (entry?.[0] as keyof typeof EXPENSE_CATEGORIES) || 'other'
}

export const BUDGET_ORIGINS = {
   Diego: { label: 'Diego', icon: '👨', color: '#3b82f6' },
   Pamela: { label: 'Pamela', icon: '👩', color: '#ec4899' },
   Casal: { label: 'Casal', icon: '💑', color: '#8b5cf6' }
}

// Helper to get budget origin key from label
export function getBudgetOriginFromLabel(label: string): keyof typeof BUDGET_ORIGINS {
   const entry = Object.entries(BUDGET_ORIGINS).find(([_, config]) => config.label === label)
   return (entry?.[0] as keyof typeof BUDGET_ORIGINS) || 'Casal'
}

export const PERIODS = {
   morning: { label: 'Manhã', icon: '🌅', hours: '06:00-12:00' },
   afternoon: { label: 'Tarde', icon: '☀️', hours: '12:00-18:00' },
   evening: { label: 'Noite', icon: '🌆', hours: '18:00-22:00' },
   night: { label: 'Noturno', icon: '🌙', hours: '22:00-06:00' },
   'full-day': { label: 'Dia todo', icon: '🌍', hours: '00:00-23:59' }
}

export const RESERVATION_STATUS = {
   'not-needed': { label: 'Não precisa', icon: '✓' },
   pending: { label: 'Pendente', icon: '⏳' },
   confirmed: { label: 'Confirmada', icon: '✅' },
   cancelled: { label: 'Cancelada', icon: '❌' }
}

export const WEEK_DAYS = {
   Sunday: { label: 'Domingo', short: 'Dom' },
   Monday: { label: 'Segunda', short: 'Seg' },
   Tuesday: { label: 'Terça', short: 'Ter' },
   Wednesday: { label: 'Quarta', short: 'Qua' },
   Thursday: { label: 'Quinta', short: 'Qui' },
   Friday: { label: 'Sexta', short: 'Sex' },
   Saturday: { label: 'Sábado', short: 'Sáb' }
}

export const BUDGET_CATEGORIES = [
   'Acomodação',
   'Transporte',
   'Alimentação',
   'Atrações',
   'Compras',
   'Outros'
]

export const CHECKLIST_CATEGORIES = {
   documents: { label: 'Documentos', icon: '📄' },
   clothes: { label: 'Roupas', icon: '👕' },
   electronics: { label: 'Eletrônicos', icon: '🔌' },
   hygiene: { label: 'Higiene', icon: '🧴' },
   medicines: { label: 'Medicamentos', icon: '💊' },
   accessories: { label: 'Acessórios', icon: '🎒' },
   entertainment: { label: 'Entretenimento', icon: '🎮' },
   other: { label: 'Outros', icon: '📦' }
}

// Labels em português
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
}

export const SWIPE_ROUTES = [
   '/',
   '/budgets',
   '/expenses',
   '/appointments',
   '/dashboard'
];