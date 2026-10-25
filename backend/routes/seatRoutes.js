import { Router } from 'express';
import { getShowSeats, lockSeats, releaseSeats } from '../controllers/seatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router({ mergeParams: true });

router.get('/:showId/seats', getShowSeats);
router.post('/:showId/seat-locks', protect, lockSeats);
router.delete('/:showId/seat-locks', protect, releaseSeats);

export default router;
