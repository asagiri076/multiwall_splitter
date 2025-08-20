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
        マルチディスプレイ壁紙作成
      </Typography>
      <Typography 
        variant="body1" 
        color="text.secondary"
        sx={{ m: 0 }}
      >
        1枚の壁紙画像から複数のモニター用画像を切り出してマルチディスプレイ環境を構築
      </Typography>
    </Paper>
  )
}

export default memo(Header)