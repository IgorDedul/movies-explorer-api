require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');

const bodyParser = require('body-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');

const { errors } = require('celebrate');
const { login, createUser } = require('./controllers/users');
const { validateLogin, validateCreateUser } = require('./middlewares/validation');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const auth = require('./middlewares/auth');
const cors = require('./middlewares/cors');
const errorHandler = require('./middlewares/errorHandler');
const NotFoundError = require('./errors/NotFoundError');

const app = express();

const { PORT = 3000, DATABASE_URL = 'mongodb://127.0.0.1:27017/mestodb' } = process.env;

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

mongoose.connect(DATABASE_URL);

app.get('/', (req, res) => res.send('Сервер в работе'));

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

app.post('/signin', validateLogin, login);
app.post('/signup', validateCreateUser, createUser);

app.use(auth);
app.use(require('./routes/users'));
app.use(require('./routes/cards'));

app.use((req, res, next) => next(new NotFoundError('Страницы по запрошенному URL не существует')));
app.use(errorLogger);
app.use(errors());
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
