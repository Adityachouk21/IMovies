import React from 'react';
import { Link } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import { 
  FaUser, FaEnvelope, FaPhone, FaShieldAlt, FaTicketAlt, 
  FaHeart, FaSignOutAlt, FaCalendarAlt, FaUserShield 
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, logout, isAdmin } = useAuth();

  if (!user) return null;

  return (
    <Container className="py-5">
      <Row className="gy-4">
        {/* User Card */}
        <Col lg={4}>
          <Card className="cinema-card border-secondary border-opacity-25 text-center p-4">
            <Card.Body className="p-0">
              <div className="position-relative d-inline-block mb-3">
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
                  alt={user.name}
                  className="rounded-circle border border-danger p-1"
                  style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                />
                {isAdmin && (
                  <Badge 
                    bg="danger" 
                    className="position-absolute bottom-0 end-0 rounded-pill p-1 shadow-sm"
                    title="Administrator Account"
                  >
                    <FaUserShield className="small" />
                  </Badge>
                )}
              </div>

              <h4 className="text-white fw-bold mb-1">{user.name}</h4>
              <p className="text-secondary small mb-2">{user.email}</p>

              <Badge bg={isAdmin ? 'danger' : 'secondary'} className="px-3 py-1 mb-4 text-uppercase">
                {isAdmin ? 'Administrator' : 'Verified Member'}
              </Badge>

              <div className="d-grid gap-2">
                {isAdmin && (
                  <Button as={Link} to="/admin" variant="outline-danger" size="sm" className="d-flex align-items-center justify-content-center gap-2">
                    <FaUserShield />
                    <span>Admin Dashboard</span>
                  </Button>
                )}
                <Button 
                  variant="outline-secondary" 
                  size="sm" 
                  onClick={logout}
                  className="text-secondary border-secondary border-opacity-25 d-flex align-items-center justify-content-center gap-2"
                >
                  <FaSignOutAlt />
                  <span>Sign Out</span>
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Profile Details & Navigation Tabs */}
        <Col lg={8}>
          <Card className="cinema-card border-secondary border-opacity-25 p-4 mb-4">
            <h5 className="text-white fw-bold mb-3 border-bottom border-secondary border-opacity-15 pb-2">
              Personal Information
            </h5>
            <Row className="g-3">
              <Col sm={6}>
                <div className="p-3 rounded-2 bg-dark bg-opacity-50 border border-secondary border-opacity-15">
                  <div className="text-secondary small d-flex align-items-center gap-2 mb-1">
                    <FaUser className="text-danger" />
                    <span>Full Name</span>
                  </div>
                  <span className="text-white fw-medium">{user.name}</span>
                </div>
              </Col>

              <Col sm={6}>
                <div className="p-3 rounded-2 bg-dark bg-opacity-50 border border-secondary border-opacity-15">
                  <div className="text-secondary small d-flex align-items-center gap-2 mb-1">
                    <FaEnvelope className="text-danger" />
                    <span>Email Address</span>
                  </div>
                  <span className="text-white fw-medium">{user.email}</span>
                </div>
              </Col>

              <Col sm={6}>
                <div className="p-3 rounded-2 bg-dark bg-opacity-50 border border-secondary border-opacity-15">
                  <div className="text-secondary small d-flex align-items-center gap-2 mb-1">
                    <FaPhone className="text-danger" />
                    <span>Phone Number</span>
                  </div>
                  <span className="text-white fw-medium">{user.phone || 'Not provided'}</span>
                </div>
              </Col>

              <Col sm={6}>
                <div className="p-3 rounded-2 bg-dark bg-opacity-50 border border-secondary border-opacity-15">
                  <div className="text-secondary small d-flex align-items-center gap-2 mb-1">
                    <FaCalendarAlt className="text-danger" />
                    <span>Member Since</span>
                  </div>
                  <span className="text-white fw-medium">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'October 2026'}
                  </span>
                </div>
              </Col>
            </Row>
          </Card>

          {/* Quick Access Tiles */}
          <Row className="g-3">
            <Col sm={6}>
              <Card 
                as={Link} 
                to="/bookings" 
                className="cinema-card border-secondary border-opacity-25 p-3 text-decoration-none h-100 d-flex flex-row align-items-center gap-3"
              >
                <div 
                  className="p-3 rounded-3" 
                  style={{ backgroundColor: 'rgba(229, 9, 20, 0.15)', color: 'var(--cinema-red)' }}
                >
                  <FaTicketAlt className="fs-4" />
                </div>
                <div>
                  <h6 className="text-white fw-bold mb-0">My Bookings</h6>
                  <small className="text-secondary">View tickets & upcoming show passes</small>
                </div>
              </Card>
            </Col>

            <Col sm={6}>
              <Card 
                as={Link} 
                to="/watchlist" 
                className="cinema-card border-secondary border-opacity-25 p-3 text-decoration-none h-100 d-flex flex-row align-items-center gap-3"
              >
                <div 
                  className="p-3 rounded-3" 
                  style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}
                >
                  <FaHeart className="fs-4" />
                </div>
                <div>
                  <h6 className="text-white fw-bold mb-0">Saved Watchlist</h6>
                  <small className="text-secondary">Manage favorite upcoming movies</small>
                </div>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
}
