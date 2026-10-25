import React from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import { FaExclamationTriangle } from 'react-icons/fa';

export default function ErrorMessage({ title = 'Error Occurred', message, onRetry }) {
  return (
    <Alert variant="danger" className="bg-dark text-danger border-danger border-opacity-50 my-4 p-4 rounded-3">
      <div className="d-flex align-items-center mb-2">
        <FaExclamationTriangle className="me-2 fs-5" />
        <Alert.Heading className="fs-6 fw-bold mb-0">{title}</Alert.Heading>
      </div>
      <p className="mb-2 small text-light text-opacity-75">{message || 'Something went wrong while processing your request.'}</p>
      {onRetry && (
        <Button variant="outline-danger" size="sm" onClick={onRetry} className="mt-2">
          Try Again
        </Button>
      )}
    </Alert>
  );
}
