import Express from 'express';
import fs from 'fs';
import path from 'path';

const router = Express.Router();

router.use('/api', require('./api').default);
router.use('/discord', require('./discord').default);

// Handling for the SPA:

// Any files that exist can be accessed directly.
// If the server has been compiled, the path will be different.
const appDirectory = fs.realpathSync(process.cwd());
const buildFolder = path.basename(appDirectory) === 'build' ? path.join(appDirectory, '..', '..', 'build') : path.join(appDirectory, '..', 'build');
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
// Load the index file into memory so we don't have to access it all the time
const index = fs.readFileSync(path.join(buildFolder, 'index.html'), 'utf8');
router.get(['/', '/news/:article', '/contributor/:contributor'], (req, res) => {
  res.send(index);
});
router.get('/report/:reportCode([A-Za-z0-9]+)/:fightId([0-9]+)?:fightName(-[^/]+)?/:playerId([0-9]+-)?:playerName([^/]{2,})?/:tab([A-Za-z0-9-]+)?', (req, res) => {
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

export default router;
