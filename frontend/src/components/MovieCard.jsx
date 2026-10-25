import React from 'react';
import { Link } from 'react-router-dom';
import Card from 'react-bootstrap/Card';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import { FaStar, FaTicketAlt, FaClock, FaLanguage } from 'react-icons/fa';

export default function MovieCard({ movie }) {
  if (!movie) return null;

  const formatDuration = (mins) => {
    if (!mins) return '';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  const isComingSoon = movie.movieStatus === 'coming_soon';

  return (
    <Card className="cinema-card h-100 overflow-hidden d-flex flex-column border-secondary border-opacity-25">
      {/* Poster Container */}
      <div className="position-relative overflow-hidden" style={{ paddingTop: '145%', backgroundColor: '#0c1017' }}>
        <img
          src={movie.posterUrl}
          alt={movie.title}
          loading="lazy"
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{ objectFit: 'cover', transition: 'transform 0.4s ease' }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80';
          }}
        />

        {/* Top Badges */}
        <div className="position-absolute top-0 start-0 p-2 d-flex gap-1">
          <Badge bg="dark" className="border border-secondary border-opacity-50 text-warning d-flex align-items-center gap-1 shadow-sm">
            <FaStar className="small" />
            <span>{movie.averageRating || '4.5'}</span>
          </Badge>
          {movie.ageRating && (
            <Badge bg="dark" className="border border-secondary border-opacity-50 text-light shadow-sm">
              {movie.ageRating}
            </Badge>
          )}
        </div>

        {isComingSoon && (
          <div className="position-absolute bottom-0 start-0 w-100 p-2 text-center" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.85))' }}>
            <Badge bg="warning" text="dark" className="fw-bold px-2 py-1">
              Coming Soon
            </Badge>
          </div>
        )}
      </div>

      {/* Card Details */}
      <Card.Body className="d-flex flex-column p-3">
        <h6 className="text-white fw-bold mb-1 text-truncate" title={movie.title} style={{ fontSize: '1rem' }}>
          {movie.title}
        </h6>

        <div className="d-flex align-items-center gap-2 text-secondary small mb-2" style={{ fontSize: '0.78rem' }}>
          <span className="d-flex align-items-center gap-1">
            <FaLanguage />
            {movie.language}
          </span>
          <span>•</span>
          <span className="d-flex align-items-center gap-1">
            <FaClock />
            {formatDuration(movie.duration)}
          </span>
        </div>

        {/* Genres */}
        <div className="d-flex flex-wrap gap-1 mb-3">
          {movie.genre?.slice(0, 2).map((g) => (
            <Badge 
              key={g} 
              bg="dark" 
              className="text-secondary border border-secondary border-opacity-25 fw-normal" 
              style={{ fontSize: '0.7rem' }}
            >
              {g}
            </Badge>
          ))}
        </div>

        {/* Action Button */}
        <div className="mt-auto">
          {isComingSoon ? (
            <Button
              as={Link}
              to={`/movies/${movie._id}`}
              variant="outline-secondary"
              size="sm"
              className="w-100 text-light border-secondary border-opacity-50"
            >
              View Details
            </Button>
          ) : (
            <Button
              as={Link}
              to={`/movies/${movie._id}`}
              size="sm"
              className="w-100 cinema-btn-primary d-flex align-items-center justify-content-center gap-2"
            >
              <FaTicketAlt className="small" />
              <span>Book Tickets</span>
            </Button>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}
