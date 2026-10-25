import mongoose from 'mongoose';
import { Movie } from '../models/Movie.js';
import { Review } from '../models/Review.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sampleMovies } from '../utils/sampleData.js';

// @desc    Get all movies with search, filters, sorting, and pagination
// @route   GET /api/movies
// @access  Public
export const getMovies = asyncHandler(async (req, res) => {
  const {
    search,
    genre,
    language,
    status,
    sortBy = 'releaseDate',
    sortOrder = 'desc',
    page = 1,
    limit = 12
  } = req.query;

  const isDBConnected = mongoose.connection.readyState === 1;

  if (!isDBConnected) {
    // Graceful offline/in-memory fallback using sampleMovies
    let results = [...sampleMovies];

    if (search) {
      results = results.filter((m) =>
        m.title.toLowerCase().includes(search.toLowerCase()) ||
        m.genre.some((g) => g.toLowerCase().includes(search.toLowerCase()))
      );
    }

    if (genre) {
      results = results.filter((m) =>
        m.genre.some((g) => g.toLowerCase() === genre.toLowerCase())
      );
    }

    if (language) {
      results = results.filter((m) => m.language.toLowerCase() === language.toLowerCase());
    }

    if (status) {
      results = results.filter((m) => m.movieStatus === status);
    }

    if (sortBy === 'rating') {
      results.sort((a, b) => (sortOrder === 'asc' ? a.averageRating - b.averageRating : b.averageRating - a.averageRating));
    } else if (sortBy === 'popularity') {
      results.sort((a, b) => (sortOrder === 'asc' ? a.totalRatings - b.totalRatings : b.totalRatings - a.totalRatings));
    } else if (sortBy === 'title') {
      results.sort((a, b) => (sortOrder === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)));
    } else {
      results.sort((a, b) => (sortOrder === 'asc' ? new Date(a.releaseDate) - new Date(b.releaseDate) : new Date(b.releaseDate) - new Date(a.releaseDate)));
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10)));
    const start = (pageNum - 1) * limitNum;
    const paginated = results.slice(start, start + limitNum);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          movies: paginated,
          pagination: {
            totalMovies: results.length,
            totalPages: Math.ceil(results.length / limitNum),
            currentPage: pageNum,
            limit: limitNum,
            hasNextPage: pageNum < Math.ceil(results.length / limitNum),
            hasPrevPage: pageNum > 1
          }
        },
        'Movies fetched successfully'
      )
    );
  }

  // Live MongoDB Query
  const query = {};

  if (search) {
    query.title = { $regex: search, $options: 'i' };
  }

  if (genre) {
    query.genre = { $in: [new RegExp(genre, 'i')] };
  }

  if (language) {
    query.language = { $regex: new RegExp(`^${language}$`, 'i') };
  }

  if (status) {
    query.movieStatus = status;
  }

  const sort = {};
  if (sortBy === 'rating') {
    sort.averageRating = sortOrder === 'asc' ? 1 : -1;
  } else if (sortBy === 'popularity') {
    sort.totalRatings = sortOrder === 'asc' ? 1 : -1;
  } else if (sortBy === 'title') {
    sort.title = sortOrder === 'asc' ? 1 : -1;
  } else {
    sort.releaseDate = sortOrder === 'asc' ? 1 : -1;
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [movies, totalMovies] = await Promise.all([
    Movie.find(query).sort(sort).skip(skip).limit(limitNum).lean(),
    Movie.countDocuments(query)
  ]);

  const totalPages = Math.ceil(totalMovies / limitNum);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        movies,
        pagination: {
          totalMovies,
          totalPages,
          currentPage: pageNum,
          limit: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      },
      'Movies fetched successfully'
    )
  );
});

