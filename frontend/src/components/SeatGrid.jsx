import React from 'react';
import Badge from 'react-bootstrap/Badge';
import { FaLock, FaCheck } from 'react-icons/fa';

export default function SeatGrid({
  rows,
  seatPricing,
  selectedSeats,
  bookedSeats,
  lockedSeats,
  onSeatToggle,
  maxSelectable = 10
}) {
  // Check seat state
  const getSeatState = (seatLabel) => {
    if (bookedSeats.includes(seatLabel)) {
      return 'booked';
    }

    const lock = lockedSeats.find((l) => l.seatNumber === seatLabel);
    if (lock) {
      return lock.isCurrentUsers ? 'selected' : 'locked';
    }

    if (selectedSeats.some((s) => s.label === seatLabel)) {
      return 'selected';
    }

    return 'available';
  };

  // Group rows by category
  const categories = ['Premium', 'Gold', 'Silver'];

  return (
    <div className="d-flex flex-column align-items-center w-100 py-3">
      {/* Screen Indicator */}
      <div className="w-100 text-center mb-5" style={{ maxWidth: '640px' }}>
        <div 
          className="mx-auto mb-2 rounded-top-pill"
          style={{
            height: '8px',
            width: '80%',
            backgroundColor: '#e50914',
            boxShadow: '0 0 25px rgba(229, 9, 20, 0.7)'
          }}
        />
        <span className="text-secondary text-uppercase fw-bold tracking-widest" style={{ fontSize: '0.7rem', letterSpacing: '3px' }}>
          All Eyes This Way • Cinema Screen
        </span>
      </div>

      {/* Seats Container */}
      <div className="w-100 overflow-auto py-2 d-flex flex-column align-items-center">
        {categories.map((category) => {
          const categoryRows = rows.filter((r) => r.category === category);
          if (categoryRows.length === 0) return null;

          const price = seatPricing?.[category] || 180;

          return (
            <div key={category} className="mb-4 w-100 d-flex flex-column align-items-center">
              {/* Category Header */}
              <div className="d-flex align-items-center justify-content-between mb-3 px-3 w-100 border-bottom border-secondary border-opacity-15 pb-1" style={{ maxWidth: '680px' }}>
                <span className="text-white fw-bold small text-uppercase tracking-wider">
                  {category} Class
                </span>
                <span className="text-danger small fw-semibold">₹{price}</span>
              </div>

              {/* Rows */}
              <div className="d-flex flex-column gap-2">
                {categoryRows.map((row) => (
                  <div key={row.rowLabel} className="d-flex align-items-center justify-content-center gap-1">
                    {/* Left Row Label */}
                    <span 
                      className="text-secondary small fw-bold text-center me-2 user-select-none" 
                      style={{ width: '20px', fontSize: '0.78rem' }}
                    >
                      {row.rowLabel}
                    </span>

                    {/* Seat Buttons */}
                    {Array.from({ length: row.count }, (_, i) => {
                      const seatNum = i + 1;
                      const seatLabel = `${row.rowLabel}${seatNum}`;
                      const state = getSeatState(seatLabel);
                      const isAisle = (row.count === 12 && (i === 2 || i === 9)) || (row.count === 10 && (i === 1 || i === 8));

                      return (
                        <React.Fragment key={seatLabel}>
                          {isAisle && <div style={{ width: '16px' }} />}
                          <button
                            type="button"
                            disabled={state === 'booked' || state === 'locked'}
                            onClick={() => onSeatToggle({ label: seatLabel, row: row.rowLabel, number: seatNum, category, price })}
                            className={`seat-btn d-flex align-items-center justify-content-center p-0 rounded-2 position-relative ${state}`}
                            title={`${seatLabel} (${category} - ₹${price})`}
                            style={{
                              width: '32px',
                              height: '30px',
                              fontSize: '0.72rem',
                              fontWeight: '600',
                              border: state === 'selected' ? '1px solid #e50914' : '1px solid rgba(255,255,255,0.12)',
                              backgroundColor: 
                                state === 'selected' ? '#e50914' : 
                                state === 'booked' ? '#1e293b' : 
                                state === 'locked' ? '#f59e0b' : 
                                '#0f172a',
                              color: 
                                state === 'selected' ? '#ffffff' : 
                                state === 'booked' ? '#475569' : 
                                state === 'locked' ? '#000000' : 
                                '#cbd5e1',
                              cursor: state === 'booked' || state === 'locked' ? 'not-allowed' : 'pointer',
                              boxShadow: state === 'selected' ? '0 0 12px rgba(229,9,20,0.6)' : 'none',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            {state === 'locked' ? (
                              <FaLock style={{ fontSize: '0.65rem' }} />
                            ) : state === 'selected' ? (
                              <FaCheck style={{ fontSize: '0.65rem' }} />
                            ) : (
                              seatNum
                            )}
                          </button>
                        </React.Fragment>
                      );
                    })}

                    {/* Right Row Label */}
                    <span 
                      className="text-secondary small fw-bold text-center ms-2 user-select-none" 
                      style={{ width: '20px', fontSize: '0.78rem' }}
                    >
                      {row.rowLabel}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Visual Legend */}
      <div className="d-flex flex-wrap justify-content-center align-items-center gap-4 mt-4 pt-3 border-top border-secondary border-opacity-15 small text-secondary">
        <div className="d-flex align-items-center gap-2">
          <div className="rounded-2" style={{ width: '18px', height: '18px', backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.2)' }} />
          <span>Available</span>
        </div>

        <div className="d-flex align-items-center gap-2">
          <div className="rounded-2" style={{ width: '18px', height: '18px', backgroundColor: '#e50914', border: '1px solid #e50914' }} />
          <span className="text-light">Selected</span>
        </div>

        <div className="d-flex align-items-center gap-2">
          <div className="rounded-2 d-flex align-items-center justify-content-center text-dark" style={{ width: '18px', height: '18px', backgroundColor: '#f59e0b' }}>
            <FaLock style={{ fontSize: '0.55rem' }} />
          </div>
          <span>Locked</span>
        </div>

        <div className="d-flex align-items-center gap-2">
          <div className="rounded-2" style={{ width: '18px', height: '18px', backgroundColor: '#1e293b', border: '1px solid #334155' }} />
          <span>Booked</span>
        </div>
      </div>
    </div>
  );
}
