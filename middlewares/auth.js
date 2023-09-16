const jwt = require('jsonwebtoken');

const UnauthorizedError = require('../errors/UnauthorizedError');

const secretKey = 'dev-secret-key';

const { NODE_ENV, JWT_SECRET = 'secretKey' } = process.env;

module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith('Bearer')) {
    return next(new UnauthorizedError('Необходима авторизация'));
  }

  const token = authorization.split(' ')[1];

  let payload;

  try {
    payload = jwt.verify(token, (NODE_ENV === 'production') ? JWT_SECRET : secretKey);
  } catch (err) {
    return next(new UnauthorizedError('Необходима авторизация'));
  }

  req.user = payload;

  return next();
};
