import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, vi, beforeEach, afterEach, expect } from 'vitest';
import { ConfirmModal } from '../ConfirmModal';

describe('ConfirmModal', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('renders when isOpen is true', () => {
    render(
      <ConfirmModal
        isOpen={true}
        onClose={vi.fn()}
        title="Confirm"
        message="Are you sure?"
        onConfirm={vi.fn()}
      />
    );

    expect(screen.getByText('Confirm')).toBeInTheDocument();
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(
      <ConfirmModal
        isOpen={false}
        onClose={vi.fn()}
        title="Confirm"
        message="Are you sure?"
        onConfirm={vi.fn()}
      />
    );

    expect(screen.queryByText('Confirm')).not.toBeInTheDocument();
  });

  it('calls onClose when cancel button is clicked', () => {
    const onClose = vi.fn();

    render(
      <ConfirmModal
        isOpen={true}
        onClose={onClose}
        title="Confirm"
        message="Are you sure?"
        onConfirm={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText('Cancelar'));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onConfirm and onClose when confirm button is clicked', async () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn(() => Promise.resolve());

    render(
      <ConfirmModal
        isOpen={true}
        onClose={onClose}
        title="Confirm"
        message="Are you sure?"
        onConfirm={onConfirm}
      />
    );

    const confirmButton = screen.getByText('Excluir');

    // Wrap click in act because state updates happen
    await act(async () => {
      fireEvent.click(confirmButton);
      await Promise.resolve(); // wait for promise in handleConfirm
    });

    expect(onConfirm).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it('disables buttons when loading is true', () => {
    render(
      <ConfirmModal
        isOpen={true}
        onClose={vi.fn()}
        title="Confirm"
        message="Are you sure?"
        onConfirm={vi.fn()}
        loading={true}
      />
    );

    const cancelButton = screen.getByText('Cancelar') as HTMLButtonElement;
    const confirmButton = screen.getByText(/Excluindo.../i) as HTMLButtonElement;

    expect(cancelButton.disabled).toBe(true);
    expect(confirmButton.disabled).toBe(true);
  });

  it('closes modal on Escape key when not busy', () => {
    const onClose = vi.fn();

    render(
      <ConfirmModal
        isOpen={true}
        onClose={onClose}
        title="Confirm"
        message="Are you sure?"
        onConfirm={vi.fn()}
      />
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('does not close modal on Escape key when busy', () => {
    const onClose = vi.fn();

    render(
      <ConfirmModal
        isOpen={true}
        onClose={onClose}
        title="Confirm"
        message="Are you sure?"
        onConfirm={vi.fn()}
        loading={true}
      />
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('calls onClose when clicking the overlay if not busy', () => {
    const onClose = vi.fn();

    render(
      <ConfirmModal
        isOpen={true}
        onClose={onClose}
        title="Confirm"
        message="Are you sure?"
        onConfirm={vi.fn()}
      />
    );

    const overlay = document.querySelector('div[aria-hidden="true"]') as HTMLElement;
    fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalled();
  });

  it('does not call onClose when clicking the overlay if busy', () => {
    const onClose = vi.fn();

    render(
      <ConfirmModal
        isOpen={true}
        onClose={onClose}
        title="Confirm"
        message="Are you sure?"
        onConfirm={vi.fn()}
        loading={true}
      />
    );

    const overlay = document.querySelector('div[aria-hidden="true"]') as HTMLElement;
    fireEvent.click(overlay);
    expect(onClose).not.toHaveBeenCalled();
  });
});