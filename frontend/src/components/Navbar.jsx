import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';
import { 
  FaFilm, FaSearch, FaMapMarkerAlt, FaSignInAlt, FaUserPlus, 
  FaUser, FaTicketAlt, FaSignOutAlt, FaUserShield 
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

export default function AppNavbar() {
  const [selectedCity, setSelectedCity] = useState('Mumbai');
  const [searchQuery, setSearchQuery] = useState('');
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const location = useLocation();

  const cities = ['Mumbai', 'Delhi-NCR', 'Bengaluru', 'Hyderabad', 'Chennai', 'Kolkata'];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/movies?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <Navbar expand="lg" variant="dark" sticky="top" className="cinema-nav py-3">
      <Container>
        {/* Brand Logo */}
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center me-4">
          <div 
            className="d-flex align-items-center justify-content-center me-2 rounded-3 shadow-sm"
            style={{ width: '38px', height: '38px', backgroundColor: 'var(--cinema-red)' }}
          >
            <FaFilm className="text-white fs-5" />
          </div>
          <span className="fw-bold fs-4 tracking-tight text-white">
            i<span style={{ color: 'var(--cinema-red)' }}>Movies</span>
          </span>
        </Navbar.Brand>

        {/* City Selector */}
        <div className="d-none d-md-flex align-items-center bg-dark border border-secondary border-opacity-25 rounded-pill px-3 py-1 me-3">
          <FaMapMarkerAlt className="text-danger me-2 small" />
          <Form.Select 
            size="sm" 
            value={selectedCity} 
            onChange={(e) => setSelectedCity(e.target.value)}
            className="bg-transparent border-0 text-light p-0 pe-4 shadow-none"
            style={{ fontSize: '0.82rem', cursor: 'pointer' }}
          >
            {cities.map((city) => (
              <option key={city} value={city} className="bg-dark text-light">
                {city}
              </option>
            ))}
          </Form.Select>
        </div>

        <Navbar.Toggle aria-controls="imovies-navbar-nav" className="border-secondary border-opacity-50" />

        <Navbar.Collapse id="imovies-navbar-nav">
          {/* Search Bar */}
          <Form onSubmit={handleSearchSubmit} className="d-flex my-2 my-lg-0 mx-lg-auto" style={{ maxWidth: '360px', width: '100%' }}>
            <InputGroup size="sm">
              <InputGroup.Text className="bg-dark border-secondary border-opacity-25 text-secondary rounded-start-pill ps-3">
                <FaSearch />
              </InputGroup.Text>
              <Form.Control
                type="search"
                placeholder="Search movies, genres, theaters..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-dark border-secondary border-opacity-25 text-light rounded-end-pill pe-3 shadow-none"
                style={{ fontSize: '0.85rem' }}
              />
            </InputGroup>
          </Form>

          {/* Navigation Links */}
          <Nav className="ms-auto align-items-lg-center">
            <Nav.Link 
              as={Link} 
              to="/movies" 
              className={`px-3 fw-medium ${location.pathname === '/movies' ? 'text-danger' : 'text-light'}`}
            >
              Movies
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/theaters" 
              className={`px-3 fw-medium ${location.pathname === '/theaters' ? 'text-danger' : 'text-light'}`}
            >
              Theaters
            </Nav.Link>

            {/* Authentication States */}
            {isAuthenticated ? (
              <NavDropdown
                title={
                  <div className="d-inline-flex align-items-center gap-2 text-light">
                    <img
                      src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                      alt={user.name}
                      className="rounded-circle border border-danger"
                      style={{ width: '28px', height: '28px', objectFit: 'cover' }}
                    />
                    <span className="small fw-semibold text-truncate" style={{ maxWidth: '120px' }}>
                      {user.name}
                    </span>
                  </div>
                }
                id="user-profile-dropdown"
                align="end"
                className="ms-lg-3 mt-2 mt-lg-0 cinema-dropdown"
              >
                <NavDropdown.Item as={Link} to="/profile" className="d-flex align-items-center gap-2 small py-2">
                  <FaUser className="text-secondary" />
                  <span>My Profile</span>
                </NavDropdown.Item>

                <NavDropdown.Item as={Link} to="/bookings" className="d-flex align-items-center gap-2 small py-2">
                  <FaTicketAlt className="text-danger" />
                  <span>My Bookings</span>
                </NavDropdown.Item>

                {isAdmin && (
                  <NavDropdown.Item as={Link} to="/admin" className="d-flex align-items-center gap-2 small py-2 text-danger fw-bold">
                    <FaUserShield />
                    <span>Admin Dashboard</span>
                  </NavDropdown.Item>
                )}

                <NavDropdown.Divider className="border-secondary border-opacity-25 my-1" />

                <NavDropdown.Item onClick={logout} className="d-flex align-items-center gap-2 small py-2 text-danger">
                  <FaSignOutAlt />
                  <span>Sign Out</span>
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <div className="d-flex align-items-center ms-lg-3 mt-3 mt-lg-0 gap-2">
                <Button 
                  as={Link} 
                  to="/login" 
                  variant="outline-light" 
                  size="sm" 
                  className="px-3 py-1 rounded-3 d-flex align-items-center gap-1 border-secondary border-opacity-50"
                >
                  <FaSignInAlt className="small" />
                  <span>Sign In</span>
                </Button>
                <Button 
                  as={Link} 
                  to="/register" 
                  size="sm" 
                  className="px-3 py-1 rounded-3 cinema-btn-primary d-flex align-items-center gap-1"
                >
                  <FaUserPlus className="small" />
                  <span>Sign Up</span>
                </Button>
              </div>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
