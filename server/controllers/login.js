import Express from 'express';
import Passport from 'passport';

const router = Express.Router();

router.get('/', Passport.authenticate('patreon', { scope: 'users' }));
router.get('/callback', Passport.authenticate('patreon', { failureRedirect: '/login' }), function (req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.send(JSON.stringify(req.user));
});

export default router;
