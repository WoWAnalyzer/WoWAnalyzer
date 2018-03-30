import Express from 'express';

const router = Express.Router();

router.use('/patreon', require('./patreon').default);

export default router;
