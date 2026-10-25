import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { FaTimes, FaPlay, FaFilm } from 'react-icons/fa';

export default function TrailerModal({ show, onHide, trailerUrl, movieTitle }) {
  // Convert standard YouTube watch/share URL to embed URL
  const getEmbedUrl = (url) => {
    if (!url) return '';
    try {
      if (url.includes('embed')) return url;
      if (url.includes('youtube.com/watch')) {
        const urlObj = new URL(url);
        const v = urlObj.searchParams.get('v');
        return `https://www.youtube-nocookie.com/embed/${v}?autoplay=1&rel=0&modestbranding=1`;
      }
      if (url.includes('youtu.be/')) {
        const id = url.split('youtu.be/')[1]?.split('?')[0];
        return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`;
      }
      return url;
    } catch {
      return url;
    }
  };

  const embedUrl = getEmbedUrl(trailerUrl);

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
      contentClassName="cinema-card border-secondary border-opacity-50 text-light shadow-2xl p-0 overflow-hidden"
    >
      <Modal.Header 
        className="bg-dark border-secondary border-opacity-25 py-2 px-3 d-flex align-items-center justify-content-between"
      >
        <Modal.Title className="fs-6 fw-bold d-flex align-items-center gap-2 text-white">
          <FaFilm className="text-danger" />
          <span>{movieTitle || 'Official Cinematic Trailer'}</span>
        </Modal.Title>
        <button
          type="button"
          onClick={onHide}
          className="btn btn-sm btn-link text-secondary text-decoration-none p-0 hover:text-white"
          aria-label="Close"
          style={{ fontSize: '1.2rem' }}
        >
          <FaTimes />
        </button>
      </Modal.Header>

      <Modal.Body className="p-0 bg-black">
        {embedUrl ? (
          <div className="ratio ratio-16x9">
            <iframe
              src={embedUrl}
              title={`${movieTitle} Official Trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ border: 0 }}
            />
          </div>
        ) : (
          <div className="p-5 text-center text-secondary">
            <FaPlay className="text-danger mb-2" style={{ fontSize: '2rem' }} />
            <p className="mb-0">Trailer video not currently available for this title.</p>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
}
