import { useState } from 'react'
import { 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Typography, 
  Box, 
  Chip 
} from '@mui/material'
import { Add } from '@mui/icons-material'
import { CropArea } from '../types'
import CropAreaEditor from './CropAreaEditor'

interface CropAreaListProps {
  cropAreas: CropArea[]
  selectedAreaId: string | null
  imageBounds?: { width: number; height: number }
  hasImage?: boolean
  onAddArea: (aspectRatio: CropArea['aspectRatio'], customAspectRatio?: string) => void
  onUpdateArea: (id: string, updates: Partial<CropArea>) => void
  onDeleteArea: (id: string) => void
  onSelectArea: (id: string | null) => void
}

const CropAreaList = ({
  cropAreas,
  selectedAreaId,
  imageBounds,
  hasImage,
  onAddArea,
  onUpdateArea,
  onDeleteArea,
  onSelectArea
}: CropAreaListProps) => {
  const [showAspectRatioDialog, setShowAspectRatioDialog] = useState(false)
  const [showCustomRatioInput, setShowCustomRatioInput] = useState(false)
  const [customRatio, setCustomRatio] = useState('')

  const handleAddArea = (aspectRatio: CropArea['aspectRatio']) => {
    if (aspectRatio === 'free') {
      setShowCustomRatioInput(true)
      return
    }
    onAddArea(aspectRatio)
    setShowAspectRatioDialog(false)
  }

  const handleCustomRatioSubmit = () => {
    if (customRatio.trim() && /^\d+(\.\d+)?:\d+(\.\d+)?$/.test(customRatio.trim())) {
      onAddArea('free', customRatio.trim())
      setCustomRatio('')
      setShowCustomRatioInput(false)
      setShowAspectRatioDialog(false)
    }
  }

  const handleCustomRatioCancel = () => {
    setCustomRatio('')
    setShowCustomRatioInput(false)
  }

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" component="h2" sx={{ mb: 2, fontWeight: 'bold' }}>
          切り出し範囲設定
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setShowAspectRatioDialog(true)}
            disabled={!hasImage}
            size="medium"
            aria-label="新しい切り出し範囲を追加"
            title={!hasImage ? '画像をアップロードしてから範囲を追加してください' : '新しい切り出し範囲を追加'}
          >
            範囲を追加
          </Button>
          <Chip 
            label={`${cropAreas.length}個`} 
            color="primary"
            size="small"
          />
        </Box>
      </Box>

      <Dialog
        open={showAspectRatioDialog && !showCustomRatioInput}
        onClose={() => setShowAspectRatioDialog(false)}
        maxWidth="xs"
        fullWidth
        aria-labelledby="aspect-ratio-dialog-title"
      >
        <DialogTitle id="aspect-ratio-dialog-title">アスペクト比を選択</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mt: 1 }}>
            <Button 
              variant="outlined" 
              onClick={() => handleAddArea('16:9')}
              size="large"
            >
              16:9
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => handleAddArea('4:3')}
              size="large"
            >
              4:3
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => handleAddArea('1:1')}
              size="large"
            >
              1:1
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => handleAddArea('free')}
              size="large"
              color="secondary"
            >
              カスタム
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAspectRatioDialog(false)}>
            キャンセル
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={showCustomRatioInput}
        onClose={handleCustomRatioCancel}
        maxWidth="xs"
        fullWidth
        aria-labelledby="custom-ratio-dialog-title"
      >
        <DialogTitle id="custom-ratio-dialog-title">カスタムアスペクト比を入力</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="アスペクト比"
            fullWidth
            variant="outlined"
            value={customRatio}
            onChange={(e) => setCustomRatio(e.target.value)}
            placeholder="例: 3:2, 5:4, 2.35:1"
            helperText="横:縦の比率で入力してください"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCustomRatioCancel}>
            キャンセル
          </Button>
          <Button 
            variant="contained"
            onClick={handleCustomRatioSubmit}
            disabled={!customRatio.trim() || !/^\d+(\.\d+)?:\d+(\.\d+)?$/.test(customRatio.trim())}
          >
            追加
          </Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ mt: 2 }}>
        {cropAreas.map(area => (
          <CropAreaEditor
            key={area.id}
            area={area}
            onUpdate={(updates) => onUpdateArea(area.id, updates)}
            onDelete={() => onDeleteArea(area.id)}
            isSelected={selectedAreaId === area.id}
            onSelect={() => onSelectArea(area.id)}
            imageBounds={imageBounds}
          />
        ))}
        {cropAreas.length === 0 && (
          <Box 
            sx={{ 
              textAlign: 'center', 
              py: 4, 
              color: 'text.secondary',
              border: '2px dashed',
              borderColor: 'divider',
              borderRadius: 1,
              bgcolor: 'background.paper'
            }}
          >
            <Typography variant="body2">
              切り出し範囲がありません。<br />
              「範囲を追加」ボタンで追加してください。
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default CropAreaList