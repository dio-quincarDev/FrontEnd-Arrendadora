// src/utils/fileDownload.js
export function downloadFile(blob, format, baseName = 'report') {
  if (!(blob instanceof Blob)) {
    console.error('[Download] No es un Blob válido', blob)
    throw new Error('El archivo recibido no es válido')
  }
  if (blob.size === 0) {
    console.error('[Download] Blob vacío recibido')
    throw new Error('El archivo recibido está vacío')
  }

  const extensions = {
    PDF: 'pdf',
    EXCEL: 'xlsx',
  }
  const ext = extensions[format] || 'dat'
  const filename = `${baseName}-${new Date().toISOString().slice(0, 10)}.${ext}`

  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  document.body.appendChild(link)
  link.click()
  setTimeout(() => {
    URL.revokeObjectURL(link.href)
    document.body.removeChild(link)
  }, 200)
}
