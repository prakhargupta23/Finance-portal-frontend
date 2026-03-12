/** @format */

import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  Stack,
  Paper,
  Chip,
  Divider,
  Tooltip,
  Snackbar,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Visibility as VisibilityIcon,
  SwapHoriz as ReplaceIcon,
  CheckCircle as CheckCircleIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import '../css/Finance.css';

interface MonthRecord {
  id: number;
  month: string;
  year: number;
  uploadedOn: string;
  fileName: string;
  fileUrl: string;
  status: 'uploaded' | 'replaced';
}

const DUMMY_RECORDS: MonthRecord[] = [
  {
    id: 1,
    month: 'January',
    year: 2025,
    uploadedOn: '2025-01-31',
    fileName: 'Executive_Summary_Jan_2025.pdf',
    fileUrl: '#',
    status: 'uploaded',
  },
  {
    id: 2,
    month: 'February',
    year: 2025,
    uploadedOn: '2025-02-28',
    fileName: 'Executive_Summary_Feb_2025.pdf',
    fileUrl: '#',
    status: 'replaced',
  },
  {
    id: 3,
    month: 'March',
    year: 2025,
    uploadedOn: '2025-03-31',
    fileName: 'Executive_Summary_Mar_2025.pdf',
    fileUrl: '#',
    status: 'uploaded',
  },
  {
    id: 4,
    month: 'April',
    year: 2025,
    uploadedOn: '2025-04-30',
    fileName: 'Executive_Summary_Apr_2025.pdf',
    fileUrl: '#',
    status: 'uploaded',
  },
  {
    id: 5,
    month: 'May',
    year: 2025,
    uploadedOn: '2025-05-31',
    fileName: 'Executive_Summary_May_2025.pdf',
    fileUrl: '#',
    status: 'uploaded',
  },
  {
    id: 6,
    month: 'June',
    year: 2025,
    uploadedOn: '2025-06-30',
    fileName: 'Executive_Summary_Jun_2025.pdf',
    fileUrl: '#',
    status: 'replaced',
  },
];

