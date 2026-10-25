import { Router } from 'express';
import {
  getMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie
} from '../controllers/movieController.js';
import { getMovieReviews, addReview } from '../controllers/reviewController.js';

const router = Router();

// Movie collection routes
router.route('/')
  .get(getMovies)
  .post(createMovie);

// Single movie routes
router.route('/:id')
  .get(getMovieById)
  .put(updateMovie)
  .delete(deleteMovie);

// Nested reviews routes for movie
router.route('/:movieId/reviews')
  .get(getMovieReviews)
  .post(addReview);

export default router;
