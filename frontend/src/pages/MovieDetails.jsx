import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';
import { 
  FaStar, FaClock, FaCalendarAlt, FaLanguage, FaTicketAlt, 
  FaPlay, FaArrowLeft, FaUser, FaRegStar 
} from 'react-icons/fa';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import TrailerModal from '../components/TrailerModal.jsx';

export default function MovieDetails() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);

  // Review submission state
  const [userRating, setUserRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [reviewError, setReviewError] = useState('');

  const fetchMovieDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/movies/${id}`);
      if (response.data) {
        setMovie(response.data);
      }
      setError(null);
    } catch (err) {
      console.error('Failed to load movie details:', err);
      setError(err.message || 'Movie details could not be found.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovieDetails();
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    try {
      setSubmittingReview(true);
      setReviewError('');
      setReviewSuccess('');

      await api.post(`/movies/${id}/reviews`, {
        rating: userRating,
        comment: reviewComment.trim(),
        userId: user?._id
      });

      setReviewSuccess('Your review has been submitted successfully!');
      setReviewComment('');
      // Refresh movie to reflect new rating and review list
      fetchMovieDetails();
    } catch (err) {
      setReviewError(err.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading movie presentation..." />;
  }

  if (error || !movie) {
    return (
      <Container className="py-5">
        <ErrorMessage title="Movie Error" message={error} onRetry={fetchMovieDetails} />
        <Link to="/movies" className="btn btn-outline-secondary mt-3">
          <FaArrowLeft className="me-2" />
          Back to Movies
        </Link>
      </Container>
    );
  }

  const isComingSoon = movie.movieStatus === 'coming_soon';

  return (
    <div>
      {/* Cinematic Hero Backdrop Banner */}
      <section 
        className="position-relative text-white py-5"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(7, 9, 14, 0.95) 20%, rgba(7, 9, 14, 0.75) 60%, rgba(7, 9, 14, 0.95) 100%), url(${movie.backdropUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '440px'
        }}
      >
        <Container className="py-3">
          <Link to="/movies" className="text-secondary small text-decoration-none d-inline-flex align-items-center gap-1 mb-4 hover-danger">
            <FaArrowLeft />
            <span>Back to Movies</span>
          </Link>

          <Row className="gy-4 align-items-center">
            {/* Poster Card */}
            <Col lg={3} md={4} sm={5}>
              <div className="rounded-3 overflow-hidden shadow-lg border border-secondary border-opacity-25" style={{ aspectRatio: '2/3' }}>
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-100 h-100 object-fit-cover"
                />
              </div>
            </Col>

            {/* Movie Info */}
            <Col lg={9} md={8} sm={7}>
              <div className="d-flex flex-wrap gap-2 mb-2">
                <Badge bg={isComingSoon ? 'warning' : 'danger'} text={isComingSoon ? 'dark' : 'light'} className="px-3 py-1 fw-bold text-uppercase">
                  {isComingSoon ? 'Coming Soon' : 'Now Showing'}
                </Badge>
                {movie.ageRating && (
                  <Badge bg="dark" className="border border-secondary border-opacity-50 text-light px-2 py-1">
                    {movie.ageRating}
                  </Badge>
                )}
              </div>

              <h1 className="display-4 fw-bolder mb-2 tracking-tight text-white">{movie.title}</h1>

              {/* Rating and Meta */}
              <div className="d-flex flex-wrap align-items-center gap-3 text-secondary small mb-3">
                <div className="d-flex align-items-center gap-1 text-warning">
                  <FaStar />
                  <span className="text-light fw-bold fs-6">{movie.averageRating || '4.5'}</span>
                  <span>({movie.totalRatings || 0} ratings)</span>
                </div>
                <span>•</span>
                <span className="d-flex align-items-center gap-1">
                  <FaClock />
                  {movie.duration} mins
                </span>
                <span>•</span>
                <span className="d-flex align-items-center gap-1">
                  <FaLanguage />
                  {movie.language}
                </span>
                <span>•</span>
                <span className="d-flex align-items-center gap-1">
                  <FaCalendarAlt />
                  {new Date(movie.releaseDate).toLocaleDateString()}
                </span>
              </div>

              {/* Genre Badges */}
              <div className="d-flex flex-wrap gap-2 mb-4">
                {movie.genre?.map((g) => (
                  <Badge key={g} bg="dark" className="border border-secondary border-opacity-25 text-light px-3 py-1 fw-normal">
                    {g}
                  </Badge>
                ))}
              </div>

              {/* Synopsis */}
              <p className="text-light text-opacity-85 mb-4 pe-lg-5" style={{ fontSize: '1.05rem', lineHeight: '1.7' }}>
                {movie.description}
              </p>

              {/* Director & Cast */}
              <div className="mb-4 small text-secondary">
                {movie.director && (
                  <div className="mb-1">
                    <span className="text-light fw-medium">Director: </span>
                    <span>{movie.director}</span>
                  </div>
                )}
                {movie.cast?.length > 0 && (
                  <div>
                    <span className="text-light fw-medium">Starring: </span>
                    <span>{movie.cast.join(', ')}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="d-flex flex-wrap gap-3">
                {!isComingSoon && (
                  <Button
                    as={Link}
                    to={`/showtimes?movieId=${movie._id}`}
                    className="cinema-btn-primary px-4 py-2 d-flex align-items-center gap-2 shadow"
                  >
                    <FaTicketAlt />
                    <span>Select Showtimes & Seats</span>
                  </Button>
                )}
                {movie.trailerUrl && (
                  <Button
                    onClick={() => setShowTrailer(true)}
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

      {/* Reviews & Ratings Section */}
      <Container className="py-5">
        <Row className="gy-4">
          <Col lg={7}>
            <h4 className="text-white fw-bold mb-3 tracking-tight">Audience Reviews</h4>

            {movie.reviews?.length === 0 ? (
              <div className="p-4 rounded-3 bg-dark bg-opacity-50 border border-secondary border-opacity-15 text-center text-secondary">
                No audience reviews yet. Be the first to review this movie!
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {movie.reviews?.map((r) => (
                  <Card key={r._id} className="cinema-card border-secondary border-opacity-15 p-3">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <div 
                          className="rounded-circle bg-danger bg-opacity-25 text-danger d-flex align-items-center justify-content-center"
                          style={{ width: '32px', height: '32px' }}
                        >
                          <FaUser className="small" />
                        </div>
                        <div>
                          <span className="text-white fw-medium small d-block">{r.userId?.name || 'Verified Moviegoer'}</span>
                          <span className="text-secondary" style={{ fontSize: '0.72rem' }}>
                            {new Date(r.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="d-flex align-items-center gap-1 text-warning small">
                        {Array.from({ length: 5 }, (_, i) => (
                          <span key={i}>{i < r.rating ? '★' : '☆'}</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-light text-opacity-80 small mb-0 lh-base">
                      {r.comment}
                    </p>
                  </Card>
                ))}
              </div>
            )}
          </Col>

          {/* Write a Review Card */}
          <Col lg={5}>
            <Card className="cinema-card border-secondary border-opacity-25 p-4">
              <h5 className="text-white fw-bold mb-3">Write a Review</h5>

              {reviewSuccess && (
                <Alert variant="success" className="bg-dark text-success border-success border-opacity-50 small py-2 mb-3">
                  {reviewSuccess}
                </Alert>
              )}

              {reviewError && (
                <Alert variant="danger" className="bg-dark text-danger border-danger border-opacity-50 small py-2 mb-3">
                  {reviewError}
                </Alert>
              )}

              {isAuthenticated ? (
                <Form onSubmit={handleReviewSubmit}>
                  {/* Rating Selector */}
                  <Form.Group className="mb-3">
                    <Form.Label className="text-secondary small fw-medium">Your Rating</Form.Label>
                    <div className="d-flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setUserRating(star)}
                          className="btn btn-sm p-1 fs-5 border-0 bg-transparent"
                          style={{ color: star <= userRating ? '#f59e0b' : '#475569' }}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </Form.Group>

                  {/* Comment */}
                  <Form.Group className="mb-3">
                    <Form.Label className="text-secondary small fw-medium">Your Experience</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      placeholder="Share your thoughts about the direction, acting, visuals, and soundtrack..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      required
                      className="bg-dark border-secondary border-opacity-25 text-light shadow-none small"
                    />
                  </Form.Group>

                  <Button
                    type="submit"
                    disabled={submittingReview}
                    className="cinema-btn-primary w-100 py-2 small"
                  >
                    {submittingReview ? 'Submitting...' : 'Post Review'}
                  </Button>
                </Form>
              ) : (
                <div className="text-center py-4 text-secondary">
                  <p className="small mb-3">You must be logged in to leave a review and rating.</p>
                  <Button as={Link} to="/login" variant="outline-danger" size="sm" className="px-4">
                    Sign In to Review
                  </Button>
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </Container>

      {/* In-App Trailer Lightbox Modal */}
      <TrailerModal
        show={showTrailer}
        onHide={() => setShowTrailer(false)}
        trailerUrl={movie.trailerUrl}
        movieTitle={movie.title}
      />
    </div>
  );
}
