import Express from 'express';

const router = Express.Router();

router.use('/v1', require('./v1').default);

export default router;
