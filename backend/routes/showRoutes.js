import { Router } from 'express';
import {
  getShows,
  getShowById,
  createShow,
  updateShow,
  deleteShow
} from '../controllers/showController.js';

const router = Router();

router.route('/')
  .get(getShows)
  .post(createShow);

router.route('/:id')
  .get(getShowById)
  .put(updateShow)
  .delete(deleteShow);

export default router;
