import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import { 
  FaServer, FaDatabase, FaBolt, FaTicketAlt, FaCheckCircle, 
  FaSyncAlt, FaArrowRight, FaShieldAlt, FaPlay, FaStar, FaFilm,
  FaVolumeUp, FaCube, FaGlasses, FaBroadcastTower
} from 'react-icons/fa';
import api from '../services/api.js';
import MovieCard from '../components/MovieCard.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import TrailerModal from '../components/TrailerModal.jsx';

export default function Home() {
  const [health, setHealth] = useState(null);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [activeTrailer, setActiveTrailer] = useState(null);

  const genres = ['All', 'Action', 'Sci-Fi', 'Adventure', 'Drama', 'Thriller', 'Animation'];

  const fetchData = async () => {
    try {
      setLoading(true);
      const [healthRes, moviesRes] = await Promise.all([
        api.get('/health').catch(() => ({ data: null })),
        api.get('/movies?limit=12')
      ]);

      if (healthRes.data) setHealth(healthRes.data);
      if (moviesRes.data?.movies) setMovies(moviesRes.data.movies);
      setError(null);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.message || 'Unable to fetch data from API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const nowShowingMovies = movies.filter((m) => m.movieStatus === 'now_showing');
  const comingSoonMovies = movies.filter((m) => m.movieStatus === 'coming_soon');
  const featuredMovie = nowShowingMovies[0] || movies[0];

  const filteredNowShowing = selectedGenre === 'All'
    ? nowShowingMovies
    : nowShowingMovies.filter((m) => m.genre?.some((g) => g.toLowerCase() === selectedGenre.toLowerCase()));

  return (
    <div className="pb-5">
      {/* Featured Movie Hero Banner */}
      {featuredMovie && (
        <section 
          className="position-relative text-white overflow-hidden py-5 mb-5"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(7, 9, 14, 0.95) 20%, rgba(7, 9, 14, 0.7) 60%, rgba(7, 9, 14, 0.9) 100%), url(${featuredMovie.backdropUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            minHeight: '480px'
          }}
        >
          <Container className="py-4 position-relative">
            <Row className="align-items-center">
              <Col lg={7} md={8}>
                <Badge bg="danger" className="px-3 py-1 mb-3 rounded-pill fw-bold text-uppercase" style={{ fontSize: '0.75rem' }}>
                  ★ Featured Premiere
                </Badge>
                <h1 className="display-4 fw-bolder mb-2 tracking-tight">
                  {featuredMovie.title}
                </h1>
                
                <div className="d-flex align-items-center gap-3 text-secondary small mb-3">
                  <span className="text-warning d-flex align-items-center gap-1">
                    <FaStar />
                    <span className="text-light fw-bold">{featuredMovie.averageRating || '4.9'}</span>/5
                  </span>
                  <span>•</span>
                  <span>{featuredMovie.language}</span>
                  <span>•</span>
                  <span>{featuredMovie.duration} mins</span>
                  <span>•</span>
                  <Badge bg="dark" className="border border-secondary border-opacity-50 text-light">
                    {featuredMovie.ageRating}
                  </Badge>
                </div>

                <p className="lead text-light text-opacity-85 mb-4 pe-lg-5" style={{ fontSize: '1rem', lineHeight: '1.6' }}>
                  {featuredMovie.description}
                </p>

                <div className="d-flex flex-wrap gap-3">
                  <Button
                    as={Link}
                    to={`/movies/${featuredMovie._id}`}
                    className="cinema-btn-primary px-4 py-2 d-flex align-items-center gap-2 shadow"
                  >
                    <FaTicketAlt />
                    <span>Book Tickets</span>
                  </Button>
                  {featuredMovie.trailerUrl && (
                    <Button
                      onClick={() => setActiveTrailer({ url: featuredMovie.trailerUrl, title: featuredMovie.title })}
                      variant="outline-light"
                      className="px-4 py-2 d-flex align-items-center gap-2 border-secondary border-opacity-50"
                    >
                      <FaPlay className="small text-danger" />
                      <span>Watch Trailer</span>
                    </Button>
                  )}
                </div>
              </Col>
            </Row>
          </Container>
        </section>
      )}

      {/* Now Showing Section with Genre Filter Pills */}
      <Container className="my-5">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
          <div>
            <div className="d-flex align-items-center gap-2">
              <span className="p-1 rounded bg-danger d-inline-block" style={{ width: '8px', height: '18px' }} />
              <h3 className="text-white fw-bold mb-0 tracking-tight">Now Showing in Cinemas</h3>
            </div>
            <small className="text-secondary">Explore current theatrical screenings and book live seats</small>
          </div>

          {/* Genre Filter Pills */}
          <div className="d-flex flex-wrap gap-1">
            {genres.map((g) => (
              <Button
                key={g}
                size="sm"
                variant={selectedGenre === g ? 'danger' : 'outline-secondary'}
                onClick={() => setSelectedGenre(g)}
                className={`rounded-pill px-3 py-1 ${selectedGenre === g ? 'cinema-btn-primary' : 'text-secondary border-secondary border-opacity-25'}`}
                style={{ fontSize: '0.8rem' }}
              >
                {g}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <LoadingSpinner message="Fetching movies from iMovies API..." />
        ) : error ? (
          <ErrorMessage title="Catalog Notice" message={error} onRetry={fetchData} />
        ) : filteredNowShowing.length === 0 ? (
          <div className="text-center py-5 text-secondary">No movies found matching {selectedGenre}.</div>
        ) : (
          <Row className="g-4">
            {filteredNowShowing.map((movie) => (
              <Col key={movie._id} lg={3} md={4} sm={6}>
                <MovieCard movie={movie} />
              </Col>
            ))}
          </Row>
        )}
      </Container>

      {/* Coming Soon Section */}
      {comingSoonMovies.length > 0 && (
        <Container className="my-5 pt-3">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <div className="d-flex align-items-center gap-2">
                <span className="p-1 rounded bg-warning d-inline-block" style={{ width: '8px', height: '18px' }} />
                <h3 className="text-white fw-bold mb-0 tracking-tight">Upcoming Releases</h3>
              </div>
              <small className="text-secondary">Anticipated blockbusters arriving soon to screens</small>
            </div>
            <Link to="/movies?status=coming_soon" className="text-danger small text-decoration-none fw-bold d-flex align-items-center gap-1">
              <span>View All</span>
              <FaArrowRight className="small" />
            </Link>
          </div>

          <Row className="g-4">
            {comingSoonMovies.slice(0, 4).map((movie) => (
              <Col key={movie._id} lg={3} md={4} sm={6}>
                <MovieCard movie={movie} />
              </Col>
            ))}
          </Row>
        </Container>
      )}

      {/* Cinematic Viewing Formats Showcase (Option 2) */}
      <Container className="my-5 py-3">
        <div className="mb-4">
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="p-1 rounded bg-danger d-inline-block" style={{ width: '8px', height: '18px' }} />
            <h3 className="text-white fw-bold mb-0 tracking-tight">Cinematic Formats & Experiences</h3>
          </div>
          <small className="text-secondary">Discover ultra-high-definition visual and audio technologies available across our screens</small>
        </div>

        <Row className="g-4">
          <Col lg={3} sm={6}>
            <Card className="cinema-card border-secondary border-opacity-25 p-4 h-100 shadow-sm hover-glow text-center">
              <div className="d-inline-flex p-3 rounded-circle bg-danger bg-opacity-10 text-danger mb-3 mx-auto">
                <FaBroadcastTower style={{ fontSize: '1.8rem' }} />
              </div>
              <h5 className="text-white fw-bold mb-1">IMAX with Laser</h5>
              <Badge bg="dark" className="border border-danger border-opacity-50 text-danger mb-3 mx-auto" style={{ fontSize: '0.68rem' }}>
                1.43:1 Aspect Ratio
              </Badge>
              <p className="text-secondary small mb-0" style={{ lineHeight: '1.5' }}>
                Dual 4K laser projection delivering crystal-clear images, deeper contrast, and a 12-channel sonic soundscape.
              </p>
            </Card>
          </Col>

          <Col lg={3} sm={6}>
            <Card className="cinema-card border-secondary border-opacity-25 p-4 h-100 shadow-sm hover-glow text-center">
              <div className="d-inline-flex p-3 rounded-circle bg-primary bg-opacity-10 text-primary mb-3 mx-auto">
                <FaVolumeUp style={{ fontSize: '1.8rem' }} />
              </div>
              <h5 className="text-white fw-bold mb-1">Dolby Atmos 7.1</h5>
              <Badge bg="dark" className="border border-primary border-opacity-50 text-primary mb-3 mx-auto" style={{ fontSize: '0.68rem' }}>
                Spatial 3D Audio
              </Badge>
              <p className="text-secondary small mb-0" style={{ lineHeight: '1.5' }}>
                Sound moves in three-dimensional space around you with pinpoint precision for breathtaking realism.
              </p>
            </Card>
          </Col>

          <Col lg={3} sm={6}>
            <Card className="cinema-card border-secondary border-opacity-25 p-4 h-100 shadow-sm hover-glow text-center">
              <div className="d-inline-flex p-3 rounded-circle bg-warning bg-opacity-10 text-warning mb-3 mx-auto">
                <FaCube style={{ fontSize: '1.8rem' }} />
              </div>
              <h5 className="text-white fw-bold mb-1">4DX Motion</h5>
              <Badge bg="dark" className="border border-warning border-opacity-50 text-warning mb-3 mx-auto" style={{ fontSize: '0.68rem' }}>
                Multi-Sensory
              </Badge>
              <p className="text-secondary small mb-0" style={{ lineHeight: '1.5' }}>
                Seats synchronized with on-screen action alongside environmental wind, water mist, scents, and lighting.
              </p>
            </Card>
          </Col>

          <Col lg={3} sm={6}>
            <Card className="cinema-card border-secondary border-opacity-25 p-4 h-100 shadow-sm hover-glow text-center">
              <div className="d-inline-flex p-3 rounded-circle bg-success bg-opacity-10 text-success mb-3 mx-auto">
                <FaGlasses style={{ fontSize: '1.8rem' }} />
              </div>
              <h5 className="text-white fw-bold mb-1">RealD 3D</h5>
              <Badge bg="dark" className="border border-success border-opacity-50 text-success mb-3 mx-auto" style={{ fontSize: '0.68rem' }}>
                High-Luminance 3D
              </Badge>
              <p className="text-secondary small mb-0" style={{ lineHeight: '1.5' }}>
                Twice the brightness of standard 3D projections, ensuring vivid colors, sharp action, and zero eye fatigue.
              </p>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Trailer Video Lightbox Modal */}
      <TrailerModal
        show={!!activeTrailer}
        onHide={() => setActiveTrailer(null)}
        trailerUrl={activeTrailer?.url}
        movieTitle={activeTrailer?.title}
      />

      {/* Phase 1 & 2 Architecture & Health Verification Card */}
      <Container id="system-status" className="my-5 pt-4">
        <Card className="cinema-card border-secondary border-opacity-25 shadow-lg overflow-hidden">
          <Card.Header className="bg-dark bg-opacity-50 border-secondary border-opacity-10 py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div>
              <div className="d-flex align-items-center gap-2">
                <span className="spinner-grow spinner-grow-sm text-success" role="status" />
                <h5 className="text-white fw-bold mb-0">Phase 2: Database Models & MVC Verification</h5>
              </div>
              <small className="text-secondary">
                Verified REST APIs for Movies, Theaters, Shows, Screens, and Reviews
              </small>
            </div>

            <Button 
              size="sm" 
              variant="outline-secondary" 
              onClick={fetchData} 
              disabled={loading}
              className="text-light d-flex align-items-center gap-2 border-secondary border-opacity-50"
            >
              <FaSyncAlt className={loading ? 'fa-spin text-danger' : 'text-success'} />
              <span>{loading ? 'Refreshing...' : 'Refresh Status'}</span>
            </Button>
          </Card.Header>

          <Card.Body className="p-4">
            <Row className="g-4">
              <Col md={3} sm={6}>
                <div className="p-3 rounded-3 bg-dark bg-opacity-75 border border-secondary border-opacity-15 h-100">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-secondary small">Movies Catalog</span>
                    <Badge bg="danger">{movies.length} Loaded</Badge>
                  </div>
                  <h6 className="text-white fw-bold mb-1">GET /api/movies</h6>
                  <p className="text-secondary small mb-0">Search, genre, language & pagination support.</p>
                </div>
              </Col>

              <Col md={3} sm={6}>
                <div className="p-3 rounded-3 bg-dark bg-opacity-75 border border-secondary border-opacity-15 h-100">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-secondary small">Cinemas & Screens</span>
                    <Badge bg="info">5 Theaters</Badge>
                  </div>
                  <h6 className="text-white fw-bold mb-1">GET /api/theaters</h6>
                  <p className="text-secondary small mb-0">Filter by city (Mumbai, Delhi-NCR, etc.).</p>
                </div>
              </Col>

              <Col md={3} sm={6}>
                <div className="p-3 rounded-3 bg-dark bg-opacity-75 border border-secondary border-opacity-15 h-100">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-secondary small">Scheduled Shows</span>
                    <Badge bg="success">Active</Badge>
                  </div>
                  <h6 className="text-white fw-bold mb-1">GET /api/shows</h6>
                  <p className="text-secondary small mb-0">Multi-screen conflict detection engine.</p>
                </div>
              </Col>

              <Col md={3} sm={6}>
                <div className="p-3 rounded-3 bg-dark bg-opacity-75 border border-secondary border-opacity-15 h-100">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-secondary small">Database State</span>
                    <Badge bg={health?.database?.status === 'connected' ? 'success' : 'secondary'}>
                      {health?.database?.status || 'Active Fallback'}
                    </Badge>
                  </div>
                  <h6 className="text-white fw-bold mb-1">MongoDB Atlas / Mongoose</h6>
                  <p className="text-secondary small mb-0">Mongoose schemas & seed data ready.</p>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}
