import React, { useState, useEffect, useRef } from 'react';
import { vettingService } from '../services/vetting.service';


import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';

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
  Snackbar,
  Alert
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Download as DownloadIcon,
  Close as CloseIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { uploadDocumenttoblob, getdata } from '../services/document.service';
import { fetchWrapper } from '../helpers/fetch-wrapper';
import { config } from '../shared/constants/config';
import '../css/Finance.css';

const DocumentUpload = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [sNo, setSNo] = useState<string | null>(localStorage.getItem("currentSNo"));
  const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: File | null }>({});
  const [uploadedDocs, setUploadedDocs] = useState<{ [key: string]: string }>({});
  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});
  const [docErrors, setDocErrors] = useState<{ [key: string]: string | null }>({});
  const [snackbar, setSnackbar] = useState<{ open: boolean, message: string, severity: 'error' | 'success' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  useEffect(() => {
    const recoverSession = async () => {
      let activeSNo = localStorage.getItem("currentSNo");
      try {
        let status;
        if (activeSNo) {
          status = await vettingService.getMasterStatus(activeSNo);
        } else {
          status = await vettingService.getLatestMasterStatus();
          if (status && status.s_no) {
            activeSNo = status.s_no;
            localStorage.setItem("currentSNo", activeSNo as string);
            setSNo(activeSNo);
          }
        }
        if (status) {
          const mapped: any = {};
          if (status.drm_app_uploaded) mapped['DRM APP'] = status.drm_app_file_url;
          if (status.dg_letter_uploaded) mapped['D&G Letter'] = status.dg_letter_file_url;
          if (status.estimate_uploaded) mapped['Estimate reference'] = status.estimate_file_url;
          if (status.func_distribution_uploaded) mapped['Func distribution letter'] = status.func_distribution_file_url;
          if (status.top_sheet_uploaded) mapped['Top sheet'] = status.top_sheet_file_url;
          setUploadedDocs(mapped);
          if (activeSNo) setSNo(activeSNo);
        }
      } catch (error) {
        console.error("Session recovery failed", error);
      }
    };
    recoverSession();
  }, []);

  const showNotification = (message: string, severity: 'error' | 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const clearSession = () => {
    localStorage.removeItem("currentSNo");
    setSNo(null);
    setUploadedDocs({});
    setSelectedFiles({});
    setDocErrors({});
  };

  const handleCreateDocument = async () => {
    clearSession();
    try {
      const data = await fetchWrapper.post(`${config.apiUrl}/api/create-master`, {});
      if (data && data.s_no) {
        setSNo(data.s_no);
        localStorage.setItem("currentSNo", data.s_no);
      }
    } catch (error) {
      console.error("Master creation failed", error);
    }
  };

  const uploadFile = async (doc: string, file: File) => {
    if (!sNo) return;
    setUploading(prev => ({ ...prev, [doc]: true }));
    try {
      const documentTypeByDoc: Record<string, string> = {
        'DRM APP': 'FINANCE_DRM_APP',
        'D&G Letter': 'GM_APPROVAL_LETTER',
        'Estimate reference': 'ESTIMATE_DOC',
        'Func distribution letter': 'FUNC_DISTRIBUTION',
        'Top sheet': 'TOP_SHEET',
      };

      const apiPathByDoc: Record<string, string> = {
        'D&G Letter': '/api/extract-GM-data'
      };

      const documentType = documentTypeByDoc[doc] || 'FINANCE_DOC';
      const apiPath = apiPathByDoc[doc] || '/api/extract-finance-data';

      setDocErrors(prev => ({ ...prev, [doc]: null }));
      const url = await uploadDocumenttoblob(doc, file);
      await getdata(file, documentType, sNo, file.name, url, apiPath, doc);

      setUploadedDocs(prev => ({ ...prev, [doc]: url }));
      setSelectedFiles(prev => ({ ...prev, [doc]: null }));
      showNotification('Document uploaded successfully!', 'success');
    } catch (error: any) {
      setDocErrors(prev => ({ ...prev, [doc]: error.toString() }));
      showNotification('Upload failed', 'error');
    } finally {
      setUploading(prev => ({ ...prev, [doc]: false }));
    }
  };

  const documents = ['DRM APP', 'D&G Letter', 'Estimate reference', 'Func distribution letter', 'Top sheet'];

  const handleReviewReplace = (row: any) => {
    setSNo(row.s_no);
    localStorage.setItem("currentSNo", row.s_no);
    const mapped: any = {};
    if (row.drm_app_uploaded) mapped['DRM APP'] = row.drm_app_file_url;
    if (row.dg_letter_uploaded) mapped['D&G Letter'] = row.dg_letter_file_url;
    if (row.estimate_uploaded) mapped['Estimate reference'] = row.estimate_file_url;
    if (row.func_distribution_uploaded) mapped['Func distribution letter'] = row.func_distribution_file_url;
    if (row.top_sheet_uploaded) mapped['Top sheet'] = row.top_sheet_file_url;
    setUploadedDocs(mapped);
    setActiveTab(0);
  };

  return (
    <Box className="finance-page">
      <Box className="finance-top-bar">
        <Typography variant="subtitle1">Document Management - Upload Portal</Typography>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Stack direction="row" alignItems="center" spacing={0.75}>
            <Box className="finance-status-dot" sx={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#28a745' }} />
            <Typography variant="caption" className="finance-status-wrap">STATUS ACTIVE</Typography>
          </Stack>
        </Stack>
      </Box>

      <Box sx={{ padding: '24px 20px', maxWidth: '100%', margin: '0 auto' }}>
        <Box sx={{
          padding: '24px 20px', maxWidth: '1100px', margin: '0 auto', borderRadius: '20px',
          border: '1px solid #d6e3f5', background: 'linear-gradient(180deg, #f7faff 0%, #f1f6ff 100%)',
          boxShadow: '0 18px 34px rgba(20, 44, 83, 0.12)'
        }}>
          <Box className="finance-header">
            <Typography variant="h5" sx={{ fontSize: '1.75rem', fontWeight: 700, color: '#343a40' }}>Document Management</Typography>
            <Typography className="subtitle">Upload documents and review submissions</Typography>
          </Box>

          <Card sx={{ backgroundColor: '#ffffff', border: '1px solid #d6e3f5', boxShadow: '0 14px 28px rgba(20, 44, 83, 0.12)', padding: '24px 28px' }}>
            <CardContent sx={{ padding: 0 }}>
              <Tabs value={activeTab} onChange={handleTabChange} sx={{ marginBottom: '28px' }}>
                <Tab label="Upload Document" />
                <Tab label="Review" />
              </Tabs>

              {activeTab === 0 ? (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                    <Box>
                      <Typography variant="h6" sx={{ color: '#343a40', fontWeight: 600 }}>Upload Documents</Typography>
                      {sNo && <Typography variant="body2" sx={{ fontWeight: 700, color: '#2c3e50', mt: 1 }}>S.No: {sNo}</Typography>}
                    </Box>
                    <Stack direction="row" spacing={2}>
                      <Button variant="contained" onClick={handleCreateDocument} sx={{ borderRadius: '8px', px: 3 }}>+ Add New Document</Button>
                    </Stack>
                  </Box>

                  <Stack spacing={2}>
                    {documents.map((doc, idx) => (
                      <Box key={idx}>
                        <Paper sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: '#f8f9fa', border: '1px solid #e9ecef' }}>
                          <Typography sx={{ fontWeight: 600 }}>{doc}</Typography>
                          <input type="file" ref={el => fileInputRefs.current[doc] = el} hidden onChange={e => { setSelectedFiles(prev => ({ ...prev, [doc]: e.target.files?.[0] || null })); setDocErrors(prev => ({ ...prev, [doc]: null })); }} />
                          <Stack direction="row" spacing={1}>
                            {uploadedDocs[doc] && !selectedFiles[doc] ? (
                              <>
                                <Button size="small" variant="contained" color="success" onClick={() => window.open(uploadedDocs[doc], '_blank')}>View</Button>
                                <Button size="small" variant="outlined" onClick={() => fileInputRefs.current[doc]?.click()}>Replace</Button>
                              </>
                            ) : (
                              <>
                                {selectedFiles[doc] && <Typography variant="caption">{selectedFiles[doc]?.name}</Typography>}
                                <Button
                                  variant="contained"
                                  size="small"
                                  disabled={!sNo || uploading[doc]}
                                  onClick={() => {
                                    const file = selectedFiles[doc];
                                    if (file) {
                                      uploadFile(doc, file);
                                    } else {
                                      fileInputRefs.current[doc]?.click();
                                    }
                                  }}
                                >
                                  {uploading[doc] ? '...' : selectedFiles[doc] ? 'Confirm' : 'Choose File'}
                                </Button>
                              </>
                            )}
                          </Stack>
                        </Paper>
                        {docErrors[doc] && <Typography color="error" variant="caption" sx={{ ml: 1 }}>{docErrors[doc]}</Typography>}
                      </Box>
                    ))}
                  </Stack>
                </Box>
              ) : (
                <Review onReplace={handleReviewReplace} />
              )}
            </CardContent>
          </Card>
          <Box sx={{ mt: 3, textAlign: 'center' }}><Typography variant="caption" sx={{ color: '#6c757d' }}>Document Management Portal</Typography></Box>
        </Box>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} sx={{ borderRadius: '10px' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};




const Review = ({ onReplace }: { onReplace: (row: any) => void }) => {
  const [reviewData, setReviewData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await vettingService.getTableData();
        setReviewData(data || []);
      } catch (error) {
        console.error("Failed to fetch review data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Typography sx={{ p: 4, textAlign: 'center' }}>Loading review data...</Typography>;

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Uploaded Documents Summary</Typography>
      <TableContainer component={Paper} sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderRadius: '12px' }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f8f9fa' }}>
            <TableRow>
              <TableCell><b>S.No</b></TableCell>
              <TableCell><b>DRM APP</b></TableCell>
              <TableCell><b>D&G Letter</b></TableCell>
              <TableCell><b>Estimate</b></TableCell>
              <TableCell><b>Func Dist</b></TableCell>
              <TableCell><b>Top Sheet</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reviewData.map((row, index) => (
              <TableRow key={index} sx={{ '&:hover': { backgroundColor: '#fcfdff' } }}>
                <TableCell sx={{ fontWeight: 600 }}>{row.s_no}</TableCell>

                {['drm_app', 'dg_letter', 'estimate', 'func_distribution', 'top_sheet'].map((type) => {
                  const url = row[`${type}_file_url`];
                  const isUploaded = row[`${type}_uploaded`];
                  return (
                    <TableCell key={type}>
                      {isUploaded ? (
                        <Stack direction="row" spacing={1}>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={() => window.open(url, '_blank')}
                            sx={{ minWidth: '60px', textTransform: 'none' }}
                          >
                            View
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => onReplace(row)}
                            sx={{ minWidth: '70px', textTransform: 'none' }}
                          >
                            Replace
                          </Button>
                        </Stack>
                      ) : (
                        <Typography variant="caption" color="text.secondary">Not Uploaded</Typography>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
            {reviewData.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>No records found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default DocumentUpload;
