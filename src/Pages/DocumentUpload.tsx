import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Tabs,
  Tab,
  Typography,
  Stack,
  Modal,
  IconButton,
  Paper,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Download as DownloadIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { uploadDocumenttoblob, getdata } from '../services/document.service';
import '../css/Finance.css';


const DocumentUpload = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box className="finance-page">
      <Box className="finance-top-bar">
        <Typography variant="subtitle1">Document Management - Upload Portal</Typography>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Stack direction="row" alignItems="center" spacing={0.75}>
            <Box
              className="finance-status-dot"
              sx={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#28a745',
              }}
            />
            <Typography variant="caption" className="finance-status-wrap">STATUS ACTIVE</Typography>
          </Stack>
        </Stack>
      </Box>
      <Box sx={{ padding: '24px 20px', maxWidth: '100%', margin: '0 auto' }}>
        <Box
          sx={{
            padding: '24px 20px',
            maxWidth: '1100px',
            margin: '0 auto',
            borderRadius: '20px',
            border: '1px solid #d6e3f5',
            background: 'linear-gradient(180deg, #f7faff 0%, #f1f6ff 100%)',
            boxShadow: '0 18px 34px rgba(20, 44, 83, 0.12)',
            transition: 'transform 0.25s ease, box-shadow 0.25s ease',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: '0 22px 40px rgba(20, 44, 83, 0.14)',
            }
          }}
        >
        <Box className="finance-header">
          <Typography variant="h5" sx={{ fontSize: '1.75rem', fontWeight: 700, color: '#343a40' }}>
            Document Management
          </Typography>
          <Typography className="subtitle">Upload documents and review submissions</Typography>
        </Box>
        <Card
          className="finance-panel"
          sx={{
            backgroundColor: '#ffffff',
            border: '1px solid #d6e3f5',
            boxShadow: '0 14px 28px rgba(20, 44, 83, 0.12)',
            padding: '24px 28px',
          }}
        >
          <CardContent sx={{ padding: 0 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              sx={{
                marginBottom: '28px',
                '& .MuiTabs-indicator': {
                  backgroundColor: '#007bff',
                },
              }}
            >
              <Tab label="Upload Document" />
              <Tab label="Review" />
            </Tabs>
            <Box>
              {activeTab === 0 && <UploadDocument />}
              {activeTab === 1 && <Review />}
            </Box>
          </CardContent>
        </Card>
        <Box className="finance-footer">
          <Typography variant="caption">Document Management Portal</Typography>
        </Box>
        </Box>
      </Box>
    </Box>
  );
};

const UploadDocument = () => {
  const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: File | null }>({});
  const [uploadedDocs, setUploadedDocs] = useState<{ [key: string]: string }>({});
  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});
  const [activeView, setActiveView] = useState<string | null>(null);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const uploadFile = async (doc: string, file: File) => {
    setUploading(prev => ({ ...prev, [doc]: true }));
    try {
      console.log("Uploading file for document:", doc, file);
      const fetchdata = getdata(file, "GSTInvoice", 1);
      console.log("fetchdata", fetchdata);
      const url = await uploadDocumenttoblob(doc, file);
      setUploadedDocs(prev => ({ ...prev, [doc]: url }));
      setSelectedFiles(prev => ({ ...prev, [doc]: null }));
    } catch (error) {
      console.error('Upload failed', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(prev => ({ ...prev, [doc]: false }));
    }
  };

  const documents = [
    'DRM APP',
    'D&G Letter',
    'Estimate reference',
    'Func distribution letter',
    'Top sheet'
  ];

  const handleDownload = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', '');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box>
      <Typography
        variant="h6"
        sx={{
          textAlign: 'center',
          marginBottom: '20px',
          color: '#343a40',
          fontWeight: 600,
          fontSize: '1.1rem'
        }}
      >
        Upload Documents
      </Typography>
      <Stack spacing={2}>
        {documents.map((doc, index) => (
          <Paper
            key={index}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px',
              backgroundColor: '#f8f9fa',
              border: '1px solid #e9ecef',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                transform: 'translateY(-2px)',
              },
            }}
            className="doc-row"
          >
            <Typography sx={{ flex: 1, fontWeight: 600, color: '#343a40', fontSize: '0.95rem' }}>
              {doc}
            </Typography>
            {uploadedDocs[doc] ? (
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  color="success"
                  size="small"
                  startIcon={<VisibilityIcon />}
                  onClick={() => window.open(uploadedDocs[doc], '_blank')}
                  className="doc-btn-primary"
                >
                  View
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  startIcon={<DownloadIcon />}
                  onClick={() => handleDownload(uploadedDocs[doc])}
                >
                  Download
                </Button>
              </Stack>
            ) : (
              <Stack direction="row" alignItems="center" spacing={1}>
                <input
                  type="file"
                  ref={(el) => (fileInputRefs.current[doc] = el)}
                  onChange={(e) => setSelectedFiles(prev => ({ ...prev, [doc]: e.target.files?.[0] || null }))}
                  style={{ display: 'none' }}
                />
                {selectedFiles[doc] && (
                  <Typography
                    sx={{
                      fontSize: '0.85rem',
                      color: '#6c757d',
                      maxWidth: '140px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {selectedFiles[doc]!.name}
                  </Typography>
                )}
                <Button
                  variant="contained"
                  color={selectedFiles[doc] ? 'warning' : 'primary'}
                  size="small"
                  startIcon={selectedFiles[doc] ? <CloudUploadIcon /> : undefined}
                  disabled={uploading[doc]}
                  onClick={() => {
                    if (selectedFiles[doc]) {
                      uploadFile(doc, selectedFiles[doc]!);
                    } else {
                      fileInputRefs.current[doc]?.click();
                    }
                  }}
                  className="doc-btn-primary"
                >
                  {uploading[doc] ? 'Uploading…' : selectedFiles[doc] ? 'Upload' : 'Choose File'}
                </Button>
              </Stack>
            )}
          </Paper>
        ))}
      </Stack>
      <Modal open={!!activeView} onClose={() => setActiveView(null)}>
        <Paper
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            maxWidth: '800px',
            maxHeight: '90%',
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'auto',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <Typography variant="h6" sx={{ color: '#343a40', fontWeight: 600 }}>
              Viewing {activeView}
            </Typography>
            <IconButton
              onClick={() => setActiveView(null)}
              size="small"
              sx={{ color: '#f44336' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          <Box
            component="iframe"
            src={activeView ? uploadedDocs[activeView] : ''}
            sx={{
              width: '100%',
              height: '500px',
              border: 'none',
              borderRadius: '4px',
              flex: 1,
              marginBottom: '16px',
            }}
            title={`Document: ${activeView}`}
          />
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="contained"
              color="primary"
              startIcon={<DownloadIcon />}
              onClick={() => handleDownload(uploadedDocs[activeView!])}
            >
              Download
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<CloseIcon />}
              onClick={() => setActiveView(null)}
            >
              Close
            </Button>
          </Stack>
        </Paper>
      </Modal>
    </Box>
  );
};

const Review = () => {
  return (
    <Box
      sx={{
        textAlign: 'center',
        padding: '48px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
      }}
      className="finance-empty-state"
    >
      <Box
        sx={{
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#6c757d',
        }}
      >
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" fill="currentColor" />
        </svg>
      </Box>
      <Typography variant="h6" sx={{ color: '#343a40', fontWeight: 600 }}>
        Review Section
      </Typography>
      <Typography variant="body2" sx={{ color: '#6c757d' }}>
        Review functionality will be implemented here.
      </Typography>
    </Box>
  );
};

export default DocumentUpload;
