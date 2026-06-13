/**
 * Advanced Image Manipulation Toolbar Component
 * Integrates all 12 manipulation functions into ImageCompressor UI
 */

'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  Card,
  Slider,
  Stack,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Tooltip,
  IconButton,
  Collapse,
} from '@mui/material';

interface ManipulationToolbarProps {
  onTransform: (type: string, value: any) => void;
  disabled?: boolean;
}

// SVG Icons
const RotateIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M23 4v6h-6"></path>
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
  </svg>
);

const FlipIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
    <line x1="12" y1="2" x2="12" y2="22"></line>
  </svg>
);

const ResizeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M15 3h6v6"></path>
    <path d="M9 21H3v-6"></path>
    <path d="M21 3l-7 7"></path>
    <path d="M3 21l7-7"></path>
  </svg>
);

const CropIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 2v14a2 2 0 0 0 2 2h14"></path>
    <path d="M18 22V8a2 2 0 0 0-2-2H2"></path>
  </svg>
);

const FilterIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
  </svg>
);

const ExpandIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

export default function ManipulationToolbar({ onTransform, disabled = false }: ManipulationToolbarProps) {
  const [expandTransform, setExpandTransform] = useState(true);
  const [expandFilters, setExpandFilters] = useState(true);
  const [expandEffects, setExpandEffects] = useState(false);

  // Transform states
  const [rotateAngle, setRotateAngle] = useState(0);
  const [resizeWidth, setResizeWidth] = useState(100);
  const [resizeHeight, setResizeHeight] = useState(100);
  const [cropMode, setCropMode] = useState('none');

  // Filter states
  const [blur, setBlur] = useState(0);
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [sharpen, setSharpen] = useState(0);

  return (
    <Card sx={{ p: 2.5 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, letterSpacing: '0.5px' }}>
            🎨 IMAGE MANIPULATION TOOLS
          </Typography>
          <Typography variant="caption" color="text.secondary">
            12 Functions Available
          </Typography>
        </Box>

        <Divider />

        {/* TRANSFORM SECTION */}
        <Box>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              cursor: 'pointer',
              mb: 1,
            }}
            onClick={() => setExpandTransform(!expandTransform)}
          >
            <Typography variant="body2" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
              <RotateIcon /> Transform & Geometry
            </Typography>
            <IconButton size="small" sx={{ transform: expandTransform ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.2s' }}>
              <ExpandIcon />
            </IconButton>
          </Box>

          <Collapse in={expandTransform}>
            <Stack spacing={2.5}>
              {/* Rotate */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
                  Rotate Image
                </Typography>
                <ButtonGroup fullWidth size="small" variant="outlined">
                  <Tooltip title="Rotate 90° clockwise">
                    <Button 
                      onClick={() => {
                        const newAngle = (rotateAngle + 90) % 360;
                        setRotateAngle(newAngle);
                        onTransform('rotate', newAngle);
                      }}
                      disabled={disabled}
                    >
                      90°
                    </Button>
                  </Tooltip>
                  <Tooltip title="Rotate 180°">
                    <Button 
                      onClick={() => {
                        const newAngle = (rotateAngle + 180) % 360;
                        setRotateAngle(newAngle);
                        onTransform('rotate', newAngle);
                      }}
                      disabled={disabled}
                    >
                      180°
                    </Button>
                  </Tooltip>
                  <Tooltip title="Rotate 270° clockwise">
                    <Button 
                      onClick={() => {
                        const newAngle = (rotateAngle + 270) % 360;
                        setRotateAngle(newAngle);
                        onTransform('rotate', newAngle);
                      }}
                      disabled={disabled}
                    >
                      270°
                    </Button>
                  </Tooltip>
                  <Tooltip title="Custom angle">
                    <Button 
                      onClick={() => {
                        const angle = prompt('Enter rotation angle (0-359):', String(rotateAngle));
                        if (angle !== null) {
                          const newAngle = parseInt(angle) % 360;
                          setRotateAngle(newAngle);
                          onTransform('rotate', newAngle);
                        }
                      }}
                      disabled={disabled}
                    >
                      Custom
                    </Button>
                  </Tooltip>
                </ButtonGroup>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  Current: {rotateAngle}°
                </Typography>
              </Box>

              {/* Flip */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
                  Flip Image
                </Typography>
                <ButtonGroup fullWidth size="small" variant="outlined">
                  <Button 
                    startIcon={<FlipIcon />}
                    onClick={() => onTransform('flip', 'horizontal')}
                    disabled={disabled}
                  >
                    Flip Horizontal
                  </Button>
                  <Button 
                    startIcon={<FlipIcon />}
                    onClick={() => onTransform('flip', 'vertical')}
                    disabled={disabled}
                  >
                    Flip Vertical
                  </Button>
                </ButtonGroup>
              </Box>

              {/* Resize */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
                  Resize (Percentage)
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="caption">Width: {resizeWidth}%</Typography>
                    <Slider 
                      value={resizeWidth} 
                      min={10} 
                      max={200} 
                      onChange={(_, val) => setResizeWidth(val as number)}
                      onChangeCommitted={(_, val) => onTransform('resize', { width: val, height: resizeHeight })}
                      size="small"
                      disabled={disabled}
                    />
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="caption">Height: {resizeHeight}%</Typography>
                    <Slider 
                      value={resizeHeight} 
                      min={10} 
                      max={200} 
                      onChange={(_, val) => setResizeHeight(val as number)}
                      onChangeCommitted={(_, val) => onTransform('resize', { width: resizeWidth, height: val })}
                      size="small"
                      disabled={disabled}
                    />
                  </Box>
                </Stack>
                <ButtonGroup fullWidth size="small" sx={{ mt: 1 }}>
                  <Button onClick={() => { setResizeWidth(50); setResizeHeight(50); onTransform('resize', { width: 50, height: 50 }); }}>50%</Button>
                  <Button onClick={() => { setResizeWidth(75); setResizeHeight(75); onTransform('resize', { width: 75, height: 75 }); }}>75%</Button>
                  <Button onClick={() => { setResizeWidth(100); setResizeHeight(100); onTransform('resize', { width: 100, height: 100 }); }}>100%</Button>
                  <Button onClick={() => { setResizeWidth(150); setResizeHeight(150); onTransform('resize', { width: 150, height: 150 }); }}>150%</Button>
                </ButtonGroup>
              </Box>

              {/* Crop */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
                  Crop Mode
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={cropMode}
                    onChange={(e) => {
                      setCropMode(e.target.value);
                      onTransform('crop', e.target.value);
                    }}
                    disabled={disabled}
                  >
                    <MenuItem value="none">No Crop</MenuItem>
                    <MenuItem value="square">Square (1:1)</MenuItem>
                    <MenuItem value="landscape">Landscape (16:9)</MenuItem>
                    <MenuItem value="portrait">Portrait (9:16)</MenuItem>
                    <MenuItem value="custom">Custom (Interactive)</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Stack>
          </Collapse>
        </Box>

        <Divider />

        {/* FILTERS SECTION */}
        <Box>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              cursor: 'pointer',
              mb: 1,
            }}
            onClick={() => setExpandFilters(!expandFilters)}
          >
            <Typography variant="body2" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
              <FilterIcon /> Filters & Adjustments
            </Typography>
            <IconButton size="small" sx={{ transform: expandFilters ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.2s' }}>
              <ExpandIcon />
            </IconButton>
          </Box>

          <Collapse in={expandFilters}>
            <Stack spacing={2}>
              {/* Blur */}
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption">Blur</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>{blur}px</Typography>
                </Box>
                <Slider 
                  value={blur} 
                  min={0} 
                  max={20} 
                  onChange={(_, val) => setBlur(val as number)}
                  onChangeCommitted={(_, val) => onTransform('blur', val)}
                  size="small"
                  disabled={disabled}
                />
              </Box>

              {/* Brightness */}
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption">Brightness</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>{brightness > 0 ? '+' : ''}{brightness}</Typography>
                </Box>
                <Slider 
                  value={brightness} 
                  min={-100} 
                  max={100} 
                  onChange={(_, val) => setBrightness(val as number)}
                  onChangeCommitted={(_, val) => onTransform('brightness', val)}
                  size="small"
                  disabled={disabled}
                />
              </Box>

              {/* Contrast */}
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption">Contrast</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>{contrast > 0 ? '+' : ''}{contrast}</Typography>
                </Box>
                <Slider 
                  value={contrast} 
                  min={-100} 
                  max={100} 
                  onChange={(_, val) => setContrast(val as number)}
                  onChangeCommitted={(_, val) => onTransform('contrast', val)}
                  size="small"
                  disabled={disabled}
                />
              </Box>

              {/* Saturation */}
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption">Saturation</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>{saturation > 0 ? '+' : ''}{saturation}</Typography>
                </Box>
                <Slider 
                  value={saturation} 
                  min={-100} 
                  max={100} 
                  onChange={(_, val) => setSaturation(val as number)}
                  onChangeCommitted={(_, val) => onTransform('saturation', val)}
                  size="small"
                  disabled={disabled}
                />
              </Box>

              {/* Sharpen */}
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption">Sharpen</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>{sharpen}</Typography>
                </Box>
                <Slider 
                  value={sharpen} 
                  min={0} 
                  max={100} 
                  onChange={(_, val) => setSharpen(val as number)}
                  onChangeCommitted={(_, val) => onTransform('sharpen', val)}
                  size="small"
                  disabled={disabled}
                />
              </Box>
            </Stack>
          </Collapse>
        </Box>

        <Divider />

        {/* EFFECTS SECTION */}
        <Box>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              cursor: 'pointer',
              mb: 1,
            }}
            onClick={() => setExpandEffects(!expandEffects)}
          >
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              ✨ Special Effects
            </Typography>
            <IconButton size="small" sx={{ transform: expandEffects ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.2s' }}>
              <ExpandIcon />
            </IconButton>
          </Box>

          <Collapse in={expandEffects}>
            <Stack spacing={1.5}>
              <Button 
                variant="outlined" 
                fullWidth
                onClick={() => onTransform('grayscale', true)}
                disabled={disabled}
              >
                Grayscale
              </Button>
              <Button 
                variant="outlined" 
                fullWidth
                onClick={() => onTransform('sepia', true)}
                disabled={disabled}
              >
                Sepia Tone
              </Button>
              <Button 
                variant="outlined" 
                fullWidth
                onClick={() => onTransform('invert', true)}
                disabled={disabled}
              >
                Invert Colors
              </Button>
            </Stack>
          </Collapse>
        </Box>

        <Divider />

        {/* Reset Button */}
        <Button 
          variant="outlined" 
          color="error" 
          fullWidth
          onClick={() => {
            setRotateAngle(0);
            setResizeWidth(100);
            setResizeHeight(100);
            setBlur(0);
            setBrightness(0);
            setContrast(0);
            setSaturation(0);
            setSharpen(0);
            setCropMode('none');
            onTransform('reset', null);
          }}
          disabled={disabled}
        >
          Reset All Transformations
        </Button>
      </Stack>
    </Card>
  );
}
