import Express from 'express';

const router = Express.Router();

router.use('/patreon', require('./patreon').default);
router.use('/github', require('./github').default);

export default router;
