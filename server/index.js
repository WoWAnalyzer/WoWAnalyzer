const express = require('express');
const path = require('path');
const querystring = require('querystring');
const https = require('https');

const cache = require('./cache');

// const http = require('http');

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
app.get('/api/v1/*', function (req, res) {
  console.time('request');
  const requestUrl = `${req.params[0]}?${querystring.stringify(req.query)}`;
  const json = cache.get(requestUrl);
  if (json) {
    console.timeEnd('request');
    res.json(json);
  }
  if (!json) {
    const query = Object.assign({}, req.query, {
      api_key: '97c84db1a100b32a6d5abb763711244e',
    });

    const options = {
      host: 'www.warcraftlogs.com',
      path: `/v1/${req.params[0]}?${querystring.stringify(query)}`,
      headers: {
        'User-Agent': 'WoWAnalyzer.com API',
      },
    };
    console.log('GET', options.path);
    console.time('wclApi');
    https.get(options, function (wclRes) {
      let responseContent = '';
      wclRes.on('data', function (chunk) {
        responseContent += chunk;
      });
      wclRes.on('end', function () {
        if (wclRes.statusCode === 200) {
          console.timeEnd('wclApi');
          try {
            const json = JSON.parse(responseContent);
            console.log('Request success!');
            cache.set(requestUrl, json, 7200);
            console.timeEnd('request');
            res.json(json);
          } catch (e) {
            console.error('Error parsing JSON!', e);
          }
        } else {
          console.error('Status:', wclRes.statusCode);
        }
      });
    }).on('error', function (err) {
      console.error('Error:', err);
    });
  }

  // TODO: Handle fights list cache busting smartly (ignore _ when writing to cache so that _-less requests get the latest version)
});

app.listen(3000);
console.log('Listening to port 3000');
