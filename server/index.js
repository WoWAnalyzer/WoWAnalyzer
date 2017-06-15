const express = require('express');
const path = require('path');
const app = express();

const buildFolder = path.join(__dirname, '..', 'build');

app.use(express.static(buildFolder));

app.get('/', function (req, res) {
  res.sendFile(path.join(buildFolder, 'index.html'));
});
app.get('/report/:reportCode([A-Za-z0-9]+)/:fightId([0-9]+)?/:playerName([^/]{2,})?/:tab([A-Za-z0-9-]+)?', function (req, res) {
  // TODO: Manipulate OpenGraph based on cached report info
  // TODO: Change fightId to be fight name now that it's unique with wipe numbers
  res.sendFile(path.join(buildFolder, 'index.html'));
});

app.listen(3000);
console.log('Listening to port 3000');
