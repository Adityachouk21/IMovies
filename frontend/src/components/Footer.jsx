import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Link } from 'react-router-dom';
import { FaFilm, FaShieldAlt, FaEnvelope, FaPhoneAlt, FaMapMarkerAlt, FaHeart } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="mt-auto py-5 border-top border-secondary border-opacity-10" style={{ backgroundColor: '#090d15' }}>
      <Container>
        <Row className="gy-4">
          {/* Brand Info */}
          <Col lg={4} md={6}>
            <div className="d-flex align-items-center mb-3">
              <div 
                className="d-flex align-items-center justify-content-center me-2 rounded-2"
                style={{ width: '32px', height: '32px', backgroundColor: 'var(--cinema-red)' }}
              >
                <FaFilm className="text-white" />
              </div>
              <span className="fw-bold fs-5 text-white">
                i<span style={{ color: 'var(--cinema-red)' }}>Movies</span>
              </span>
            </div>
            <p className="text-secondary small pe-lg-4 lh-base">
              Next-generation cinema ticketing platform with real-time seat lock protection, verified payment gateways, and instant digital tickets.
            </p>
            <div className="d-flex align-items-center text-success small gap-2">
              <FaShieldAlt />
              <span className="text-secondary" style={{ fontSize: '0.78rem' }}>256-Bit SSL Encrypted & Verified Checkouts</span>
            </div>
          </Col>

          {/* Quick Links */}
          <Col lg={2} sm={6}>
            <h6 className="text-white fw-bold mb-3 small text-uppercase tracking-wider">Explore</h6>
            <ul className="list-unstyled small mb-0 d-flex flex-column gap-2">
              <li><Link to="/movies" className="text-secondary text-decoration-none hover-danger">Now Showing</Link></li>
              <li><Link to="/movies?status=coming_soon" className="text-secondary text-decoration-none hover-danger">Coming Soon</Link></li>
              <li><Link to="/theaters" className="text-secondary text-decoration-none hover-danger">Cinemas</Link></li>
              <li><Link to="/profile" className="text-secondary text-decoration-none hover-danger">My Bookings</Link></li>
            </ul>
          </Col>

          {/* Top Genres */}
          <Col lg={3} sm={6}>
            <h6 className="text-white fw-bold mb-3 small text-uppercase tracking-wider">Top Genres</h6>
            <ul className="list-unstyled small mb-0 d-flex flex-column gap-2">
              <li><span className="text-secondary">Action & Blockbusters</span></li>
              <li><span className="text-secondary">Sci-Fi & Cyberpunk</span></li>
              <li><span className="text-secondary">Suspense & Thrillers</span></li>
              <li><span className="text-secondary">Animation & IMAX</span></li>
            </ul>
          </Col>

          {/* Contact */}
          <Col lg={3} md={6}>
            <h6 className="text-white fw-bold mb-3 small text-uppercase tracking-wider">Support</h6>
            <ul className="list-unstyled small mb-0 d-flex flex-column gap-2 text-secondary">
              <li className="d-flex align-items-center gap-2">
                <FaEnvelope className="text-danger" />
                <span>support@imovies.local</span>
              </li>
              <li className="d-flex align-items-center gap-2">
                <FaPhoneAlt className="text-danger" />
                <span>+91 1800-123-4567</span>
              </li>
              <li className="d-flex align-items-center gap-2">
                <FaMapMarkerAlt className="text-danger" />
                <span>Mumbai, Maharashtra, India</span>
              </li>
            </ul>
          </Col>
        </Row>

        <hr className="my-4 border-secondary border-opacity-10" />

        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center small text-secondary">
          <p className="mb-2 mb-sm-0" style={{ fontSize: '0.8rem' }}>
            © {new Date().getFullYear()} iMovies Platform. Built with React, Express & MongoDB.
          </p>
          <div className="d-flex gap-3" style={{ fontSize: '0.8rem' }}>
            <span role="button" className="text-secondary">Privacy</span>
            <span role="button" className="text-secondary">Terms</span>
            <span role="button" className="text-secondary">Security</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
