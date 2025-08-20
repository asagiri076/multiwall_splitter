import { CropArea, ImageData } from '../types'

export const cropImage = (
  image: ImageData,
  cropArea: CropArea
): Promise<Blob> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    
    const img = new Image()
    img.onload = () => {
      // Set canvas size to crop area size
      canvas.width = cropArea.width
      canvas.height = cropArea.height
      
      // Draw the cropped portion of the image
      ctx.drawImage(
        img,
        cropArea.x, cropArea.y, cropArea.width, cropArea.height, // Source rectangle
        0, 0, cropArea.width, cropArea.height // Destination rectangle
      )
      
      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob)
        }
      }, 'image/png')
    }
    img.src = image.dataUrl
  })
}

export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export const createZip = async (
  image: ImageData,
  cropAreas: CropArea[]
): Promise<Blob> => {
  // For now, we'll just return a simple implementation
  // In a real application, you'd want to use a ZIP library like JSZip
  const blobs: Blob[] = []
  
  for (const area of cropAreas) {
    const blob = await cropImage(image, area)
    blobs.push(blob)
  }
  
  // This is a simplified implementation - just return the first blob for demo
  return blobs[0] || new Blob()
}