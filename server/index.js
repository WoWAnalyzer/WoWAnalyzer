import compression from 'compression';
import express from 'express';
import path from 'path';
import fs from 'fs';
import Raven from 'raven';

import api from './api';
import status from './status';

if (process.env.NODE_ENV === 'production') {
  Raven.config('https://f9b55775efbe4c0ab9a0d23236123364:99a7618f90104600b67e64e05106c535@sentry.io/242066', {
    captureUnhandledRejections: true,
  }).install();
}

const app = express();

if (Raven.installed) {
  // The Raven request handler must be the first middleware on the app
  app.use(Raven.requestHandler());
  // The error handler must be before any other error middleware
  app.use(Raven.errorHandler());
}

app.use(compression());

// Any files that exist can be accessed directly.
// If the server has been compiled, the path will be different.
const buildFolder = path.basename(__dirname) === 'build' ? path.join(__dirname, '..', '..', 'build') : path.join(__dirname, '..', 'build');
app.use(express.static(buildFolder));

// Load the index file into memory so we don't have to access it all the time
const index = fs.readFileSync(path.join(buildFolder, 'index.html'), 'utf8');

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

app.get('/', (req, res) => {
  res.sendFile(path.join(buildFolder, 'index.html'));
});
app.get('/news/:article', (req, res) => {
  res.send(index);
});
app.get('/report/:reportCode([A-Za-z0-9]+)/:fightId([0-9]+)?:fightName(-[^/]+)?/:playerId([0-9]+)?:playerName(-[^/]{2,})?/:tab([A-Za-z0-9-]+)?', (req, res) => {
  let response = index;
  if (req.params.fightName) {
    const fightName = decodeURI(req.params.fightName.substr(1).replace(/\+/g, ' '));
    const playerName = req.params.playerName && decodeURI(req.params.playerName);

    let title = '';
    if (playerName) {
      title = `${fightName} by ${playerName}`;
    } else {
      title = fightName;
    }

    // This is a bit hacky, better solution welcome
    response = response
      .replace('property="og:title" content="WoWAnalyzer"', `property="og:title" content="WoWAnalyzer: ${escapeHtml(title)}"`)
      .replace('<title>WoWAnalyzer</title>', `<title>WoWAnalyzer: ${escapeHtml(title)}</title>`);
  }

  res.send(response);
});
app.get('/api/v1/*', api);
app.get('/api/status', status);

app.listen(3000);
console.log('Listening to port 3000');
