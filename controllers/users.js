const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const ConflictError = require('../errors/ConflictError');
const NotFoundError = require('../errors/NotFoundError');
const ValidationError = require('../errors/ValidationError');
const UnauthorizedError = require('../errors/UnauthorizedError');

const User = require('../models/user');

const secretKey = 'dev-secret-key';

const { NODE_ENV, JWT_SECRET = 'secretKey' } = process.env;

//  Создаёт пользователя
const createUser = (req, res, next) => {
  const { name, email, password } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => User.create({ name, email, password: hash }))
    .then((user) => {
      res.send({
        _id: user._id,
        name: user.name,
        email: user.email,
      });
    })
    .catch((err) => {
      if (err.code === 11000) {
        return next(new ConflictError('Такой пользователь уже существует'));
      }

      if (err.name === 'ValidationError') {
        return next(new ValidationError('Переданы некорректные данные'));
      }

      return next(err);
    });
};

// Аунтификация
const login = (req, res, next) => {
  const { email, password } = req.body;

  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        throw new UnauthorizedError('Такого пользователя не существует');
      }

      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            throw new UnauthorizedError('Неправильные логин или пароль');
          }

          const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : secretKey, { expiresIn: '7d' });

          res.send({ token });
        });
    })
    .catch((err) => {
      next(err);
    });
};

// Получение информации о пользователе
const getMe = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь не найден');
      }

      return res.send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new ValidationError('Некорректный id пользователя'));
      }

      return next(err);
    });
};

// Обновление профиля
const updateMe = (req, res, next) => {
  const { name, email } = req.body;

  User.findByIdAndUpdate(
    req.user._id,
    { name, email },
    { new: true, runValidators: true },
  )
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь не найден');
      }

      return res.status(200).send({ data: user });
    })
    .catch((err) => {
      if (err.code === 11000) {
        return next(new ConflictError('Такой пользователь уже существует'));
      }

      if (err.name === 'ValidationError') {
        return next(new ValidationError('Переданы некорректные данные в метод обновления профиля пользователя'));
      }

      return next(err);
    });
};

module.exports = {
  createUser,
  login,
  getMe,
  updateMe,
};
