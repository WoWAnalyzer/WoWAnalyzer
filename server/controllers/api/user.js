import Express from 'express';

import requireAuthenticated from 'helpers/requireAuthenticated';

const router = Express.Router();

router.get('/', requireAuthenticated, function(req, res) {
  const user = req.user;

  let premium = false;
  if (user.patreon && user.patreon.pledgeAmount >= 100) {
    premium = true;
  }
  if (user.github && user.github.lastCommitDate) {
    const lastCommitDate = Date.parse(user.github.lastCommitDate);
    const now = Date.now();
    const secondsSinceLastCommit = (now - lastCommitDate) / 1000;
    const secondsPerMonth = 3600 * 24 * 30;
    premium = secondsSinceLastCommit < secondsPerMonth;
  }

  res.json({
    name: user.name,
    avatar: user.avatar,
    premium: premium,
  });
});

export default router;
