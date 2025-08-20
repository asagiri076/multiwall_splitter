import { useState } from 'react'
import { ThemeProvider, CssBaseline, Container, Box } from '@mui/material'
import { theme } from './theme/theme'
import { ImageData, CropArea } from './types'
import Header from './components/Header'
import KonvaCanvas from './components/KonvaCanvas'
import Sidebar from './components/Sidebar'

function App() {
  const [image, setImage] = useState<ImageData | null>(null)
  const [cropAreas, setCropAreas] = useState<CropArea[]>([])
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null)

  const handleImageUpload = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        setImage({
          file,
          dataUrl: e.target?.result as string,
          width: img.width,
          height: img.height
        })
        // 画像変更時に切り出し範囲をリセット
        setCropAreas([])
        setSelectedAreaId(null)
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const handleImageDelete = () => {
    setImage(null)
    setCropAreas([])
    setSelectedAreaId(null)
  }

  const addCropArea = (aspectRatio: CropArea['aspectRatio'], customAspectRatio?: string) => {
    const id = Date.now().toString()
    const newArea: CropArea = {
      id,
      name: `Range ${cropAreas.length + 1}`,
      aspectRatio,
      customAspectRatio,
      x: image ? image.width * 0.1 : 100,
      y: image ? image.height * 0.1 : 100,
      width: image ? image.width * 0.4 : 400,
      height: aspectRatio === '16:9'
        ? (image ? image.width * 0.4 * 9 / 16 : 225)
        : aspectRatio === '4:3'
          ? (image ? image.width * 0.4 * 3 / 4 : 300)
          : aspectRatio === '1:1'
            ? (image ? image.width * 0.4 : 400)
            : aspectRatio === 'free' && customAspectRatio
              ? (() => {
                const [w, h] = customAspectRatio.split(':').map(n => parseFloat(n))
                return image ? image.width * 0.4 * h / w : 300
              })()
              : (image ? image.height * 0.4 : 300),
      visible: true
    }
    setCropAreas(prev => [...prev, newArea])
    setSelectedAreaId(id)
  }

  const updateCropArea = (id: string, updates: Partial<CropArea>) => {
    setCropAreas(prev => prev.map(area =>
      area.id === id ? { ...area, ...updates } : area
    ))
  }

  const deleteCropArea = (id: string) => {
    setCropAreas(prev => prev.filter(area => area.id !== id))
    if (selectedAreaId === id) {
      setSelectedAreaId(null)
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container
        maxWidth="xl"
        sx={{
          py: 3,
          minHeight: '100vh'
        }}
      >
        <Header />
        <Box
          sx={{
            display: 'flex',
            gap: 3,
            mt: 0,
            minHeight: 'calc(100vh - 200px)'
          }}
        >
          <Box sx={{ flex: 1 }}>
            <KonvaCanvas
              image={image}
              cropAreas={cropAreas}
              selectedAreaId={selectedAreaId}
              onImageUpload={handleImageUpload}
              onAreaSelect={setSelectedAreaId}
              onAreaUpdate={updateCropArea}
              onImageDelete={handleImageDelete}
            />
          </Box>
          <Box
            sx={{
              width: 350,
              height: 'fit-content',
              position: 'sticky',
              top: 0
            }}
          >
            <Sidebar
              cropAreas={cropAreas}
              selectedAreaId={selectedAreaId}
              image={image}
              onAddArea={addCropArea}
              onUpdateArea={updateCropArea}
              onDeleteArea={deleteCropArea}
              onSelectArea={setSelectedAreaId}
            />
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  )
}

export default App