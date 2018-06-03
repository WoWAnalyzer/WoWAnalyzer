import compression from 'compression';
import Express from 'express';
import path from 'path';
import fs from 'fs';
import Raven from 'raven';
import bodyParser from 'body-parser';
import Passport from 'passport';

import models from 'models';

import loadDotEnv from './config/env';

const User = models.User;

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
const appDirectory = fs.realpathSync(process.cwd());

loadDotEnv(appDirectory);

if (process.env.RAVEN_DSN) {
  Raven.config(process.env.RAVEN_DSN, {
    captureUnhandledRejections: true,
  }).install();
}
// Any files that exist can be accessed directly.
// If the server has been compiled, the path will be different.
const buildFolder = path.basename(appDirectory) === 'build' ? path.join(appDirectory, '..', '..', 'build') : path.join(appDirectory, '..', 'build');

const app = Express();

if (Raven.installed) {
  // The Raven request handler must be the first middleware on the app
  app.use(Raven.requestHandler());
  // The error handler must be before any other error middleware
  app.use(Raven.errorHandler());
}
app.use(compression());
app.use(Express.static(buildFolder));
app.use(bodyParser.urlencoded({ extended: false }));

// region Authentication
app.use(Passport.initialize());
Passport.serializeUser(function(user, done) {
  done(null, user.id);
});
Passport.deserializeUser(async function(id, done) {
  const user = await User.findById(id);
  done(null, user);
});
// endregion

app.use(require('./controllers').default);

app.listen(process.env.PORT, () => {
  console.log(`Listening to port ${process.env.PORT}`);
});
