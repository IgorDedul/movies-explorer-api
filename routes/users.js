const router = require('express').Router();
const { getMe, updateMe } = require('../controllers/users');
const { updateMeValidator } = require('../middlewares/validator');

router.get('/me', getMe);
router.patch('/me', updateMeValidator, updateMe);

module.exports = router;
