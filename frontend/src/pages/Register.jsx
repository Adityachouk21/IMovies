import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import InputGroup from 'react-bootstrap/InputGroup';
import { FaFilm, FaUser, FaEnvelope, FaPhone, FaLock, FaUserPlus } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setLocalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      setLocalError('Please fill in all required fields.');
      return;
    }

    if (formData.password.length < 6) {
      setLocalError('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      setLocalError('');
      const result = await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword
      });

      if (result.success) {
        navigate('/', { replace: true });
      } else {
        setLocalError(result.error);
      }
    } catch (err) {
      setLocalError(err.message || 'An error occurred during account registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div style={{ maxWidth: '480px', width: '100%' }}>
        
        {/* Header */}
        <div className="text-center mb-4">
          <div 
            className="d-inline-flex align-items-center justify-content-center p-3 rounded-3 mb-2 shadow"
            style={{ backgroundColor: 'var(--cinema-red)' }}
          >
            <FaFilm className="text-white fs-3" />
          </div>
          <h3 className="fw-bold text-white mb-1">Create an Account</h3>
          <p className="text-secondary small">Join iMovies to reserve seats, save watchlists, and earn perks</p>
        </div>

        <Card className="cinema-card border-secondary border-opacity-25 shadow-lg p-4">
          <Card.Body className="p-0">
            {localError && (
              <Alert variant="danger" className="bg-dark text-danger border-danger border-opacity-50 small py-2 mb-3">
                {localError}
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
              {/* Full Name */}
              <Form.Group className="mb-3" controlId="regName">
                <Form.Label className="text-secondary small fw-medium">Full Name *</Form.Label>
                <InputGroup size="sm">
                  <InputGroup.Text className="bg-dark border-secondary border-opacity-25 text-secondary">
                    <FaUser />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="bg-dark border-secondary border-opacity-25 text-light shadow-none"
                  />
                </InputGroup>
              </Form.Group>

              {/* Email */}
              <Form.Group className="mb-3" controlId="regEmail">
                <Form.Label className="text-secondary small fw-medium">Email Address *</Form.Label>
                <InputGroup size="sm">
                  <InputGroup.Text className="bg-dark border-secondary border-opacity-25 text-secondary">
                    <FaEnvelope />
                  </InputGroup.Text>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="bg-dark border-secondary border-opacity-25 text-light shadow-none"
                  />
                </InputGroup>
              </Form.Group>

              {/* Phone */}
              <Form.Group className="mb-3" controlId="regPhone">
                <Form.Label className="text-secondary small fw-medium">Phone Number (Optional)</Form.Label>
                <InputGroup size="sm">
                  <InputGroup.Text className="bg-dark border-secondary border-opacity-25 text-secondary">
                    <FaPhone />
                  </InputGroup.Text>
                  <Form.Control
                    type="tel"
                    name="phone"
                    placeholder="+91 9876543210"
                    value={formData.phone}
                    onChange={handleChange}
                    className="bg-dark border-secondary border-opacity-25 text-light shadow-none"
                  />
                </InputGroup>
              </Form.Group>

              {/* Password */}
              <Form.Group className="mb-3" controlId="regPassword">
                <Form.Label className="text-secondary small fw-medium">Password (min 6 characters) *</Form.Label>
                <InputGroup size="sm">
                  <InputGroup.Text className="bg-dark border-secondary border-opacity-25 text-secondary">
                    <FaLock />
                  </InputGroup.Text>
                  <Form.Control
                    type="password"
                    name="password"
                    placeholder="Choose a strong password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="bg-dark border-secondary border-opacity-25 text-light shadow-none"
                  />
                </InputGroup>
              </Form.Group>

              {/* Confirm Password */}
              <Form.Group className="mb-4" controlId="regConfirmPassword">
                <Form.Label className="text-secondary small fw-medium">Confirm Password *</Form.Label>
                <InputGroup size="sm">
                  <InputGroup.Text className="bg-dark border-secondary border-opacity-25 text-secondary">
                    <FaLock />
                  </InputGroup.Text>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="bg-dark border-secondary border-opacity-25 text-light shadow-none"
                  />
                </InputGroup>
              </Form.Group>

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading}
                className="w-100 cinema-btn-primary py-2 d-flex align-items-center justify-content-center gap-2"
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                ) : (
                  <>
                    <FaUserPlus />
                    <span>Create Account</span>
                  </>
                )}
              </Button>
            </Form>
          </Card.Body>
        </Card>

        {/* Link to Login */}
        <p className="text-center text-secondary small mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-danger fw-bold text-decoration-none">
            Sign In here
          </Link>
        </p>
      </div>
    </Container>
  );
}
