import React from 'react';
import Editor from '@monaco-editor/react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';

function CodeInputPanel({ code, setCode, onGenerate, isLoading }) {
  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
      
      {/* HEADER: Title and Button on the same line */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 2 
      }}>
        <Typography variant="h6" fontWeight="bold" sx={{ color: '#000000' }}>
          Your Java Code
        </Typography>

        <Button
          variant="contained"
          onClick={onGenerate}
          disabled={isLoading || !code}
          size="small"
          sx={{ 
            px: 3,
            py: 0.5, 
            bgcolor: '#00E676', 
            color: '#000000', 
            fontWeight: 'bold',
            border: '2px solid #000000',
            boxShadow: '3px 3px 0px #000000',
            textTransform: 'uppercase',
            fontSize: '0.75rem',
            '&:hover': { 
              bgcolor: '#00C853',
              boxShadow: '1px 1px 0px #000000'
            },
            '&.Mui-disabled': {
              bgcolor: '#e0e0e0',
              border: '2px solid #999'
            }
          }}
        >
          {isLoading ? <CircularProgress size={16} sx={{ color: '#000' }} /> : 'Generate'}
        </Button>
      </Box>

      {/* EDITOR BOX */}
      <Box sx={{ 
        flexGrow: 1, 
        border: '2px solid #000000', 
        borderRadius: '8px', 
        overflow: 'hidden', 
        bgcolor: '#ffffff' 
      }}>
        <Editor
          height="100%"
          defaultLanguage="java"
          theme="light"
          value={code}
          onChange={(value) => setCode(value)}
          options={{ 
            minimap: { enabled: false },
            fontSize: 14,
            padding: { top: 16 },
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
          }}
        />
      </Box>
    </Box>
  );
}

export default CodeInputPanel;