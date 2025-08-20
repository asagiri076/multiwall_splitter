import { memo } from 'react'
import { 
  Button, 
  Typography, 
  Box, 
  Card, 
  CardContent,
  Chip,
  Stack
} from '@mui/material'
import { Download, Archive } from '@mui/icons-material'
import { CropArea, ImageData } from '../types'
import { cropImage, downloadBlob } from '../utils/cropImage'

interface DownloadSectionProps {
  cropAreas: CropArea[]
  image?: ImageData | null
}

const DownloadSection = ({ cropAreas, image }: DownloadSectionProps) => {
  const handleCropAll = async () => {
    if (!image) return
    
    for (const area of cropAreas) {
      try {
        const blob = await cropImage(image, area)
        const filename = `${area.name.replace(/\s+/g, '_')}.png`
        downloadBlob(blob, filename)
      } catch (error) {
        console.error(`Error cropping ${area.name}:`, error)
      }
    }
  }

  const handleDownloadZip = () => {
    console.log('Downloading ZIP - feature not implemented yet')
    alert('ZIP ダウンロード機能は現在実装中です')
  }

  const handleDownloadSingle = async (area: CropArea) => {
    if (!image) return
    
    try {
      const blob = await cropImage(image, area)
      const filename = `${area.name.replace(/\s+/g, '_')}.png`
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
      
      <Stack spacing={1.5} sx={{ mb: 2 }}>
        <Button
          variant="contained"
          color="warning"
          startIcon={<Download />}
          onClick={handleCropAll}
          disabled={cropAreas.length === 0}
          fullWidth
          size="large"
        >
          すべて切り出し
        </Button>
        <Button
          variant="outlined"
          color="warning"
          startIcon={<Archive />}
          onClick={handleDownloadZip}
          disabled={cropAreas.length === 0}
          fullWidth
          size="medium"
        >
          一括ZIP ダウンロード
        </Button>
      </Stack>
      
      <Box sx={{ textAlign: 'center', mb: 2 }}>
        <Chip
          label={`切り出し準備完了: ${cropAreas.length}個の範囲`}
          variant="outlined"
          size="small"
          color="primary"
        />
      </Box>

      <Stack spacing={1.5}>
        {cropAreas.map(area => (
          <Card key={area.id} variant="outlined" sx={{ borderRadius: 2 }}>
            <Box
              sx={{
                height: 80,
                background: 'linear-gradient(135deg, #667eea 20%, #764ba2 80%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}
            >
              <Typography variant="caption">
                {area.name} Preview
              </Typography>
            </Box>
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Typography variant="body2" fontWeight="medium" sx={{ mb: 0.5 }}>
                {area.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                {Math.round(area.width)} × {Math.round(area.height)} px
              </Typography>
              <Button
                size="small"
                variant="contained"
                color="primary"
                onClick={() => handleDownloadSingle(area)}
                disabled={!image}
                fullWidth
                sx={{ 
                  fontSize: '0.7rem',
                  py: 0.5
                }}
              >
                ダウンロード
              </Button>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  )
}

export default memo(DownloadSection)