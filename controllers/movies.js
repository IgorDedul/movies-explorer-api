const NotFoundError = require('../errors/NotFoundError');
const ValidationError = require('../errors/ValidationError');
const ForbiddenError = require('../errors/ForbiddenError');

const Movie = require('../models/movie');

// Возвращает список фильмов
const getMovies = (req, res, next) => {
  const owner = req.user._id;

  Movie.find({ owner })
    .populate('owner')
    .then((movies) => {
      res.send(movies);
    })
    .catch((err) => {
      next(err);
    });
};

// Создаёт закладку с фильмом
const createMovie = (req, res, next) => {
  const {
    country, director, duration, year, description, image,
    trailerLink, thumbnail, movieId, nameRU, nameEN,
  } = req.body;
  const owner = req.user._id;

  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    owner,
    movieId,
    nameRU,
    nameEN,
  })
    .then((movie) => movie.populate('owner'))
    .then((movie) => {
      res.send(movie);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new ValidationError('Переданы некорректные данные'));
      }

      return next(err);
    });
};

// Удаляет закладку с фильмом
const deleteMovie = (req, res, next) => {
  const { _id: movieId } = req.params;

  Movie.findById(movieId)
    .then((movie) => {
      if (!movie) {
        throw new NotFoundError('Фильм не найден');
      }

      if (movie.owner.toString() !== req.user._id) {
        throw new ForbiddenError('Удаление чужой закладки');
      }

      return Movie.findByIdAndRemove(movieId)
        .populate('owner')
        .then((myMovie) => {
          res.send(myMovie);
        });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new ValidationError('Некорректный id фильма'));
      }

      return next(err);
    });
};

module.exports = {
  getMovies,
  createMovie,
  deleteMovie,
};
