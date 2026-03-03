import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TimelineSegment } from '../TimelineSegment';
import type { TimelineSegment as TimelineSegmentType } from '@/types/Timeline';

// Mock segments for different travel modes
const mockSegments: TimelineSegmentType[] = [
  { from: {} as any, to: {} as any, durationMinutes: 10, distanceKm: 0.8, travelMode: 'walking' },
  { from: {} as any, to: {} as any, durationMinutes: 15, distanceKm: 5.2, travelMode: 'driving' },
  { from: {} as any, to: {} as any, durationMinutes: 20, distanceKm: 8.5, travelMode: 'transit' },
  { from: {} as any, to: {} as any, durationMinutes: 5, distanceKm: 1.0, travelMode: 'unknown' },
];


describe('TimelineSegment Component', () => {
  // ============================
  // Basic Rendering Test
  // ============================
  it('renders segment without crashing', () => {
    render(<TimelineSegment segment={mockSegments[0]} />);
    expect(screen.getByText(/A pé|Carro|Transporte|Deslocamento/)).toBeInTheDocument();
  });

  // ============================
  // Travel Mode Icon Tests
  // ============================
  it('renders correct icon for walking', () => {
    render(<TimelineSegment segment={mockSegments[0]} />);
    // TrendingUp icon should exist
    const icon = screen.getByTestId('icon-walking');
    expect(icon).toBeInTheDocument();
  });

  it('renders correct icon for driving', () => {
    render(<TimelineSegment segment={mockSegments[1]} />);
    const icon = screen.getByTestId('icon-driving');
    expect(icon).toBeInTheDocument();
  });

  it('renders correct icon for transit', () => {
    render(<TimelineSegment segment={mockSegments[2]} />);
    const icon = screen.getByTestId('icon-transit');
    expect(icon).toBeInTheDocument();
  });

  it('renders default icon for unknown travel mode', () => {
    render(<TimelineSegment segment={mockSegments[3]} />);
    const icon = screen.getByTestId('icon-default');
    expect(icon).toBeInTheDocument();
  });

  // ============================
  // Travel Mode Label Tests
  // ============================
  it('renders correct label for walking', () => {
    render(<TimelineSegment segment={mockSegments[0]} />);
    expect(screen.getByText('A pé')).toBeInTheDocument();
  });

  it('renders correct label for driving', () => {
    render(<TimelineSegment segment={mockSegments[1]} />);
    expect(screen.getByText('Carro')).toBeInTheDocument();
  });

  it('renders correct label for transit', () => {
    render(<TimelineSegment segment={mockSegments[2]} />);
    expect(screen.getByText('Transporte')).toBeInTheDocument();
  });

  it('renders correct label for unknown travel mode', () => {
    render(<TimelineSegment segment={mockSegments[3]} />);
    expect(screen.getByText('Deslocamento')).toBeInTheDocument();
  });

  // ============================
  // Duration and Distance Tests
  // ============================
  it('displays the correct duration and distance', () => {
    const segment = mockSegments[2]; // transit segment
    render(<TimelineSegment segment={segment} />);
    expect(screen.getByText(segment.durationMinutes.toString())).toBeInTheDocument();
    expect(screen.getByText(segment.distanceKm.toFixed(1))).toBeInTheDocument();
    expect(screen.getByText('min')).toBeInTheDocument();
    expect(screen.getByText('km')).toBeInTheDocument();
  });
});