import jsPDF from 'jspdf'
import { CHECKLIST_CATEGORIES } from '@/config/constants'
import type { ChecklistItem } from '@/types/ChecklistItem'

interface ExportOptions {
  items: ChecklistItem[]
  title?: string
  includeNotes?: boolean
}

/**
 * Export checklist items to PDF
 * Categories are sorted alphabetically, items within categories are sorted by description
 */
export function exportChecklistToPDF({ items, title = 'Checklist de Viagem', includeNotes = true}: ExportOptions) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const lineHeight = 7;

  let yPosition = margin;

  // Helper function to check if we need a new page
  const checkPageBreak = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      doc.addPage();

      yPosition = margin;

      return true;
    }

    return false;
  };

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(title, pageWidth / 2, yPosition, { align: 'center' });

  yPosition += 15;

  // Date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);

  const currentDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  doc.text(`Gerado em: ${currentDate}`, pageWidth / 2, yPosition, { align: 'center' });

  yPosition += 10;

  // Statistics
  const total = items.length;
  const packed = items.filter(item => item.isPacked).length;
  const percentage = total > 0 ? Math.round((packed / total) * 100) : 0;

  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text(`Progresso: ${packed}/${total} itens (${percentage}%)`, margin, yPosition);

  yPosition += 10;

  // Line separator
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  
yPosition += 10;

  // Group by category and sort alphabetically
  const groupedByCategory = items.reduce((acc, item) => {
    const category = item.category;

    if (!acc[category]) {
      acc[category] = [];
    }

    acc[category].push(item);

    return acc;
  }, {} as Record<string, ChecklistItem[]>);

  // Sort categories alphabetically by label
  const sortedCategories = Object.entries(groupedByCategory).sort(([keyA], [keyB]) => {
    const labelA = CHECKLIST_CATEGORIES[keyA as keyof typeof CHECKLIST_CATEGORIES]?.label || keyA;
    const labelB = CHECKLIST_CATEGORIES[keyB as keyof typeof CHECKLIST_CATEGORIES]?.label || keyB;

    return labelA.localeCompare(labelB, 'pt-BR');
  });

  // Sort items within each category by description
  sortedCategories.forEach(([, categoryItems]) => {
    categoryItems.sort((a, b) => a.description.localeCompare(b.description, 'pt-BR'));
  });

  // Render categories
  sortedCategories.forEach(([category, categoryItems]) => {
    const categoryConfig = CHECKLIST_CATEGORIES[category as keyof typeof CHECKLIST_CATEGORIES];
    const packedInCategory = categoryItems.filter(item => item.isPacked).length;
    const totalInCategory = categoryItems.length;

    // Check if category header fits
    checkPageBreak(lineHeight * 4);

    // Category header with bullet and progress
    doc.setFillColor(59, 130, 246);
    doc.circle(margin + 2, yPosition - 2, 2, 'F');

    // Category progress (before title)
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);

    const progressText = `(${packedInCategory}/${totalInCategory})`;

    doc.text(progressText, margin + 7, yPosition);

    const progressWidth = doc.getTextWidth(progressText);

    // Category title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);

    const categoryText = categoryConfig.label;

    doc.text(categoryText, margin + 7 + progressWidth + 3, yPosition);

    yPosition += lineHeight + 2;

    // Category items
    categoryItems.forEach((item) => {
      // Check if item fits (considering item + potential notes)
      const requiredSpace = includeNotes && item.notes ? lineHeight * 2.5 : lineHeight * 1.5;

      checkPageBreak(requiredSpace);

      // Checkbox
      const checkboxX = margin + 2;
      const checkboxY = yPosition - 3;
      const checkboxSize = 3;

      doc.setDrawColor(100, 100, 100);
      doc.setLineWidth(0.3);
      doc.rect(checkboxX, checkboxY, checkboxSize, checkboxSize);

      // Check mark if packed
      if (item.isPacked) {
        doc.setDrawColor(34, 197, 94);
        doc.setLineWidth(0.5);
        doc.line(checkboxX + 0.5, checkboxY + 1.5, checkboxX + 1.2, checkboxY + 2.5);
        doc.line(checkboxX + 1.2, checkboxY + 2.5, checkboxX + 2.5, checkboxY + 0.5);
      }

      // Item description
      doc.setFontSize(10);
      doc.setFont('helvetica', item.isPacked ? 'normal' : 'normal');
      doc.setTextColor(item.isPacked ? 150 : 0, item.isPacked ? 150 : 0, item.isPacked ? 150 : 0);

      let itemText = item.description;

      if (item.quantity && item.quantity > 1) {
        itemText += ` (x${item.quantity})`;
      }

      doc.text(itemText, checkboxX + checkboxSize + 3, yPosition);

      yPosition += lineHeight;

      // Notes (if any and if includeNotes is true)
      if (includeNotes && item.notes) {
        doc.setFontSize(8);
        doc.setTextColor(120, 120, 120);

        const notesLines = doc.splitTextToSize(`Observações: ${item.notes}`, pageWidth - margin * 2 - 10);

        doc.text(notesLines, checkboxX + checkboxSize + 3, yPosition);

        yPosition += (notesLines.length * 5);
      }

      yPosition += 2;
    })

    yPosition += 5;
  })

  // Footer on last page
  const footerY = pageHeight - 15;

  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Trip Planner - Checklist de Viagem', pageWidth / 2, footerY, { align: 'center' });

  // Save PDF
  const filename = `checklist-${new Date().toISOString().split('T')[0]}.pdf`;

  doc.save(filename);
}