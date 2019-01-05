import Express from 'express';
import fs from 'fs';
import path from 'path';

const router = Express.Router();

router.use('/api', require('./api').default);
router.use('/i', require('./api').default);
router.use('/login', require('./login').default);
router.use('/logout', require('./logout').default);
router.use('/user', require('./user').default);
router.use('/discord', require('./discord').default);

// Handling for the SPA:

// source: https://stackoverflow.com/a/20429914/684353
// Putting these headers here since I'm getting desperate. A lot of 404 errors all the time,
function nocache(req, res, next) {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
  next();
}
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Any files that exist can be accessed directly.
// If the server has been compiled, the path will be different.
const appDirectory = fs.realpathSync(process.cwd());
const buildFolder = path.basename(appDirectory) === 'server' ? path.join(appDirectory, '..', 'build') : path.join(appDirectory, 'build');

// Load the index file into memory so we don't have to access it all the time
const index = fs.readFileSync(path.join(buildFolder, 'index.html'), 'utf8');
router.get(['/', '/premium', '/news/:article', '/contributor/:contributor', '/character/:region/:realm/:player'], nocache, (req, res) => {
  res.send(index);
});
router.get([
  '/report/:reportCode([A-Za-z0-9]+)/:fightId([0-9]+)?:fightName(-[^/]+)?/:playerId([0-9]+)?:playerName(-[^/]{2,})?/:tab([A-Za-z0-9-]+)?',
  // This is the same route as above but without `playerId` since this breaks links without player id and with special characters such as: https://wowanalyzer.com/report/Y8GbgcB6d9ptX3K7/7-Mythic+Demonic+Inquisition+-+Wipe+1+(5:15)/Rootzô
  '/report/:reportCode([A-Za-z0-9]+)/:fightId([0-9]+)?:fightName(-[^/]+)?/:playerName([^/]{2,})?/:tab([A-Za-z0-9-]+)?',
], nocache, (req, res) => {
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

// Pass all remaining requests through to the static files. This must be after the routes so they take precendence. This is especially important for the root; /; index.html.
router.use(Express.static(buildFolder));

export default router;
