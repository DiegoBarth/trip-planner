import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CustomSelect } from '@/components/ui/CustomSelect'

describe('CustomSelect', () => {
  const mockOnChange = vi.fn()
  const options = ['Option 1', 'Option 2', 'Option 3']

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render with placeholder when there is no value', () => {
    render(
      <CustomSelect
        value=""
        onChange={mockOnChange}
        options={options}
      />
    )

    expect(screen.getByText('Selecione')).toBeInTheDocument()
  })

  it('should render the selected value', () => {
    render(
      <CustomSelect
        value="Option 2"
        onChange={mockOnChange}
        options={options}
      />
    )

    expect(screen.getByText('Option 2')).toBeInTheDocument()
  })

  it('should open the dropdown when clicked', () => {
    render(
      <CustomSelect
        value=""
        onChange={mockOnChange}
        options={options}
      />
    )

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(button).toHaveAttribute('aria-expanded', 'true')
  })

  it('should close the dropdown when clicked again', () => {
    render(
      <CustomSelect
        value=""
        onChange={mockOnChange}
        options={options}
      />
    )

    const button = screen.getByRole('button')

    fireEvent.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')

    fireEvent.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })

  it('should render options when open', () => {
    render(
      <CustomSelect
        value=""
        onChange={mockOnChange}
        options={options}
      />
    )

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(screen.getByText('Option 1')).toBeInTheDocument()
    expect(screen.getByText('Option 2')).toBeInTheDocument()
    expect(screen.getByText('Option 3')).toBeInTheDocument()
  })

  it('should select an option when clicked', () => {
    render(
      <CustomSelect
        value=""
        onChange={mockOnChange}
        options={options}
      />
    )

    const button = screen.getByRole('button')
    fireEvent.click(button)

    const option2 = screen.getByText('Option 2')
    fireEvent.mouseDown(option2)

    expect(mockOnChange).toHaveBeenCalledWith('Option 2')
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })

  it('should show a checkmark on the selected option', () => {
    render(
      <CustomSelect
        value="Option 2"
        onChange={mockOnChange}
        options={options}
      />
    )

    const button = screen.getByRole('button')
    fireEvent.click(button)

    // Search for the option within the listbox
    const listbox = screen.getByRole('listbox')
    const option2 = listbox.querySelector('[role="option"][aria-selected="true"]')

    expect(option2).toBeInTheDocument()
    expect(option2).toHaveTextContent('Option 2')

    // Check for the check icon (svg)
    const checkIcon = option2?.querySelector('svg')
    expect(checkIcon).toBeInTheDocument()
  })

  it('should close when clicking outside', async () => {
    render(
      <CustomSelect
        value=""
        onChange={mockOnChange}
        options={options}
      />
    )

    const button = screen.getByRole('button')
    fireEvent.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')

    fireEvent.mouseDown(document.body)

    await waitFor(() => {
      expect(button).toHaveAttribute('aria-expanded', 'false')
    })
  })

  it('should have correct ARIA attributes', () => {
    render(
      <CustomSelect
        value="Option 1"
        onChange={mockOnChange}
        options={options}
        id="test-select"
        label="Test Label"
      />
    )

    const button = screen.getByRole('button')

    expect(button).toHaveAttribute('id', 'test-select')
    expect(button).toHaveAttribute('aria-haspopup', 'listbox')
    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(button).toHaveAttribute('aria-labelledby', 'test-select-label')
  })

  it('should open with Enter key', () => {
    render(
      <CustomSelect
        value=""
        onChange={mockOnChange}
        options={options}
      />
    )

    const button = screen.getByRole('button')
    fireEvent.keyDown(button, { key: 'Enter' })

    expect(button).toHaveAttribute('aria-expanded', 'true')
  })

  it('should open with Space key', () => {
    render(
      <CustomSelect
        value=""
        onChange={mockOnChange}
        options={options}
      />
    )

    const button = screen.getByRole('button')
    fireEvent.keyDown(button, { key: ' ' })

    expect(button).toHaveAttribute('aria-expanded', 'true')
  })

  it('should open with ArrowDown key', () => {
    render(
      <CustomSelect
        value=""
        onChange={mockOnChange}
        options={options}
      />
    )

    const button = screen.getByRole('button')
    fireEvent.keyDown(button, { key: 'ArrowDown' })

    expect(button).toHaveAttribute('aria-expanded', 'true')
  })

  it('should open with ArrowUp key', () => {
    render(
      <CustomSelect
        value=""
        onChange={mockOnChange}
        options={options}
      />
    )

    const button = screen.getByRole('button')
    fireEvent.keyDown(button, { key: 'ArrowUp' })

    expect(button).toHaveAttribute('aria-expanded', 'true')
  })

  it('should navigate down with ArrowDown when open', () => {
    render(
      <CustomSelect
        value=""
        onChange={mockOnChange}
        options={options}
        id="test"
      />
    )

    const button = screen.getByRole('button')
    fireEvent.click(button)

    fireEvent.keyDown(button, { key: 'ArrowDown' })
    expect(button).toHaveAttribute('aria-activedescendant', 'test-listbox-option-0')

    fireEvent.keyDown(button, { key: 'ArrowDown' })
    expect(button).toHaveAttribute('aria-activedescendant', 'test-listbox-option-1')
  })

  it('should navigate up with ArrowUp when open', () => {
    render(
      <CustomSelect
        value=""
        onChange={mockOnChange}
        options={options}
        id="test"
      />
    )

    const button = screen.getByRole('button')
    fireEvent.click(button)

    fireEvent.keyDown(button, { key: 'ArrowUp' })
    expect(button).toHaveAttribute('aria-activedescendant', 'test-listbox-option-2')

    fireEvent.keyDown(button, { key: 'ArrowUp' })
    expect(button).toHaveAttribute('aria-activedescendant', 'test-listbox-option-1')
  })

  it('should go to the first option with Home', () => {
    render(
      <CustomSelect
        value=""
        onChange={mockOnChange}
        options={options}
        id="test"
      />
    )

    const button = screen.getByRole('button')
    fireEvent.click(button)

    fireEvent.keyDown(button, { key: 'Home' })
    expect(button).toHaveAttribute('aria-activedescendant', 'test-listbox-option-0')
  })

  it('should go to the last option with End', () => {
    render(
      <CustomSelect
        value=""
        onChange={mockOnChange}
        options={options}
        id="test"
      />
    )

    const button = screen.getByRole('button')
    fireEvent.click(button)

    fireEvent.keyDown(button, { key: 'End' })
    expect(button).toHaveAttribute('aria-activedescendant', 'test-listbox-option-2')
  })

  it('should select the highlighted option with Enter', () => {
    render(
      <CustomSelect
        value=""
        onChange={mockOnChange}
        options={options}
      />
    )

    const button = screen.getByRole('button')
    fireEvent.click(button)

    fireEvent.keyDown(button, { key: 'ArrowDown' })
    fireEvent.keyDown(button, { key: 'Enter' })

    expect(mockOnChange).toHaveBeenCalledWith('Option 1')
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })

  it('should close with Escape without selecting', () => {
    render(
      <CustomSelect
        value=""
        onChange={mockOnChange}
        options={options}
      />
    )

    const button = screen.getByRole('button')
    fireEvent.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')

    fireEvent.keyDown(button, { key: 'Escape' })

    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(mockOnChange).not.toHaveBeenCalled()
  })

  it('should loop back to the start when navigating down from the last option', () => {
    render(
      <CustomSelect
        value=""
        onChange={mockOnChange}
        options={options}
        id="test"
      />
    )

    const button = screen.getByRole('button')
    fireEvent.click(button)

    fireEvent.keyDown(button, { key: 'End' })
    expect(button).toHaveAttribute('aria-activedescendant', 'test-listbox-option-2')

    fireEvent.keyDown(button, { key: 'ArrowDown' })
    expect(button).toHaveAttribute('aria-activedescendant', 'test-listbox-option-0')
  })

  it('should loop to the end when navigating up from the first option', () => {
    render(
      <CustomSelect
        value=""
        onChange={mockOnChange}
        options={options}
        id="test"
      />
    )

    const button = screen.getByRole('button')
    fireEvent.click(button)

    fireEvent.keyDown(button, { key: 'Home' })
    expect(button).toHaveAttribute('aria-activedescendant', 'test-listbox-option-0')

    fireEvent.keyDown(button, { key: 'ArrowUp' })
    expect(button).toHaveAttribute('aria-activedescendant', 'test-listbox-option-2')
  })

  it('should highlight an option on mouse enter', () => {
    render(
      <CustomSelect
        value=""
        onChange={mockOnChange}
        options={options}
        id="test"
      />
    )

    const button = screen.getByRole('button')
    fireEvent.click(button)

    const option2 = screen.getByText('Option 2')
    fireEvent.mouseEnter(option2)

    expect(button).toHaveAttribute('aria-activedescendant', 'test-listbox-option-1')
  })

  it('should have a chevron icon with rotation', () => {
    const { container } = render(
      <CustomSelect
        value=""
        onChange={mockOnChange}
        options={options}
      />
    )

    const button = screen.getByRole('button')
    const chevron = container.querySelector('svg')

    expect(chevron).toBeInTheDocument()
    expect(chevron).toHaveAttribute('aria-hidden', 'true')

    fireEvent.click(button)
    expect(chevron).toHaveClass('rotate-180')
  })

  it('should accept an empty array of options', () => {
    render(
      <CustomSelect
        value=""
        onChange={mockOnChange}
        options={[]}
      />
    )

    expect(screen.getByText('Selecione')).toBeInTheDocument()
  })

  it('should have listbox role on the options container', () => {
    render(
      <CustomSelect
        value=""
        onChange={mockOnChange}
        options={options}
      />
    )

    const button = screen.getByRole('button')
    fireEvent.click(button)

    const listbox = screen.getByRole('listbox')
    expect(listbox).toBeInTheDocument()
  })

  it('should have option role on each item', () => {
    render(
      <CustomSelect
        value=""
        onChange={mockOnChange}
        options={options}
      />
    )

    const button = screen.getByRole('button')
    fireEvent.click(button)

    const optionElements = screen.getAllByRole('option')
    expect(optionElements).toHaveLength(3)
  })

  it('should mark the selected option with aria-selected', () => {
    render(
      <CustomSelect
        value="Option 2"
        onChange={mockOnChange}
        options={options}
      />
    )

    const button = screen.getByRole('button')
    fireEvent.click(button)

    const optionsElements = screen.getAllByRole('option')
    expect(optionsElements[1]).toHaveAttribute('aria-selected', 'true')
    expect(optionsElements[0]).toHaveAttribute('aria-selected', 'false')
    expect(optionsElements[2]).toHaveAttribute('aria-selected', 'false')
  })

  it('should scroll to the selected item when the dropdown opens', async () => {
    const scrollIntoViewMock = vi.fn();
    window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;

    render(
      <CustomSelect
        value="Option 2"
        onChange={mockOnChange}
        options={options}
      />
    );

    const button = screen.getByRole('button');

    fireEvent.click(button);

    await waitFor(() => {
      expect(scrollIntoViewMock).toHaveBeenCalledWith({
        block: 'center',
        behavior: 'auto'
      });
    }, { timeout: 100 });

    vi.restoreAllMocks();
  })

  it('should not close when clicking inside the container', () => {
    render(
      <CustomSelect
        value=""
        onChange={mockOnChange}
        options={options}
      />
    )

    const button = screen.getByRole('button')
    fireEvent.click(button)

    fireEvent.mouseDown(button)

    expect(button).toHaveAttribute('aria-expanded', 'true')
  })

  it('should not open when pressing an unmapped key while closed', () => {
    render(
      <CustomSelect
        value=""
        onChange={mockOnChange}
        options={options}
      />
    )

    const button = screen.getByRole('button')
    fireEvent.keyDown(button, { key: 'Tab' })

    expect(button).toHaveAttribute('aria-expanded', 'false')
  })

  it('should not call onChange if Enter is pressed and no option is highlighted', () => {
    render(
      <CustomSelect
        value=""
        onChange={mockOnChange}
        options={options}
      />
    )

    const button = screen.getByRole('button')
    fireEvent.click(button)

    fireEvent.keyDown(button, { key: 'Enter' })

    expect(mockOnChange).not.toHaveBeenCalled()
  })
})