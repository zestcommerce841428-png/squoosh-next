'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Chip,
  Tooltip,
  IconButton,
  Collapse,
  Grid,
  LinearProgress,
} from '@mui/material';

// Icons
const InfoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const ServerIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
    <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
    <line x1="6" y1="6" x2="6.01" y2="6"></line>
    <line x1="6" y1="18" x2="6.01" y2="18"></line>
  </svg>
);

interface BuildStatus {
  status: 'success' | 'building' | 'error';
  version: string;
  buildTime: string;
  deployedAt: string;
  commit: string;
  branch: string;
  environment: string;
  uptime: number;
  responseTime: number;
}

export default function BuildStatus() {
  const [expanded, setExpanded] = useState(false);
  const [buildInfo, setBuildInfo] = useState<BuildStatus>({
    status: 'success',
    version: '2.1.0',
    buildTime: '25s',
    deployedAt: new Date().toISOString(),
    commit: 'd05d63e',
    branch: 'master',
    environment: 'production',
    uptime: 0,
    responseTime: 0,
  });
  const [isOnline, setIsOnline] = useState(true);

  // Check online status
  useEffect(() => {
    const checkStatus = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener('online', checkStatus);
    window.addEventListener('offline', checkStatus);

    return () => {
      window.removeEventListener('online', checkStatus);
      window.removeEventListener('offline', checkStatus);
    };
  }, []);

  // Calculate uptime
  useEffect(() => {
    const deployedTime = new Date(buildInfo.deployedAt).getTime();
    
    const updateUptime = () => {
      const now = Date.now();
      const uptimeSeconds = Math.floor((now - deployedTime) / 1000);
      setBuildInfo(prev => ({ ...prev, uptime: uptimeSeconds }));
    };

    updateUptime();
    const interval = setInterval(updateUptime, 1000);

    return () => clearInterval(interval);
  }, [buildInfo.deployedAt]);

  // Measure response time
  useEffect(() => {
    const measureResponseTime = async () => {
      const start = performance.now();
      try {
        await fetch('/api/health', { method: 'HEAD' }).catch(() => {});
        const end = performance.now();
        setBuildInfo(prev => ({ ...prev, responseTime: Math.round(end - start) }));
      } catch {
        setBuildInfo(prev => ({ ...prev, responseTime: 0 }));
      }
    };

    measureResponseTime();
    const interval = setInterval(measureResponseTime, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  const getStatusColor = () => {
    if (!isOnline) return 'error';
    switch (buildInfo.status) {
      case 'success': return 'success';
      case 'building': return 'warning';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    switch (buildInfo.status) {
      case 'success': return 'Operational';
      case 'building': return 'Deploying';
      case 'error': return 'Error';
      default: return 'Unknown';
    }
  };

  return (
    <Box
      sx={{
        borderTop: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        py: 1,
      }}
    >
      <Container maxWidth="lg">
        {/* Compact Status Bar */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          {/* Left: Status & Version */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              icon={isOnline && buildInfo.status === 'success' ? <CheckIcon /> : undefined}
              label={getStatusText()}
              color={getStatusColor()}
              size="small"
              sx={{ fontWeight: 600 }}
            />
            <Typography variant="caption" color="text.secondary">
              v{buildInfo.version}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
              •
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
              Commit: {buildInfo.commit}
            </Typography>
          </Box>

          {/* Right: Stats & Toggle */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Tooltip title="Uptime since last deployment">
              <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.5 }}>
                <ServerIcon />
                <Typography variant="caption" color="text.secondary">
                  {formatUptime(buildInfo.uptime)}
                </Typography>
              </Box>
            </Tooltip>

            {buildInfo.responseTime > 0 && (
              <Tooltip title="Server response time">
                <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                  {buildInfo.responseTime}ms
                </Typography>
              </Tooltip>
            )}

            <Tooltip title={expanded ? 'Hide details' : 'Show build details'}>
              <IconButton
                size="small"
                onClick={() => setExpanded(!expanded)}
                sx={{ ml: 1 }}
              >
                <InfoIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Expanded Details */}
        <Collapse in={expanded}>
          <Box sx={{ mt: 2, pb: 1 }}>
            <Grid container spacing={2}>
              {/* Build Information */}
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                  Build Info
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Typography variant="caption" display="block">
                    Environment: <strong>{buildInfo.environment}</strong>
                  </Typography>
                  <Typography variant="caption" display="block">
                    Branch: <strong>{buildInfo.branch}</strong>
                  </Typography>
                  <Typography variant="caption" display="block">
                    Build Time: <strong>{buildInfo.buildTime}</strong>
                  </Typography>
                </Box>
              </Grid>

              {/* Deployment Info */}
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                  Deployment
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Typography variant="caption" display="block">
                    Deployed: <strong>{new Date(buildInfo.deployedAt).toLocaleString()}</strong>
                  </Typography>
                  <Typography variant="caption" display="block">
                    Uptime: <strong>{formatUptime(buildInfo.uptime)}</strong>
                  </Typography>
                  <Typography variant="caption" display="block">
                    Platform: <strong>Vercel</strong>
                  </Typography>
                </Box>
              </Grid>

              {/* Performance Metrics */}
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                  Performance
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Typography variant="caption" display="block">
                    Response: <strong>{buildInfo.responseTime}ms</strong>
                  </Typography>
                  <Typography variant="caption" display="block">
                    Status: <strong>{isOnline ? 'Online' : 'Offline'}</strong>
                  </Typography>
                  <Typography variant="caption" display="block">
                    SSL: <strong>Active</strong>
                  </Typography>
                </Box>
              </Grid>

              {/* Technology Stack */}
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                  Technology
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Typography variant="caption" display="block">
                    Next.js: <strong>16.2.9</strong>
                  </Typography>
                  <Typography variant="caption" display="block">
                    React: <strong>19.0.0</strong>
                  </Typography>
                  <Typography variant="caption" display="block">
                    TypeScript: <strong>5.0</strong>
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Health Status Bar */}
            {buildInfo.status === 'building' && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                  Deployment in progress...
                </Typography>
                <LinearProgress />
              </Box>
            )}

            {/* Quick Links */}
            <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label="GitHub"
                size="small"
                component="a"
                href="https://github.com/zestcommerce841428-png/squoosh-next"
                target="_blank"
                clickable
                sx={{ fontSize: '0.7rem' }}
              />
              <Chip
                label="Vercel Dashboard"
                size="small"
                component="a"
                href="https://vercel.com/naushad-alam-s-projects1/squoosh-dev"
                target="_blank"
                clickable
                sx={{ fontSize: '0.7rem' }}
              />
              <Chip
                label="Analytics"
                size="small"
                component="a"
                href="https://analytics.google.com"
                target="_blank"
                clickable
                sx={{ fontSize: '0.7rem' }}
              />
            </Box>
          </Box>
        </Collapse>
      </Container>
    </Box>
  );
}
