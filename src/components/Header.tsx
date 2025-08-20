import { memo } from 'react'
import { Paper, Typography } from '@mui/material'

const Header = () => {
  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        mb: 3,
        textAlign: 'center',
      }}
    >
      <Typography 
        variant="h4" 
        component="h1" 
        color="secondary.main"
        sx={{ 
          mb: 1,
          fontWeight: 'bold'
        }}
      >
        画像切り出しアプリ
      </Typography>
      <Typography 
        variant="body1" 
        color="text.secondary"
        sx={{ m: 0 }}
      >
        1枚の画像から複数の範囲を切り出して、個別の画像として保存できます
      </Typography>
    </Paper>
  )
}

export default memo(Header)