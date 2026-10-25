import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { 
  createBooking, 
  getMyBookings, 
  getBookingById, 
  cancelBooking 
} from '../controllers/bookingController.js';

describe('Ticketing & Booking Calculation System', () => {
  const dummyUser = { _id: 'user_test_456', role: 'user' };

  test('should calculate subtotal, convenience fee (₹30/seat), and 18% GST accurately', async () => {
    const seats = [
      { row: 'G', seatNumber: 5, seatLabel: 'G5', category: 'Gold', price: 280 },
      { row: 'G', seatNumber: 6, seatLabel: 'G6', category: 'Gold', price: 280 }
    ];

    const subtotal = seats.reduce((acc, s) => acc + s.price, 0); // 560
    const fees = seats.length * 30; // 60
    const taxes = Math.round((subtotal + fees) * 0.18); // (560 + 60) * 0.18 = 111.6 -> 112
    const totalAmount = subtotal + fees + taxes; // 560 + 60 + 112 = 732

    assert.strictEqual(subtotal, 560);
    assert.strictEqual(fees, 60);
    assert.strictEqual(taxes, 112);
    assert.strictEqual(totalAmount, 732);
  });

  test('should create a confirmed ticket booking with reference code and QR data', async () => {
    let statusCode = null;
    let jsonResponse = null;

    const req = {
      user: dummyUser,
      body: {
        showId: 'show_seed_1',
        seats: [
          { row: 'H', seatNumber: 1, seatLabel: 'H1', category: 'Premium', price: 420 }
        ],
        paymentMethod: 'card'
      },
      app: {
        get: () => ({ to: () => ({ emit: () => {} }) })
      }
    };

    const res = {
      status: (code) => {
        statusCode = code;
        return {
          json: (data) => {
            jsonResponse = data;
          }
        };
      }
    };

    await createBooking(req, res, (err) => { if (err) throw err; });

    assert.strictEqual(statusCode, 201);
    assert.ok(jsonResponse.data, 'Booking data should be returned');
    assert.match(jsonResponse.data.bookingReference, /^IMO-[A-Z0-9]{8}$/);
    assert.strictEqual(jsonResponse.data.bookingStatus, 'confirmed');
    assert.strictEqual(jsonResponse.data.paymentStatus, 'paid');
    assert.strictEqual(jsonResponse.data.subtotal, 420);
    assert.strictEqual(jsonResponse.data.fees, 30);
    assert.strictEqual(jsonResponse.data.totalAmount, 420 + 30 + Math.round(450 * 0.18)); // 531
    assert.ok(jsonResponse.data.qrCodeData, 'QR Code string must be generated');

    const createdRef = jsonResponse.data.bookingReference;

    // Test retrieving user bookings
    let myBookingsJson = null;
    const reqMy = { user: dummyUser };
    const resMy = {
      status: () => ({
        json: (data) => { myBookingsJson = data; }
      })
    };

    await getMyBookings(reqMy, resMy, (err) => { if (err) throw err; });
    assert.ok(Array.isArray(myBookingsJson.data));
    const found = myBookingsJson.data.find((b) => b.bookingReference === createdRef);
    assert.ok(found, 'Created booking must appear in my bookings list');

    // Test cancelling the booking
    let cancelJson = null;
    const reqCancel = {
      user: dummyUser,
      params: { id: createdRef },
      app: {
        get: () => ({ to: () => ({ emit: () => {} }) })
      }
    };
    const resCancel = {
      status: () => ({
        json: (data) => { cancelJson = data; }
      })
    };

    await cancelBooking(reqCancel, resCancel, (err) => { if (err) throw err; });
    assert.strictEqual(cancelJson.data.bookingStatus, 'cancelled');
    assert.strictEqual(cancelJson.data.paymentStatus, 'refunded');
    assert.strictEqual(cancelJson.data.cancellationStatus.isCancelled, true);
  });

  test('should apply promo code discount and deduct from totalAmount correctly', async () => {
    let statusCode = null;
    let jsonResponse = null;

    const req = {
      user: dummyUser,
      body: {
        showId: 'show_seed_1',
        seats: [
          { row: 'E', seatNumber: 1, seatLabel: 'E1', category: 'Gold', price: 290 }
        ],
        paymentMethod: 'upi',
        promoCode: 'IMAX50',
        discount: 145
      },
      app: {
        get: () => ({ to: () => ({ emit: () => {} }) })
      }
    };

    const res = {
      status: (code) => {
        statusCode = code;
        return {
          json: (data) => { jsonResponse = data; }
        };
      }
    };

    await createBooking(req, res, (err) => { if (err) throw err; });

    assert.strictEqual(statusCode, 201);
    assert.strictEqual(jsonResponse.data.promoCode, 'IMAX50');
    assert.strictEqual(jsonResponse.data.discount, 145);
    const subtotal = 290;
    const fees = 30;
    const taxes = Math.round((subtotal + fees) * 0.18);
    const expectedTotal = subtotal + fees + taxes - 145;
    assert.strictEqual(jsonResponse.data.totalAmount, expectedTotal);
  });
});
