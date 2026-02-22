import React from 'react';
import Editor from '@monaco-editor/react';
import { 
  Box, Typography, Alert, CircularProgress, Paper, Divider, 
  Accordion, AccordionSummary, AccordionDetails, Chip 
} from '@mui/material';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CodeIcon from '@mui/icons-material/Code';
import { motion, AnimatePresence } from 'framer-motion';

// Helper to guess the type of edge case for a visual tag
const getEdgeCaseType = (description) => {
  const desc = description.toLowerCase();
  if (desc.includes('null') || desc.includes('empty')) return { label: 'Null/Empty', color: 'warning' };
  if (desc.includes('exception') || desc.includes('throw') || desc.includes('error')) return { label: 'Exception', color: 'error' };
  if (desc.includes('negative') || desc.includes('max') || desc.includes('min') || desc.includes('bound')) return { label: 'Boundary', color: 'info' };
  return { label: 'Standard', color: 'success' };
};

function GeneratedOutputPanel({ generatedCode, suggestions, error, isLoading }) {
  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      
      <Typography variant="h6" fontWeight="700" sx={{ color: '#0F172A', mb: 2, letterSpacing: '-0.01em' }}>
        Generated Test Suite
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>{error}</Alert>}

      {/* CODE OUTPUT BOX */}
      <Box sx={{ 
        flexGrow: 1, 
        border: '1px solid #E2E8F0', 
        borderRadius: '8px', 
        overflow: 'hidden', 
        mb: 3, 
        minHeight: '400px', 
        bgcolor: '#ffffff',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
      }}>
        {isLoading && (
          <Box sx={{ position: 'absolute', inset: 0, zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(255,255,255,0.8)' }}>
            <CircularProgress sx={{ color: '#00E676' }} />
          </Box>
        )}
        
        <AnimatePresence mode="wait">
          {generatedCode ? (
            <motion.div key="editor" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ height: '100%' }}>
              <Editor 
                height="100%" 
                defaultLanguage="java" 
                theme="light" 
                value={generatedCode} 
                options={{ readOnly: true, minimap: { enabled: false }, fontSize: 14, wordWrap: 'on', padding: { top: 16 } }} 
              />
            </motion.div>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                Your generated JUnit tests will appear here.
              </Typography>
            </Box>
          )}
        </AnimatePresence>
      </Box>

      {/* SMART EDGE CASE ANALYSIS PANEL */}
      {suggestions && suggestions.length > 0 && (
        <Paper elevation={0} sx={{ 
          p: 3, 
          border: '1px solid #E2E8F0', 
          bgcolor: '#ffffff', 
          borderRadius: '8px', 
          maxHeight: '350px', 
          overflowY: 'auto' 
        }}>
          <Typography variant="subtitle1" fontWeight="800" sx={{ color: '#0F172A', display: 'flex', alignItems: 'center', mb: 3 }}>
            <LightbulbIcon sx={{ color: '#00E676', mr: 1 }} /> Identified Edge Cases
          </Typography>
          
          {suggestions.map((suggestion, index) => (
            <Box key={index} sx={{ mb: 4 }}>
              
              {/* Target Method Header */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CodeIcon sx={{ color: '#64748B', mr: 1, fontSize: 20 }} />
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155', fontFamily: 'monospace', fontSize: '14px' }}>
                  {suggestion.targetMethodName || suggestion.methodSignature}
                </Typography>
              </Box>

              {/* Collapsible Edge Cases */}
              {suggestion.edgeCases?.map((ec, i) => {
                const tagInfo = getEdgeCaseType(ec.description);
                
                return (
                  <Accordion 
                    key={i} 
                    disableGutters 
                    elevation={0} 
                    sx={{ 
                      border: '1px solid #E2E8F0', 
                      mb: 1, 
                      borderRadius: '6px !important',
                      '&:before': { display: 'none' } // removes default MUI divider line
                    }}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#94A3B8' }} />} sx={{ '&:hover': { bgcolor: '#F8FAFC' } }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2 }}>
                        {/* Visual Tag */}
                        <Chip 
                          label={tagInfo.label} 
                          color={tagInfo.color} 
                          size="small" 
                          variant="outlined"
                          sx={{ fontWeight: 600, fontSize: '0.7rem', minWidth: '80px' }} 
                        />
                        {/* Plain English Description */}
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A' }}>
                          {ec.description}
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    
                    <AccordionDetails sx={{ bgcolor: '#0F172A', borderBottomLeftRadius: '6px', borderBottomRightRadius: '6px', p: 2 }}>
                      {/* Clean Code Snippet */}
                      <Typography component="pre" sx={{ 
                        m: 0, color: '#00E676', fontSize: '13px', fontFamily: 'monospace', overflowX: 'auto' 
                      }}>
                        {ec.snippet}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                );
              })}
              
              {index < suggestions.length - 1 && <Divider sx={{ mt: 3, borderColor: '#F1F5F9' }} />}
            </Box>
          ))}
        </Paper>
      )}
    </Box>
  );
}

export default GeneratedOutputPanel;
