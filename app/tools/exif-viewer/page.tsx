'use client';

import { useState } from 'react';
import { Card, Stack, Alert, Typography, Box, Table, TableBody, TableCell, TableContainer, TableRow, Paper } from '@mui/material';
import { ToolLayout, UploadArea } from '@/components/ToolComponents';

interface ExifData {
  [key: string]: string | number;
}

export default function EXIFViewerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [exifData, setExifData] = useState<ExifData | null>(null);
  const [basicData, setBasicData] = useState<ExifData | null>(null);

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      return;
    }
    
    setFile(selectedFile);
    
    // Extract basic file data
    const img = new Image();
    const url = URL.createObjectURL(selectedFile);
    
    img.onload = () => {
      setBasicData({
        'File Name': selectedFile.name,
        'File Size': formatBytes(selectedFile.size),
        'File Type': selectedFile.type,
        'Width': `${img.width}px`,
        'Height': `${img.height}px`,
        'Aspect Ratio': `${(img.width / img.height).toFixed(2)}:1`,
        'Megapixels': `${((img.width * img.height) / 1000000).toFixed(2)} MP`,
        'Last Modified': new Date(selectedFile.lastModified).toLocaleString(),
      });
      
      URL.revokeObjectURL(url);
    };
    
    img.src = url;
    
    // Note: Full EXIF extraction requires exif-js or piexifjs library
    setExifData({
      'Camera Make': 'N/A (Install exif-js for full data)',
      'Camera Model': 'N/A',
      'Date Taken': 'N/A',
      'Exposure Time': 'N/A',
      'F-Number': 'N/A',
      'ISO Speed': 'N/A',
      'Focal Length': 'N/A',
      'GPS Latitude': 'N/A',
      'GPS Longitude': 'N/A',
      'Orientation': 'N/A',
      'Software': 'N/A',
    });
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const reset = () => {
    setFile(null);
    setExifData(null);
    setBasicData(null);
  };

  return (
    <ToolLayout
      title="EXIF Metadata Viewer"
      description="View complete EXIF data, camera settings, GPS location, and technical metadata"
      features={['File Information', 'Camera Settings', 'GPS Data', 'Technical Metadata']}
    >
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2" gutterBottom>
          <strong>EXIF Library Integration Available:</strong>
        </Typography>
        <Typography variant="caption" component="div">
          For complete EXIF reading, integrate:<br/>
          • <strong>exif-js</strong> - Read all EXIF tags from JPEG files<br/>
          • <strong>piexifjs</strong> - Read/write EXIF data including GPS<br/>
          • <strong>exiftool.js</strong> - Full metadata extraction<br/>
          <br/>
          Currently showing basic file information. Install exif-js for complete camera data.
        </Typography>
      </Alert>

      {!file ? (
        <UploadArea onFileSelect={handleFileSelect} accept="image/*" />
      ) : (
        <Stack spacing={3}>
          {basicData && (
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                File Information
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableBody>
                    {Object.entries(basicData).map(([key, value]) => (
                      <TableRow key={key}>
                        <TableCell sx={{ fontWeight: 600, width: '40%' }}>{key}</TableCell>
                        <TableCell>{value}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          )}

          {exifData && (
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                EXIF Metadata
              </Typography>
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="caption">
                  <strong>Note:</strong> This image contains basic metadata. For complete EXIF extraction including camera settings, GPS coordinates, and technical data, integrate the exif-js library.
                </Typography>
              </Alert>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableBody>
                    {Object.entries(exifData).map(([key, value]) => (
                      <TableRow key={key}>
                        <TableCell sx={{ fontWeight: 600, width: '40%' }}>{key}</TableCell>
                        <TableCell>{value}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          )}

          <Alert severity="success">
            <Typography variant="body2" gutterBottom>
              <strong>EXIF-JS Integration Example:</strong>
            </Typography>
            <Typography variant="caption" component="div" sx={{ fontFamily: 'monospace' }}>
              npm install exif-js<br/><br/>
              import EXIF from 'exif-js';<br/><br/>
              EXIF.getData(imageFile, function() {'{'}<br/>
              {'  '}const make = EXIF.getTag(this, 'Make');<br/>
              {'  '}const model = EXIF.getTag(this, 'Model');<br/>
              {'  '}const gps = EXIF.getTag(this, 'GPSLatitude');<br/>
              {'}'});
            </Typography>
          </Alert>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <button onClick={reset} style={{ flex: 1, padding: '12px', cursor: 'pointer' }}>
              View Another Image
            </button>
          </Box>
        </Stack>
      )}
    </ToolLayout>
  );
}
