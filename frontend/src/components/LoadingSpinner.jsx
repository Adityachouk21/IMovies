import React from 'react';
import Spinner from 'react-bootstrap/Spinner';

export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5">
      <Spinner animation="border" variant="danger" role="status" style={{ width: '3rem', height: '3rem' }}>
        <span className="visually-hidden">Loading...</span>
      </Spinner>
      {message && <p className="text-secondary mt-3 small fw-medium">{message}</p>}
    </div>
  );
}
