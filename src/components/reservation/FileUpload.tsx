import { useState } from 'react'
import { Upload, File, X, Loader2 } from 'lucide-react'
import { uploadFile, deleteFile } from '@/api/reservation'

interface FileUploadProps {
   onFileUploaded: (fileUrl: string, fileId: string) => void
   currentFile?: string
   currentFileId?: string
   label?: string
   accept?: string
   maxSizeMB?: number
}

export function FileUpload({
   onFileUploaded,
   currentFile,
   currentFileId,
   label = 'Documento',
   accept = '.pdf,.jpg,.jpeg,.png,.xls,.xlsx',
   maxSizeMB = 10
}: FileUploadProps) {
   const [isUploading, setIsUploading] = useState(false)
   const [isDeleting, setIsDeleting] = useState(false)
   const [error, setError] = useState<string | null>(null)

   const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      setError(null)

      // Validate file size
      const maxBytes = maxSizeMB * 1024 * 1024
      if (file.size > maxBytes) {
         setError(`Arquivo muito grande. Máximo: ${maxSizeMB}MB`)
         return
      }

      // Validate file type
      const allowedTypes = [
         'application/pdf',
         'image/jpeg',
         'image/jpg',
         'image/png',
         'application/vnd.ms-excel',
         'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ]

      if (!allowedTypes.includes(file.type)) {
         setError('Tipo de arquivo não suportado. Use PDF, JPG, PNG ou Excel.')
         return
      }

      setIsUploading(true)

      try {
         // Convert file to base64
         const base64 = await fileToBase64(file)

         // Upload to Google Drive via Apps Script
         const response = await uploadFile(file.name, base64, file.type)

         if (response.success && response.fileUrl && response.fileId) {
            onFileUploaded(response.fileUrl, response.fileId)
            setError(null)
         } else {
            throw new Error(response.message || 'Erro ao fazer upload')
         }
      } catch (error) {
         console.error('Upload error:', error)
         setError('Erro ao fazer upload do arquivo. Tente novamente.')
      } finally {
         setIsUploading(false)
         // Clear input
         event.target.value = ''
      }
   }

   const fileToBase64 = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
         const reader = new FileReader()
         reader.readAsDataURL(file)
         reader.onload = () => {
            const base64 = (reader.result as string).split(',')[1]
            resolve(base64)
         }
         reader.onerror = error => reject(error)
      })
   }

   const handleRemove = async () => {
      // If there's a Drive file ID, delete from Drive
      if (currentFileId) {
         setIsDeleting(true)
         try {
            await deleteFile(currentFileId)
         } catch (error) {
            console.error('Error deleting file from Drive:', error)
            // Continue anyway - user still wants to remove reference
         } finally {
            setIsDeleting(false)
         }
      }
      
      onFileUploaded('', '')
      setError(null)
   }

   const getFileName = (url: string) => {
      if (!url) return ''

      // Try to extract filename from Google Drive URL
      if (url.includes('drive.google.com')) {
         return 'Documento no Google Drive'
      }

      // Extract from regular URL
      try {
         const urlObj = new URL(url)
         const pathname = urlObj.pathname
         return pathname.split('/').pop() || 'Documento anexado'
      } catch {
         return 'Documento anexado'
      }
   }

   return (
      <div className="space-y-2">
         <label className="block text-sm font-medium text-gray-700">{label}</label>

         {currentFile ? (
            <div className="flex items-center gap-2 p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
               <File className="w-5 h-5 text-blue-600 flex-shrink-0" />
               <a
                  href={currentFile}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-sm text-blue-600 hover:underline truncate"
                  title={currentFile}
               >
                  {getFileName(currentFile)}
               </a>
               <button
                  type="button"
                  onClick={handleRemove}
                  disabled={isDeleting}
                  className="p-1 hover:bg-blue-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Remover arquivo"
               >
                  {isDeleting ? (
                     <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                  ) : (
                     <X className="w-4 h-4 text-blue-600" />
                  )}
               </button>
            </div>
         ) : (
            <div className="relative">
               <input
                  type="file"
                  autoComplete="off"
                  onChange={handleFileSelect}
                  disabled={isUploading}
                  className="hidden"
                  id={`file-upload-${label}`}
                  accept={accept}
               />
               <label
                  htmlFor={`file-upload-${label}`}
                  className={`
              flex items-center justify-center gap-2 w-full p-4 
              border-2 border-dashed rounded-lg cursor-pointer
              transition-all
              ${isUploading
                        ? 'border-blue-400 bg-blue-50 cursor-not-allowed'
                        : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                     }
            `}
               >
                  {isUploading ? (
                     <>
                        <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                        <span className="text-sm text-blue-600">
                           Fazendo upload...
                        </span>
                     </>
                  ) : (
                     <>
                        <Upload className="w-5 h-5 text-gray-400" />
                        <span className="text-sm text-gray-600">
                           Clique para anexar arquivo
                        </span>
                     </>
                  )}
               </label>
            </div>
         )}

         {error && (
            <p className="text-xs text-red-600 flex items-center gap-1">
               <span>⚠️</span>
               {error}
            </p>
         )}

         {!error && (
            <p className="text-xs text-gray-500">
               PDF, JPG, PNG ou Excel • Máximo: {maxSizeMB}MB
            </p>
         )}
      </div>
   )
}
