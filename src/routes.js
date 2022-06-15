const express = require('express');
const router = express.Router();

const AdsController = require('./controllers/AdsController');
const AuthController = require('./controllers/AuthController');
const UserController = require('./controllers/UserController');

router.get('/ping', (req, res) => {
    res.json({pong: true});
});

router.post('/user/signin', AuthController.signIn);
router.post('/user/signup', AuthController.signUp);

router.get('/states', UserController.getStates);
router.get('/user/me', UserController.getInfo);
router.put('/user/me', UserController.editAction);

router.get('/categories', AdsController.getCategories);
router.post('/ad/add', AdsController.addAction);
router.get('/ad/list', AdsController.getList);
router.get('/ad/item', AdsController.getItem);
router.put('/ad/:id', AdsController.editAction);

module.exports = router;