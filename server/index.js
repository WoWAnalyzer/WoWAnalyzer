const express = require('express');
const path = require('path');
const app = express();

const buildFolder = path.join(__dirname, '..', 'build');

app.use(express.static(buildFolder));

app.get('/', function (req, res) {
  res.sendFile(path.join(buildFolder, 'index.html'));
});

app.listen(3000);
console.log('Listening to port 3000');
