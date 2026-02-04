import React, { useState } from 'react';
import bg2 from '../assets/bg2.jpg';

const DocumentUpload = () => {
  const [activeTab, setActiveTab] = useState('upload');

  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: `url(${bg2})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '10px',
        padding: '30px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '800px'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>Document Management</h2>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
          <button
            onClick={() => setActiveTab('upload')}
            style={{
              padding: '12px 24px',
              marginRight: '10px',
              backgroundColor: activeTab === 'upload' ? '#007bff' : '#f8f9fa',
              color: activeTab === 'upload' ? 'white' : '#333',
              border: '2px solid #007bff',
              borderRadius: '25px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              boxShadow: activeTab === 'upload' ? '0 2px 4px rgba(0, 123, 255, 0.3)' : 'none'
            }}
          >
            Upload Document
          </button>
          <button
            onClick={() => setActiveTab('review')}
            style={{
              padding: '12px 24px',
              backgroundColor: activeTab === 'review' ? '#007bff' : '#f8f9fa',
              color: activeTab === 'review' ? 'white' : '#333',
              border: '2px solid #007bff',
              borderRadius: '25px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              boxShadow: activeTab === 'review' ? '0 2px 4px rgba(0, 123, 255, 0.3)' : 'none'
            }}
          >
            Review
          </button>
        </div>
        {activeTab === 'upload' && <UploadDocument />}
        {activeTab === 'review' && <Review />}
      </div>
    </div>
  );
};

const UploadDocument = () => {
  const documents = [
    'DRM APP',
    'D&G Letter',
    'Estimate reference',
    'Func distribution letter',
    'Top sheet'
  ];

  return (
    <div>
      <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#555' }}>Upload Documents</h3>
      {documents.map((doc, index) => (
        <div key={index} style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '15px',
          padding: '15px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #e9ecef',
          transition: 'box-shadow 0.3s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)'}
        onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
        >
          <span style={{ flex: 1, fontWeight: 'bold', color: '#333' }}>{doc}</span>
          <input
            type="file"
            style={{
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              backgroundColor: 'white',
              cursor: 'pointer'
            }}
          />
        </div>
      ))}
    </div>
  );
};

const Review = () => {
  return (
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <h3 style={{ color: '#555' }}>Review Section</h3>
      <p style={{ color: '#777' }}>Review functionality will be implemented here.</p>
    </div>
  );
};

export default DocumentUpload;
