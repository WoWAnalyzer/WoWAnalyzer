import Express from 'express';

import status from '../status';
import api from '../api';

const router = Express.Router();

router.get('/v1/*', api);
router.get('/status', status);

export default router;
