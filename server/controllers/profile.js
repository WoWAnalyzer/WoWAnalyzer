import Express from 'express';

import requireAuthenticated from 'helpers/requireAuthenticated';

const router = Express.Router();

router.get('/', requireAuthenticated, function(req, res) {
  const user = req.user;

  res.json({
    name: user.name,
    avatar: user.avatar,
    premium: (user.patreon && user.patreon.pledgeAmount >= 100/*TODO: || user.github*/) || false,
  });
});

export default router;