// @desc    Get single movie by ID with reviews
// @route   GET /api/movies/:id
// @access  Public
export const getMovieById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (mongoose.connection.readyState !== 1) {
    const movie = sampleMovies.find((m) => m._id === id || m.title.toLowerCase().includes(id.toLowerCase()));
    if (!movie) {
      throw new ApiError(404, `Movie with ID ${id} not found`);
    }
    return res.status(200).json(
      new ApiResponse(200, { ...movie, reviews: [] }, 'Movie details fetched successfully')
    );
  }

  const movie = await Movie.findById(id).lean();
  if (!movie) {
    throw new ApiError(404, `Movie with ID ${id} not found`);
  }

  const reviews = await Review.find({ movieId: id, moderationStatus: 'approved' })
    .populate('userId', 'name avatar')
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  return res.status(200).json(
    new ApiResponse(200, { ...movie, reviews }, 'Movie details fetched successfully')
  );
});

// @desc    Create a new movie
// @route   POST /api/movies
// @access  Admin
export const createMovie = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    genre,
    language,
    duration,
    releaseDate,
    cast,
    director,
    posterUrl,
    backdropUrl,
    trailerUrl,
    ageRating = 'UA',
    movieStatus = 'now_showing'
  } = req.body;

  if (!title || !description || !genre || !language || !duration || !releaseDate) {
    throw new ApiError(400, 'Title, description, genre, language, duration, and release date are required fields.');
  }

  const isDBConnected = mongoose.connection.readyState === 1;

  if (!isDBConnected) {
    const formattedMovie = {
      _id: new mongoose.Types.ObjectId().toString(),
      title: title.trim(),
      description: description.trim(),
      genre: Array.isArray(genre) ? genre : genre.split(',').map((g) => g.trim()).filter(Boolean),
      language: language.trim(),
      duration: Number(duration),
      releaseDate: new Date(releaseDate).toISOString(),
      cast: Array.isArray(cast) ? cast : (cast ? cast.split(',').map((c) => c.trim()).filter(Boolean) : []),
      director: director?.trim() || '',
      posterUrl: posterUrl?.trim() || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80',
      backdropUrl: backdropUrl?.trim() || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
      trailerUrl: trailerUrl?.trim() || '',
      ageRating,
      averageRating: 4.5,
      totalRatings: 0,
      movieStatus,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    sampleMovies.unshift(formattedMovie);
    return res.status(201).json(new ApiResponse(201, formattedMovie, 'Movie created successfully'));
  }

  const movie = await Movie.create(req.body);
  return res.status(201).json(new ApiResponse(201, movie, 'Movie created successfully'));
});

// @desc    Update a movie
// @route   PUT /api/movies/:id
// @access  Admin
export const updateMovie = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const isDBConnected = mongoose.connection.readyState === 1;

  if (!isDBConnected) {
    const index = sampleMovies.findIndex((m) => m._id === id);
    if (index === -1) throw new ApiError(404, `Movie with ID ${id} not found`);

    sampleMovies[index] = {
      ...sampleMovies[index],
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    return res.status(200).json(new ApiResponse(200, sampleMovies[index], 'Movie updated successfully'));
  }

  const movie = await Movie.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
  if (!movie) throw new ApiError(404, `Movie with ID ${id} not found`);
  return res.status(200).json(new ApiResponse(200, movie, 'Movie updated successfully'));
});

// @desc    Delete a movie
// @route   DELETE /api/movies/:id
// @access  Admin
export const deleteMovie = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const isDBConnected = mongoose.connection.readyState === 1;

  if (!isDBConnected) {
    const index = sampleMovies.findIndex((m) => m._id === id);
    if (index === -1) throw new ApiError(404, `Movie with ID ${id} not found`);

    sampleMovies.splice(index, 1);
    return res.status(200).json(new ApiResponse(200, null, 'Movie deleted successfully'));
  }

  const movie = await Movie.findByIdAndDelete(id);
  if (!movie) throw new ApiError(404, `Movie with ID ${id} not found`);
  return res.status(200).json(new ApiResponse(200, null, 'Movie deleted successfully'));
});
