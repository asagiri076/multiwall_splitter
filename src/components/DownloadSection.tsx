import { memo } from 'react'
import { 
  Button, 
  Typography, 
  Box, 
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material'
import { Download } from '@mui/icons-material'
import { CropArea, ImageData } from '../types'
import { cropImage, downloadBlob } from '../utils/cropImage'

interface DownloadSectionProps {
  cropAreas: CropArea[]
  image?: ImageData | null
}

const DownloadSection = ({ cropAreas, image }: DownloadSectionProps) => {
  const handleCropAll = async () => {
    if (!image) return
    
    const baseFilename = image.file.name.replace(/\.[^/.]+$/, '') // 拡張子を除去
    
    for (const area of cropAreas) {
      try {
        const blob = await cropImage(image, area)
        const filename = `${baseFilename}_${area.name.replace(/\s+/g, '_')}.jpg`
        downloadBlob(blob, filename)
      } catch (error) {
        console.error(`Error cropping ${area.name}:`, error)
      }
    }
  }


  const handleDownloadSingle = async (area: CropArea) => {
    if (!image) return
    
    const baseFilename = image.file.name.replace(/\.[^/.]+$/, '') // 拡張子を除去
    
    try {
      const blob = await cropImage(image, area)
      const filename = `${baseFilename}_${area.name.replace(/\s+/g, '_')}.jpg`
      downloadBlob(blob, filename)
    } catch (error) {
      console.error(`Error cropping ${area.name}:`, error)
    }
  }

  return (
    <Box>
      <Typography variant="h6" component="h2" sx={{ mb: 2, fontWeight: 'bold' }}>
        ダウンロード
      </Typography>
      
      <Button
        variant="contained"
        color="secondary"
        startIcon={<Download />}
        onClick={handleCropAll}
        disabled={cropAreas.length === 0}
        fullWidth
        size="large"
        sx={{ mb: 2 }}
      >
        すべて切り出し
      </Button>
      
      <Box sx={{ textAlign: 'center', mb: 2 }}>
        <Chip
          label={`切り出し範囲: ${cropAreas.length}個`}
          variant="outlined"
          size="small"
          color="primary"
        />
      </Box>

      {cropAreas.length > 0 && (
        <List sx={{ p: 0 }}>
          {cropAreas.map((area, index) => (
            <Box key={area.id}>
              <ListItem
                sx={{ 
                  px: 0, 
                  py: 1,
                  flexDirection: 'column',
                  alignItems: 'stretch'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', mb: 1 }}>
                  <ListItemText
                    primary={area.name}
                    secondary={
                      <Box component="span" sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          {Math.round(area.width)} × {Math.round(area.height)} px
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {area.aspectRatio === 'free' && area.customAspectRatio 
                            ? area.customAspectRatio 
                            : area.aspectRatio}
                        </Typography>
                      </Box>
                    }
                    sx={{ margin: 0 }}
                  />
                  <Button
                    size="small"
                    variant="outlined"
                    color="primary"
                    onClick={() => handleDownloadSingle(area)}
                    disabled={!image}
                    sx={{ 
                      fontSize: '0.75rem',
                      py: 0.5,
                      px: 1.5,
                      minWidth: 'auto'
                    }}
                  >
                    DL
                  </Button>
                </Box>
              </ListItem>
              {index < cropAreas.length - 1 && <Divider />}
            </Box>
          ))}
        </List>
      )}

      {cropAreas.length === 0 && (
        <Box 
          sx={{ 
            textAlign: 'center', 
            py: 3, 
            color: 'text.secondary',
            border: '1px dashed',
            borderColor: 'divider',
            borderRadius: 1,
            bgcolor: 'background.paper'
          }}
        >
          <Typography variant="body2">
            切り出し範囲が設定されていません
          </Typography>
        </Box>
      )}
    </Box>
  )
}

export default memo(DownloadSection)