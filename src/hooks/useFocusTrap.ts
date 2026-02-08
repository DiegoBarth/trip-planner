import { useEffect, useRef } from 'react'

/**
 * Hook to implement Focus Trap in modals/dialogs
 * 
 * Accessibility (a11y):
 * - Prevents Tab from navigating outside the modal
 * - Cycles focus between focusable elements within the container
 * - Restores focus to previous element when modal closes
 * 
 * WCAG 2.1: Success Criterion 2.4.3 (Focus Order)
 * 
 * @param isActive - Whether the trap is active (modal open)
 * @returns Ref to attach to the modal container
 * 
 * @example
 * const trapRef = useFocusTrap(isOpen)
 * return <div ref={trapRef}>...</div>
 */
export function useFocusTrap(isActive: boolean) {
   const containerRef = useRef<HTMLDivElement>(null)
   const previousActiveElement = useRef<HTMLElement | null>(null)

   useEffect(() => {
      if (!isActive) return

      // Save element that had focus before modal opened
      previousActiveElement.current = document.activeElement as HTMLElement

      const container = containerRef.current
      if (!container) return

      // Focusable elements selector
      const focusableSelector =
         'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

      // Focus first focusable element in modal
      const firstFocusable = container.querySelector<HTMLElement>(focusableSelector)
      firstFocusable?.focus()

      /**
       * Keyboard handler to cycle focus
       * 
       * Behavior:
       * - Tab: Move to next element
       * - Shift+Tab: Move to previous element
       * - On last element + Tab: Return to first
       * - On first element + Shift+Tab: Go to last
       */
      function handleKeyDown(e: KeyboardEvent) {
         if (e.key !== 'Tab' || !container) return

         const focusableElements = Array.from(
            container.querySelectorAll<HTMLElement>(focusableSelector)
         )

         if (focusableElements.length === 0) return

         const firstElement = focusableElements[0]
         const lastElement = focusableElements[focusableElements.length - 1]

         // Shift + Tab on first element → go to last
         if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault()
            lastElement.focus()
            return
         }

         // Tab on last element → go to first
         if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault()
            firstElement.focus()
            return
         }
      }

      document.addEventListener('keydown', handleKeyDown)

      // Cleanup: restore focus to previous element
      return () => {
         document.removeEventListener('keydown', handleKeyDown)
         previousActiveElement.current?.focus()
      }
   }, [isActive])

   return containerRef
}
