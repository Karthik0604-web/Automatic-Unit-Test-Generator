import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, List, ListItem, ListItemButton, 
  ListItemText, CircularProgress, Divider, IconButton 
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import CodeIcon from '@mui/icons-material/Code';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

function HistorySidebar({ userId, onSelectHistory, refreshTrigger }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    fetch(`http://localhost:8080/api/history/${userId}`)
      .then(res => res.json())
      .then(data => {
        setHistory(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch history:", err);
        setLoading(false);
      });
  }, [userId, refreshTrigger]);

  // --- FAIL-SAFE DELETE FUNCTION ---
  const handleDelete = async (e, id) => {
    e.preventDefault();   // Stops browser's default link behavior
    e.stopPropagation();  // Stops the click from hitting the row underneath
    
    console.log("Attempting to delete ID:", id); 
    
    try {
      const response = await fetch(`http://localhost:8080/api/history/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        console.log("Successfully deleted ID:", id);
        // Instantly remove from the React state
        setHistory(prevHistory => prevHistory.filter(item => item.id !== id));
      } else {
        console.error("Server refused to delete. Status:", response.status);
      }
    } catch (error) {
      console.error("Network error during deletion:", error);
    }
  };

  return (
    <Box sx={{ width: 280, bgcolor: '#ffffff', borderRight: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <HistoryIcon sx={{ color: '#64748B', fontSize: 20 }} />
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A' }}>RECENT TESTS</Typography>
      </Box>
      <Divider sx={{ borderColor: '#F1F5F9' }} />
      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress size={24} sx={{ color: '#00E676' }} />
          </Box>
        ) : history.length > 0 ? (
          <List sx={{ p: 1 }}>
            {history.map((item, index) => {
              const testNumber = history.length - index; 

              return (
                <ListItem 
                  key={item.id} 
                  disablePadding 
                  secondaryAction={
                    <IconButton 
                      edge="end" 
                      onClick={(e) => handleDelete(e, item.id)} 
                      sx={{ color: '#ef4444', '&:hover': { bgcolor: '#fee2e2' } }}
                      aria-label="delete"
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  }
                  sx={{ mb: 0.5 }}
                >
                  <ListItemButton 
                    onClick={() => onSelectHistory(item)}
                    sx={{ borderRadius: '8px', pr: 6, '&:hover': { bgcolor: '#F1F5F9' } }}
                  >
                    <CodeIcon sx={{ fontSize: 16, mr: 1.5, color: '#00E676' }} />
                    <ListItemText 
                      primary={`Test #${testNumber}`} 
                      primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 500, color: '#334155' }} 
                      secondary="Java Unit Test" 
                      secondaryTypographyProps={{ fontSize: '0.7rem' }} 
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        ) : (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: '#94A3B8' }}>No recent history found.</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default HistorySidebar;