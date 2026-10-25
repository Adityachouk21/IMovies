import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { 
  FaMapMarkerAlt, FaCalendarAlt, FaFilm, FaClock, 
  FaTicketAlt, FaShieldAlt, FaChevronRight 
} from 'react-icons/fa';
import api from '../services/api.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

export default function Showtimes() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [shows, setShows] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || 'Mumbai');
  const [selectedMovieId, setSelectedMovieId] = useState(searchParams.get('movieId') || '');
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);

  const cities = ['Mumbai', 'Delhi-NCR', 'Bengaluru', 'Hyderabad'];

  // Generate 4 consecutive dates starting today
  const dates = Array.from({ length: 4 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      index: i,
      dayName: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' }),
      dateFormatted: d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
      fullDate: d.toISOString().split('T')[0]
    };
  });

  const fetchShowtimesData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCity) params.append('city', selectedCity);
      if (selectedMovieId) params.append('movieId', selectedMovieId);

      const [showsRes, moviesRes, theatersRes] = await Promise.all([
        api.get(`/shows?${params.toString()}`),
        api.get('/movies?status=now_showing'),
        api.get(`/theaters?city=${selectedCity}`)
      ]);

      if (showsRes.data?.shows) setShows(showsRes.data.shows);
      if (moviesRes.data?.movies) setMovies(moviesRes.data.movies);
      if (theatersRes.data?.theaters) setTheaters(theatersRes.data.theaters);
      setError(null);
    } catch (err) {
      console.error('Failed to load showtimes:', err);
      setError(err.message || 'Unable to retrieve show schedules.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShowtimesData();
  }, [selectedCity, selectedMovieId]);

  // Group shows by Theater
  const showsByTheater = {};
  shows.forEach((show) => {
    const theaterId = show.theaterId?._id || 'unknown';
    if (!showsByTheater[theaterId]) {
      showsByTheater[theaterId] = {
        theater: show.theaterId,
        shows: []
      };
    }
    showsByTheater[theaterId].shows.push(show);
  });

  const selectedMovie = movies.find((m) => m._id === selectedMovieId);

  return (
    <Container className="py-4">
      {/* Title & Selected Movie Context */}
      <div className="mb-4">
        <h2 className="text-white fw-bold mb-1 tracking-tight">Theaters & Showtimes</h2>
        <p className="text-secondary small mb-3">
          Select your cinema, preferred screen experience, and showtime to book seats.
        </p>

        {/* Movie Selector / Context Banner */}
        <div className="p-3 rounded-3 bg-dark bg-opacity-75 border border-secondary border-opacity-15 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div className="d-flex align-items-center gap-3">
            <div 
              className="d-flex align-items-center justify-content-center p-2 rounded-2 text-danger"
              style={{ backgroundColor: 'rgba(229, 9, 20, 0.15)' }}
            >
              <FaFilm className="fs-4" />
            </div>
            <div>
              <span className="text-secondary small d-block">Selected Movie</span>
              <h5 className="text-white fw-bold mb-0">
                {selectedMovie ? selectedMovie.title : 'All Now Showing Movies'}
              </h5>
            </div>
          </div>

          <div style={{ minWidth: '240px' }}>
            <Form.Select
              size="sm"
              value={selectedMovieId}
              onChange={(e) => {
                setSelectedMovieId(e.target.value);
                setSearchParams({
                  ...(selectedCity && { city: selectedCity }),
                  ...(e.target.value && { movieId: e.target.value })
                });
              }}
              className="bg-dark border-secondary border-opacity-25 text-light shadow-none"
            >
              <option value="">All Now Showing Movies</option>
              {movies.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.title} ({m.language})
                </option>
              ))}
            </Form.Select>
          </div>
        </div>
      </div>

      {/* City & Date Bar */}
      <div className="p-3 mb-4 rounded-3 cinema-card border-secondary border-opacity-25 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        {/* Date Selector Pills */}
        <div className="d-flex gap-2 overflow-auto pb-2 pb-md-0">
          {dates.map((d) => (
            <Button
              key={d.index}
              size="sm"
              variant={selectedDateIndex === d.index ? 'danger' : 'outline-secondary'}
              onClick={() => setSelectedDateIndex(d.index)}
              className={`text-center px-3 py-1 rounded-3 ${selectedDateIndex === d.index ? 'cinema-btn-primary' : 'text-light border-secondary border-opacity-50'}`}
              style={{ minWidth: '85px' }}
            >
              <span className="d-block fw-bold small">{d.dayName}</span>
              <span className="d-block text-secondary" style={{ fontSize: '0.72rem' }}>
                {d.dateFormatted}
              </span>
            </Button>
          ))}
        </div>

        {/* City Filter */}
        <div className="d-flex align-items-center gap-2">
          <FaMapMarkerAlt className="text-danger" />
          <Form.Select
            size="sm"
            value={selectedCity}
            onChange={(e) => {
              setSelectedCity(e.target.value);
              setSearchParams({
                city: e.target.value,
                ...(selectedMovieId && { movieId: selectedMovieId })
              });
            }}
            className="bg-dark border-secondary border-opacity-25 text-light shadow-none"
            style={{ width: '160px' }}
          >
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Form.Select>
        </div>
      </div>

      {/* Showtimes Listings */}
      {loading ? (
        <LoadingSpinner message="Locating cinema show schedules..." />
      ) : error ? (
        <ErrorMessage title="Showtimes Error" message={error} onRetry={fetchShowtimesData} />
      ) : Object.keys(showsByTheater).length === 0 ? (
        <div className="text-center py-5 my-4 bg-dark bg-opacity-50 rounded-3 border border-secondary border-opacity-15">
          <FaClock className="text-secondary display-4 mb-3" />
          <h5 className="text-white fw-bold mb-2">No Showtimes Found</h5>
          <p className="text-secondary small mb-3">
            There are no shows scheduled for this selection in {selectedCity} on {dates[selectedDateIndex].dayName}.
          </p>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => {
              setSelectedMovieId('');
              setSelectedCity('Mumbai');
              setSearchParams({});
            }}
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="d-flex flex-column gap-4">
          {Object.entries(showsByTheater).map(([theaterId, group]) => (
            <Card key={theaterId} className="cinema-card border-secondary border-opacity-25 p-4 shadow-sm">
              {/* Theater Header */}
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center pb-3 border-bottom border-secondary border-opacity-15 mb-3 gap-2">
                <div>
                  <h5 className="text-white fw-bold mb-1">
                    {group.theater?.name || 'Multiplex Cinema'}
                  </h5>
                  <p className="text-secondary small mb-0">
                    {group.theater?.address || 'City Center Mall'}, {group.theater?.city}
                  </p>
                </div>

                {/* Facilities Badges */}
                <div className="d-flex flex-wrap gap-1">
                  {group.theater?.facilities?.slice(0, 3).map((f) => (
                    <Badge key={f} bg="dark" className="border border-secondary border-opacity-25 text-secondary fw-normal small">
                      {f}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Show Slots Grid */}
              <div className="d-flex flex-wrap gap-3">
                {group.shows.map((show) => {
                  const startTimeStr = new Date(show.startTime).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  });

                  return (
                    <Card 
                      key={show._id} 
                      as={Link}
                      to={`/seats/${show._id}`}
                      className="cinema-card border-secondary border-opacity-50 text-decoration-none p-3 hover-glow"
                      style={{ minWidth: '150px', cursor: 'pointer' }}
                    >
                      <div className="text-center">
                        <span className="fw-bold fs-6 text-white d-block mb-1">{startTimeStr}</span>
                        <Badge bg="dark" className="border border-danger border-opacity-50 text-danger small mb-2 d-inline-block">
                          {show.screenId?.name || 'IMAX Screen'}
                        </Badge>
                        <div className="text-secondary" style={{ fontSize: '0.72rem' }}>
                          Starts at ₹{show.seatPricing?.Silver || 180}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      )}
    </Container>
  );
}
