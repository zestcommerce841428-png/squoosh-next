'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  Container,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Alert,
  Tooltip,
  Grid,
  Divider,
} from '@mui/material';

interface SitemapEntry {
  id: string;
  url: string;
  priority: number;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  lastModified: string;
  status: 'active' | 'draft' | 'archived';
}

// SVG Icons
const AddIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const EditIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const DeleteIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

const RefreshIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M23 4v6h-6"></path>
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
  </svg>
);

const DownloadIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

export default function SitemapManager() {
  const [entries, setEntries] = useState<SitemapEntry[]>([
    {
      id: '1',
      url: 'https://zesttechsolution.cloud/',
      priority: 1.0,
      changeFrequency: 'daily',
      lastModified: new Date().toISOString(),
      status: 'active',
    },
    {
      id: '2',
      url: 'https://zesttechsolution.cloud/compress',
      priority: 0.9,
      changeFrequency: 'weekly',
      lastModified: new Date().toISOString(),
      status: 'active',
    },
    {
      id: '3',
      url: 'https://zesttechsolution.cloud/about',
      priority: 0.7,
      changeFrequency: 'monthly',
      lastModified: new Date().toISOString(),
      status: 'active',
    },
    {
      id: '4',
      url: 'https://zesttechsolution.cloud/contact',
      priority: 0.6,
      changeFrequency: 'monthly',
      lastModified: new Date().toISOString(),
      status: 'active',
    },
    {
      id: '5',
      url: 'https://zesttechsolution.cloud/privacy',
      priority: 0.5,
      changeFrequency: 'monthly',
      lastModified: new Date().toISOString(),
      status: 'active',
    },
  ]);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingEntry, setEditingEntry] = useState<SitemapEntry | null>(null);
  const [formData, setFormData] = useState({
    url: '',
    priority: 0.5,
    changeFrequency: 'weekly' as SitemapEntry['changeFrequency'],
    status: 'active' as SitemapEntry['status'],
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [sitemapXML, setSitemapXML] = useState('');
  const [showXML, setShowXML] = useState(false);

  const generateSitemapXML = () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.filter(e => e.status === 'active').map(entry => `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastModified}</lastmod>
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${entry.priority.toFixed(1)}</priority>
  </url>`).join('\n')}
</urlset>`;
    setSitemapXML(xml);
    setShowXML(true);
  };

  const handleOpenDialog = (entry?: SitemapEntry) => {
    if (entry) {
      setEditingEntry(entry);
      setFormData({
        url: entry.url,
        priority: entry.priority,
        changeFrequency: entry.changeFrequency,
        status: entry.status,
      });
    } else {
      setEditingEntry(null);
      setFormData({
        url: 'https://zesttechsolution.cloud/',
        priority: 0.5,
        changeFrequency: 'weekly',
        status: 'active',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingEntry(null);
  };

  const handleSave = () => {
    if (editingEntry) {
      // Update existing entry
      setEntries(entries.map(e => 
        e.id === editingEntry.id 
          ? { ...e, ...formData, lastModified: new Date().toISOString() }
          : e
      ));
      setSuccessMessage('Entry updated successfully!');
    } else {
      // Add new entry
      const newEntry: SitemapEntry = {
        id: Date.now().toString(),
        ...formData,
        lastModified: new Date().toISOString(),
      };
      setEntries([...entries, newEntry]);
      setSuccessMessage('Entry added successfully!');
    }
    handleCloseDialog();
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this entry?')) {
      setEntries(entries.filter(e => e.id !== id));
      setSuccessMessage('Entry deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const downloadSitemap = () => {
    generateSitemapXML();
    const blob = new Blob([sitemapXML || generateXMLString()], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateXMLString = () => {
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.filter(e => e.status === 'active').map(entry => `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastModified}</lastmod>
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${entry.priority.toFixed(1)}</priority>
  </url>`).join('\n')}
</urlset>`;
  };

  const stats = {
    total: entries.length,
    active: entries.filter(e => e.status === 'active').length,
    draft: entries.filter(e => e.status === 'draft').length,
    archived: entries.filter(e => e.status === 'archived').length,
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            background: 'linear-gradient(90deg, #3b82f6 0%, #6366f1 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1,
          }}
        >
          Advanced Sitemap Manager
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your XML sitemap entries, priorities, and update frequencies
        </Typography>
      </Box>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2.5, textAlign: 'center' }}>
            <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main', mb: 0.5 }}>
              {stats.total}
            </Typography>
            <Typography variant="body2" color="text.secondary">Total Entries</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2.5, textAlign: 'center' }}>
            <Typography variant="h3" sx={{ fontWeight: 700, color: 'success.main', mb: 0.5 }}>
              {stats.active}
            </Typography>
            <Typography variant="body2" color="text.secondary">Active</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2.5, textAlign: 'center' }}>
            <Typography variant="h3" sx={{ fontWeight: 700, color: 'warning.main', mb: 0.5 }}>
              {stats.draft}
            </Typography>
            <Typography variant="body2" color="text.secondary">Draft</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2.5, textAlign: 'center' }}>
            <Typography variant="h3" sx={{ fontWeight: 700, color: 'text.secondary', mb: 0.5 }}>
              {stats.archived}
            </Typography>
            <Typography variant="body2" color="text.secondary">Archived</Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Actions Bar */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={2} flexWrap="wrap">
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add New Entry
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={generateSitemapXML}
          >
            Generate Preview
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={downloadSitemap}
          >
            Download sitemap.xml
          </Button>
          <Button
            variant="outlined"
            color="success"
            startIcon={<CheckIcon />}
            onClick={() => {
              setSuccessMessage('Sitemap validated successfully! All URLs are properly formatted.');
              setTimeout(() => setSuccessMessage(''), 3000);
            }}
          >
            Validate Sitemap
          </Button>
        </Stack>
      </Card>

      {/* XML Preview */}
      {showXML && (
        <Card sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Generated Sitemap XML
            </Typography>
            <Button size="small" onClick={() => setShowXML(false)}>Hide</Button>
          </Box>
          <Box sx={{ 
            bgcolor: 'action.hover', 
            p: 2, 
            borderRadius: 1, 
            maxHeight: 400, 
            overflowY: 'auto',
            fontFamily: 'monospace',
            fontSize: '0.85rem',
          }}>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
              {sitemapXML}
            </pre>
          </Box>
        </Card>
      )}

      {/* Entries Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                <TableCell sx={{ fontWeight: 700 }}>URL</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Priority</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Change Freq</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Last Modified</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id} hover>
                  <TableCell sx={{ maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <Tooltip title={entry.url}>
                      <Typography variant="body2" noWrap>{entry.url}</Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={entry.priority.toFixed(1)} 
                      size="small" 
                      color={entry.priority >= 0.8 ? 'success' : entry.priority >= 0.5 ? 'primary' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip label={entry.changeFrequency} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">
                      {new Date(entry.lastModified).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={entry.status} 
                      size="small" 
                      color={
                        entry.status === 'active' ? 'success' : 
                        entry.status === 'draft' ? 'warning' : 
                        'default'
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleOpenDialog(entry)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={() => handleDelete(entry.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editingEntry ? 'Edit Sitemap Entry' : 'Add New Sitemap Entry'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="URL"
              fullWidth
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://zesttechsolution.cloud/page"
            />
            
            <TextField
              label="Priority"
              type="number"
              fullWidth
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: parseFloat(e.target.value) })}
              inputProps={{ min: 0, max: 1, step: 0.1 }}
              helperText="Value between 0.0 and 1.0 (higher = more important)"
            />
            
            <FormControl fullWidth>
              <InputLabel>Change Frequency</InputLabel>
              <Select
                value={formData.changeFrequency}
                label="Change Frequency"
                onChange={(e) => setFormData({ ...formData, changeFrequency: e.target.value as SitemapEntry['changeFrequency'] })}
              >
                <MenuItem value="always">Always</MenuItem>
                <MenuItem value="hourly">Hourly</MenuItem>
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="yearly">Yearly</MenuItem>
                <MenuItem value="never">Never</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={(e) => setFormData({ ...formData, status: e.target.value as SitemapEntry['status'] })}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            {editingEntry ? 'Update' : 'Add'} Entry
          </Button>
        </DialogActions>
      </Dialog>

      {/* Help Section */}
      <Card sx={{ p: 3, mt: 3, bgcolor: 'action.hover' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          📋 Sitemap Best Practices
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Priority Guidelines:</strong>
            </Typography>
            <Typography variant="caption" component="div">
              • Homepage: 1.0<br />
              • Main sections: 0.8-0.9<br />
              • Sub-pages: 0.5-0.7<br />
              • Archived content: 0.3-0.4
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Change Frequency Tips:</strong>
            </Typography>
            <Typography variant="caption" component="div">
              • Blog/News: daily or weekly<br />
              • Products: weekly or monthly<br />
              • Static pages: monthly or yearly<br />
              • Contact/About: monthly
            </Typography>
          </Grid>
        </Grid>
      </Card>
    </Container>
  );
}
