import { Router } from 'express';
import {
  getTheaters,
  getTheaterById,
  createTheater,
  updateTheater,
  createScreen
} from '../controllers/theaterController.js';

const router = Router();

router.route('/')
  .get(getTheaters)
  .post(createTheater);

router.route('/:id')
  .get(getTheaterById)
  .put(updateTheater);

// Screen creation for theater
router.route('/:theaterId/screens')
  .post(createScreen);

export default router;
