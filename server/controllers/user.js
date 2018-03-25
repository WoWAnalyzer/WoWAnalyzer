import Express from 'express';

const router = Express.Router();

router.get('/', function(req, res) {
  if (req.user) {
    res.json(req.user);
  } else {
    res.sendStatus(401);
  }
});

export default router;
