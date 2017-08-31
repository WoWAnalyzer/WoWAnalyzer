const compression = require('compression');
const express = require('express');
const path = require('path');
const fs = require('fs');
const Sequelize = require('sequelize');

const api = require('./api');

const sequelize = new Sequelize('wowanalyzer', 'root', 'my-secret-pw', {
  host: 'database',
  dialect: 'mysql',

  pool: {
    max: 5,
    min: 0,
    idle: 10000,
  },
});
sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

const app = express();
app.use(compression());
// Any files that exist can be accessed directly
const buildFolder = path.join(__dirname, '..', 'build');
app.use(express.static(buildFolder));

// Load the index file into memory so we don't have to access it all the time
const index = fs.readFileSync(path.join(buildFolder, 'index.html'), 'utf8');

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

app.get('/', function (req, res) {
  res.sendFile(path.join(buildFolder, 'index.html'));
});
app.get('/report/:reportCode([A-Za-z0-9]+)/:fightId([0-9]+)?:fightName(-[^/]+)?/:playerName([^/]{2,})?/:tab([A-Za-z0-9-]+)?', function (req, res) {
  let response = index;
  if (req.params.fightName) {
    const fightName = decodeURI(req.params.fightName.substr(1).replace(/\+/g, ' '));
    const playerName = decodeURI(req.params.playerName);

    let title = '';
    if (playerName) {
      title = `${fightName} by ${playerName}`;
    } else {
      title = fightName;
    }

    // This is a bit hacky, better solution welcome
    response = response
      .replace('property="og:title" content="WoW Analyzer"', `property="og:title" content="WoW Analyzer: ${escapeHtml(title)}"`)
      .replace('<title>WoW Analyzer</title>', `<title>WoW Analyzer: ${escapeHtml(title)}</title>`);
  }

  res.send(response);
});
app.get('/api/v1/*', api);

app.listen(3000);
console.log('Listening to port 3000');
