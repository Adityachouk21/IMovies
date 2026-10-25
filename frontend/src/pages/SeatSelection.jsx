import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import Alert from 'react-bootstrap/Alert';
import Modal from 'react-bootstrap/Modal';
import Spinner from 'react-bootstrap/Spinner';
import { io } from 'socket.io-client';
import { 
  FaCalendarAlt, FaClock, FaMapMarkerAlt, FaVideo, 
  FaShieldAlt, FaTicketAlt, FaCheckCircle, FaExclamationTriangle,
  FaArrowLeft, FaCreditCard, FaQrcode, FaLock,
  FaTag, FaPercent, FaGift, FaTimes
} from 'react-icons/fa';

import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import SeatGrid from '../components/SeatGrid';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const AVAILABLE_OFFERS = [
  { code: 'IMAX50', title: '50% Off Tickets', desc: 'Up to ₹200 savings on cinema seats', calculate: (sub) => Math.min(200, Math.round(sub * 0.5)) },
  { code: 'FIRSTBOOK', title: 'Flat ₹100 Off', desc: 'New customer welcome bonus', calculate: (sub) => Math.min(100, sub) },
  { code: 'POPCORNFREE', title: 'Zero Convenience Fee', desc: 'Saves 100% booking fee', calculate: (sub, f) => f },
  { code: 'HDFC150', title: 'HDFC Bank Card Offer', desc: 'Flat ₹150 off with cards', calculate: (sub) => Math.min(150, sub) }
];

