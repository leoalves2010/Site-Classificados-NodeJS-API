const express = require('express');
const router = express.Router();

const AdsController = require('./controllers/AdsController');
const AuthController = require('./controllers/AuthController');
const UserController = require('./controllers/UserController');

const AuthValidator = require('./validators/AuthValidator');
const UserValidator = require('./validators/UserValidator');
const AdValidator = require('./validators/AdValidator');

const Auth = require('./middlewares/Auth');

router.get('/ping', (req, res) => {
    res.json({pong: true});
});

router.post('/user/signin', AuthValidator.signIn, AuthController.signIn); //ok
router.post('/user/signup', AuthValidator.signUp, AuthController.signUp); //ok

router.get('/states', UserController.getStates); //ok
router.get('/user/me', Auth.private, UserController.getInfo); //ok
router.put('/user/me', UserValidator.editAction, Auth.private, UserController.editAction); //ok

router.get('/categories', AdsController.getCategories); //ok
router.post('/ad/add', AdValidator.addActions, Auth.private, AdsController.addAction); //ok
router.get('/ad/list', AdsController.getList); //ok
router.get('/ad/:id', AdsController.getItem); //ok
router.put('/ad/:id', Auth.private, AdsController.editAction);

module.exports = router;