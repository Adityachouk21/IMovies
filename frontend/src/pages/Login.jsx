import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import InputGroup from 'react-bootstrap/InputGroup';
import { FaFilm, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaSignInAlt, FaUserShield, FaUser } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setLocalError('Please enter both your email address and password.');
      return;
    }

    try {
      setLoading(true);
      setLocalError('');
      const result = await login(email.trim(), password);

      if (result.success) {
        navigate(redirectPath, { replace: true });
      } else {
        setLocalError(result.error);
      }
    } catch (err) {
      setLocalError(err.message || 'An unexpected error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  // Quick fill helper for testing
  const fillCredentials = (userEmail, userPassword) => {
    setEmail(userEmail);
    setPassword(userPassword);
    setLocalError('');
  };

  return (
    <Container className="py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '75vh' }}>
      <div style={{ maxWidth: '440px', width: '100%' }}>
        
        {/* Brand header */}
        <div className="text-center mb-4">
          <div 
            className="d-inline-flex align-items-center justify-content-center p-3 rounded-3 mb-2 shadow"
            style={{ backgroundColor: 'var(--cinema-red)' }}
          >
            <FaFilm className="text-white fs-3" />
          </div>
          <h3 className="fw-bold text-white mb-1">Welcome Back</h3>
          <p className="text-secondary small">Sign in to your iMovies account to continue booking</p>
        </div>

        <Card className="cinema-card border-secondary border-opacity-25 shadow-lg p-4">
          <Card.Body className="p-0">
            {localError && (
              <Alert variant="danger" className="bg-dark text-danger border-danger border-opacity-50 small py-2 mb-3">
                {localError}
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
              {/* Email */}
              <Form.Group className="mb-3" controlId="loginEmail">
                <Form.Label className="text-secondary small fw-medium">Email Address</Form.Label>
                <InputGroup size="sm">
                  <InputGroup.Text className="bg-dark border-secondary border-opacity-25 text-secondary">
                    <FaEnvelope />
                  </InputGroup.Text>
                  <Form.Control
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-dark border-secondary border-opacity-25 text-light shadow-none"
                  />
                </InputGroup>
              </Form.Group>

              {/* Password */}
              <Form.Group className="mb-4" controlId="loginPassword">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <Form.Label className="text-secondary small fw-medium mb-0">Password</Form.Label>
                  <Link to="/forgot-password" style={{ fontSize: '0.78rem' }} className="text-danger text-decoration-none">
                    Forgot Password?
                  </Link>
                </div>
                <InputGroup size="sm">
                  <InputGroup.Text className="bg-dark border-secondary border-opacity-25 text-secondary">
                    <FaLock />
                  </InputGroup.Text>
                  <Form.Control
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-dark border-secondary border-opacity-25 text-light shadow-none"
                  />
                  <Button
                    variant="dark"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="border-secondary border-opacity-25 text-secondary"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </Button>
                </InputGroup>
              </Form.Group>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-100 cinema-btn-primary py-2 d-flex align-items-center justify-content-center gap-2 mb-3"
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                ) : (
                  <>
                    <FaSignInAlt />
                    <span>Sign In</span>
                  </>
                )}
              </Button>
            </Form>

            {/* Quick Demo Fill Buttons for frictionless evaluation */}
            <div className="pt-3 border-top border-secondary border-opacity-15 text-center">
              <small className="text-secondary d-block mb-2" style={{ fontSize: '0.75rem' }}>
                Quick Test Credentials:
              </small>
              <div className="d-flex gap-2">
                <Button
                  size="sm"
                  variant="outline-secondary"
                  className="w-50 text-light border-secondary border-opacity-50 d-flex align-items-center justify-content-center gap-1"
                  style={{ fontSize: '0.75rem' }}
                  onClick={() => fillCredentials('demo@imovies.com', 'User@12345')}
                >
                  <FaUser className="text-warning small" />
                  <span>Demo User</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline-secondary"
                  className="w-50 text-light border-secondary border-opacity-50 d-flex align-items-center justify-content-center gap-1"
                  style={{ fontSize: '0.75rem' }}
                  onClick={() => fillCredentials('admin@imovies.com', 'Admin@12345')}
                >
                  <FaUserShield className="text-danger small" />
                  <span>Admin User</span>
                </Button>
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Link to Register */}
        <p className="text-center text-secondary small mt-4">
          Don't have an iMovies account yet?{' '}
          <Link to="/register" className="text-danger fw-bold text-decoration-none">
            Create an Account
          </Link>
        </p>
      </div>
    </Container>
  );
}
