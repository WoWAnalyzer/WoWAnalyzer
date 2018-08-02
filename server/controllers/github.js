import Express from 'express';

const router = Express.Router();

router.get('/', function (req, res) {
  // Since this path will usually only be used once per visitor there's no need to use a permanent redirect, and this allows us to fix the url should it ever break.
  res.status(307).redirect('https://github.com/WoWAnalyzer/WoWAnalyzer');
});

export default router;
