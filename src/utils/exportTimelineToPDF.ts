import jsPDF from 'jspdf'
import type { TimelineDay } from '@/types/Timeline'
import { dateToInputFormat, formatDate } from '@/utils/formatters'

const MARGIN = 18
const PAGE_WIDTH = 210
const PAGE_HEIGHT = 297
const LINE_HEIGHT = 5
const GAP_AFTER_DAY = 8

function getAttractionDuration(attraction: { duration?: number }): number {
   if (attraction.duration === 0) return 0
   return attraction.duration ?? 60
}

function checkPageBreak(doc: jsPDF, y: number, required: number): number {
   let yPos = y
   if (yPos + required > PAGE_HEIGHT - MARGIN + 20) {
      doc.addPage()
      yPos = MARGIN
   }
   return yPos
}

export function exportTimelineToPDF(days: TimelineDay[]) {
   const doc = new jsPDF()
   let y = MARGIN

   // ---- Cover / title ----
   doc.setFillColor(51, 65, 85) // slate-700
   doc.rect(0, 0, PAGE_WIDTH, 36, 'F')
   doc.setFontSize(22)
   doc.setFont('helvetica', 'bold')
   doc.setTextColor(255, 255, 255)
   doc.text('Timeline do Roteiro', PAGE_WIDTH / 2, 22, { align: 'center' })
   doc.setFontSize(10)
   doc.setFont('helvetica', 'normal')
   doc.setTextColor(226, 232, 240)
   const subtitle = days.length === 1
      ? `Dia ${days[0].dayNumber} · ${formatDate(days[0].date)}`
      : `${days.length} dias · ${formatDate(days[0].date)} – ${formatDate(days[days.length - 1].date)}`
   doc.text(subtitle, PAGE_WIDTH / 2, 30, { align: 'center' })
   y = 42

   doc.setFontSize(8)
   doc.setTextColor(100, 116, 139)
   doc.setFont('helvetica', 'normal')
   const generatedAt = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
   })
   doc.text(`Gerado em ${generatedAt}`, PAGE_WIDTH / 2, y, { align: 'center' })
   y += 8

   doc.setDrawColor(226, 232, 240)
   doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y)
   y += 6

   for (let dayIndex = 0; dayIndex < days.length; dayIndex++) {
      const day = days[dayIndex]

      y = checkPageBreak(doc, y, 50)

      // Day header block (slate)
      doc.setFillColor(71, 85, 105) // slate-600
      const headerH = 20
      doc.rect(MARGIN, y, PAGE_WIDTH - MARGIN * 2, headerH, 'F')
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(255, 255, 255)
      doc.text(`Dia ${day.dayNumber}`, MARGIN + 5, y + 8)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(226, 232, 240)
      doc.text(formatDate(day.date), MARGIN + 5, y + 14)
      doc.setFontSize(9)
      doc.text(`${day.startTime} - ${day.endTime}`, PAGE_WIDTH - MARGIN - 6, y + 11, { align: 'right' })
      y += headerH + 4

      // Stats row
      doc.setFontSize(8)
      doc.setTextColor(100, 116, 139)
      doc.setFont('helvetica', 'normal')
      doc.text(`${day.attractions.length} locais`, MARGIN, y)
      doc.text(`${day.totalDistance.toFixed(1)} km`, MARGIN + 40, y)
      doc.text(`${day.totalTravelTime} min viagem`, MARGIN + 75, y)
      y += LINE_HEIGHT + 2

      // Attractions list
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.setTextColor(30, 41, 59)
      doc.text('Roteiro', MARGIN, y)
      y += LINE_HEIGHT + 1

      for (let i = 0; i < day.attractions.length; i++) {
         y = checkPageBreak(doc, y, LINE_HEIGHT * 4)

         if (i > 0 && day.segments[i - 1]) {
            const seg = day.segments[i - 1]!
            doc.setFontSize(7)
            doc.setFont('helvetica', 'normal')
            doc.setTextColor(148, 163, 184)
            doc.text(
               `${seg.distanceKm.toFixed(1)} km, ~${seg.durationMinutes} min ate ${seg.to.name}`,
               MARGIN + 8,
               y
            )
            y += LINE_HEIGHT + 1
         }

         const a = day.attractions[i]
         const arrival = (a as { arrivalTime?: string }).arrivalTime ?? day.startTime
         const departure = (a as { departureTime?: string }).departureTime ?? day.startTime
         const duration = getAttractionDuration(a)
         const isAccommodation = a.id === -999

         y = checkPageBreak(doc, y, LINE_HEIGHT * 2 + 6)
         const rowH = LINE_HEIGHT + 5
         doc.setFillColor(248, 250, 252)
         doc.rect(MARGIN, y - 3, PAGE_WIDTH - MARGIN * 2, rowH, 'F')
         doc.setFontSize(9)
         doc.setFont('helvetica', 'bold')
         doc.setTextColor(51, 65, 85)
         doc.text(`${i + 1}. ${a.name}`, MARGIN + 5, y + 1.5)
         doc.setFont('helvetica', 'normal')
         doc.setFontSize(8)
         doc.setTextColor(100, 116, 139)
         doc.text(`${arrival} - ${departure}`, PAGE_WIDTH - MARGIN - 5, y + 1.5, { align: 'right' })
         if (a.city) {
            doc.text(a.city, MARGIN + 5, y + 1.5 + LINE_HEIGHT)
         }
         if (!isAccommodation && duration > 0) {
            doc.text(`${duration} min`, PAGE_WIDTH - MARGIN - 5, y + 1.5 + LINE_HEIGHT, { align: 'right' })
         }
         y += rowH + 2
      }

      // Conflicts
      if (day.conflicts.length > 0) {
         const conflictH = 5 + day.conflicts.length * (LINE_HEIGHT + 0.5)
         y = checkPageBreak(doc, y, conflictH + 4)
         doc.setFillColor(254, 226, 226) // red-100
         doc.roundedRect(MARGIN, y, PAGE_WIDTH - MARGIN * 2, conflictH, 1.5, 1.5, 'F')
         doc.setFontSize(8)
         doc.setFont('helvetica', 'bold')
         doc.setTextColor(185, 28, 28)
         doc.text(`Atenção: ${day.conflicts.length} conflito(s)`, MARGIN + 5, y + 4)
         doc.setFont('helvetica', 'normal')
         doc.setFontSize(7)
         doc.setTextColor(127, 29, 29)
         day.conflicts.forEach((c, i) => {
            doc.text(`• ${c.message}`, MARGIN + 5, y + 4 + (i + 1) * (LINE_HEIGHT + 0.5))
         })
         y += conflictH + 2
      }

      y += GAP_AFTER_DAY
   }

   // Footer
   const footerY = PAGE_HEIGHT - 12
   doc.setFontSize(8)
   doc.setTextColor(148, 163, 184)
   doc.text('Trip Planner · Timeline do Roteiro', PAGE_WIDTH / 2, footerY, { align: 'center' })
console.log(days[0])
   const filename = days.length === 1
      ? `timeline-dia-${days[0].dayNumber}-${dateToInputFormat(days[0].date)}.pdf`
      : `timeline-roteiro-${new Date().toISOString().split('T')[0]}.pdf`
   doc.save(filename)
}