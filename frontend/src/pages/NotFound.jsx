import React from 'react';
import { Link } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import { FaFilm, FaHome } from 'react-icons/fa';

export default function NotFound() {
  return (
    <Container className="text-center py-5 my-5">
      <div 
        className="d-inline-flex align-items-center justify-content-center p-3 rounded-circle mb-4"
        style={{ backgroundColor: 'rgba(229, 9, 20, 0.1)', color: 'var(--cinema-red)' }}
      >
        <FaFilm className="display-4" />
      </div>
      <h1 className="display-3 fw-bold text-white mb-2">404</h1>
      <h4 className="text-secondary mb-4">Scene Not Found</h4>
      <p className="text-secondary mx-auto mb-4" style={{ maxWidth: '480px' }}>
        The page you are looking for might have been removed, had its title changed, or is temporarily unavailable.
      </p>
      <Button as={Link} to="/" className="cinema-btn-primary px-4 py-2 d-inline-flex align-items-center gap-2">
        <FaHome />
        <span>Back to Home</span>
      </Button>
    </Container>
  );
}
