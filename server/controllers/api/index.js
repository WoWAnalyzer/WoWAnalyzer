import Express from 'express';

const router = Express.Router();

router.use('/v1', require('./v1').default);
router.use('/character', require('./character').default);
router.use('/item', require('./item').default);
router.use('/spell', require('./spell').default);
export default router;
