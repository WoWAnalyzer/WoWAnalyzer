import Express from 'express';

const router = Express.Router();

if (process.env.UNSAFE_ACCESS_CONTROL_ALLOW_ALL) {
  // When developing it might be nice to run the front-end webpack dev server on a different port from the back-end server and route API calls to the local server instead of production. The .env.development enables this automatically. It's unset in production.
  router.all('/', function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', req.headers['origin'] || '*');
    res.setHeader('Access-Control-Allow-Credentials', true);

    next();
  });
}
router.get('/', async function (req, res) {
  req.logout();
  res.json(true);
});

export default router;
