import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { 
  getShowSeatMap, 
  acquireSeatLocks, 
  releaseSeatLocks, 
  markSeatsAsBooked, 
  unmarkSeatsAsBooked 
} from '../services/seatLockService.js';

describe('Real-Time Seat Locking & Concurrency Engine', () => {
  const showId = 'show_test_101';
  const userA = 'user_alpha_1';
  const userB = 'user_beta_2';

  test('should return default layout, pricing and booked seats for a show', async () => {
    const seatMap = await getShowSeatMap(showId, userA);
    assert.ok(seatMap, 'Seat map must not be null');
    assert.strictEqual(seatMap.showId, showId);
    assert.ok(Array.isArray(seatMap.rows), 'Rows must be an array');
    assert.ok(seatMap.rows.length > 0, 'Rows must have seat items');
    assert.ok(seatMap.seatPricing, 'Seat pricing must be defined');
    assert.ok(Array.isArray(seatMap.bookedSeats), 'Booked seats must be an array');
  });

  test('should allow User A to atomically lock available seats', async () => {
    const seatsToLock = ['B1', 'B2'];
    const lockResult = await acquireSeatLocks(showId, seatsToLock, userA);

    assert.strictEqual(lockResult.success, true);
    assert.deepStrictEqual(lockResult.seats, seatsToLock);
    assert.ok(lockResult.expiresAt, 'Expires timestamp must be returned');

    // Verify seat map reflects locked status for User A as selected
    const seatMapA = await getShowSeatMap(showId, userA);
    const userALocks = seatMapA.lockedSeats.filter((l) => l.isCurrentUsers);
    assert.strictEqual(userALocks.length >= 2, true);

    // Verify seat map reflects locked status for User B as locked (not current user)
    const seatMapB = await getShowSeatMap(showId, userB);
    const userBLocks = seatMapB.lockedSeats.filter((l) => !l.isCurrentUsers && seatsToLock.includes(l.seatNumber));
    assert.strictEqual(userBLocks.length, 2);
  });

  test('should reject User B when trying to acquire seat locked by User A (concurrency conflict)', async () => {
    const conflictingSeats = ['B1', 'B3'];

    await assert.rejects(
      async () => {
        await acquireSeatLocks(showId, conflictingSeats, userB);
      },
      (err) => {
        assert.strictEqual(err.statusCode, 409);
        assert.match(err.message, /currently held by another/i);
        return true;
      }
    );
  });

  test('should allow User A to release locked seats cleanly', async () => {
    const seatsToRelease = ['B1', 'B2'];
    const releaseResult = await releaseSeatLocks(showId, seatsToRelease, userA);
    assert.strictEqual(releaseResult.success, true);

    // User B should now be able to lock B1
    const userBLockResult = await acquireSeatLocks(showId, ['B1'], userB);
    assert.strictEqual(userBLockResult.success, true);

    // Cleanup
    await releaseSeatLocks(showId, ['B1'], userB);
  });

  test('should reject reserving more than 10 seats in a single request', async () => {
    const excessiveSeats = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9', 'A10', 'A11'];

    await assert.rejects(
      async () => {
        await acquireSeatLocks(showId, excessiveSeats, userA);
      },
      (err) => {
        assert.strictEqual(err.statusCode, 400);
        assert.match(err.message, /cannot reserve more than 10 seats/i);
        return true;
      }
    );
  });

  test('should correctly transition seats to booked and prevent locking', async () => {
    const bookedSeats = ['C5', 'C6'];
    markSeatsAsBooked(showId, bookedSeats);

    // Attempting to lock booked seat should fail with 409
    await assert.rejects(
      async () => {
        await acquireSeatLocks(showId, ['C5'], userA);
      },
      (err) => {
        assert.strictEqual(err.statusCode, 409);
        assert.match(err.message, /already booked/i);
        return true;
      }
    );

    // Unmarking allows seats to be free again
    unmarkSeatsAsBooked(showId, bookedSeats);
  });
});
