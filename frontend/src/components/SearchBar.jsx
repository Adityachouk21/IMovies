import React from 'react';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';
import { FaSearch, FaTimes } from 'react-icons/fa';

export default function SearchBar({ value, onChange, onClear, placeholder = 'Search movies, cast, genres...' }) {
  return (
    <InputGroup className="shadow-sm">
      <InputGroup.Text className="bg-dark border-secondary border-opacity-25 text-secondary ps-3">
        <FaSearch />
      </InputGroup.Text>
      <Form.Control
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-dark border-secondary border-opacity-25 text-light shadow-none"
        style={{ fontSize: '0.9rem' }}
      />
      {value && (
        <Button
          variant="dark"
          onClick={onClear}
          className="border-secondary border-opacity-25 text-secondary px-3"
          title="Clear search"
        >
          <FaTimes />
        </Button>
      )}
    </InputGroup>
  );
}
