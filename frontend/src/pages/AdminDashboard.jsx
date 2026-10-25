import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Table from 'react-bootstrap/Table';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import Alert from 'react-bootstrap/Alert';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Spinner from 'react-bootstrap/Spinner';
import { 
  FaFilm, FaTheaterMasks, FaCalendarAlt, FaMoneyBillWave, 
  FaPlus, FaCheckCircle, FaExclamationTriangle,
  FaTv, FaUsers, FaDatabase, FaTrash, FaExternalLinkAlt,
  FaSearch, FaSyncAlt, FaEye, FaMagic
} from 'react-icons/fa';

import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const AVAILABLE_GENRES = [
  'Action', 'Sci-Fi', 'Adventure', 'Drama', 'Thriller', 
  'Comedy', 'Crime', 'Horror', 'Animation', 'Fantasy', 
  'Musical', 'Romance', 'Biography', 'Mystery'
];

const INITIAL_FORM_STATE = {
  title: '',
  description: '',
  genre: ['Action', 'Sci-Fi'],
  customGenre: '',
  language: 'English',
  duration: 150,
  releaseDate: new Date().toISOString().split('T')[0],
  director: '',
  cast: '',
  posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80',
  backdropUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
  trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
  ageRating: 'UA',
  movieStatus: 'now_showing'
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('movies');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Catalog state
  const [movies, setMovies] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [shows, setShows] = useState([]);
  const [dbHealth, setDbHealth] = useState(null);

  // Movie Filter & Search
  const [movieSearch, setMovieSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Add Movie Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [movieForm, setMovieForm] = useState(INITIAL_FORM_STATE);
  const [submittingMovie, setSubmittingMovie] = useState(false);
  const [formError, setFormError] = useState(null);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [moviesRes, theatersRes, showsRes, healthRes] = await Promise.allSettled([
        api.get('/movies?limit=50'),
        api.get('/theaters'),
        api.get('/shows'),
        api.get('/health')
      ]);

      if (moviesRes.status === 'fulfilled') {
        const payload = moviesRes.value.data;
        setMovies(payload?.movies || (Array.isArray(payload) ? payload : []));
      }

      if (theatersRes.status === 'fulfilled') {
        const payload = theatersRes.value.data;
        setTheaters(payload?.theaters || (Array.isArray(payload) ? payload : []));
      }

      if (showsRes.status === 'fulfilled') {
        const payload = showsRes.value.data;
        setShows(payload?.shows || (Array.isArray(payload) ? payload : []));
      }

      if (healthRes.status === 'fulfilled') {
        setDbHealth(healthRes.value.data?.database || null);
      }
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err);
      setError(err.message || 'Unable to load administration dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Form field helpers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMovieForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleGenre = (g) => {
    setMovieForm((prev) => {
      const current = prev.genre;
      if (current.includes(g)) {
        return { ...prev, genre: current.filter((item) => item !== g) };
      } else {
        return { ...prev, genre: [...current, g] };
      }
    });
  };

  const handleAddCustomGenre = () => {
    if (movieForm.customGenre?.trim()) {
      const trimmed = movieForm.customGenre.trim();
      if (!movieForm.genre.includes(trimmed)) {
        setMovieForm((prev) => ({
          ...prev,
          genre: [...prev.genre, trimmed],
          customGenre: ''
        }));
      }
    }
  };

  // Quick fill sample blockbuster
  const handleAutoFillSample = () => {
    const samples = [
      {
        title: 'Avengers: Secret Wars',
        description: 'Earth’s mightiest heroes and allies across multiple realities unite in an epic multi-dimensional battle to save the multiverse from total annihilation.',
        genre: ['Action', 'Sci-Fi', 'Adventure'],
        language: 'English',
        duration: 175,
        releaseDate: '2026-05-01',
        director: 'Anthony and Joe Russo',
        cast: 'Robert Downey Jr., Pedro Pascal, Benedict Cumberbatch, Chris Hemsworth',
        posterUrl: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=600&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=73_1biulkYk',
        ageRating: 'UA',
        movieStatus: 'coming_soon'
      },
      {
        title: 'Kantara: A Legend Chapter 1',
        description: 'Set during the reign of the ancient Kadambas of Banavasi, the mythic origins of the deity and the sacred forest protector are revealed amidst royal intrigue.',
        genre: ['Action', 'Drama', 'Adventure', 'Fantasy'],
        language: 'Kannada',
        duration: 165,
        releaseDate: '2025-10-02',
        director: 'Rishab Shetty',
        cast: 'Rishab Shetty, Sapthami Gowda, Kishore Kumar G.',
        posterUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=KVnheQhQlCY',
        ageRating: 'UA',
        movieStatus: 'coming_soon'
      }
    ];

    const pick = samples[Math.floor(Math.random() * samples.length)];
    setMovieForm((prev) => ({
      ...prev,
      ...pick,
      customGenre: ''
    }));
  };

  // Submit new movie
  const handleCreateMovie = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!movieForm.title.trim()) {
      setFormError('Movie title is required.');
      return;
    }
    if (!movieForm.description.trim()) {
      setFormError('Movie description is required.');
      return;
    }
    if (!movieForm.genre.length) {
      setFormError('Please select at least one genre.');
      return;
    }
    if (!movieForm.duration || Number(movieForm.duration) <= 0) {
      setFormError('Please enter a valid movie duration in minutes.');
      return;
    }

    try {
      setSubmittingMovie(true);

      const castArray = movieForm.cast
        ? movieForm.cast.split(',').map((c) => c.trim()).filter(Boolean)
        : [];

      const payload = {
        title: movieForm.title.trim(),
        description: movieForm.description.trim(),
        genre: movieForm.genre,
        language: movieForm.language,
        duration: Number(movieForm.duration),
        releaseDate: new Date(movieForm.releaseDate).toISOString(),
        director: movieForm.director.trim(),
        cast: castArray,
        posterUrl: movieForm.posterUrl.trim(),
        backdropUrl: movieForm.backdropUrl.trim(),
        trailerUrl: movieForm.trailerUrl.trim(),
        ageRating: movieForm.ageRating,
        movieStatus: movieForm.movieStatus
      };

      const res = await api.post('/movies', payload);
      const created = res.data;

      // Update state immediately
      setMovies((prev) => [created, ...prev]);
      setShowAddModal(false);
      setMovieForm(INITIAL_FORM_STATE);
      setSuccessMessage(`Movie "${created.title}" successfully added to the database catalog!`);

      // Auto dismiss success
      setTimeout(() => setSuccessMessage(null), 6000);
    } catch (err) {
      console.error('Failed to create movie:', err);
      setFormError(err.message || 'Failed to add movie to database.');
    } finally {
      setSubmittingMovie(false);
    }
  };

  // Delete movie
  const handleDeleteMovie = async (movie) => {
    if (!window.confirm(`Are you sure you want to delete "${movie.title}" from the database?`)) {
      return;
    }

    try {
      await api.delete(`/movies/${movie._id}`);
      setMovies((prev) => prev.filter((m) => m._id !== movie._id));
      setSuccessMessage(`Movie "${movie.title}" removed successfully.`);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error('Failed to delete movie:', err);
      setError(`Failed to delete movie: ${err.message}`);
    }
  };

  // Toggle movie status (now_showing <-> coming_soon)
  const handleToggleStatus = async (movie) => {
    const newStatus = movie.movieStatus === 'now_showing' ? 'coming_soon' : 'now_showing';
    try {
      await api.put(`/movies/${movie._id}`, { movieStatus: newStatus });
      setMovies((prev) =>
        prev.map((m) => (m._id === movie._id ? { ...m, movieStatus: newStatus } : m))
      );
      setSuccessMessage(`Updated "${movie.title}" status to ${newStatus.replace('_', ' ')}.`);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      console.error('Failed to update status:', err);
      setError(`Failed to update status: ${err.message}`);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading administration console..." />;
  }

  // Filter movies for table
  const filteredMovies = movies.filter((m) => {
    const matchesSearch =
      !movieSearch ||
      m.title?.toLowerCase().includes(movieSearch.toLowerCase()) ||
      m.language?.toLowerCase().includes(movieSearch.toLowerCase()) ||
      m.genre?.some((g) => g.toLowerCase().includes(movieSearch.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' || m.movieStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const nowShowingCount = movies.filter((m) => m.movieStatus === 'now_showing').length;
  const comingSoonCount = movies.filter((m) => m.movieStatus === 'coming_soon').length;
  const isDbConnected = dbHealth?.status === 'connected';

  return (
    <div className="admin-dashboard-page py-4" style={{ backgroundColor: '#07090e', minHeight: '88vh' }}>
      <Container>
        {/* Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 pb-3 border-bottom border-secondary border-opacity-25 gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <h2 className="text-white fw-bold mb-0">Cinema Management Portal</h2>
              <Badge bg="danger" className="text-uppercase" style={{ fontSize: '0.7rem' }}>
                Admin Operations
              </Badge>
            </div>
            <p className="text-secondary small mb-0">
              Manage movies, theaters, seat maps, and monitor database connection status.
            </p>
          </div>

          <div className="d-flex flex-wrap gap-2">
            <Button
              variant="danger"
              size="sm"
              className="d-flex align-items-center gap-2 px-3 fw-semibold shadow-sm"
              onClick={() => setShowAddModal(true)}
            >
              <FaPlus /> Add New Movie
            </Button>
            <Button
              variant="outline-secondary"
              size="sm"
              className="d-flex align-items-center gap-2"
              onClick={fetchAdminData}
            >
              <FaSyncAlt /> Refresh
            </Button>
            <Button as={Link} to="/movies" variant="outline-light" size="sm">
              <FaExternalLinkAlt className="me-1" /> View Public Site
            </Button>
          </div>
        </div>

        {/* Database Health Card */}
        <Card className="cinema-card border-secondary border-opacity-25 p-3 mb-4 shadow-sm" style={{ backgroundColor: '#0d1117' }}>
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
            <div className="d-flex align-items-center gap-3">
              <div className={`p-2 rounded-3 ${isDbConnected ? 'bg-success bg-opacity-15 text-success' : 'bg-warning bg-opacity-15 text-warning'}`}>
                <FaDatabase style={{ fontSize: '1.4rem' }} />
              </div>
              <div>
                <div className="d-flex align-items-center gap-2">
                  <h6 className="text-white mb-0 fw-semibold">Database Engine:</h6>
                  <Badge bg={isDbConnected ? 'success' : 'warning'} className="text-uppercase" style={{ fontSize: '0.72rem' }}>
                    {isDbConnected ? 'MongoDB Connected' : 'Resilient In-Memory Mode'}
                  </Badge>
                </div>
                <span className="text-secondary small">
                  {isDbConnected
                    ? `Active cluster: ${dbHealth?.host || 'MongoDB'} | Database: ${dbHealth?.name || 'imovies'}`
                    : 'To connect to MongoDB Atlas, add your URI in backend/.env under MONGODB_URI and run `npm run db:test`.'}
                </span>
              </div>
            </div>

            <div className="d-flex align-items-center gap-2">
              <span className="text-secondary small">
                Catalog: <strong className="text-white">{movies.length}</strong> movies loaded
              </span>
            </div>
          </div>
        </Card>

        {/* Notification Alerts */}
        {successMessage && (
          <Alert
            variant="success"
            dismissible
            onClose={() => setSuccessMessage(null)}
            className="bg-success bg-opacity-10 border-success text-success d-flex align-items-center gap-2"
          >
            <FaCheckCircle /> {successMessage}
          </Alert>
        )}

        {error && (
          <Alert
            variant="danger"
            dismissible
            onClose={() => setError(null)}
            className="bg-danger bg-opacity-10 border-danger text-danger d-flex align-items-center gap-2"
          >
            <FaExclamationTriangle /> {error}
          </Alert>
        )}

        {/* Stats Grid */}
        <Row className="g-3 mb-4">
          <Col xs={12} sm={6} lg={3}>
            <Card className="cinema-card border-secondary border-opacity-25 p-3 shadow-sm h-100" style={{ backgroundColor: '#0d1117' }}>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <span className="text-secondary text-uppercase fw-semibold" style={{ fontSize: '0.7rem' }}>Total Movies</span>
                  <h3 className="text-white fw-bold my-1">{movies.length}</h3>
                  <span className="text-success small" style={{ fontSize: '0.72rem' }}>
                    {nowShowingCount} Now Showing • {comingSoonCount} Upcoming
                  </span>
                </div>
                <div className="p-3 rounded-3 bg-danger bg-opacity-10 text-danger">
                  <FaFilm style={{ fontSize: '1.4rem' }} />
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={12} sm={6} lg={3}>
            <Card className="cinema-card border-secondary border-opacity-25 p-3 shadow-sm h-100" style={{ backgroundColor: '#0d1117' }}>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <span className="text-secondary text-uppercase fw-semibold" style={{ fontSize: '0.7rem' }}>Partner Theaters</span>
                  <h3 className="text-white fw-bold my-1">{theaters.length}</h3>
                  <span className="text-secondary small" style={{ fontSize: '0.72rem' }}>
                    Mumbai, Delhi-NCR, BLR, HYD
                  </span>
                </div>
                <div className="p-3 rounded-3 bg-primary bg-opacity-10 text-primary">
                  <FaTheaterMasks style={{ fontSize: '1.4rem' }} />
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={12} sm={6} lg={3}>
            <Card className="cinema-card border-secondary border-opacity-25 p-3 shadow-sm h-100" style={{ backgroundColor: '#0d1117' }}>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <span className="text-secondary text-uppercase fw-semibold" style={{ fontSize: '0.7rem' }}>Scheduled Shows</span>
                  <h3 className="text-white fw-bold my-1">{shows.length}</h3>
                  <span className="text-info small" style={{ fontSize: '0.72rem' }}>
                    Active Seat Engines Live
                  </span>
                </div>
                <div className="p-3 rounded-3 bg-warning bg-opacity-10 text-warning">
                  <FaCalendarAlt style={{ fontSize: '1.4rem' }} />
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={12} sm={6} lg={3}>
            <Card className="cinema-card border-secondary border-opacity-25 p-3 shadow-sm h-100" style={{ backgroundColor: '#0d1117' }}>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <span className="text-secondary text-uppercase fw-semibold" style={{ fontSize: '0.7rem' }}>Database State</span>
                  <h3 className={`fw-bold my-1 ${isDbConnected ? 'text-success' : 'text-warning'}`}>
                    {isDbConnected ? 'Atlas Live' : 'Memory Sync'}
                  </h3>
                  <span className="text-secondary small" style={{ fontSize: '0.72rem' }}>
                    Full CRUD active
                  </span>
                </div>
                <div className={`p-3 rounded-3 ${isDbConnected ? 'bg-success bg-opacity-10 text-success' : 'bg-warning bg-opacity-10 text-warning'}`}>
                  <FaDatabase style={{ fontSize: '1.4rem' }} />
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Tabbed Content */}
        <Card className="cinema-card border-secondary border-opacity-25 p-3 shadow-sm" style={{ backgroundColor: '#0d1117' }}>
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-4 border-secondary border-opacity-25"
          >
            {/* MOVIES TAB */}
            <Tab eventKey="movies" title={`Movie Catalog (${movies.length})`}>
              {/* Filter & Action Bar */}
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3 pb-3 border-bottom border-secondary border-opacity-15">
                <div className="d-flex flex-wrap align-items-center gap-2 flex-grow-1">
                  <InputGroup size="sm" style={{ maxWidth: '320px' }}>
                    <InputGroup.Text className="bg-dark border-secondary border-opacity-50 text-secondary">
                      <FaSearch />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Search title, genre, language..."
                      value={movieSearch}
                      onChange={(e) => setMovieSearch(e.target.value)}
                      className="bg-dark border-secondary border-opacity-50 text-white"
                    />
                  </InputGroup>

                  <Form.Select
                    size="sm"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ maxWidth: '170px' }}
                    className="bg-dark border-secondary border-opacity-50 text-white"
                  >
                    <option value="all">All Statuses ({movies.length})</option>
                    <option value="now_showing">Now Showing ({nowShowingCount})</option>
                    <option value="coming_soon">Coming Soon ({comingSoonCount})</option>
                  </Form.Select>
                </div>

                <div>
                  <Button
                    variant="danger"
                    size="sm"
                    className="d-flex align-items-center gap-2"
                    onClick={() => setShowAddModal(true)}
                  >
                    <FaPlus /> Add Movie
                  </Button>
                </div>
              </div>

              {/* Movies Table */}
              <div className="table-responsive">
                <Table hover variant="dark" className="bg-transparent align-middle mb-0">
                  <thead className="text-secondary text-uppercase small border-bottom border-secondary border-opacity-25">
                    <tr>
                      <th>Title & Details</th>
                      <th>Genre</th>
                      <th>Duration</th>
                      <th>Rating</th>
                      <th>Status (Click to toggle)</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMovies.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-4 text-secondary">
                          No movies matched your search criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredMovies.map((m) => (
                        <tr key={m._id} className="border-secondary border-opacity-15">
                          <td>
                            <div className="d-flex align-items-center gap-3">
                              <img 
                                src={m.posterUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80'} 
                                alt={m.title} 
                                className="rounded object-fit-cover shadow-sm" 
                                style={{ width: '42px', height: '58px' }} 
                              />
                              <div>
                                <strong className="text-white d-block">{m.title}</strong>
                                <span className="text-secondary" style={{ fontSize: '0.75rem' }}>
                                  {m.language} • {m.ageRating || 'UA'} • {m.director || 'Director'}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="d-flex flex-wrap gap-1">
                              {m.genre?.slice(0, 3).map((g) => (
                                <Badge key={g} bg="dark" className="border border-secondary border-opacity-25 text-light fw-normal" style={{ fontSize: '0.7rem' }}>
                                  {g}
                                </Badge>
                              ))}
                            </div>
                          </td>
                          <td>
                            <span className="text-light small">{m.duration} mins</span>
                          </td>
                          <td>
                            <span className="text-warning fw-bold small">
                              ★ {m.averageRating ? m.averageRating.toFixed(1) : '4.5'}
                            </span>
                            <span className="text-secondary d-block" style={{ fontSize: '0.7rem' }}>
                              ({m.totalRatings || 0} votes)
                            </span>
                          </td>
                          <td>
                            <Badge 
                              bg={m.movieStatus === 'now_showing' ? 'success' : 'secondary'} 
                              className="text-uppercase cursor-pointer"
                              style={{ fontSize: '0.68rem', cursor: 'pointer' }}
                              onClick={() => handleToggleStatus(m)}
                              title="Click to toggle status"
                            >
                              {m.movieStatus ? m.movieStatus.replace('_', ' ') : 'now showing'}
                            </Badge>
                          </td>
                          <td className="text-end">
                            <div className="d-flex justify-content-end gap-2">
                              <Button
                                as={Link}
                                to={`/movies/${m._id}`}
                                size="sm"
                                variant="outline-light"
                                className="d-flex align-items-center gap-1"
                              >
                                <FaEye /> View
                              </Button>
                              <Button
                                size="sm"
                                variant="outline-danger"
                                onClick={() => handleDeleteMovie(m)}
                                title="Delete Movie"
                              >
                                <FaTrash />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
            </Tab>

            {/* SHOWTIMES TAB */}
            <Tab eventKey="shows" title={`Showtimes (${shows.length})`}>
              <div className="table-responsive">
                <Table hover variant="dark" className="bg-transparent align-middle mb-0">
                  <thead className="text-secondary text-uppercase small border-bottom border-secondary border-opacity-25">
                    <tr>
                      <th>Movie</th>
                      <th>Theater / City</th>
                      <th>Screen</th>
                      <th>Start Time</th>
                      <th>Pricing (Silver/Gold/Prem)</th>
                      <th>Live Seats</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shows.map((show) => {
                      const movieTitle = show.movieId?.title || 'Blockbuster Movie';
                      const theaterName = show.theaterId?.name || 'Multiplex Cinema';
                      const cityName = show.theaterId?.city || 'Mumbai';
                      const screenName = show.screenId?.name || 'Screen 1';
                      const timeStr = new Date(show.startTime).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      });
                      const dateStr = new Date(show.startTime).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      });

                      return (
                        <tr key={show._id} className="border-secondary border-opacity-15">
                          <td>
                            <strong className="text-white d-block">{movieTitle}</strong>
                            <span className="text-secondary" style={{ fontSize: '0.75rem' }}>
                              {show.movieId?.language || 'English'} • {show.movieId?.genre?.slice(0, 2).join(', ')}
                            </span>
                          </td>
                          <td>
                            <span className="text-light">{theaterName}</span>
                            <span className="text-secondary d-block" style={{ fontSize: '0.72rem' }}>
                              {cityName}
                            </span>
                          </td>
                          <td>
                            <Badge bg="dark" className="border border-secondary border-opacity-50 text-secondary">
                              {screenName}
                            </Badge>
                          </td>
                          <td>
                            <span className="text-white fw-semibold">{timeStr}</span>
                            <span className="text-secondary d-block" style={{ fontSize: '0.72rem' }}>
                              {dateStr}
                            </span>
                          </td>
                          <td>
                            <span className="text-secondary small">
                              ₹{show.seatPricing?.Silver || 180} / ₹{show.seatPricing?.Gold || 280} / ₹{show.seatPricing?.Premium || 420}
                            </span>
                          </td>
                          <td>
                            <Button
                              as={Link}
                              to={`/seats/${show._id}`}
                              size="sm"
                              variant="outline-danger"
                              className="text-decoration-none"
                            >
                              Live Seats
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
            </Tab>

            {/* THEATERS TAB */}
            <Tab eventKey="theaters" title={`Theaters (${theaters.length})`}>
              <div className="table-responsive">
                <Table hover variant="dark" className="bg-transparent align-middle mb-0">
                  <thead className="text-secondary text-uppercase small border-bottom border-secondary border-opacity-25">
                    <tr>
                      <th>Multiplex Name</th>
                      <th>City & Address</th>
                      <th>Screens</th>
                      <th>Facilities</th>
                    </tr>
                  </thead>
                  <tbody>
                    {theaters.map((t) => (
                      <tr key={t._id} className="border-secondary border-opacity-15">
                        <td>
                          <strong className="text-white">{t.name}</strong>
                          <span className="text-secondary d-block small">{t.contactPhone || ''}</span>
                        </td>
                        <td>
                          <span className="text-light small d-block">{t.city}</span>
                          <span className="text-secondary" style={{ fontSize: '0.72rem' }}>{t.address}</span>
                        </td>
                        <td>
                          <Badge bg="dark" className="border border-secondary border-opacity-50 text-secondary">
                            {t.screens?.length || 2} Screens
                          </Badge>
                        </td>
                        <td>
                          <div className="d-flex flex-wrap gap-1">
                            {t.facilities?.slice(0, 4).map((f) => (
                              <Badge key={f} bg="dark" className="text-secondary border border-secondary border-opacity-25 small fw-normal">
                                {f}
                              </Badge>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Tab>
          </Tabs>
        </Card>
      </Container>

      {/* ========================================================================= */}
      {/* ADD MOVIE MODAL */}
      {/* ========================================================================= */}
      <Modal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        size="lg"
        centered
        backdrop="static"
        contentClassName="bg-dark text-light border border-secondary border-opacity-50"
      >
        <Modal.Header closeButton closeVariant="white" className="border-secondary border-opacity-25">
          <div className="d-flex align-items-center justify-content-between w-100 me-3">
            <Modal.Title className="text-white fw-bold d-flex align-items-center gap-2">
              <FaFilm className="text-danger" /> Add New Movie to Database
            </Modal.Title>
            <Button
              variant="outline-info"
              size="sm"
              onClick={handleAutoFillSample}
              className="d-flex align-items-center gap-1"
            >
              <FaMagic /> Auto-fill Sample
            </Button>
          </div>
        </Modal.Header>

        <Form onSubmit={handleCreateMovie}>
          <Modal.Body className="p-4" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
            {formError && (
              <Alert variant="danger" dismissible onClose={() => setFormError(null)} className="bg-danger bg-opacity-15 border-danger text-danger">
                {formError}
              </Alert>
            )}

            <Row className="g-3">
              {/* Title */}
              <Col xs={12} md={8}>
                <Form.Group>
                  <Form.Label className="text-secondary small fw-semibold">Movie Title *</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={movieForm.title}
                    onChange={handleInputChange}
                    placeholder="e.g. Deadpool & Wolverine"
                    required
                    className="bg-dark border-secondary border-opacity-50 text-white"
                  />
                </Form.Group>
              </Col>

              {/* Language */}
              <Col xs={12} md={4}>
                <Form.Group>
                  <Form.Label className="text-secondary small fw-semibold">Language *</Form.Label>
                  <Form.Select
                    name="language"
                    value={movieForm.language}
                    onChange={handleInputChange}
                    className="bg-dark border-secondary border-opacity-50 text-white"
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Telugu">Telugu</option>
                    <option value="Tamil">Tamil</option>
                    <option value="Kannada">Kannada</option>
                    <option value="Malayalam">Malayalam</option>
                    <option value="Marathi">Marathi</option>
                    <option value="Korean">Korean</option>
                    <option value="Japanese">Japanese</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              {/* Description */}
              <Col xs={12}>
                <Form.Group>
                  <Form.Label className="text-secondary small fw-semibold">Synopsis / Description *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={movieForm.description}
                    onChange={handleInputChange}
                    placeholder="Provide an engaging cinema synopsis..."
                    required
                    className="bg-dark border-secondary border-opacity-50 text-white"
                  />
                </Form.Group>
              </Col>

              {/* Genre Selector */}
              <Col xs={12}>
                <Form.Label className="text-secondary small fw-semibold d-block">
                  Genres * (Select all that apply)
                </Form.Label>
                <div className="d-flex flex-wrap gap-2 mb-2">
                  {AVAILABLE_GENRES.map((g) => {
                    const selected = movieForm.genre.includes(g);
                    return (
                      <Badge
                        key={g}
                        bg={selected ? 'danger' : 'dark'}
                        className={`border ${selected ? 'border-danger' : 'border-secondary border-opacity-50'} py-2 px-3 cursor-pointer`}
                        style={{ cursor: 'pointer', fontSize: '0.75rem' }}
                        onClick={() => toggleGenre(g)}
                      >
                        {selected ? '✓ ' : ''}{g}
                      </Badge>
                    );
                  })}
                </div>
                <InputGroup size="sm" style={{ maxWidth: '300px' }}>
                  <Form.Control
                    type="text"
                    name="customGenre"
                    value={movieForm.customGenre}
                    onChange={handleInputChange}
                    placeholder="Add custom genre"
                    className="bg-dark border-secondary border-opacity-50 text-white"
                  />
                  <Button variant="outline-secondary" onClick={handleAddCustomGenre}>
                    Add
                  </Button>
                </InputGroup>
              </Col>

              {/* Duration, Release Date, Age Rating */}
              <Col xs={12} sm={4}>
                <Form.Group>
                  <Form.Label className="text-secondary small fw-semibold">Duration (Minutes) *</Form.Label>
                  <Form.Control
                    type="number"
                    name="duration"
                    value={movieForm.duration}
                    onChange={handleInputChange}
                    min="30"
                    max="360"
                    required
                    className="bg-dark border-secondary border-opacity-50 text-white"
                  />
                </Form.Group>
              </Col>

              <Col xs={12} sm={4}>
                <Form.Group>
                  <Form.Label className="text-secondary small fw-semibold">Release Date *</Form.Label>
                  <Form.Control
                    type="date"
                    name="releaseDate"
                    value={movieForm.releaseDate}
                    onChange={handleInputChange}
                    required
                    className="bg-dark border-secondary border-opacity-50 text-white"
                  />
                </Form.Group>
              </Col>

              <Col xs={12} sm={4}>
                <Form.Group>
                  <Form.Label className="text-secondary small fw-semibold">Age Rating</Form.Label>
                  <Form.Select
                    name="ageRating"
                    value={movieForm.ageRating}
                    onChange={handleInputChange}
                    className="bg-dark border-secondary border-opacity-50 text-white"
                  >
                    <option value="U">U (Universal)</option>
                    <option value="UA">UA (Parental Guidance)</option>
                    <option value="A">A (Adults 18+)</option>
                    <option value="PG-13">PG-13</option>
                    <option value="R">R (Restricted)</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              {/* Director & Cast */}
              <Col xs={12} md={6}>
                <Form.Group>
                  <Form.Label className="text-secondary small fw-semibold">Director</Form.Label>
                  <Form.Control
                    type="text"
                    name="director"
                    value={movieForm.director}
                    onChange={handleInputChange}
                    placeholder="e.g. Christopher Nolan"
                    className="bg-dark border-secondary border-opacity-50 text-white"
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={6}>
                <Form.Group>
                  <Form.Label className="text-secondary small fw-semibold">Cast (Comma-separated)</Form.Label>
                  <Form.Control
                    type="text"
                    name="cast"
                    value={movieForm.cast}
                    onChange={handleInputChange}
                    placeholder="e.g. Actor One, Actor Two, Actor Three"
                    className="bg-dark border-secondary border-opacity-50 text-white"
                  />
                </Form.Group>
              </Col>

              {/* Status */}
              <Col xs={12} md={6}>
                <Form.Group>
                  <Form.Label className="text-secondary small fw-semibold">Movie Catalog Status</Form.Label>
                  <Form.Select
                    name="movieStatus"
                    value={movieForm.movieStatus}
                    onChange={handleInputChange}
                    className="bg-dark border-secondary border-opacity-50 text-white"
                  >
                    <option value="now_showing">Now Showing (Available for Booking)</option>
                    <option value="coming_soon">Coming Soon (Preview Only)</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              {/* Trailer URL */}
              <Col xs={12} md={6}>
                <Form.Group>
                  <Form.Label className="text-secondary small fw-semibold">YouTube Trailer URL</Form.Label>
                  <Form.Control
                    type="url"
                    name="trailerUrl"
                    value={movieForm.trailerUrl}
                    onChange={handleInputChange}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="bg-dark border-secondary border-opacity-50 text-white"
                  />
                </Form.Group>
              </Col>

              {/* Poster URL & Preview */}
              <Col xs={12} md={6}>
                <Form.Group>
                  <Form.Label className="text-secondary small fw-semibold">Poster Image URL *</Form.Label>
                  <Form.Control
                    type="url"
                    name="posterUrl"
                    value={movieForm.posterUrl}
                    onChange={handleInputChange}
                    placeholder="https://images.unsplash.com/..."
                    required
                    className="bg-dark border-secondary border-opacity-50 text-white mb-2"
                  />
                  {movieForm.posterUrl && (
                    <div className="d-flex align-items-center gap-2 p-2 rounded bg-black bg-opacity-40 border border-secondary border-opacity-25">
                      <img 
                        src={movieForm.posterUrl} 
                        alt="Poster Preview" 
                        className="rounded object-fit-cover" 
                        style={{ width: '48px', height: '64px' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                      <span className="text-secondary small">Poster preview active</span>
                    </div>
                  )}
                </Form.Group>
              </Col>

              {/* Backdrop URL & Preview */}
              <Col xs={12} md={6}>
                <Form.Group>
                  <Form.Label className="text-secondary small fw-semibold">Backdrop Banner URL *</Form.Label>
                  <Form.Control
                    type="url"
                    name="backdropUrl"
                    value={movieForm.backdropUrl}
                    onChange={handleInputChange}
                    placeholder="https://images.unsplash.com/..."
                    required
                    className="bg-dark border-secondary border-opacity-50 text-white mb-2"
                  />
                  {movieForm.backdropUrl && (
                    <div className="d-flex align-items-center gap-2 p-2 rounded bg-black bg-opacity-40 border border-secondary border-opacity-25">
                      <img 
                        src={movieForm.backdropUrl} 
                        alt="Backdrop Preview" 
                        className="rounded object-fit-cover" 
                        style={{ width: '100px', height: '56px' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                      <span className="text-secondary small">Backdrop preview active</span>
                    </div>
                  )}
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>

          <Modal.Footer className="border-secondary border-opacity-25">
            <Button variant="outline-secondary" onClick={() => setShowAddModal(false)} disabled={submittingMovie}>
              Cancel
            </Button>
            <Button variant="danger" type="submit" disabled={submittingMovie} className="px-4 fw-semibold">
              {submittingMovie ? (
                <>
                  <Spinner size="sm" animation="border" className="me-2" /> Saving Movie...
                </>
              ) : (
                'Save to Database'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
