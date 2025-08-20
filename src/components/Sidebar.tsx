import { Stack, Paper } from '@mui/material'
import { CropArea, ImageData } from '../types'
import CropAreaList from './CropAreaList'
import DownloadSection from './DownloadSection'

interface SidebarProps {
  cropAreas: CropArea[]
  selectedAreaId: string | null
  image?: ImageData | null
  onAddArea: (aspectRatio: CropArea['aspectRatio']) => void
  onUpdateArea: (id: string, updates: Partial<CropArea>) => void
  onDeleteArea: (id: string) => void
  onSelectArea: (id: string | null) => void
}

const Sidebar = ({
  cropAreas,
  selectedAreaId,
  image,
  onAddArea,
  onUpdateArea,
  onDeleteArea,
  onSelectArea
}: SidebarProps) => {
  return (
    <Stack spacing={2}>
      <Paper 
        elevation={2} 
        sx={{ p: 2}}
      >
        <CropAreaList 
          cropAreas={cropAreas}
          selectedAreaId={selectedAreaId}
          imageBounds={image ? { width: image.width, height: image.height } : undefined}
          hasImage={!!image}
          onAddArea={onAddArea}
          onUpdateArea={onUpdateArea}
          onDeleteArea={onDeleteArea}
          onSelectArea={onSelectArea}
        />
      </Paper>
      <Paper 
        elevation={2} 
        sx={{ p: 2}}
      >
        <DownloadSection 
          cropAreas={cropAreas.filter(area => area.visible)}
          image={image}
        />
      </Paper>
    </Stack>
  )
}

export default Sidebar