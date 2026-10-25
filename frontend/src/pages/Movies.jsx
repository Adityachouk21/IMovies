import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Pagination from 'react-bootstrap/Pagination';
import { FaFilm, FaSearch } from 'react-icons/fa';
import api from '../services/api.js';
import MovieCard from '../components/MovieCard.jsx';
import SearchBar from '../components/SearchBar.jsx';
import MovieFilters from '../components/MovieFilters.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

export default function Movies() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [movies, setMovies] = useState([]);
  const [pagination, setPagination] = useState({ totalMovies: 0, totalPages: 1, currentPage: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states initialized from URL search params
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState(searchParams.get('status') || 'all');
  const [genre, setGenre] = useState(searchParams.get('genre') || 'All');
  const [language, setLanguage] = useState(searchParams.get('language') || 'All');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'releaseDate');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  // Sync state with URL params
  const updateFilters = (newParams) => {
    const updated = {
      ...(search && { search }),
      ...(status !== 'all' && { status }),
      ...(genre !== 'All' && { genre }),
      ...(language !== 'All' && { language }),
      ...(sortBy !== 'releaseDate' && { sortBy }),
      ...(page > 1 && { page }),
      ...newParams
    };
    setSearchParams(updated);
  };

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (status !== 'all') params.append('status', status);
      if (genre !== 'All') params.append('genre', genre);
      if (language !== 'All') params.append('language', language);
      if (sortBy) params.append('sortBy', sortBy);
      params.append('page', page);
      params.append('limit', 12);

      const response = await api.get(`/movies?${params.toString()}`);
      if (response.data) {
        setMovies(response.data.movies || []);
        setPagination(response.data.pagination || { totalMovies: 0, totalPages: 1, currentPage: 1 });
      }
      setError(null);
    } catch (err) {
      console.error('Failed to fetch movies:', err);
      setError(err.message || 'Unable to load movie catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, [search, status, genre, language, sortBy, page]);

  const handleReset = () => {
    setSearch('');
    setStatus('all');
    setGenre('All');
    setLanguage('All');
    setSortBy('releaseDate');
    setPage(1);
    setSearchParams({});
  };

  return (
    <Container className="py-4">
      {/* Header & Search */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="text-white fw-bold mb-1 tracking-tight">Movie Catalog</h2>
          <p className="text-secondary small mb-0">
            Showing {pagination.totalMovies} {pagination.totalMovies === 1 ? 'title' : 'titles'} in cinemas
          </p>
        </div>
        <div style={{ maxWidth: '340px', width: '100%' }}>
          <SearchBar
            value={search}
            onChange={(val) => {
              setSearch(val);
              setPage(1);
            }}
            onClear={() => {
              setSearch('');
              setPage(1);
            }}
            placeholder="Search by movie title..."
          />
        </div>
      </div>

      {/* Filter Toolbar */}
      <MovieFilters
        status={status}
        onStatusChange={(val) => {
          setStatus(val);
          setPage(1);
        }}
        genre={genre}
        onGenreChange={(val) => {
          setGenre(val);
          setPage(1);
        }}
        language={language}
        onLanguageChange={(val) => {
          setLanguage(val);
          setPage(1);
        }}
        sortBy={sortBy}
        onSortChange={(val) => {
          setSortBy(val);
          setPage(1);
        }}
        onReset={handleReset}
      />

      {/* Content State */}
      {loading ? (
        <LoadingSpinner message="Searching movie catalog..." />
      ) : error ? (
        <ErrorMessage title="Catalog Error" message={error} onRetry={fetchMovies} />
      ) : movies.length === 0 ? (
        <div className="text-center py-5 my-5 bg-dark bg-opacity-50 rounded-3 border border-secondary border-opacity-15">
          <FaFilm className="text-secondary display-4 mb-3" />
          <h5 className="text-white fw-bold mb-2">No Movies Found</h5>
          <p className="text-secondary small mb-3">
            We couldn't find any movie matching your current search and filter combination.
          </p>
          <button onClick={handleReset} className="btn cinema-btn-primary btn-sm px-4">
            Reset Filters
          </button>
        </div>
      ) : (
        <>
          <Row className="g-4 mb-4">
            {movies.map((movie) => (
              <Col key={movie._id} lg={3} md={4} sm={6}>
                <MovieCard movie={movie} />
              </Col>
            ))}
          </Row>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="d-flex justify-content-center mt-5">
              <Pagination className="cinema-pagination">
                <Pagination.Prev
                  disabled={page <= 1}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  className="bg-dark text-light border-secondary"
                />
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                  <Pagination.Item
                    key={p}
                    active={p === page}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </Pagination.Item>
                ))}
                <Pagination.Next
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((prev) => Math.min(pagination.totalPages, prev + 1))}
                  className="bg-dark text-light border-secondary"
                />
              </Pagination>
            </div>
          )}
        </>
      )}
    </Container>
  );
}
