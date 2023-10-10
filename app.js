require('dotenv').config();

const express = require('express');
const router = require('express').Router();
const mongoose = require('mongoose');

const bodyParser = require('body-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');

const { errors } = require('celebrate');
const { login, createUser } = require('./controllers/users');
const { loginValidator, createUserValidator } = require('./middlewares/validator');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const auth = require('./middlewares/auth');
const cors = require('./middlewares/cors');
const errorHandler = require('./middlewares/errorHandler');
const notFoundHandler = require('./middlewares/notFoundHandler');
//const NotFoundError = require('./errors/NotFoundError');

const movieRouter = require('./routes/movies');
const userRouter = require('./routes/users');

const app = express();

const { PORT = 3000, DATABASE_URL = 'mongodb://127.0.0.1:27017/bitfilmsdb' } = process.env;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  // Ограничевает обращения до 100 за 15 минут.
});

app.use(helmet());
app.use(requestLogger);
app.use(limiter);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors);

mongoose.connect(DATABASE_URL)
  .then(() => {
    console.log(`App is connected to database on URL ${DATABASE_URL}`);
  })
  .catch((err) => {
    console.log(`Error connecting to database on URL ${DATABASE_URL}`);
    console.error(err);
  });

app.get('/', (req, res) => res.send('Сервер в работе!'));

app.post('/signin', loginValidator, login);
app.post('/signup', createUserValidator, createUser);

app.use(auth);
app.use(userRouter);
app.use(movieRouter);

app.use('*', notFoundHandler);

//app.use((req, res, next) => next(new NotFoundError('Страницы по запрошенному URL не существует')));
app.use(errorLogger);
app.use(errors());
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