const ExecutiveSummaryUpload: React.FC = () => {
  const [records, setRecords] = useState<MonthRecord[]>(DUMMY_RECORDS);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [replacingId, setReplacingId] = useState<number | null>(null);
  const mainFileInputRef = useRef<HTMLInputElement>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);

  const simulateUpload = (onDone: (url: string, name: string) => void) => {
    setUploading(true);
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          onDone('#new-file-url', 'Executive_Summary_New.pdf');
          return 100;
        }
        return prev + 20;
      });
    }, 200);
  };

  const handleMainUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    simulateUpload((url, name) => {
      const now = new Date();
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
      ];
      const newRecord: MonthRecord = {
        id: Date.now(),
        month: monthNames[now.getMonth()],
        year: now.getFullYear(),
        uploadedOn: now.toISOString().slice(0, 10),
        fileName: file.name,
        fileUrl: url,
        status: 'uploaded',
      };
      setRecords((prev) => [newRecord, ...prev]);
      setSnackbar({ open: true, message: 'Executive summary uploaded successfully!', severity: 'success' });
    });
    e.target.value = '';
  };

  const handleReplaceClick = (id: number) => {
    setReplacingId(id);
    replaceFileInputRef.current?.click();
  };

  const handleReplaceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || replacingId === null) return;
    simulateUpload((url, name) => {
      setRecords((prev) =>
        prev.map((r) =>
          r.id === replacingId
            ? { ...r, fileName: file.name, fileUrl: url, status: 'replaced', uploadedOn: new Date().toISOString().slice(0, 10) }
            : r
        )
      );
      setSnackbar({ open: true, message: 'File replaced successfully!', severity: 'success' });
      setReplacingId(null);
    });
    e.target.value = '';
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <Box className="finance-page">
      {/* Top Bar */}
      <Box className="finance-top-bar">
        <Typography variant="subtitle1">Executive Summary — Upload Portal</Typography>
        <Stack direction="row" alignItems="center" spacing={0.75}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: '#28a745',
            }}
          />
          <Typography variant="caption" className="finance-status-wrap">
            STATUS ACTIVE
          </Typography>
        </Stack>
      </Box>

      <Box sx={{ padding: '24px 20px', maxWidth: '100%', margin: '0 auto' }}>
        <Box
          sx={{
            padding: '28px 24px',
            maxWidth: '1100px',
            margin: '0 auto',
            borderRadius: '20px',
            border: '1px solid #d6e3f5',
            background: 'linear-gradient(180deg, #f7faff 0%, #f1f6ff 100%)',
            boxShadow: '0 18px 34px rgba(20, 44, 83, 0.12)',
          }}
        >
          {/* Header */}
          <Box className="finance-header" sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ fontSize: '1.75rem', fontWeight: 700, color: '#343a40' }}>
              Executive Summary Upload
            </Typography>
            <Typography className="subtitle">
              Upload monthly executive summary data and manage existing submissions
            </Typography>
          </Box>

          {/* Upload Card */}
          <Paper
            elevation={0}
            sx={{
              backgroundColor: '#ffffff',
              border: '2px dashed #90b8f8',
              borderRadius: '16px',
              padding: '36px 24px',
              textAlign: 'center',
              mb: 4,
              transition: 'border-color 0.25s, background 0.25s',
              cursor: 'pointer',
              '&:hover': {
                borderColor: '#007bff',
                background: 'linear-gradient(135deg, #eaf2ff 0%, #f0f7ff 100%)',
              },
            }}
            onClick={() => !uploading && mainFileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={mainFileInputRef}
              style={{ display: 'none' }}
              accept=".pdf,.xlsx,.xls,.doc,.docx"
              onChange={handleMainUpload}
            />
            <input
              type="file"
              ref={replaceFileInputRef}
              style={{ display: 'none' }}
              accept=".pdf,.xlsx,.xls,.doc,.docx"
              onChange={handleReplaceUpload}
            />

            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                boxShadow: '0 6px 20px rgba(0, 123, 255, 0.35)',
              }}
            >
              <CloudUploadIcon sx={{ color: '#fff', fontSize: 36 }} />
            </Box>

            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a2b4a', mb: 0.5 }}>
              Upload Executive Summary
            </Typography>
            <Typography variant="body2" sx={{ color: '#6c757d', mb: 2.5 }}>
              Drag & drop or click to browse — PDF, XLSX, DOC supported
            </Typography>

            <Button
              variant="contained"
              size="large"
              startIcon={<CloudUploadIcon />}
              disabled={uploading}
              onClick={(e) => {
                e.stopPropagation();
                mainFileInputRef.current?.click();
              }}
              sx={{
                background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
                borderRadius: '10px',
                fontWeight: 600,
                px: 4,
                py: 1.25,
                boxShadow: '0 4px 14px rgba(0, 123, 255, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #0069d9 0%, #004aad 100%)',
                  boxShadow: '0 6px 18px rgba(0, 123, 255, 0.5)',
                },
              }}
            >
              {uploading ? 'Uploading…' : 'Upload Executive Summary'}
            </Button>

            {uploading && (
              <Box sx={{ mt: 2, px: 4 }}>
                <LinearProgress
                  variant="determinate"
                  value={uploadProgress}
                  sx={{
                    height: 6,
                    borderRadius: 4,
                    backgroundColor: '#d6e8ff',
                    '& .MuiLinearProgress-bar': { borderRadius: 4, backgroundColor: '#007bff' },
                  }}
                />
                <Typography variant="caption" sx={{ color: '#6c757d', mt: 0.5, display: 'block' }}>
                  {uploadProgress}% uploaded
                </Typography>
              </Box>
            )}
          </Paper>

          {/* Monthly History Table */}
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
              <DescriptionIcon sx={{ color: '#007bff', fontSize: 22 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a2b4a', fontSize: '1.05rem' }}>
                Monthly Upload History
              </Typography>
              <Chip
                label={`${records.length} records`}
                size="small"
                sx={{ backgroundColor: '#e8f0fe', color: '#007bff', fontWeight: 600, fontSize: '0.75rem' }}
              />
            </Stack>

            {/* Table Header */}
            <Paper
              elevation={0}
              sx={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1.5fr 1fr',
                px: 2.5,
                py: 1.25,
                backgroundColor: '#edf3ff',
                borderRadius: '10px 10px 0 0',
                border: '1px solid #d6e3f5',
                borderBottom: 'none',
              }}
            >
              {['Month', 'Uploaded On', 'File Name', 'Actions'].map((col) => (
                <Typography key={col} variant="caption" sx={{ fontWeight: 700, color: '#4a6fa5', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {col}
                </Typography>
              ))}
            </Paper>

            {/* Records */}
            <Stack divider={<Divider flexItem />} sx={{ border: '1px solid #d6e3f5', borderRadius: '0 0 12px 12px', overflow: 'hidden' }}>
              {records.map((record, idx) => (
                <Paper
                  key={record.id}
                  elevation={0}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1.5fr 1fr',
                    alignItems: 'center',
                    px: 2.5,
                    py: 1.75,
                    backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fafcff',
                    transition: 'background 0.2s',
                    '&:hover': {
                      backgroundColor: '#f0f6ff',
                    },
                  }}
                >
                  {/* Month */}
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <CheckCircleIcon
                      sx={{
                        fontSize: 16,
                        color: record.status === 'replaced' ? '#fd7e14' : '#28a745',
                      }}
                    />
                    <Typography sx={{ fontWeight: 600, color: '#1a2b4a', fontSize: '0.9rem' }}>
                      {record.month} {record.year}
                    </Typography>
                  </Stack>

                  {/* Uploaded On */}
                  <Typography sx={{ color: '#6c757d', fontSize: '0.875rem' }}>
                    {formatDate(record.uploadedOn)}
                  </Typography>

                  {/* File Name */}
                  <Tooltip title={record.fileName} arrow>
                    <Typography
                      sx={{
                        color: '#007bff',
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        pr: 2,
                      }}
                    >
                      {record.fileName}
                    </Typography>
                  </Tooltip>

                  {/* Actions */}
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                      label={record.status === 'replaced' ? 'Replaced' : 'Active'}
                      size="small"
                      sx={{
                        backgroundColor: record.status === 'replaced' ? '#fff3e8' : '#e6f9ee',
                        color: record.status === 'replaced' ? '#fd7e14' : '#28a745',
                        fontWeight: 600,
                        fontSize: '0.7rem',
                        height: 22,
                        mr: 0.5,
                      }}
                    />
                    <Tooltip title="View document" arrow>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={() => window.open(record.fileUrl, '_blank')}
                        sx={{
                          borderColor: '#007bff',
                          color: '#007bff',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          borderRadius: '8px',
                          px: 1.25,
                          py: 0.4,
                          textTransform: 'none',
                          '&:hover': {
                            backgroundColor: '#e8f2ff',
                            borderColor: '#0056b3',
                          },
                        }}
                      >
                        View
                      </Button>
                    </Tooltip>
                    <Tooltip title="Replace with new file" arrow>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<ReplaceIcon />}
                        onClick={() => !uploading && handleReplaceClick(record.id)}
                        disabled={uploading}
                        sx={{
                          background: 'linear-gradient(135deg, #fd7e14 0%, #e96500 100%)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          borderRadius: '8px',
                          px: 1.25,
                          py: 0.4,
                          textTransform: 'none',
                          boxShadow: 'none',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #e96500 0%, #cf5900 100%)',
                          },
                        }}
                      >
                        Replace
                      </Button>
                    </Tooltip>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </Box>

          {/* Footer */}
          <Box className="finance-footer" sx={{ mt: 3 }}>
            <Typography variant="caption">Executive Summary Upload Portal</Typography>
          </Box>
        </Box>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ borderRadius: '10px' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ExecutiveSummaryUpload;
