const express = require('express');
const path = require('path');
const querystring = require('querystring');

const cache = require('./cache');

// const http = require('http');

const app = express();

const buildFolder = path.join(__dirname, '..', 'build');

app.use(express.static(buildFolder));

app.get('/', function (req, res) {
  res.sendFile(path.join(buildFolder, 'index.html'));
});
app.get('/report/:reportCode([A-Za-z0-9]+)/:playerName([^/]{2,})?/:fightId([0-9]+)?/:tab([A-Za-z0-9-]+)?', function (req, res) {
  // TODO: Manipulate OpenGraph based on cached report info
  // TODO: Change fightId to be fight name now that it's unique with wipe numbers
  res.sendFile(path.join(buildFolder, 'index.html'));
});
app.get('/api/v1/*', function (req, res) {
  // https:///v1/report/events/

  const requestUrl = `${req.params[0]}?${querystring.stringify(req.query)}`;
  let result = cache.get(requestUrl);
  if (!result) {
    // TODO: If not exist, fetch from WCL, then store in cache automatically purging oldest entry should memory be an issue
    const query = Object.assign({}, req.query, {
      api_key: '97c84db1a100b32a6d5abb763711244e',
    });

    result = null;
    // TODO: Cache must be in JS format since I want to be able to read it server-side.
    cache.set(requestUrl, result);
  }

  res.send(result);

  // TODO: Handle fights list cache busting smartly (ignore _ when writing to cache so that _-less requests get the latest version)
});

app.listen(3000);
console.log('Listening to port 3000');
