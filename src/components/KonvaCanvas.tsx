import { useState, useEffect, useRef } from 'react'
import { Stage, Layer, Image as KonvaImage, Rect, Transformer, Text } from 'react-konva'
import Konva from 'konva'
import { 
  Paper, 
  Box, 
  Button, 
  Typography, 
  Chip,
  Stack
} from '@mui/material'
import { CloudUpload, Image, Info } from '@mui/icons-material'
import { ImageData, CropArea } from '../types'
import { getAspectRatioValue } from '../utils/aspectRatio'

interface KonvaCanvasProps {
  image: ImageData | null
  cropAreas: CropArea[]
  selectedAreaId: string | null
  onImageUpload: (file: File) => void
  onAreaSelect: (id: string | null) => void
  onAreaUpdate: (id: string, updates: Partial<CropArea>) => void
}

// Upload 用コンポーネント
const UploadView = ({ onImageUpload, fileInputRef }: { onImageUpload: (file: File) => void, fileInputRef: React.RefObject<HTMLInputElement> }) => {
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onImageUpload(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      onImageUpload(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <Paper
      elevation={2}
      sx={{
        width: 840,
        height: 640,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
        mb: 2,
        cursor: 'pointer',
        border: '2px dashed',
        borderColor: 'divider',
        transition: 'all 0.3s ease',
        '&:hover': {
          borderColor: 'primary.main',
          bgcolor: 'primary.50',
          transform: 'scale(1.01)',
        },
        '&:active': {
          transform: 'scale(0.99)',
        }
      }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={handleUploadClick}
    >
      <Stack spacing={3} alignItems="center" sx={{ textAlign: 'center' }}>
        <Image 
          sx={{ 
            fontSize: 80, 
            color: 'text.disabled',
            opacity: 0.6 
          }} 
        />
        <Typography 
          variant="h6" 
          color="text.secondary"
          sx={{ fontWeight: 500 }}
        >
          ファイルをドラッグ&ドロップ または クリックして選択
        </Typography>
        <Button
          variant="contained"
          startIcon={<CloudUpload />}
          size="large"
          onClick={(e) => {
            e.stopPropagation()
            handleUploadClick()
          }}
          sx={{
            py: 1.5,
            px: 4,
            fontSize: '1.1rem',
          }}
        >
          ファイルを選択
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </Stack>
    </Paper>
  )
}

// 編集用コンポーネント（画像ロード・Konva 管理を全て内包）
const EditorView = ({
  image,
  cropAreas,
  selectedAreaId,
  onAreaSelect,
  onAreaUpdate
}: Omit<KonvaCanvasProps, 'onImageUpload'>) => {
  const [konvaImage, setKonvaImage] = useState<HTMLImageElement | null>(null)
  const stageSize = { width: 800, height: 600 }
  const [imageScale, setImageScale] = useState({ x: 1, y: 1 })
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 })
  const transformerRef = useRef<Konva.Transformer | null>(null)
  const stageRef = useRef<Konva.Stage | null>(null)

  // 画像をロードしてKonvaImageオブジェクトを作成
  useEffect(() => {
    if (image) {
      const img = new window.Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        setKonvaImage(img)
        
        // 画像をキャンバスにフィットさせる計算
        const containerWidth = 800
        const containerHeight = 600
        const imageAspect = img.width / img.height
        const containerAspect = containerWidth / containerHeight
        
        let scale, newWidth, newHeight, offsetX, offsetY
        
        if (imageAspect > containerAspect) {
          // 画像が横長の場合、幅を基準にスケール
          scale = containerWidth / img.width
          newWidth = containerWidth
          newHeight = img.height * scale
          offsetX = 0
          offsetY = (containerHeight - newHeight) / 2
        } else {
          // 画像が縦長の場合、高さを基準にスケール
          scale = containerHeight / img.height
          newWidth = img.width * scale
          newHeight = containerHeight
          offsetX = (containerWidth - newWidth) / 2
          offsetY = 0
        }
        
        setImageScale({ x: scale, y: scale })
        setImagePosition({ x: offsetX, y: offsetY })
      }
      img.src = image.dataUrl
    }
  }, [image])

  // Transformerの設定
  useEffect(() => {
    if (transformerRef.current && selectedAreaId) {
      const stage = transformerRef.current.getStage()
      if (stage) {
        const selectedNode = stage.findOne(`#rect-${selectedAreaId}`)
        if (selectedNode) {
          transformerRef.current.nodes([selectedNode])
        }
      }
    } else if (transformerRef.current) {
      transformerRef.current.nodes([])
    }
  }, [selectedAreaId])

  const handleRectClick = (areaId: string) => {
    onAreaSelect(areaId)
  }

  const handleStageClick = (e: any) => {
    // 背景をクリックした場合は選択解除
    if (e.target === e.target.getStage()) {
      onAreaSelect(null)
    }
  }

  const handleRectDragEnd = (areaId: string, e: any) => {
    const rect = e.target
    const newX = (rect.x() - imagePosition.x) / imageScale.x
    const newY = (rect.y() - imagePosition.y) / imageScale.y
    
    onAreaUpdate(areaId, {
      x: Math.max(0, Math.min(image!.width - rect.width() / imageScale.x, newX)),
      y: Math.max(0, Math.min(image!.height - rect.height() / imageScale.y, newY))
    })
  }

  const handleRectTransformEnd = (areaId: string, e: any) => {
    const rect = e.target
    
    // スケールを実際のサイズに変換
    const newWidth = rect.width() * rect.scaleX()
    const newHeight = rect.height() * rect.scaleY()
    
    // スケールをリセット
    rect.scaleX(1)
    rect.scaleY(1)
    rect.width(newWidth)
    rect.height(newHeight)
    
    // 画像座標系に変換
    const imageX = (rect.x() - imagePosition.x) / imageScale.x
    const imageY = (rect.y() - imagePosition.y) / imageScale.y
    const imageWidth = newWidth / imageScale.x
    const imageHeight = newHeight / imageScale.y
    
    onAreaUpdate(areaId, {
      x: Math.max(0, Math.min(image!.width - imageWidth, imageX)),
      y: Math.max(0, Math.min(image!.height - imageHeight, imageY)),
      width: Math.max(20, Math.min(image!.width, imageWidth)),
      height: Math.max(20, Math.min(image!.height, imageHeight))
    })
  }

  return (
    <Stack spacing={2}>
      <Paper
        elevation={2}
        sx={{
          width: 840,
          height: 640,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
          overflow: 'hidden'
        }}
      >
        <Stage
          ref={stageRef}
          width={stageSize.width}
          height={stageSize.height}
          onClick={handleStageClick}
          onTap={handleStageClick}
        >
          <Layer>
            {/* Background image */}
            {konvaImage && (
              <KonvaImage
                image={konvaImage}
                x={imagePosition.x}
                y={imagePosition.y}
                scaleX={imageScale.x}
                scaleY={imageScale.y}
              />
            )}
            
            {/* Crop area rectangles */}
            {cropAreas.filter(area => area.visible).map(area => (
              <Rect
                key={area.id}
                id={`rect-${area.id}`}
                x={imagePosition.x + area.x * imageScale.x}
                y={imagePosition.y + area.y * imageScale.y}
                width={area.width * imageScale.x}
                height={area.height * imageScale.y}
                fill="transparent"
                stroke={selectedAreaId === area.id ? '#3498db' : '#e74c3c'}
                strokeWidth={2}
                draggable
                onClick={() => handleRectClick(area.id)}
                onTap={() => handleRectClick(area.id)}
                onDragEnd={(e) => handleRectDragEnd(area.id, e)}
                onTransformEnd={(e) => handleRectTransformEnd(area.id, e)}
                // ドラッグ範囲制限
                dragBoundFunc={(pos) => {
                  const minX = imagePosition.x
                  const minY = imagePosition.y
                  const maxX = imagePosition.x + image!.width * imageScale.x - area.width * imageScale.x
                  const maxY = imagePosition.y + image!.height * imageScale.y - area.height * imageScale.y
                  
                  return {
                    x: Math.max(minX, Math.min(maxX, pos.x)),
                    y: Math.max(minY, Math.min(maxY, pos.y))
                  }
                }}
              />
            ))}
            
            {/* Labels */}
            {cropAreas.filter(area => area.visible).map(area => (
              <Text
                key={`label-${area.id}`}
                x={imagePosition.x + area.x * imageScale.x + 5}
                y={imagePosition.y + area.y * imageScale.y + 5}
                text={`${area.name} (${area.aspectRatio === 'free' && area.customAspectRatio ? area.customAspectRatio : area.aspectRatio})`}
                fontSize={12}
                fill="white"
                stroke="black"
                strokeWidth={0.5}
                listening={false}
              />
            ))}
            
            {/* Transformer (resize handles) */}
            <Transformer
              ref={transformerRef}
              enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
              rotateEnabled={false}
              keepRatio={selectedAreaId ? (() => {
                const selectedArea = cropAreas.find(area => area.id === selectedAreaId)
                return selectedArea && selectedArea.aspectRatio !== 'free'
              })() : false}
              boundBoxFunc={(_, newBox) => {
                // アスペクト比維持の処理
                if (selectedAreaId) {
                  const selectedArea = cropAreas.find(area => area.id === selectedAreaId)
                  if (selectedArea && selectedArea.aspectRatio !== 'free') {
                    const aspectRatio = getAspectRatioValue(selectedArea)
                    if (aspectRatio > 0) {
                      // アスペクト比に基づいて高さを調整
                      newBox.height = newBox.width / aspectRatio
                    }
                  }
                }
                
                // リサイズ範囲を画像内に制限
                const imageRect = {
                  x: imagePosition.x,
                  y: imagePosition.y,
                  width: image!.width * imageScale.x,
                  height: image!.height * imageScale.y
                }
                
                if (newBox.x < imageRect.x) {
                  newBox.width = newBox.width - (imageRect.x - newBox.x)
                  newBox.x = imageRect.x
                }
                if (newBox.y < imageRect.y) {
                  newBox.height = newBox.height - (imageRect.y - newBox.y)
                  newBox.y = imageRect.y
                }
                if (newBox.x + newBox.width > imageRect.x + imageRect.width) {
                  newBox.width = imageRect.x + imageRect.width - newBox.x
                }
                if (newBox.y + newBox.height > imageRect.y + imageRect.height) {
                  newBox.height = imageRect.y + imageRect.height - newBox.y
                }
                
                // 最小サイズ制限
                if (newBox.width < 20) newBox.width = 20
                if (newBox.height < 20) newBox.height = 20
                
                return newBox
              }}
            />
          </Layer>
        </Stage>
      </Paper>
      
      <Box 
        sx={{ 
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          px: 1
        }}
      >
        <Chip 
          icon={<Info />}
          label={`${image!.file.name}`}
          variant="outlined"
          color="primary"
        />
        <Typography variant="body2" color="text.secondary">
          {image!.width} × {image!.height} px
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {Math.round(image!.file.size / 1024 / 1024 * 10) / 10} MB
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
          💡 切り抜き範囲をクリックして選択・リサイズハンドルでサイズ変更
        </Typography>
      </Box>
    </Stack>
  )
}

// 大元の短い分岐コンポーネント
const KonvaCanvas = ({
  image,
  cropAreas,
  selectedAreaId,
  onImageUpload,
  onAreaSelect,
  onAreaUpdate
}: KonvaCanvasProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!image) {
    return <UploadView onImageUpload={onImageUpload} fileInputRef={fileInputRef} />
  }

  return (
    <EditorView
      image={image}
      cropAreas={cropAreas}
      selectedAreaId={selectedAreaId}
      onAreaSelect={onAreaSelect}
      onAreaUpdate={onAreaUpdate}
    />
  )
}

export default KonvaCanvas