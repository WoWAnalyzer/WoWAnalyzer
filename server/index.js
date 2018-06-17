import Express from 'express';
import compression from 'compression';
import path from 'path';
import fs from 'fs';
import BodyParser from 'body-parser';

import loadDotEnv from './config/env';
import configureRaven from './configureRaven';
import configureSession from './configureSession';
import configurePassport from './configurePassport';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
const appDirectory = fs.realpathSync(process.cwd());

loadDotEnv(appDirectory);

// Any files that exist can be accessed directly.
// If the server has been compiled, the path will be different.
const buildFolder = path.basename(appDirectory) === 'build' ? path.join(appDirectory, '..', '..', 'build') : path.join(appDirectory, '..', 'build');

const app = Express();
configureRaven(app);
app.use(compression());
app.use(Express.static(buildFolder));
app.use(BodyParser.urlencoded({ extended: false }));
configureSession(app);
configurePassport(app);
app.use(require('./controllers').default);
app.listen(process.env.PORT, () => {
  console.log(`Listening to port ${process.env.PORT}`);
});
