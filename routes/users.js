const router = require('express').Router();
const { getMe, updateMe } = require('../controllers/users');
const { updateMeValidator } = require('../middlewares/validator');

router.get('/users/me', getMe);
router.patch('/users/me', updateMeValidator, updateMe);

module.exports = router;
