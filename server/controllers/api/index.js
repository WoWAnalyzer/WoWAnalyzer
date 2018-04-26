import Express from 'express';

const router = Express.Router();

router.use('/v1', require('./v1').default);
router.use('/status', require('./status').default);

export default router;
