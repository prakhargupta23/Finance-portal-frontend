import React, { useState, useRef } from 'react';
import { uploadDocument } from '../services/document.service';
import '../css/Finance.css';

const DocumentUpload = () => {
  const [activeTab, setActiveTab] = useState('upload');

  return (
    <div className="finance-page">
      <div style={{ padding: '24px 20px', maxWidth: '800px', margin: '0 auto' }}>
        <div className="finance-header">
          <h1 style={{ fontSize: '1.75rem', margin: 0, background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Document Management
          </h1>
          <p className="subtitle">Upload documents and review submissions</p>
        </div>
        <div className="finance-panel" style={{ backgroundColor: '#fff', padding: '24px 28px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`doc-tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
            >
              Upload Document
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('review')}
              className={`doc-tab-btn ${activeTab === 'review' ? 'active' : ''}`}
            >
              Review
            </button>
          </div>
          {activeTab === 'upload' && <UploadDocument />}
          {activeTab === 'review' && <Review />}
        </div>
      </div>
    </div>
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
      const url = await uploadDocument(doc, file);
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

  return (
    <div>
      <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#475569', fontWeight: 600, fontSize: '1.1rem' }}>
        Upload Documents
      </h3>
      {documents.map((doc, index) => (
        <div key={index} className="doc-row">
          <span className="doc-row-label">{doc}</span>
          {uploadedDocs[doc] ? (
            <button type="button" onClick={() => setActiveView(doc)} className="doc-btn-primary">
              View
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input
                type="file"
                ref={(el) => (fileInputRefs.current[doc] = el)}
                onChange={(e) => setSelectedFiles(prev => ({ ...prev, [doc]: e.target.files?.[0] || null }))}
                style={{ display: 'none' }}
              />
              {selectedFiles[doc] && (
                <span style={{ fontSize: '0.875rem', color: '#64748b', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {selectedFiles[doc]!.name}
                </span>
              )}
              <button
                type="button"
                onClick={() => {
                  if (selectedFiles[doc]) {
                    uploadFile(doc, selectedFiles[doc]!);
                  } else {
                    fileInputRefs.current[doc]?.click();
                  }
                }}
                disabled={uploading[doc]}
                className="doc-btn-primary"
              >
                {uploading[doc] ? 'Uploading…' : selectedFiles[doc] ? 'Upload' : 'Choose File'}
              </button>
            </div>
          )}
        </div>
      ))}
      {activeView && (
        <div className="doc-viewer-panel">
          <h4 style={{ textAlign: 'center', marginBottom: '20px', color: '#334155', fontWeight: 600 }}>
            Viewing {activeView}
          </h4>
          <iframe src={uploadedDocs[activeView]} width="100%" height="600px" title={`Document: ${activeView}`} />
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button type="button" onClick={() => setActiveView(null)} className="doc-btn-close">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const Review = () => {
  return (
    <div className="finance-empty-state" style={{ textAlign: 'center', padding: '48px 24px' }}>
      <div className="icon-wrap" style={{ margin: '0 auto 1rem' }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" fill="currentColor" />
        </svg>
      </div>
      <h3 style={{ color: '#475569', fontWeight: 600, marginBottom: '8px' }}>Review Section</h3>
      <p style={{ color: '#64748b', margin: 0 }}>Review functionality will be implemented here.</p>
    </div>
  );
};

export default DocumentUpload;
