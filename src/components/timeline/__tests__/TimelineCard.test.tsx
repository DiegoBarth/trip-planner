import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TimelineCard } from '../TimelineCard';
import type { TimelineConflict } from '@/types/Timeline';
import * as formatters from '@/utils/formatters';

vi.mock('@/utils/formatters', () => ({
  formatCurrency: vi.fn((value) => `$${value}`),
}));

const testCases = [
  { visited: true, hasError: false, hasWarning: false },
  { visited: false, hasError: false, hasWarning: false },
  { visited: false, hasError: true, hasWarning: false },
  { visited: false, hasError: false, hasWarning: true },
  { visited: true, hasError: true, hasWarning: false },
  { visited: true, hasError: false, hasWarning: true },
];

describe('TimelineCard Component', () => {
  const mockAttraction = {
    id: 1,
    name: 'Tokyo Tower',
    country: 'japan' as const,
    city: 'Tokyo',
    region: 'Minato',
    day: 1,
    date: '2026-03-03',
    dayOfWeek: 'Tuesday',
    type: 'viewpoint' as const,
    order: 1,
    visited: false,
    needsReservation: true,
    reservationStatus: 'pending' as const,
    couplePrice: 1000,
    currency: 'JPY' as const,
    priceInBRL: 50,
    notes: 'Bring water',
    lat: 35.6586,
    lng: 139.7454,
    imageUrl: '',
    thumbnailUrl: ''
  };

  const mockConflicts: TimelineConflict[] = [
    {
      attractionId: 1,
      type: 'overlap' as const,
      message: 'Conflict detected',
      severity: 'warning' as const
    },
  ];

  beforeEach(() => {
    vi.spyOn(window, 'open').mockImplementation(() => null as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders basic attraction info correctly', () => {
    render(
      <TimelineCard
        attraction={mockAttraction}
        arrivalTime="08:00"
        departureTime="10:00"
        duration={120}
        conflicts={[]}
      />
    );

    expect(screen.getByText('Tokyo Tower')).toBeInTheDocument();
    expect(screen.getByText(/08:00/)).toBeInTheDocument();
    expect(screen.getByText(/10:00/)).toBeInTheDocument();
    expect(screen.getByText(/\(120min\)/)).toBeInTheDocument();
    expect(screen.getByText(/Minato, Tokyo/)).toBeInTheDocument();
  });

  it('calls onToggleVisited when visit button is clicked', () => {
    const onToggleVisited = vi.fn();
    render(
      <TimelineCard
        attraction={mockAttraction}
        arrivalTime="08:00"
        departureTime="10:00"
        duration={120}
        conflicts={[]}
        onToggleVisited={onToggleVisited}
      />
    );

    const button = screen.getByTitle('Marcar como visitado');
    fireEvent.click(button);

    expect(onToggleVisited).toHaveBeenCalledWith(mockAttraction.id);
  });

  it('opens Google Maps when navigation button is clicked', () => {
    render(
      <TimelineCard
        attraction={mockAttraction}
        arrivalTime="08:00"
        departureTime="10:00"
        duration={120}
        conflicts={[]}
      />
    );

    const button = screen.getByTitle('Abrir no Google Maps');
    fireEvent.click(button);

    expect(window.open).toHaveBeenCalledWith(
      `https://www.google.com/maps/search/?api=1&query=${mockAttraction.lat},${mockAttraction.lng}`,
      '_blank'
    );
  });

  it('displays price correctly using formatCurrency', () => {
    render(
      <TimelineCard
        attraction={mockAttraction}
        arrivalTime="08:00"
        departureTime="10:00"
        duration={120}
        conflicts={[]}
      />
    );

    expect(formatters.formatCurrency).toHaveBeenCalledWith(mockAttraction.couplePrice, mockAttraction.currency);
    expect(formatters.formatCurrency).toHaveBeenCalledWith(mockAttraction.priceInBRL);
    expect(screen.getByText('$1000')).toBeInTheDocument();
    expect(screen.getByText(/\$50/)).toBeInTheDocument()
  });

  it('renders conflict messages with correct severity', () => {
    render(
      <TimelineCard
        attraction={mockAttraction}
        arrivalTime="08:00"
        departureTime="10:00"
        duration={120}
        conflicts={mockConflicts}
      />
    );

    expect(screen.getByText('Conflict detected')).toBeInTheDocument();
  });

  it('renders notes if provided', () => {
    render(
      <TimelineCard
        attraction={mockAttraction}
        arrivalTime="08:00"
        departureTime="10:00"
        duration={120}
        conflicts={[]}
      />
    );

    expect(screen.getByText(/💡/)).toBeInTheDocument();
    expect(screen.getByText(/Bring water/)).toBeInTheDocument();
  });

  testCases.forEach(({ visited, hasError, hasWarning }) => {
    it(`renders TimelineCard with visited=${visited}, hasError=${hasError}, hasWarning=${hasWarning}`, () => {
      const conflicts: TimelineConflict[] = [];

      if (hasError) {
        conflicts.push({
          attractionId: mockAttraction.id,
          type: 'overlap',
          severity: 'error',
          message: 'Error conflict',
        });
      }
      if (hasWarning) {
        conflicts.push({
          attractionId: mockAttraction.id,
          type: 'rush',
          severity: 'warning',
          message: 'Warning conflict',
        });
      }

      render(
        <TimelineCard
          attraction={{ ...mockAttraction, visited }}
          arrivalTime="08:00"
          departureTime="10:00"
          duration={120}
          conflicts={conflicts}
        />
      );

      const card = screen.getByTestId('timeline-card');
      expect(card).toBeInTheDocument();

      if (visited && !hasError && !hasWarning) {
        expect(card).toHaveClass('border-l-emerald-500');
      }
      if (!visited && !hasError && !hasWarning) {
        expect(card).toHaveClass('border-l-slate-400');
      }
      if (visited) {
        expect(card).toHaveClass('opacity-95');
      }
    });
  });
});