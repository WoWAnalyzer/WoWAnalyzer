import Express from 'express';

const router = Express.Router();

router.get('/', function(req, res) {
  if (req.user) {
    const user = req.user;

    res.json({
      name: user.name,
      avatar: user.avatar,
      premium: user.patreon && user.patreon.pledgeAmount >= 100/*TODO: || user.github*/,
    });
  } else {
    res.sendStatus(401);
  }
});

export default router;
