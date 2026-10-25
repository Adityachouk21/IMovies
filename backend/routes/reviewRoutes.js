import { Router } from 'express';
import { deleteReview } from '../controllers/reviewController.js';

const router = Router();

router.route('/:id')
  .delete(deleteReview);

export default router;
