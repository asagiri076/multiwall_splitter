import { useState, useEffect, useCallback, memo } from 'react'
import { 
  Paper, 
  Box, 
  Checkbox, 
  TextField, 
  IconButton, 
  Chip, 
  Typography,
  Tooltip,
  Grid
} from '@mui/material'
import { Edit, Check, Delete } from '@mui/icons-material'
import { CropArea } from '../types'
import { maintainAspectRatio } from '../utils/aspectRatio'

interface CropAreaEditorProps {
  area: CropArea
  onUpdate: (updates: Partial<CropArea>) => void
  onDelete: () => void
  isSelected: boolean
  onSelect: () => void
  imageBounds?: { width: number; height: number }
}

const CropAreaEditor = ({ 
  area, 
  onUpdate, 
  onDelete, 
  isSelected, 
  onSelect,
  imageBounds
}: CropAreaEditorProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editValues, setEditValues] = useState({
    x: Math.round(area.x),
    y: Math.round(area.y),
    width: Math.round(area.width),
    height: Math.round(area.height)
  })

  // Update edit values when area changes
  useEffect(() => {
    setEditValues({
      x: Math.round(area.x),
      y: Math.round(area.y),
      width: Math.round(area.width),
      height: Math.round(area.height)
    })
  }, [area.x, area.y, area.width, area.height])

  const handleEditToggle = () => {
    setIsEditing(!isEditing)
  }

  const handleValueChange = (field: keyof typeof editValues, value: string) => {
    const numValue = parseInt(value) || 0
    let clampedValue = Math.max(0, numValue)
    
    // Clamp to image bounds
    if (imageBounds) {
      if (field === 'x') {
        clampedValue = Math.min(clampedValue, imageBounds.width - editValues.width)
      } else if (field === 'y') {
        clampedValue = Math.min(clampedValue, imageBounds.height - editValues.height)
      } else if (field === 'width') {
        clampedValue = Math.min(clampedValue, imageBounds.width - editValues.x)
        clampedValue = Math.max(20, clampedValue)
      } else if (field === 'height') {
        clampedValue = Math.min(clampedValue, imageBounds.height - editValues.y)
        clampedValue = Math.max(20, clampedValue)
      }
    }
    
    setEditValues(prev => ({ ...prev, [field]: clampedValue }))
    
    // Update GUI in real-time
    if (isEditing) {
      const newValues = { ...editValues, [field]: clampedValue }
      
      // Maintain aspect ratio if needed
      let finalValues = newValues
      if (area.aspectRatio !== 'free' && (field === 'width' || field === 'height')) {
        const maintainedSize = maintainAspectRatio(
          area,
          newValues.width,
          newValues.height,
          field === 'width' ? 'width' : 'height'
        )
        finalValues = {
          ...newValues,
          width: Math.round(maintainedSize.width),
          height: Math.round(maintainedSize.height)
        }
        
        // Re-apply bounds constraints
        if (imageBounds) {
          finalValues.width = Math.min(finalValues.width, imageBounds.width - finalValues.x)
          finalValues.height = Math.min(finalValues.height, imageBounds.height - finalValues.y)
        }
        
        setEditValues(finalValues)
      }
      
      onUpdate({
        x: finalValues.x,
        y: finalValues.y,
        width: finalValues.width,
        height: finalValues.height
      })
    }
  }

  const handleNameChange = (name: string) => {
    onUpdate({ name })
  }

  return (
    <Paper
      elevation={isSelected ? 3 : 1}
      sx={{
        p: 1.5,
        mb: 1,
        borderLeft: isSelected ? 3 : 0,
        borderLeftColor: 'primary.main',
        bgcolor: isSelected ? 'action.selected' : 'background.paper',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        '&:hover': {
          elevation: 2,
          bgcolor: isSelected ? 'action.selected' : 'action.hover',
        }
      }}
      onClick={onSelect}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
          <Checkbox
            checked={area.visible}
            onChange={(e) => {
              e.stopPropagation()
              onUpdate({ visible: e.target.checked })
            }}
            size="small"
            color="primary"
            sx={{ p: 0.5 }}
          />
          <TextField
            size="small"
            value={area.name}
            onChange={(e) => handleNameChange(e.target.value)}
            onFocus={(e) => {
              e.stopPropagation()
              onSelect()
            }}
            onClick={(e) => e.stopPropagation()}
            variant="outlined"
            sx={{ 
              '& .MuiInputBase-input': { 
                fontSize: '0.75rem',
                py: 0.5,
                px: 1,
              },
              width: '90px'
            }}
          />
          <Chip
            label={area.aspectRatio === 'free' && area.customAspectRatio 
              ? area.customAspectRatio 
              : area.aspectRatio}
            size="small"
            color={area.aspectRatio === 'free' ? 'secondary' : 'primary'}
            variant="outlined"
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title={isEditing ? '編集完了' : '数値編集'}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation()
                handleEditToggle()
              }}
              color={isEditing ? 'primary' : 'default'}
              sx={{ 
                bgcolor: isEditing ? 'primary.main' : 'transparent',
                color: isEditing ? 'primary.contrastText' : 'text.secondary',
                '&:hover': {
                  bgcolor: isEditing ? 'primary.dark' : 'action.hover',
                }
              }}
            >
              {isEditing ? <Check fontSize="small" /> : <Edit fontSize="small" />}
            </IconButton>
          </Tooltip>
          <Tooltip title="削除">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  bgcolor: 'error.main',
                  color: 'error.contrastText',
                }
              }}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {isEditing ? (
        <Grid container spacing={1} sx={{ mt: 0.5 }}>
          <Grid item xs={6}>
            <TextField
              label="X"
              type="number"
              size="small"
              value={editValues.x}
              onChange={(e) => handleValueChange('x', e.target.value)}
              inputProps={{ min: 0 }}
              fullWidth
              sx={{ 
                '& .MuiInputBase-input': { 
                  fontSize: '0.7rem',
                  fontFamily: 'monospace'
                },
                '& .MuiInputLabel-root': {
                  fontSize: '0.7rem'
                }
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Y"
              type="number"
              size="small"
              value={editValues.y}
              onChange={(e) => handleValueChange('y', e.target.value)}
              inputProps={{ min: 0 }}
              fullWidth
              sx={{ 
                '& .MuiInputBase-input': { 
                  fontSize: '0.7rem',
                  fontFamily: 'monospace'
                },
                '& .MuiInputLabel-root': {
                  fontSize: '0.7rem'
                }
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="W"
              type="number"
              size="small"
              value={editValues.width}
              onChange={(e) => handleValueChange('width', e.target.value)}
              inputProps={{ min: 1 }}
              fullWidth
              sx={{ 
                '& .MuiInputBase-input': { 
                  fontSize: '0.7rem',
                  fontFamily: 'monospace'
                },
                '& .MuiInputLabel-root': {
                  fontSize: '0.7rem'
                }
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="H"
              type="number"
              size="small"
              value={editValues.height}
              onChange={(e) => handleValueChange('height', e.target.value)}
              inputProps={{ min: 1 }}
              fullWidth
              sx={{ 
                '& .MuiInputBase-input': { 
                  fontSize: '0.7rem',
                  fontFamily: 'monospace'
                },
                '& .MuiInputLabel-root': {
                  fontSize: '0.7rem'
                }
              }}
            />
          </Grid>
        </Grid>
      ) : (
        <Box 
          onClick={onSelect}
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 0.5,
            p: 0.5,
            borderRadius: 1,
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
            '&:hover': {
              bgcolor: 'action.hover',
            }
          }}
        >
          <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
            X: {Math.round(area.x)}
          </Typography>
          <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
            Y: {Math.round(area.y)}
          </Typography>
          <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
            W: {Math.round(area.width)}
          </Typography>
          <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
            H: {Math.round(area.height)}
          </Typography>
        </Box>
      )}
    </Paper>
  )
}

export default memo(CropAreaEditor)