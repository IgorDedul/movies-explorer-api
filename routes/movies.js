const router = require('express').Router();
const { getMovies, createMovie, deleteMovie } = require('../controllers/movies');
const { createMovieValidator, movieIdValidator } = require('../middlewares/validator');

router.get('/movies', getMovies);
router.post('/movies', createMovieValidator, createMovie);
router.delete('/movies/:_id', movieIdValidator, deleteMovie);

module.exports = router;
