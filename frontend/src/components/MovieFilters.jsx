import React from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import { FaFilter, FaRedoAlt, FaSortAmountDown } from 'react-icons/fa';

export default function MovieFilters({
  status,
  onStatusChange,
  genre,
  onGenreChange,
  language,
  onLanguageChange,
  sortBy,
  onSortChange,
  onReset
}) {
  const genres = ['All', 'Action', 'Sci-Fi', 'Adventure', 'Drama', 'Biography', 'Crime', 'Fantasy', 'Animation', 'Thriller'];
  const languages = ['All', 'English', 'Hindi', 'Telugu', 'Tamil'];
  const sortOptions = [
    { value: 'releaseDate', label: 'Release Date (Latest)' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'popularity', label: 'Most Popular' },
    { value: 'title', label: 'Title (A-Z)' }
  ];

  const hasActiveFilters = status !== 'all' || genre !== 'All' || language !== 'All' || sortBy !== 'releaseDate';

  return (
    <div className="p-3 mb-4 rounded-3 bg-dark bg-opacity-75 border border-secondary border-opacity-15">
      <Row className="g-3 align-items-center">
        {/* Status Toggle (All / Now Showing / Coming Soon) */}
        <Col lg={4} md={12}>
          <div className="d-flex align-items-center gap-2">
            <span className="text-secondary small fw-medium d-none d-sm-inline">Status:</span>
            <ButtonGroup size="sm" className="w-100">
              <Button
                variant={status === 'all' ? 'danger' : 'dark'}
                onClick={() => onStatusChange('all')}
                className={`border-secondary border-opacity-25 ${status === 'all' ? 'cinema-btn-primary' : 'text-secondary'}`}
              >
                All
              </Button>
              <Button
                variant={status === 'now_showing' ? 'danger' : 'dark'}
                onClick={() => onStatusChange('now_showing')}
                className={`border-secondary border-opacity-25 ${status === 'now_showing' ? 'cinema-btn-primary' : 'text-secondary'}`}
              >
                Now Showing
              </Button>
              <Button
                variant={status === 'coming_soon' ? 'danger' : 'dark'}
                onClick={() => onStatusChange('coming_soon')}
                className={`border-secondary border-opacity-25 ${status === 'coming_soon' ? 'cinema-btn-primary' : 'text-secondary'}`}
              >
                Coming Soon
              </Button>
            </ButtonGroup>
          </div>
        </Col>

        {/* Genre Selector */}
        <Col lg={2} sm={4}>
          <Form.Select
            size="sm"
            value={genre}
            onChange={(e) => onGenreChange(e.target.value)}
            className="bg-dark border-secondary border-opacity-25 text-light shadow-none"
            aria-label="Filter by Genre"
          >
            {genres.map((g) => (
              <option key={g} value={g} className="bg-dark text-light">
                {g === 'All' ? 'All Genres' : g}
              </option>
            ))}
          </Form.Select>
        </Col>

        {/* Language Selector */}
        <Col lg={2} sm={4}>
          <Form.Select
            size="sm"
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="bg-dark border-secondary border-opacity-25 text-light shadow-none"
            aria-label="Filter by Language"
          >
            {languages.map((l) => (
              <option key={l} value={l} className="bg-dark text-light">
                {l === 'All' ? 'All Languages' : l}
              </option>
            ))}
          </Form.Select>
        </Col>

        {/* Sort Selector */}
        <Col lg={3} sm={4}>
          <Form.Select
            size="sm"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="bg-dark border-secondary border-opacity-25 text-light shadow-none"
            aria-label="Sort by"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-dark text-light">
                {opt.label}
              </option>
            ))}
          </Form.Select>
        </Col>

        {/* Reset Filter Button */}
        {hasActiveFilters && (
          <Col lg={1} xs={12} className="text-lg-end">
            <Button
              variant="link"
              size="sm"
              onClick={onReset}
              className="text-secondary text-decoration-none p-0 d-inline-flex align-items-center gap-1 hover-danger"
              title="Reset all filters"
            >
              <FaRedoAlt className="small" />
              <span>Reset</span>
            </Button>
          </Col>
        )}
      </Row>
    </div>
  );
}
