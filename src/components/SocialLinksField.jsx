import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  IconButton,
  Stack,
  Typography,
  MenuItem,
  InputAdornment,
  Paper
} from '@mui/material';
import {
  Add,
  Delete,
  Link,
  GitHub,
  LinkedIn,
  Twitter,
  Instagram,
  Facebook,
  Language,
  YouTube
} from '@mui/icons-material';

const PLATFORMS = [
  { value: 'github', label: 'GitHub', icon: <GitHub fontSize="small" /> },
  { value: 'linkedin', label: 'LinkedIn', icon: <LinkedIn fontSize="small" /> },
  { value: 'twitter', label: 'Twitter', icon: <Twitter fontSize="small" /> },
  { value: 'instagram', label: 'Instagram', icon: <Instagram fontSize="small" /> },
  { value: 'facebook', label: 'Facebook', icon: <Facebook fontSize="small" /> },
  { value: 'youtube', label: 'YouTube', icon: <YouTube fontSize="small" /> },
  { value: 'website', label: 'Website', icon: <Language fontSize="small" /> },
  { value: 'other', label: 'Other', icon: <Link fontSize="small" /> }
];

// Map platform value to the actual icon
const getPlatformIcon = (platformValue) => {
  const platform = PLATFORMS.find(p => p.value === platformValue);
  return platform ? platform.icon : <Link fontSize="small" />;
};

export const SocialLinksField = ({ value, onChange }) => {

  const [links, setLinks] = useState([]);
  const [newPlatform, setNewPlatform] = useState('github');
  const [newUrl, setNewUrl] = useState('');
  const [urlError, setUrlError] = useState('');

  useEffect(() => {
    if (value) {
      try {
        const parsedValue = typeof value === 'string' ? JSON.parse(value) : value;
        const linksArray = Object.entries(parsedValue).map(([platform, url]) => ({ platform, url }));
        setLinks(linksArray);
      } catch (e) {
        console.error("Error parsing social links:", e);
        setLinks([]);
      }
    } else {
      setLinks([]);
    }
  }, [value]);


  const validateUrl = (url) => {
    if (!url) return "URL is required";
    
    try {
      new URL(url);
      return "";
    } catch (e) {
      return "Please enter a valid URL (including http:// or https://)";
    }
  };

  const handleAddLink = () => {

    const error = validateUrl(newUrl);
    setUrlError(error);
    
    if (error) return;
    
    const updatedLinks = [...links, { platform: newPlatform, url: newUrl }];
    setLinks(updatedLinks);
    
    const linksObject = updatedLinks.reduce((obj, link) => {
      obj[link.platform] = link.url;
      return obj;
    }, {});
    
    onChange(JSON.stringify(linksObject));
    
    setNewUrl('');
    setNewPlatform('github');
  };

  const handleRemoveLink = (indexToRemove) => {
    const updatedLinks = links.filter((_, index) => index !== indexToRemove);
    setLinks(updatedLinks);
    
    if (updatedLinks.length === 0) {
      onChange('');
      return;
    }
    
    const linksObject = updatedLinks.reduce((obj, link) => {
      obj[link.platform] = link.url;
      return obj;
    }, {});
    
    onChange(JSON.stringify(linksObject));
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
        Social Links
      </Typography>
      {/* Display existing links */}
      {links.length > 0 && (
        <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
          <Stack spacing={1}>
            {links.map((link, index) => (
              <Box 
                key={index} 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  py: 1,
                  borderBottom: index < links.length - 1 ? '1px solid' : 'none',
                  borderColor: 'divider'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, overflow: 'hidden' }}>
                  {getPlatformIcon(link.platform)}
                  <Typography 
                    variant="body2" 
                    fontWeight={500}
                    sx={{ textTransform: 'capitalize' }}
                  >
                    {link.platform}:
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'text.secondary',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '280px'
                    }}
                  >
                    {link.url}
                  </Typography>
                </Box>
                <IconButton 
                  size="small" 
                  color="error" 
                  onClick={() => handleRemoveLink(index)}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Stack>
        </Paper>
      )}
      
      {/* Form to add new links */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
        <TextField
          select
          label="Platform"
          value={newPlatform}
          onChange={(e) => setNewPlatform(e.target.value)}
          sx={{ 
            minWidth: { xs: '100%', sm: '150px' },
            mb: { xs: 1, sm: 0 }
          }}
          InputProps={{
            sx: { borderRadius: 2 }
          }}
        >
          {PLATFORMS.map((platform) => (
            <MenuItem key={platform.value} value={platform.value}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {platform.icon}
                {platform.label}
              </Box>
            </MenuItem>
          ))}
        </TextField>
        
        <TextField
          fullWidth
          label="URL"
          placeholder="https://..."
          value={newUrl}
          onChange={(e) => {
            setNewUrl(e.target.value);
            if (urlError) setUrlError('');
          }}
          error={!!urlError}
          helperText={urlError}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Link />
              </InputAdornment>
            ),
            sx: { borderRadius: 2 }
          }}
        />
        
        <Button
          variant="contained"
          onClick={handleAddLink}
          startIcon={<Add />}
          sx={{
            borderRadius: 2,
            height: 56,
            minWidth: '100px',
            textTransform: 'none',
            ml: { xs: 'auto', sm: 0 }
          }}
        >
          Add
        </Button>
      </Box>
    </Box>
  );
};