import { CropArea } from '../types'

export const getAspectRatioValue = (area: CropArea): number => {
  switch (area.aspectRatio) {
    case '16:9':
      return 16 / 9
    case '4:3':
      return 4 / 3
    case '1:1':
      return 1
    case 'free':
      if (area.customAspectRatio) {
        const [w, h] = area.customAspectRatio.split(':').map(n => parseFloat(n))
        if (w && h && w > 0 && h > 0) {
          return w / h
        }
      }
      return 0 // 0 means no constraint
    default:
      return 0
  }
}

export const maintainAspectRatio = (
  area: CropArea,
  newWidth: number,
  newHeight: number,
  constrainBy: 'width' | 'height' = 'width'
): { width: number; height: number } => {
  const aspectRatio = getAspectRatioValue(area)
  
  if (aspectRatio === 0) {
    // Free aspect ratio or invalid custom ratio
    return { width: newWidth, height: newHeight }
  }

  if (constrainBy === 'width') {
    return {
      width: newWidth,
      height: newWidth / aspectRatio
    }
  } else {
    return {
      width: newHeight * aspectRatio,
      height: newHeight
    }
  }
}

export const constrainToBounds = (
  x: number,
  y: number,
  width: number,
  height: number,
  bounds: { width: number; height: number }
): { x: number; y: number; width: number; height: number } => {
  // Ensure minimum size
  const minSize = 20
  const constrainedWidth = Math.max(minSize, Math.min(width, bounds.width - x))
  const constrainedHeight = Math.max(minSize, Math.min(height, bounds.height - y))
  
  // Ensure position is within bounds
  const constrainedX = Math.max(0, Math.min(x, bounds.width - constrainedWidth))
  const constrainedY = Math.max(0, Math.min(y, bounds.height - constrainedHeight))
  
  return {
    x: constrainedX,
    y: constrainedY,
    width: constrainedWidth,
    height: constrainedHeight
  }
}