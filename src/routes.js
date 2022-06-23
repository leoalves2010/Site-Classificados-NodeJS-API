const express = require('express');
const router = express.Router();

const AdsController = require('./controllers/AdsController');
const AuthController = require('./controllers/AuthController');
const UserController = require('./controllers/UserController');
const AuthValidator = require('./validators/AuthValidator');

const Auth = require('./middlewares/Auth');

router.get('/ping', (req, res) => {
    res.json({pong: true});
});

router.post('/user/signin', AuthValidator.signIn, AuthController.signIn);
router.post('/user/signup', AuthValidator.signUp, AuthController.signUp);

router.get('/states', UserController.getStates);
router.get('/user/me', Auth.private, UserController.getInfo);
router.put('/user/me', Auth.private, UserController.editAction);

router.get('/categories', AdsController.getCategories);
router.post('/ad/add', Auth.private, AdsController.addAction);
router.get('/ad/list', AdsController.getList);
router.get('/ad/item', AdsController.getItem);
router.put('/ad/:id', Auth.private, AdsController.editAction);

module.exports = router;