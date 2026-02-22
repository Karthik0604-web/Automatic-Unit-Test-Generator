import React, { useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

// Component Imports
import CodeInputPanel from './components/CodeInputPanel';
import GeneratedOutputPanel from './components/GeneratedOutputPanel';
import HistorySidebar from './components/HistorySidebar';

// Material UI Imports
import { 
  Typography, Button, Box, TextField, Alert, 
  Link, Avatar, IconButton, Menu, MenuItem, CssBaseline 
} from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { ThemeProvider } from '@mui/material/styles';
import { lightTheme, darkTheme } from './components/theme';

// --- 1. DASHBOARD COMPONENT ---
function Dashboard({ userInfo, onLogout, toggleTheme, currentTheme }) {
  const [inputCode, setInputCode] = useState('public class Calculator {\n    public int add(int a, int b) {\n        return a + b;\n    }\n}');
  const [generatedCode, setGeneratedCode] = useState('');
  const [suggestions, setSuggestions] = useState([]); 
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSelectHistory = (historyItem) => {
    setInputCode(historyItem.sourceCode);
    setGeneratedCode(historyItem.generatedTestCode);
    setSuggestions([]); 
    setError('');
  };

  const handleGenerate = async () => {
    setIsLoading(true); setError(''); setGeneratedCode(''); setSuggestions([]); 
    try {
      const response = await fetch('http://localhost:8080/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceCode: inputCode, userId: userInfo?.id }),
      });
      
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      
      const data = await response.json();
      setGeneratedCode(data.mainTestFileContent);
      setSuggestions(data.suggestions || []);
      setRefreshTrigger(prev => prev + 1);
      
    } catch (err) {
      setError(err.message || 'Failed to connect to the backend.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: '#F8FAFC' }}>
      <Box component="header" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: '#ffffff', color: '#0F172A', borderBottom: '1px solid #E2E8F0', zIndex: 10 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
          AutoTest<Box component="span" sx={{ color: '#00E676' }}>Gen</Box>
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={toggleTheme} size="small">{currentTheme === 'light' ? <DarkModeIcon /> : <LightModeIcon />}</IconButton>
          <Box sx={{ display: { xs: 'none', md: 'flex' }, flexDirection: 'column', alignItems: 'flex-end' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{userInfo?.username || 'User'}</Typography>
          </Box>
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ p: '2px' }}>
            <Avatar sx={{ bgcolor: '#0F172A', color: '#00E676', fontSize: '0.8rem', fontWeight: 700, width: 32, height: 32 }}>
              {(userInfo?.username || 'U').charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)} sx={{ mt: 1 }}>
            <MenuItem onClick={onLogout} sx={{ color: '#ef4444', fontSize: '0.9rem', fontWeight: 600 }}>Logout</MenuItem>
          </Menu>
        </Box>
      </Box>
      
      <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        <HistorySidebar userId={userInfo?.id} onSelectHistory={handleSelectHistory} refreshTrigger={refreshTrigger} />
        <Box component="main" sx={{ flexGrow: 1, display: 'flex', p: 3, gap: 3, overflowY: 'auto', bgcolor: '#F8FAFC' }}>
          <CodeInputPanel code={inputCode} setCode={setInputCode} onGenerate={handleGenerate} isLoading={isLoading} />
          <GeneratedOutputPanel generatedCode={generatedCode} suggestions={suggestions} error={error} isLoading={isLoading} />
        </Box>
      </Box>
    </Box>
  );
}

// --- 2. AUTH PAGE COMPONENT WITH STRICT VALIDATION ---
function AuthPage({ onLogin, toggleTheme, currentTheme }) {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ fullName: '', email: '', username: '', password: '' });
  
  const [fieldErrors, setFieldErrors] = useState({ fullName: '', email: '', username: '', password: '' });
  const [formError, setFormError] = useState('');

  // UPDATED STRICT Regex Patterns
  const FULLNAME_REGEX = /^[a-zA-Z\s]{2,50}$/; 
  
  // REQUIRES: At least 1 letter, 1 number, and 1 symbol (_ . -). Total length 3-20.
  const STRICT_USERNAME_REGEX = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[_.-])[a-zA-Z0-9_.-]{3,20}$/; 
  
  const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const validateField = (name, value, isSignUpMode) => {
    if (name === 'fullName' && isSignUpMode) {
      if (value.length > 0 && !FULLNAME_REGEX.test(value)) {
        return "Letters and spaces only. No numbers or symbols.";
      }
    }
    if (name === 'username') {
      if (isSignUpMode) {
        // Strict check for new accounts
        if (value.length > 0 && !STRICT_USERNAME_REGEX.test(value)) {
          return "Must contain at least 1 letter, 1 number, and 1 symbol (_ . -)";
        }
      } else {
        // Basic check for existing accounts trying to log in
        if (value.length > 0 && value.length < 3) {
          return "Username must be at least 3 characters.";
        }
      }
    }
    if (name === 'email' && isSignUpMode) {
      if (value.length > 0 && !EMAIL_REGEX.test(value)) {
        return "Please enter a valid email address format.";
      }
    }
    if (name === 'password' && isSignUpMode) {
      if (value.length > 0 && !PASSWORD_REGEX.test(value)) {
        return "Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character.";
      }
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Real-time validation updates
    setFieldErrors({
      ...fieldErrors,
      [name]: validateField(name, value, !isLogin)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const hasErrors = isLogin 
      ? Boolean(fieldErrors.username) 
      : Boolean(fieldErrors.fullName || fieldErrors.username || fieldErrors.email || fieldErrors.password);

    if (hasErrors) {
      setFormError('Please fix the highlighted fields before submitting.');
      return;
    }

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    
    try {
      const response = await fetch(`http://localhost:8080${endpoint}`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        if (isLogin) {
          const userData = await response.json(); 
          onLogin(userData); 
          navigate('/dashboard'); 
        } else {
          setIsLogin(true); 
          setFormData({ ...formData, password: '' });
          setFormError(''); 
        }
      } else {
        const msg = await response.text(); 
        setFormError(msg || 'Action failed.');
      }
    } catch (err) { 
      setFormError('Server unreachable.'); 
    }
  };

  const isSubmitDisabled = isLogin 
    ? Boolean(fieldErrors.username) 
    : Boolean(fieldErrors.fullName || fieldErrors.username || fieldErrors.email || fieldErrors.password);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', width: '100vw', bgcolor: '#F8FAFC' }}>
      <Box sx={{ 
        display: { xs: 'none', md: 'flex' }, width: '45%', bgcolor: '#0F172A', 
        flexDirection: 'column', justifyContent: 'center', p: 8, position: 'relative', overflow: 'hidden' 
      }}>
        <Box sx={{ position: 'absolute', top: -100, left: -100, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,230,118,0.08) 0%, rgba(15,23,42,0) 70%)' }} />
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
          <Typography variant="h2" sx={{ color: '#fff', mb: 1 }}>AutoTest<span style={{ color: '#00E676' }}>Gen</span></Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 400 }}>Automated JUnit Testing for modern Java teams.</Typography>
        </motion.div>
      </Box>

      <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={isLogin ? 'login' : 'signup'}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            style={{ width: '100%', maxWidth: '380px' }}
          >
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#0F172A' }}>{isLogin ? 'Welcome back' : 'Get started'}</Typography>
            <Typography variant="body2" sx={{ mb: 4, color: '#64748B' }}>{isLogin ? 'Enter your credentials to access your tests.' : 'Fill in the details to create your account.'}</Typography>

            {formError && <Alert severity="error" variant="outlined" sx={{ mb: 3, borderRadius: '8px', color: '#ef4444', borderColor: '#fee2e2' }}>{formError}</Alert>}

            <form onSubmit={handleSubmit}>
              {!isLogin && (
                <TextField 
                  fullWidth 
                  label="Full Name" 
                  name="fullName" 
                  value={formData.fullName}
                  onChange={handleChange} 
                  sx={{ mb: 2 }} 
                  required 
                  size="small"
                  error={Boolean(fieldErrors.fullName)}
                  helperText={fieldErrors.fullName} 
                />
              )}
              
              <TextField 
                fullWidth 
                label="Username" 
                name="username" 
                value={formData.username}
                onChange={handleChange} 
                sx={{ mb: 2 }} 
                required 
                size="small" 
                error={Boolean(fieldErrors.username)}
                helperText={fieldErrors.username}
              />
              
              {!isLogin && (
                <TextField 
                  fullWidth 
                  label="Email address" 
                  name="email" 
                  type="email" 
                  value={formData.email}
                  onChange={handleChange} 
                  sx={{ mb: 2 }} 
                  required 
                  size="small"
                  error={Boolean(fieldErrors.email)}
                  helperText={fieldErrors.email}
                />
              )}
              
              <TextField 
                fullWidth 
                label="Password" 
                name="password" 
                type="password" 
                value={formData.password}
                onChange={handleChange} 
                sx={{ mb: 4 }} 
                required 
                size="small" 
                error={Boolean(!isLogin && fieldErrors.password)}
                helperText={!isLogin ? fieldErrors.password : ''}
              />

              <Button 
                type="submit" 
                fullWidth 
                variant="contained" 
                disableElevation 
                disabled={isSubmitDisabled}
                sx={{ 
                  py: 1.4, bgcolor: '#00E676', color: '#0F172A', fontWeight: 700, borderRadius: '8px',
                  '&:hover': { bgcolor: '#00C853', boxShadow: '0 8px 20px rgba(0,230,118,0.2)' },
                  '&.Mui-disabled': { bgcolor: '#E2E8F0', color: '#94A3B8' }
                }}
              >
                {isLogin ? 'Sign In' : 'Create Account'}
              </Button>
            </form>

            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Link 
                component="button" 
                variant="body2" 
                onClick={() => {
                  setIsLogin(!isLogin);
                  setFieldErrors({ fullName: '', email: '', username: '', password: '' });
                  setFormError('');
                }} 
                sx={{ color: '#64748B', fontWeight: 600, textDecoration: 'none', '&:hover': { color: '#00E676' } }}
              >
                {isLogin ? "New user? Create an account" : "Already have an account? Log in"}
              </Link>
            </Box>
          </motion.div>
        </AnimatePresence>
      </Box>
    </Box>
  );
}

// --- 3. MAIN APP WRAPPER ---
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [mode, setMode] = useState('light');
  
  const theme = useMemo(() => (mode === 'light' ? lightTheme : darkTheme), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={!isAuthenticated ? 
            <AuthPage onLogin={(u) => {setUserInfo(u); setIsAuthenticated(true);}} toggleTheme={() => setMode(mode === 'light' ? 'dark' : 'light')} currentTheme={mode} /> 
            : <Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={isAuthenticated ? 
            <Dashboard userInfo={userInfo} onLogout={() => setIsAuthenticated(false)} toggleTheme={() => setMode(mode === 'light' ? 'dark' : 'light')} currentTheme={mode} /> 
            : <Navigate to="/" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}