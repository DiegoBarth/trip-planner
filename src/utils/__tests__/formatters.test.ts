import { describe, it, expect } from 'vitest'
import {
  convertToBRL,
  convertCurrency,
  formatCurrencyInput,
  formatCurrencyInputByCurrency,
  currencyToNumber,
  formatCurrency,
  formatDate,
  dateToInputFormat,
  parseLocalDate,
  dateToYYYYMMDD,
  normalizeTimeFromSheets,
  formatDuration,
  formatWeekday,
} from '../formatters'

const rates = { JPY_BRL: 0.03, KRW_BRL: 0.0007, BRL_BRL: 1 } as const

describe('convertToBRL', () => {
  it('returns amount when currency is BRL', () => {
    expect(convertToBRL(100, 'BRL')).toBe(100)
  })
  it('returns amount when rates are null', () => {
    expect(convertToBRL(100, 'JPY', null)).toBe(100)
  })
  it('converts JPY to BRL using rate', () => {
    expect(convertToBRL(1000, 'JPY', rates)).toBe(30)
  })
  it('converts KRW to BRL using rate', () => {
    expect(convertToBRL(10000, 'KRW', rates)).toBe(7)
  })
})

describe('convertCurrency', () => {
  it('returns amount when from and to are the same', () => {
    expect(convertCurrency(100, 'BRL', 'BRL', rates)).toBe(100)
  })
  it('returns amount when no rates', () => {
    expect(convertCurrency(100, 'JPY', 'KRW', null)).toBe(100)
  })
  it('converts JPY to BRL then to KRW', () => {
    const inBRL = 1000 * 0.03
    const inKRW = inBRL / 0.0007
    expect(convertCurrency(1000, 'JPY', 'KRW', rates)).toBe(inKRW)
  })
})

describe('formatCurrencyInput', () => {
  it('returns empty for empty string', () => {
    expect(formatCurrencyInput('')).toBe('')
  })
  it('formats cents as BRL currency', () => {
    expect(formatCurrencyInput('12345')).toMatch(/R\$\s*123,45/)
  })
})

describe('formatCurrencyInputByCurrency', () => {
  it('dispatches to BRL for BRL', () => {
    expect(formatCurrencyInputByCurrency('100', 'BRL')).toMatch(/R\$/)
  })
  it('dispatches to JPY for JPY', () => {
    expect(formatCurrencyInputByCurrency('1000', 'JPY')).toMatch(/¥/)
  })
  it('dispatches to KRW for KRW', () => {
    expect(formatCurrencyInputByCurrency('1000', 'KRW')).toMatch(/₩/)
  })
})

describe('currencyToNumber', () => {
  it('returns 0 for empty value', () => {
    expect(currencyToNumber('')).toBe(0)
    expect(currencyToNumber('   ')).toBe(0)
  })
  it('parses BRL formatted value', () => {
    expect(currencyToNumber('R$ 1.234,56', 'BRL')).toBe(1234.56)
  })
  it('parses JPY value', () => {
    expect(currencyToNumber('¥ 1000', 'JPY')).toBe(1000)
  })
  it('defaults to BRL when currency not passed', () => {
    expect(currencyToNumber('R$ 10,00')).toBe(10)
  })
})

describe('formatCurrency', () => {
  it('formats number as BRL', () => {
    expect(formatCurrency(100, 'BRL')).toMatch(/100/)
  })
  it('formats number as JPY with 0 decimals', () => {
    expect(formatCurrency(1000, 'JPY')).toMatch(/1\.?000/)
  })
})

describe('formatDate', () => {
  it('returns empty for empty string', () => {
    expect(formatDate('')).toBe('')
  })
  it('returns as-is when already has slash', () => {
    expect(formatDate('14/02/2025')).toBe('14/02/2025')
  })
  it('converts ISO-like to dd/mm/yyyy', () => {
    expect(formatDate('2025-02-14')).toBe('14/02/2025')
  })
})

describe('dateToInputFormat', () => {
  it('returns empty for empty string', () => {
    expect(dateToInputFormat('')).toBe('')
  })
  it('converts dd/mm/yyyy to yyyy-mm-dd', () => {
    expect(dateToInputFormat('14/02/2025')).toBe('2025-02-14')
  })
  it('returns date part of ISO string', () => {
    expect(dateToInputFormat('2025-02-14T12:00:00')).toBe('2025-02-14')
  })
})

describe('parseLocalDate', () => {
  it('parses yyyy-mm-dd to local Date', () => {
    const d = parseLocalDate('2025-02-14')
    expect(d.getFullYear()).toBe(2025)
    expect(d.getMonth()).toBe(1)
    expect(d.getDate()).toBe(14)
  })
})

describe('dateToYYYYMMDD', () => {
  it('formats Date to yyyy-mm-dd', () => {
    const d = new Date(2025, 1, 14)
    expect(dateToYYYYMMDD(d)).toBe('2025-02-14')
  })
})

describe('normalizeTimeFromSheets', () => {
  it('returns undefined for undefined', () => {
    expect(normalizeTimeFromSheets(undefined)).toBeUndefined()
  })
  it('returns value when not ISO-like', () => {
    expect(normalizeTimeFromSheets('10:00')).toBe('10:00')
  })
  it('extracts HH:mm from ISO datetime (local timezone)', () => {
    const result = normalizeTimeFromSheets('1899-12-30T13:06:28.000Z')
    expect(result).toMatch(/^\d{2}:\d{2}$/)
    expect(result).not.toBe('13:06:28')
  })
})

describe('formatDuration', () => {
  it('formats minutes only', () => {
    expect(formatDuration(45)).toBe('45min')
  })
  it('formats hours only', () => {
    expect(formatDuration(120)).toBe('2h')
  })
  it('formats hours and minutes', () => {
    expect(formatDuration(90)).toBe('1h 30min')
  })
})

describe('formatWeekday', () => {
  it('returns weekday for date string', () => {
    const w = formatWeekday('2025-02-14')
    expect(w).toBeTruthy()
    expect(typeof w).toBe('string')
  })
})
