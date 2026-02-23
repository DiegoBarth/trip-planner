import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
import Check from 'lucide-react/dist/esm/icons/check';
import { cn } from '@/lib/utils'

interface CustomSelectProps {
  value: string
  onChange: (val: string) => void
  options: string[]
  label?: string
  id?: string
  placeholder?: string
  variant?: 'default' | 'glass'
  leftIcon?: React.ReactNode
  disabled?: boolean
  dropdownPosition?: 'above' | 'below'
}

/**
 * Custom select with keyboard navigation and accessibility
 * 
 * A11y features:
 * - Arrow navigation (↑↓) and Enter
 * - Escape to close
 * - ARIA attributes (role, aria-expanded, aria-activedescendant)
 * - Screen reader friendly
 * 
 * WCAG 2.1: 2.1.1 (Keyboard), 4.1.2 (Name, Role, Value)
 */
export function CustomSelect({
  value,
  onChange,
  options,
  label,
  id,
  placeholder = 'Selecione',
  variant = 'default',
  leftIcon,
  disabled = false,
  dropdownPosition = 'above'
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedItemRef = useRef<HTMLDivElement>(null);
  const listboxId = id ? `${id}-listbox` : 'select-listbox';

  // Update coordinates and highlighted index when opened
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();

      setCoords({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height
      });

      const selectedIndex = options.indexOf(value);

      setHighlightedIndex(selectedIndex);
    }
    else {
      setHighlightedIndex(-1);
    }
  }, [isOpen, value, options]);

  // Scroll selected item into view
  useEffect(() => {
    if (isOpen && selectedItemRef.current) {
      const timer = setTimeout(() => {
        selectedItemRef.current?.scrollIntoView({
          block: 'center',
          behavior: 'auto'
        })
      }, 10);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Close on page scroll only (not when scrolling inside the dropdown options list)
  useEffect(() => {
    if (!isOpen) return;
    const handleScroll = (e: Event) => {
      if (dropdownRef.current?.contains(e.target as Node)) return;
      setIsOpen(false);
    };
    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, [isOpen]);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
  };

  /**
   * Keyboard navigation
   * 
   * Supported keys:
   * - ↓ (ArrowDown): Next option
   * - ↑ (ArrowUp): Previous option
   * - Enter: Select highlighted option
   * - Escape: Close dropdown without selecting
   * - Home: First option
   * - End: Last option
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < options.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev > 0 ? prev - 1 : options.length - 1
        );
        break;
      case 'Home':
        e.preventDefault();
        setHighlightedIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setHighlightedIndex(options.length - 1);
        break;
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0 && highlightedIndex < options.length) {
          handleSelect(options[highlightedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={label ? `${id}-label` : undefined}
        aria-controls={isOpen ? listboxId : undefined}
        aria-activedescendant={isOpen && highlightedIndex >= 0 ? `${listboxId}-option-${highlightedIndex}` : undefined}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-xl border text-sm font-medium transition-all outline-none',
          variant === 'glass' && 'relative',
          variant === 'default' && [
            'bg-white dark:bg-gray-700 px-3 py-2',
            'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 focus:outline-none',
            disabled && 'opacity-50 cursor-not-allowed'
          ],
          variant === 'glass' && [
            'bg-white/15 backdrop-blur-sm border-white/20 pl-10 pr-4 py-2.5',
            'hover:bg-white/20 focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 focus:outline-none focus:bg-white/20',
            disabled && 'opacity-50 cursor-not-allowed'
          ]
        )}
      >
        {variant === 'glass' && leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70 [&>svg]:w-4 [&>svg]:h-4 pointer-events-none" aria-hidden="true">
            {leftIcon}
          </span>
        )}
        <span className={cn(
          'truncate',
          variant === 'default' && (value ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'),
          variant === 'glass' && 'text-white'
        )}>
          {value || placeholder}
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 transition-transform flex-shrink-0 ml-2',
            variant === 'default' && 'text-gray-400 dark:text-gray-500',
            variant === 'glass' && 'text-white/70',
            isOpen && 'rotate-180'
          )}
          aria-hidden="true"
        />
      </button>

      {isOpen && createPortal(
        <div
          ref={dropdownRef}
          style={{
            position: 'fixed',
            top: dropdownPosition === 'below' ? coords.top + coords.height + 4 : coords.top,
            left: coords.left,
            width: coords.width,
            transform: dropdownPosition === 'above' ? 'translateY(-100%) translateY(-4px)' : undefined,
            zIndex: 10000
          }}
          className={cn(
            'overflow-hidden rounded-xl shadow-xl',
            'border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
          )}
        >
          <div
            id={listboxId}
            role="listbox"
            aria-label={label || 'Opções'}
            className="max-h-60 overflow-y-auto p-1 scroll-smooth"
          >
            {options.map((option, index) => {
              const isSelected = value === option
              const isHighlighted = highlightedIndex === index
              return (
                <div
                  key={option}
                  id={`${listboxId}-option-${index}`}
                  role="option"
                  aria-selected={isSelected}
                  ref={isSelected ? selectedItemRef : null}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleSelect(option)
                  }}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={cn(
                    'flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors',
                    (isHighlighted || isSelected) && 'bg-gray-100 dark:bg-gray-700',
                    !isHighlighted && !isSelected && 'hover:bg-gray-50 dark:hover:bg-gray-700',
                    isSelected ? 'font-semibold text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'
                  )}
                >
                  <span className="truncate">{option}</span>
                  {isSelected && (
                    <Check
                      className="h-4 w-4 flex-shrink-0 ml-2 text-blue-600 dark:text-blue-400"
                      aria-hidden="true"
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}