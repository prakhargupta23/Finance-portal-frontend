import React, { useState, useRef } from 'react';
import { uploadDocument } from '../services/document.service';
import bg2 from '../assets/bg3.png';

const DocumentUpload = () => {
  const [activeTab, setActiveTab] = useState('upload');

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '15px',
        padding: '40px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
        width: '100%',
        maxWidth: '900px',
        backdropFilter: 'blur(10px)'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#333', fontSize: '2rem', fontWeight: 'bold' }}>📄 Document Management</h2>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
          <button
            onClick={() => setActiveTab('upload')}
            style={{
              padding: '15px 30px',
              marginRight: '15px',
              backgroundColor: activeTab === 'upload' ? '#4CAF50' : '#f1f1f1',
              color: activeTab === 'upload' ? 'white' : '#333',
              border: 'none',
              borderRadius: '30px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1rem',
              transition: 'all 0.3s ease',
              boxShadow: activeTab === 'upload' ? '0 4px 15px rgba(76, 175, 80, 0.4)' : '0 2px 5px rgba(0,0,0,0.1)',
              transform: activeTab === 'upload' ? 'scale(1.05)' : 'scale(1)'
            }}
          >
            ⬆️ Upload Document
          </button>
          <button
            onClick={() => setActiveTab('review')}
            style={{
              padding: '15px 30px',
              backgroundColor: activeTab === 'review' ? '#2196F3' : '#f1f1f1',
              color: activeTab === 'review' ? 'white' : '#333',
              border: 'none',
              borderRadius: '30px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1rem',
              transition: 'all 0.3s ease',
              boxShadow: activeTab === 'review' ? '0 4px 15px rgba(33, 150, 243, 0.4)' : '0 2px 5px rgba(0,0,0,0.1)',
              transform: activeTab === 'review' ? 'scale(1.05)' : 'scale(1)'
            }}
          >
            👁️ Review
          </button>
        </div>
        {activeTab === 'upload' && <UploadDocument />}
        {activeTab === 'review' && <Review />}
      </div>
    </div>
  );
};

const UploadDocument = () => {
  const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: File | null }>({});
  const [uploadedDocs, setUploadedDocs] = useState<{ [key: string]: string }>({});
  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});
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
      <h3 style={{ textAlign: 'center', marginBottom: '30px', color: '#333', fontSize: '1.5rem', fontWeight: 'bold' }}>⬆️ Upload Your Documents</h3>
      {documents.map((doc, index) => (
        <div key={index} style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          padding: '20px',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #ddd',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.3s ease',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.15)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.05)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
        >
          <span style={{ flex: 1, fontWeight: 'bold', color: '#333', fontSize: '1.1rem' }}>📄 {doc}</span>
          {uploadedDocs[doc] ? (
            <button
              onClick={() => window.open(uploadedDocs[doc], '_blank')}
              style={{
                padding: '10px 20px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 5px rgba(76, 175, 80, 0.3)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#45a049'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4CAF50'}
            >
              👁️ View
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <input
                type="file"
                ref={(el) => fileInputRefs.current[doc] = el}
                onChange={(e) => setSelectedFiles(prev => ({ ...prev, [doc]: e.target.files?.[0] || null }))}
                style={{ display: 'none' }}
              />
              {selectedFiles[doc] && (
                <span style={{ fontSize: '0.9rem', color: '#666', fontStyle: 'italic' }}>📎 {selectedFiles[doc]!.name}</span>
              )}
              <button
                onClick={() => {
                  if (selectedFiles[doc]) {
                    uploadFile(doc, selectedFiles[doc]!);
                  } else {
                    fileInputRefs.current[doc]?.click();
                  }
                }}
                disabled={uploading[doc]}
                style={{
                  padding: '10px 20px',
                  backgroundColor: uploading[doc] ? '#ccc' : selectedFiles[doc] ? '#FF9800' : '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: uploading[doc] ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                  transition: 'all 0.3s ease',
                  boxShadow: uploading[doc] ? 'none' : '0 2px 5px rgba(0,0,0,0.2)'
                }}
                onMouseEnter={(e) => {
                  if (!uploading[doc]) {
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                {uploading[doc] ? '⏳ Uploading...' : selectedFiles[doc] ? '⬆️ Upload' : '📂 Choose File'}
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const Review = () => {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <h3 style={{ color: '#333', fontSize: '1.8rem', marginBottom: '20px' }}>🔍 Review Section</h3>
      <p style={{ color: '#666', fontSize: '1.1rem', lineHeight: '1.6' }}>Review functionality will be implemented here. Stay tuned for updates!</p>
      <div style={{ marginTop: '30px' }}>
        <span style={{ fontSize: '3rem' }}>🚧</span>
      </div>
    </div>
  );
};

export default DocumentUpload;
