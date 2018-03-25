import Express from 'express';

const router = Express.Router();

router.get('/', function(req, res) {
  res.json(req.user);
});

export default router;