export default function SeatSelection() {
  const { showId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Show and Seat state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [show, setShow] = useState(null);
  const [rows, setRows] = useState([]);
  const [seatPricing, setSeatPricing] = useState({});
  const [bookedSeats, setBookedSeats] = useState([]);
  const [lockedSeats, setLockedSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);

  // Promo Code & Bank Offers state
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoMessage, setPromoMessage] = useState(null);

  // Socket & Lock Timer state
  const [socketConnected, setSocketConnected] = useState(false);
  const [lockExpiresAt, setLockExpiresAt] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [lockingInProgress, setLockingInProgress] = useState(false);

  // Booking & Modal state
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const socketRef = useRef(null);
  const timerRef = useRef(null);

  // 1. Fetch Show & Seat Map
  const fetchSeatMap = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/shows/${showId}/seats`);
      const data = res.data;

      setShow(data.show);
      setRows(data.rows || []);
      setSeatPricing(data.seatPricing || {});
      setBookedSeats(data.bookedSeats || []);
      setLockedSeats(data.lockedSeats || []);

      // If user had existing locks
      const userLocks = (data.lockedSeats || []).filter((l) => l.isCurrentUsers);
      if (userLocks.length > 0) {
        // Find expiresAt
        const earliestExpiry = Math.min(...userLocks.map((l) => new Date(l.expiresAt).getTime()));
        setLockExpiresAt(earliestExpiry);
      }
    } catch (err) {
      console.error('Failed to load show seat map:', err);
      setError(err.message || 'Unable to load cinema seat map');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeatMap();
  }, [showId]);

  // 2. Setup Real-time WebSockets via Socket.io
  useEffect(() => {
    const socketUrl = import.meta.env.VITE_API_BASE_URL 
      ? import.meta.env.VITE_API_BASE_URL.replace('/api', '') 
      : 'http://localhost:5000';

    const socket = io(socketUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setSocketConnected(true);
      socket.emit('join_show', { showId });
    });

    socket.on('disconnect', () => {
      setSocketConnected(false);
    });

    // Handle real-time lock updates from other users
    socket.on('seats_locked', (data) => {
      if (data.showId === showId) {
        setLockedSeats((prev) => {
          const newLocks = data.seats.map((s) => ({
            seatNumber: s,
            isCurrentUsers: user?._id && String(data.lockedBy) === String(user._id),
            expiresAt: data.expiresAt
          }));
          const filtered = prev.filter((p) => !data.seats.includes(p.seatNumber));
          return [...filtered, ...newLocks];
        });
      }
    });

    // Handle real-time seat releases
    socket.on('seats_released', (data) => {
      if (data.showId === showId) {
        setLockedSeats((prev) => prev.filter((p) => !data.seats.includes(p.seatNumber)));
      }
    });

    // Handle real-time bookings confirmed
    socket.on('seats_booked', (data) => {
      if (data.showId === showId) {
        setBookedSeats((prev) => Array.from(new Set([...prev, ...data.bookedSeats])));
        setLockedSeats((prev) => prev.filter((p) => !data.bookedSeats.includes(p.seatNumber)));
      }
    });

    return () => {
      if (socket) {
        socket.emit('leave_show', { showId });
        socket.disconnect();
      }
    };
  }, [showId, user]);

  // 3. Countdown Timer Handler
  useEffect(() => {
    if (!lockExpiresAt) {
      setTimeLeft(null);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const difference = lockExpiresAt - now;

      if (difference <= 0) {
        setTimeLeft('00:00');
        clearInterval(timerRef.current);
        setSelectedSeats([]);
        setLockExpiresAt(null);
        setActionError('Your seat reservation has expired. Please select your seats again.');
        fetchSeatMap();
      } else {
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        setTimeLeft(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
      }
    };

    updateTimer();
    timerRef.current = setInterval(updateTimer, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [lockExpiresAt]);

  // 4. Handle Seat Click / Toggle
  const handleSeatToggle = async (seat) => {
    setActionError(null);
    const seatLabel = seat.label;
    const isAlreadySelected = selectedSeats.some((s) => s.label === seatLabel);

    let nextSelected = [];
    if (isAlreadySelected) {
      nextSelected = selectedSeats.filter((s) => s.label !== seatLabel);
    } else {
      if (selectedSeats.length >= 10) {
        setActionError('Maximum 10 tickets can be booked per transaction.');
        return;
      }
      nextSelected = [...selectedSeats, seat];
    }

    setSelectedSeats(nextSelected);

    // Synchronize locks with backend
    if (nextSelected.length > 0) {
      try {
        setLockingInProgress(true);
        const labels = nextSelected.map((s) => s.label);
        const res = await api.post(`/shows/${showId}/seat-locks`, { seats: labels });
        const expiry = new Date(res.data.expiresAt).getTime();
        setLockExpiresAt(expiry);
      } catch (err) {
        console.error('Failed to lock seat:', err);
        setActionError(err.message || 'Seat is currently unavailable. Please choose another.');
        setSelectedSeats(selectedSeats); // Revert
      } finally {
        setLockingInProgress(false);
      }
    } else {
      // Release all locks
      try {
        await api.delete(`/shows/${showId}/seat-locks`, {
          data: { seats: selectedSeats.map((s) => s.label) }
        });
        setLockExpiresAt(null);
      } catch (err) {
        console.error('Error releasing locks:', err);
      }
    }
  };

  // 5. Calculate Financials with Promo Offers
  const subtotal = selectedSeats.reduce((sum, seat) => sum + (seat.price || 200), 0);
  const fees = selectedSeats.length * 30; // ₹30 per ticket
  const taxes = Math.round((subtotal + fees) * 0.18); // 18% GST
  const discountAmount = appliedPromo ? appliedPromo.discount : 0;
  const grandTotal = Math.max(0, subtotal + fees + taxes - discountAmount);

  const applyPromoCode = (codeToApply) => {
    setPromoMessage(null);
    const code = (codeToApply || promoInput).trim().toUpperCase();
    if (!code) {
      setPromoMessage({ type: 'danger', text: 'Please enter a valid coupon code.' });
      return;
    }
    const offer = AVAILABLE_OFFERS.find((o) => o.code === code);
    if (!offer) {
      setPromoMessage({ type: 'danger', text: `Promo code "${code}" is invalid or expired.` });
      return;
    }
    if (selectedSeats.length === 0) {
      setPromoMessage({ type: 'warning', text: 'Select at least one seat before applying offer.' });
      return;
    }
    const discount = offer.calculate(subtotal, fees);
    if (discount <= 0) {
      setPromoMessage({ type: 'warning', text: 'Minimum booking threshold not met for this coupon.' });
      return;
    }
    setAppliedPromo({ code: offer.code, title: offer.title, discount });
    setPromoMessage({ type: 'success', text: `Coupon "${offer.code}" applied! You saved ₹${discount.toFixed(2)}.` });
    setPromoInput('');
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
    setPromoMessage(null);
  };

  // 6. Handle Checkout Confirmation
  const handleProceedToPayment = async () => {
    if (selectedSeats.length === 0) {
      setActionError('Please select at least one seat before proceeding.');
      return;
    }

    try {
      setBookingInProgress(true);
      setActionError(null);

      const payload = {
        showId,
        seats: selectedSeats.map((s) => ({
          row: s.row,
          seatNumber: s.number,
          seatLabel: s.label,
          category: s.category,
          price: s.price
        })),
        paymentMethod,
        promoCode: appliedPromo?.code || null,
        discount: discountAmount
      };

      const res = await api.post('/bookings', payload);
      setConfirmedBooking(res.data);
      setShowSuccessModal(true);
      setLockExpiresAt(null);
    } catch (err) {
      console.error('Booking failed:', err);
      setActionError(err.message || 'Payment processing failed. Please try again.');
    } finally {
      setBookingInProgress(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Connecting to cinema seat map..." />;
  }

  if (error || !show) {
    return (
      <Container className="py-5">
        <ErrorMessage 
          title="Showtime Not Found" 
          message={error || 'Unable to retrieve show information.'} 
        />
        <div className="text-center mt-3">
          <Button as={Link} to="/showtimes" variant="outline-danger">
            <FaArrowLeft className="me-2" /> Back to Showtimes
          </Button>
        </div>
      </Container>
    );
  }

  const movie = show.movieId || {};
  const theater = show.theaterId || {};
  const screen = show.screenId || {};
  const startTime = new Date(show.startTime).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  const showDate = new Date(show.startTime).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="seat-selection-page py-4" style={{ backgroundColor: '#07090e', minHeight: '90vh' }}>
      <Container fluid="lg">
        {/* Top Navigation & Breadcrumbs */}
        <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom border-secondary border-opacity-15">
          <Button 
            as={Link} 
            to={`/movies/${movie._id || ''}`} 
            variant="link" 
            className="text-secondary text-decoration-none p-0 d-flex align-items-center gap-2"
          >
            <FaArrowLeft /> Back to Movie
          </Button>

          {/* Socket live status */}
          <div className="d-flex align-items-center gap-2 small">
            <span 
              className={`d-inline-block rounded-circle ${socketConnected ? 'bg-success' : 'bg-warning'}`} 
              style={{ width: '8px', height: '8px' }}
            />
            <span className="text-secondary" style={{ fontSize: '0.78rem' }}>
              {socketConnected ? 'Real-time Live Sync' : 'Reconnecting Sync...'}
            </span>
          </div>
        </div>

        {/* Show Information Header Card */}
        <Card className="cinema-card border-secondary border-opacity-25 mb-4 p-3 shadow-lg">
          <Row className="align-items-center g-3">
            <Col xs="auto">
              <img 
                src={movie.posterUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300'} 
                alt={movie.title}
                className="rounded-2 object-fit-cover shadow"
                style={{ width: '65px', height: '90px' }}
              />
            </Col>

            <Col>
              <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                <h4 className="text-white fw-bold mb-0">{movie.title || 'Blockbuster Movie'}</h4>
                <Badge bg="danger" className="text-uppercase" style={{ fontSize: '0.7rem' }}>
                  {movie.ageRating || 'U/A 16+'}
                </Badge>
                <Badge bg="dark" className="border border-secondary border-opacity-50 text-secondary" style={{ fontSize: '0.7rem' }}>
                  {movie.language || 'English'}
                </Badge>
                <Badge bg="dark" className="border border-secondary border-opacity-50 text-secondary" style={{ fontSize: '0.7rem' }}>
                  {screen.screenType || 'IMAX 3D'}
                </Badge>
              </div>

              <div className="d-flex flex-wrap align-items-center gap-3 text-secondary small">
                <span className="d-flex align-items-center gap-1 text-light">
                  <FaMapMarkerAlt className="text-danger" /> {theater.name || 'Multiplex Cinema'}, {theater.city || 'Downtown'}
                </span>
                <span className="d-flex align-items-center gap-1">
                  <FaVideo className="text-secondary" /> {screen.name || 'Screen 1'}
                </span>
                <span className="d-flex align-items-center gap-1">
                  <FaCalendarAlt className="text-secondary" /> {showDate}
                </span>
                <span className="d-flex align-items-center gap-1 text-danger fw-bold">
                  <FaClock /> {startTime}
                </span>
              </div>
            </Col>

            {/* Timer Badge if seats are locked */}
            {timeLeft && (
              <Col xs={12} md="auto" className="text-md-end">
                <div 
                  className="px-3 py-2 rounded-3 border border-warning border-opacity-50 d-inline-flex align-items-center gap-2 shadow-sm"
                  style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}
                >
                  <FaLock className="text-warning" />
                  <div className="text-start">
                    <span className="d-block text-warning fw-bold fs-6 lh-1">{timeLeft}</span>
                    <span className="text-secondary" style={{ fontSize: '0.68rem' }}>Seats Held Safely</span>
                  </div>
                </div>
              </Col>
            )}
          </Row>
        </Card>

        {actionError && (
          <Alert variant="danger" onClose={() => setActionError(null)} dismissible className="bg-danger bg-opacity-10 border-danger text-danger py-2 small">
            <FaExclamationTriangle className="me-2" /> {actionError}
          </Alert>
        )}

        {/* Main Cinema Grid & Order Summary */}
        <Row className="g-4">
          {/* Seat Grid View */}
          <Col lg={8}>
            <Card className="cinema-card border-secondary border-opacity-25 p-4 shadow-sm text-center">
              <SeatGrid
                rows={rows}
                seatPricing={seatPricing}
                selectedSeats={selectedSeats}
                bookedSeats={bookedSeats}
                lockedSeats={lockedSeats}
                onSeatToggle={handleSeatToggle}
                maxSelectable={10}
              />
            </Card>
          </Col>

          {/* Checkout & Price Summary Panel */}
          <Col lg={4}>
            <Card className="cinema-card border-secondary border-opacity-25 p-4 sticky-top shadow-lg" style={{ top: '85px' }}>
              <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom border-secondary border-opacity-15">
                <h5 className="text-white fw-bold mb-0 d-flex align-items-center gap-2">
                  <FaTicketAlt className="text-danger" /> Booking Summary
                </h5>
                <Badge bg="dark" className="border border-secondary border-opacity-25 text-secondary">
                  {selectedSeats.length} {selectedSeats.length === 1 ? 'Seat' : 'Seats'}
                </Badge>
              </div>

              {selectedSeats.length === 0 ? (
                <div className="text-center py-5 text-secondary">
                  <div className="mb-3 opacity-25">
                    <FaTicketAlt style={{ fontSize: '3rem' }} />
                  </div>
                  <h6 className="text-light">No Seats Selected</h6>
                  <p className="small mb-0">Click on any available seat in the layout map to reserve your spot.</p>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {/* Selected Seats Badges */}
                  <div>
                    <label className="text-secondary small fw-semibold text-uppercase tracking-wider mb-2 d-block">
                      Selected Seats
                    </label>
                    <div className="d-flex flex-wrap gap-2">
                      {selectedSeats.map((s) => (
                        <Badge 
                          key={s.label} 
                          bg="dark" 
                          className="border border-danger border-opacity-50 text-white p-2 d-flex align-items-center gap-2"
                        >
                          <span className="fw-bold">{s.label}</span>
                          <span className="text-secondary fw-normal">({s.category})</span>
                          <span className="text-danger fw-bold">₹{s.price}</span>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Promo Codes & Bank Offers */}
                  <div className="bg-dark bg-opacity-40 rounded-3 p-3 border border-secondary border-opacity-15">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="text-secondary small fw-semibold text-uppercase tracking-wider d-flex align-items-center gap-1">
                        <FaTag className="text-danger" /> Promo & Bank Offers
                      </span>
                      {appliedPromo && (
                        <Badge bg="success" className="text-uppercase" style={{ fontSize: '0.65rem' }}>
                          Applied
                        </Badge>
                      )}
                    </div>

                    {appliedPromo ? (
                      <div className="p-2 rounded-2 bg-success bg-opacity-10 border border-success border-opacity-30 d-flex align-items-center justify-content-between mb-2">
                        <div>
                          <strong className="text-success small d-block">{appliedPromo.code}</strong>
                          <span className="text-light small" style={{ fontSize: '0.72rem' }}>
                            {appliedPromo.title} (-₹{appliedPromo.discount.toFixed(2)})
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="link"
                          onClick={removePromoCode}
                          className="text-secondary hover-danger p-0 text-decoration-none"
                          title="Remove Promo"
                        >
                          <FaTimes />
                        </Button>
                      </div>
                    ) : (
                      <div className="d-flex gap-2 mb-2">
                        <input
                          type="text"
                          placeholder="Enter Promo (e.g. IMAX50)"
                          value={promoInput}
                          onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                          onKeyDown={(e) => e.key === 'Enter' && applyPromoCode()}
                          className="form-control form-control-sm bg-dark border-secondary border-opacity-50 text-white font-monospace text-uppercase shadow-none"
                          style={{ fontSize: '0.8rem' }}
                        />
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => applyPromoCode()}
                          className="px-3 fw-semibold"
                          style={{ fontSize: '0.78rem' }}
                        >
                          Apply
                        </Button>
                      </div>
                    )}

                    {promoMessage && (
                      <div className={`small mb-2 ${promoMessage.type === 'success' ? 'text-success' : 'text-danger'}`} style={{ fontSize: '0.74rem' }}>
                        {promoMessage.text}
                      </div>
                    )}

                    {/* Quick Offer Chips */}
                    {!appliedPromo && (
                      <div className="d-flex flex-wrap gap-1 mt-1">
                        {AVAILABLE_OFFERS.map((offer) => (
                          <button
                            key={offer.code}
                            type="button"
                            onClick={() => applyPromoCode(offer.code)}
                            className="btn btn-sm btn-dark border border-secondary border-opacity-25 text-start p-1 px-2 rounded-2 d-flex align-items-center gap-1 text-secondary hover-light"
                            style={{ fontSize: '0.68rem', backgroundColor: '#0d131f' }}
                            title={offer.desc}
                          >
                            <FaPercent className="text-danger" style={{ fontSize: '0.6rem' }} />
                            <strong className="text-light">{offer.code}</strong>
                            <span className="opacity-75">({offer.title})</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Price Breakdown */}
                  <div className="bg-dark bg-opacity-50 rounded-3 p-3 border border-secondary border-opacity-15 small">
                    <div className="d-flex justify-content-between text-secondary mb-2">
                      <span>Tickets Subtotal</span>
                      <span className="text-light">₹{subtotal.toFixed(2)}</span>
                    </div>

                    <div className="d-flex justify-content-between text-secondary mb-2">
                      <span>Convenience Fees (₹30/seat)</span>
                      <span className="text-light">₹{fees.toFixed(2)}</span>
                    </div>

                    <div className="d-flex justify-content-between text-secondary mb-2">
                      <span>Integrated GST (18%)</span>
                      <span className="text-light">₹{taxes.toFixed(2)}</span>
                    </div>

                    {appliedPromo && (
                      <div className="d-flex justify-content-between text-success mb-2 fw-semibold">
                        <span>Coupon Discount ({appliedPromo.code})</span>
                        <span>-₹{appliedPromo.discount.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="d-flex justify-content-between border-top border-secondary border-opacity-25 pt-2 text-white fw-bold fs-6">
                      <span>Total Amount</span>
                      <div className="text-end">
                        {appliedPromo && (
                          <span className="text-secondary text-decoration-line-through small me-2" style={{ fontSize: '0.85rem' }}>
                            ₹{(subtotal + fees + taxes).toFixed(2)}
                          </span>
                        )}
                        <span className="text-danger fs-5">₹{grandTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div>
                    <label className="text-secondary small fw-semibold text-uppercase tracking-wider mb-2 d-block">
                      Payment Gateway
                    </label>
                    <div className="d-flex flex-column gap-2">
                      <div 
                        onClick={() => setPaymentMethod('card')}
                        className={`p-2 rounded-2 border d-flex align-items-center justify-content-between cursor-pointer ${paymentMethod === 'card' ? 'border-danger bg-danger bg-opacity-10 text-white' : 'border-secondary border-opacity-25 text-secondary'}`}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="d-flex align-items-center gap-2 small">
                          <FaCreditCard className={paymentMethod === 'card' ? 'text-danger' : 'text-secondary'} />
                          <span>Credit / Debit Card (Razorpay)</span>
                        </div>
                        {paymentMethod === 'card' && <FaCheckCircle className="text-danger small" />}
                      </div>

                      <div 
                        onClick={() => setPaymentMethod('upi')}
                        className={`p-2 rounded-2 border d-flex align-items-center justify-content-between cursor-pointer ${paymentMethod === 'upi' ? 'border-danger bg-danger bg-opacity-10 text-white' : 'border-secondary border-opacity-25 text-secondary'}`}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="d-flex align-items-center gap-2 small">
                          <FaQrcode className={paymentMethod === 'upi' ? 'text-danger' : 'text-secondary'} />
                          <span>Instant UPI / QR Code</span>
                        </div>
                        {paymentMethod === 'upi' && <FaCheckCircle className="text-danger small" />}
                      </div>
                    </div>
                  </div>

                  {/* Action CTA */}
                  <Button
                    variant="danger"
                    size="lg"
                    disabled={selectedSeats.length === 0 || bookingInProgress || lockingInProgress}
                    onClick={handleProceedToPayment}
                    className="cinema-btn-primary w-100 py-3 fw-bold shadow-lg mt-2"
                  >
                    {bookingInProgress ? (
                      <span className="d-flex align-items-center justify-content-center gap-2">
                        <Spinner animation="border" size="sm" /> Confirming Reservation...
                      </span>
                    ) : (
                      `Pay & Confirm • ₹${grandTotal.toFixed(2)}`
                    )}
                  </Button>

                  <div className="d-flex align-items-center justify-content-center gap-2 text-secondary text-center small mt-1" style={{ fontSize: '0.72rem' }}>
                    <FaShieldAlt className="text-success" />
                    <span>256-Bit SSL Encrypted & Instant QR E-Ticket</span>
                  </div>
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Confirmation & Ticket Modal */}
      <Modal 
        show={showSuccessModal} 
        onHide={() => {
          setShowSuccessModal(false);
          navigate('/bookings');
        }} 
        centered 
        contentClassName="cinema-card border-secondary border-opacity-50 text-light shadow-2xl"
      >
        <Modal.Header closeButton closeVariant="white" className="border-secondary border-opacity-25">
          <Modal.Title className="fw-bold d-flex align-items-center gap-2 text-white">
            <FaCheckCircle className="text-success" /> Booking Confirmed!
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="py-4 text-center">
          <div className="d-inline-flex p-3 rounded-circle bg-success bg-opacity-10 text-success mb-3">
            <FaTicketAlt style={{ fontSize: '2.5rem' }} />
          </div>

          <h5 className="text-white fw-bold mb-1">
            {movie.title || 'Movie Experience'}
          </h5>
          <p className="text-secondary small mb-3">
            {theater.name} • {screen.name} • {showDate} at {startTime}
          </p>

          {/* Ticket Reference Badge */}
          <div className="p-3 bg-dark bg-opacity-75 rounded-3 border border-secondary border-opacity-25 mb-4 text-start">
            <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom border-secondary border-opacity-15">
              <span className="text-secondary small">Booking Ref:</span>
              <span className="font-monospace text-danger fw-bold fs-6">
                {confirmedBooking?.bookingReference || 'IMO-XXXXX'}
              </span>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-secondary small">Seats:</span>
              <span className="text-white fw-bold">
                {selectedSeats.map((s) => s.label).join(', ')}
              </span>
            </div>

            {appliedPromo && (
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-secondary small">Coupon Savings ({appliedPromo.code}):</span>
                <span className="text-success fw-bold">
                  -₹{appliedPromo.discount.toFixed(2)}
                </span>
              </div>
            )}

            <div className="d-flex justify-content-between align-items-center">
              <span className="text-secondary small">Amount Paid:</span>
              <span className="text-success fw-bold">
                ₹{confirmedBooking?.totalAmount ?? grandTotal.toFixed(2)}
              </span>
            </div>
          </div>

          <p className="text-secondary small mb-0">
            A confirmation pass has been saved to your account. You can present this QR ticket at the cinema gate.
          </p>
        </Modal.Body>

        <Modal.Footer className="border-secondary border-opacity-25 d-flex gap-2 justify-content-center">
          <Button 
            variant="outline-secondary" 
            onClick={() => navigate('/')} 
            className="text-light"
          >
            Home
          </Button>
          <Button 
            variant="danger" 
            onClick={() => navigate('/bookings')} 
            className="cinema-btn-primary fw-semibold"
          >
            View Digital Pass
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
