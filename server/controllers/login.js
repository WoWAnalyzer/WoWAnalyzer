import Express from 'express';
import Passport from 'passport';
import { Strategy as PatreonStrategy } from 'passport-patreon/lib/passport-patreon/index';

const router = Express.Router();

router.use(Passport.initialize());
router.use(Passport.session());
Passport.use(new PatreonStrategy({
    clientID: process.env.PATREON_CLIENT_ID,
    clientSecret: process.env.PATREON_CLIENT_SECRET,
    callbackURL: process.env.PATREON_CALLBACK_URL,
    scope: 'users',
  },
  function(accessToken, refreshToken, profile, done) {
    console.log(accessToken, refreshToken, profile);
    done(null, profile);
  }
));
Passport.serializeUser(function(user, done) {
  done(null, user);
});
Passport.deserializeUser(function(user, done) {
  done(null, user);
});

router.get('/', Passport.authenticate('patreon', { scope: 'users' }));
router.get('/callback', Passport.authenticate('patreon', { failureRedirect: '/login' }), function (req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.send(JSON.stringify(req.user));
});

export default router;
