import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Modal from 'react-bootstrap/Modal';
import Spinner from 'react-bootstrap/Spinner';
import { 
  FaTicketAlt, FaCalendarAlt, FaClock, FaMapMarkerAlt, 
  FaQrcode, FaBarcode, FaPrint, FaTimesCircle, FaCheckCircle, 
  FaExclamationTriangle, FaFilm, FaArrowLeft, FaShieldAlt
} from 'react-icons/fa';

import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Bookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Cancellation state
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // Active Ticket Pass Modal
  const [activePass, setActivePass] = useState(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/bookings/my');
      setBookings(res.data || []);
    } catch (err) {
      console.error('Failed to load user bookings:', err);
      setError(err.message || 'Unable to retrieve your booking passes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async () => {
    if (!selectedBookingForCancel) return;
    try {
      setCancelling(true);
      await api.post(`/bookings/${selectedBookingForCancel._id}/cancel`);
      setActionSuccess(`Ticket ${selectedBookingForCancel.bookingReference} has been successfully cancelled. Refund initiated.`);
      setCancelModalOpen(false);
      setSelectedBookingForCancel(null);
      fetchBookings();
    } catch (err) {
      console.error('Failed to cancel ticket:', err);
      setError(err.message || 'Unable to cancel ticket at this time');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading your cinema passes..." />;
  }

  return (
    <div className="bookings-page py-5" style={{ backgroundColor: '#07090e', minHeight: '85vh' }}>
      <Container>
        {/* Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 pb-3 border-bottom border-secondary border-opacity-15 gap-3">
          <div>
            <h2 className="text-white fw-bold mb-1 d-flex align-items-center gap-2">
              <FaTicketAlt className="text-danger" /> My Digital Tickets
            </h2>
            <p className="text-secondary small mb-0">
              Manage your movie passes, show barcodes at the cinema gate, or view receipts.
            </p>
          </div>

          <Button as={Link} to="/movies" variant="danger" className="cinema-btn-primary fw-semibold">
            Explore Movies
          </Button>
        </div>

        {error && (
          <Alert variant="danger" onClose={() => setError(null)} dismissible className="bg-danger bg-opacity-10 border-danger text-danger">
            <FaExclamationTriangle className="me-2" /> {error}
          </Alert>
        )}

        {actionSuccess && (
          <Alert variant="success" onClose={() => setActionSuccess(null)} dismissible className="bg-success bg-opacity-10 border-success text-success">
            <FaCheckCircle className="me-2" /> {actionSuccess}
          </Alert>
        )}

        {bookings.length === 0 ? (
          <Card className="cinema-card border-secondary border-opacity-25 p-5 text-center my-4 shadow-sm">
            <div className="text-secondary opacity-25 mb-3">
              <FaTicketAlt style={{ fontSize: '4rem' }} />
            </div>
            <h4 className="text-light fw-bold">No Bookings Found</h4>
            <p className="text-secondary small max-w-md mx-auto mb-4" style={{ maxWidth: '420px' }}>
              You haven't reserved any movie tickets yet. Browse our now showing blockbusters and book your seats in real-time!
            </p>
            <div>
              <Button as={Link} to="/showtimes" variant="danger" className="cinema-btn-primary px-4 py-2">
                Browse Showtimes
              </Button>
            </div>
          </Card>
        ) : (
          <div className="d-flex flex-column gap-4">
            {bookings.map((booking) => {
              const show = booking.showId || booking.show || {};
              const movie = show.movieId || {};
              const theater = show.theaterId || {};
              const screen = show.screenId || {};
              const isCancelled = booking.bookingStatus === 'cancelled';

              const startTimeStr = show.startTime ? new Date(show.startTime).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              }) : '07:30 PM';

              const showDateStr = show.startTime ? new Date(show.startTime).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              }) : 'Today';

              const seatLabels = booking.seats?.map((s) => s.seatLabel || `${s.row}${s.seatNumber}`).join(', ') || 'N/A';

              return (
                <Card 
                  key={booking._id} 
                  className={`cinema-card border-secondary border-opacity-25 overflow-hidden shadow-lg transition-all ${isCancelled ? 'opacity-75' : ''}`}
                >
                  <Row className="g-0">
                    {/* Poster Strip */}
                    <Col md={3} lg={2} className="position-relative bg-dark d-flex align-items-center justify-content-center p-0">
                      <img 
                        src={movie.posterUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400'} 
                        alt={movie.title || 'Movie'}
                        className="w-100 h-100 object-fit-cover position-absolute top-0 start-0"
                        style={{ minHeight: '160px' }}
                      />
                      <div className="position-absolute top-0 start-0 w-100 h-100 bg-gradient-to-t from-dark via-transparent to-transparent opacity-80" />
                    </Col>

                    {/* Ticket Details */}
                    <Col md={6} lg={7} className="p-4 d-flex flex-column justify-content-between">
                      <div>
                        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
                          <div className="d-flex align-items-center gap-2">
                            <h4 className="text-white fw-bold mb-0">{movie.title || 'Blockbuster Movie'}</h4>
                            <Badge bg="dark" className="border border-secondary border-opacity-50 text-secondary small">
                              {movie.language || 'English'}
                            </Badge>
                          </div>

                          <Badge 
                            bg={isCancelled ? 'danger' : 'success'} 
                            className="text-uppercase fw-semibold px-2 py-1"
                            style={{ fontSize: '0.72rem' }}
                          >
                            {booking.bookingStatus}
                          </Badge>
                        </div>

                        {/* Theater & Time */}
                        <div className="text-secondary small d-flex flex-wrap gap-3 mb-3">
                          <span className="text-light d-flex align-items-center gap-1">
                            <FaMapMarkerAlt className="text-danger" /> {theater.name || 'Multiplex Cinema'}, {theater.city || 'Downtown'}
                          </span>
                          <span className="d-flex align-items-center gap-1">
                            <FaFilm className="text-secondary" /> {screen.name || 'IMAX Screen'}
                          </span>
                        </div>

                        {/* Date, Time & Seats Grid */}
                        <div className="p-3 rounded-3 bg-dark bg-opacity-60 border border-secondary border-opacity-15 d-flex flex-wrap justify-content-between align-items-center gap-3">
                          <div>
                            <span className="d-block text-secondary text-uppercase fw-semibold" style={{ fontSize: '0.68rem' }}>Date & Showtime</span>
                            <span className="text-white fw-bold small">{showDateStr} • {startTimeStr}</span>
                          </div>

                          <div>
                            <span className="d-block text-secondary text-uppercase fw-semibold" style={{ fontSize: '0.68rem' }}>Seats Allocated</span>
                            <span className="text-danger fw-bold small">{seatLabels}</span>
                          </div>

                          <div>
                            <span className="d-block text-secondary text-uppercase fw-semibold" style={{ fontSize: '0.68rem' }}>Total Paid</span>
                            <div className="d-flex align-items-center gap-1">
                              <span className="text-success fw-bold small">₹{booking.totalAmount?.toFixed(2)}</span>
                              {booking.discount > 0 && (
                                <Badge bg="success" className="text-uppercase" style={{ fontSize: '0.62rem' }}>
                                  Saved ₹{booking.discount}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Ticket Footer Actions */}
                      <div className="d-flex flex-wrap align-items-center justify-content-between pt-3 mt-3 border-top border-secondary border-opacity-15 gap-2">
                        <span className="text-secondary small font-monospace">
                          Ref: <strong className="text-light">{booking.bookingReference}</strong>
                        </span>

                        <div className="d-flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline-light" 
                            onClick={() => setActivePass(booking)}
                            className="d-flex align-items-center gap-1"
                          >
                            <FaQrcode /> View Digital Pass
                          </Button>

                          {!isCancelled && (
                            <Button 
                              size="sm" 
                              variant="outline-danger" 
                              onClick={() => {
                                setSelectedBookingForCancel(booking);
                                setCancelModalOpen(true);
                              }}
                            >
                              Cancel Ticket
                            </Button>
                          )}
                        </div>
                      </div>
                    </Col>

                    {/* Quick QR Code Sidebar */}
                    <Col md={3} lg={3} className="bg-dark bg-opacity-75 p-4 border-start border-secondary border-opacity-15 d-none d-md-flex flex-column align-items-center justify-content-center text-center">
                      <div className="p-3 bg-white rounded-3 shadow-sm mb-2">
                        <FaQrcode style={{ fontSize: '4.5rem', color: '#07090e' }} />
                      </div>
                      <span className="font-monospace text-secondary fw-semibold" style={{ fontSize: '0.75rem' }}>
                        {booking.bookingReference}
                      </span>
                      <span className="text-secondary" style={{ fontSize: '0.68rem' }}>
                        Gate Entry Barcode
                      </span>
                    </Col>
                  </Row>
                </Card>
              );
            })}
          </div>
        )}
      </Container>

      {/* Digital Cinema Ticket Modal */}
      <Modal 
        show={!!activePass} 
        onHide={() => setActivePass(null)} 
        centered 
        contentClassName="cinema-card border-secondary border-opacity-50 text-light shadow-2xl p-0 overflow-hidden"
      >
        <div className="p-4" style={{ backgroundColor: '#0f172a' }}>
          <div className="d-flex justify-content-between align-items-center border-bottom border-secondary border-opacity-25 pb-3 mb-3">
            <div className="d-flex align-items-center gap-2">
              <span className="fw-black fs-4 text-danger tracking-wider">iMOVIES</span>
              <Badge bg="danger" className="text-uppercase" style={{ fontSize: '0.65rem' }}>E-Pass</Badge>
            </div>
            <span className="font-monospace text-secondary small">{activePass?.bookingReference}</span>
          </div>

          {/* Ticket Body */}
          <div className="text-center py-2">
            <h4 className="text-white fw-bold mb-1">
              {activePass?.showId?.movieId?.title || activePass?.show?.movieId?.title || 'Blockbuster Movie'}
            </h4>
            <p className="text-secondary small mb-3">
              {activePass?.showId?.theaterId?.name || 'Multiplex Cinema'} • {activePass?.showId?.screenId?.name || 'Audi 1'}
            </p>

            {/* QR Simulation Card */}
            <div className="d-inline-flex p-4 bg-white rounded-3 shadow mb-3 text-center">
              <FaQrcode style={{ fontSize: '8rem', color: '#07090e' }} />
            </div>

            <div className="font-monospace text-secondary mb-3 small">
              Scan this QR code at the theater turnstile
            </div>

            {/* Ticket breakdown details */}
            <div className="bg-dark bg-opacity-75 rounded-3 p-3 border border-secondary border-opacity-25 text-start small">
              <div className="d-flex justify-content-between mb-2">
                <span className="text-secondary">Seats:</span>
                <span className="text-danger fw-bold">
                  {activePass?.seats?.map((s) => s.seatLabel || `${s.row}${s.seatNumber}`).join(', ')}
                </span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-secondary">Date & Time:</span>
                <span className="text-light">
                  {activePass?.showId?.startTime ? new Date(activePass.showId.startTime).toLocaleString('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  }) : 'Show Time'}
                </span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-secondary">Total Paid:</span>
                <span className="text-success fw-bold">₹{activePass?.totalAmount?.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <Modal.Footer className="border-secondary border-opacity-25 justify-content-between">
          <Button variant="outline-secondary" size="sm" onClick={() => window.print()} className="d-flex align-items-center gap-1 text-light">
            <FaPrint /> Print Ticket
          </Button>
          <Button variant="danger" size="sm" onClick={() => setActivePass(null)} className="cinema-btn-primary">
            Close Pass
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Cancellation Confirmation Modal */}
      <Modal 
        show={cancelModalOpen} 
        onHide={() => setCancelModalOpen(false)} 
        centered 
        contentClassName="cinema-card border-secondary border-opacity-50 text-light shadow-xl"
      >
        <Modal.Header closeButton closeVariant="white" className="border-secondary border-opacity-25">
          <Modal.Title className="fw-bold text-white d-flex align-items-center gap-2">
            <FaTimesCircle className="text-danger" /> Cancel Booking
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="py-4">
          <p className="text-light mb-3">
            Are you sure you want to cancel booking pass <strong className="text-danger font-monospace">{selectedBookingForCancel?.bookingReference}</strong>?
          </p>

          <Alert variant="warning" className="bg-warning bg-opacity-10 border-warning text-warning small mb-0">
            <strong>Refund Policy:</strong> Tickets subtotal (₹{selectedBookingForCancel?.subtotal}) will be refunded back to your original payment method within 2-3 business days. Convenience fees are non-refundable.
          </Alert>
        </Modal.Body>

        <Modal.Footer className="border-secondary border-opacity-25">
          <Button variant="outline-secondary" onClick={() => setCancelModalOpen(false)} className="text-light">
            Keep Ticket
          </Button>
          <Button 
            variant="danger" 
            disabled={cancelling}
            onClick={handleCancelBooking} 
            className="cinema-btn-primary"
          >
            {cancelling ? <Spinner animation="border" size="sm" /> : 'Confirm Cancellation'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
