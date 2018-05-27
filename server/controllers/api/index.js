import Express from 'express';

const router = Express.Router();

router.use('/v1', require('./v1').default);
router.use('/login', require('./login').default);
router.use('/user', require('./user').default);

export default router;
