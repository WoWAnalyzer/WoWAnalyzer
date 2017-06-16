const querystring = require('querystring');
const https = require('https');

const cache = require('./cache');

module.exports = function (req, res) {
  // This allows users to cache bust, this is useful when live logging. It stores the result in the regular (uncachebusted) spot so that future requests for the regular request are also updated.
  let cacheBust = false;
  if (req.query._) {
    console.log('Cache busting...');
    cacheBust = true;
    delete req.query._;
  }

  // Set header already so that all request, good or bad, have it
  res.setHeader('Access-Control-Allow-Origin', '*');

  const requestUrl = `${req.params[0]}?${querystring.stringify(req.query)}`;
  console.time('request');
  const jsonString = !cacheBust && cache.get(requestUrl);
  if (jsonString) {
    console.timeEnd('request');
    console.log('\x1b[32m%s\x1b[0m', 'cache hit');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.send(jsonString);
  } else {
    console.log('\x1b[31m%s\x1b[0m', 'cache miss');
    const query = Object.assign({}, req.query, {
      // Allow users to provide their own API key. This is required during development so that other developers don't lock out the production in case they mess something up.
      api_key: req.query.api_key || '97c84db1a100b32a6d5abb763711244e',
    });

    const options = {
      host: 'www.warcraftlogs.com',
      path: `/v1/${req.params[0]}?${querystring.stringify(query)}`,
      headers: {
        'User-Agent': 'WoWAnalyzer.com API',
      },
    };
    console.log('GET', options.path);
    console.time('wcl');
    https
      .get(options, (wclResponse) => {
        let jsonString = '';
        wclResponse.on('data', chunk => { jsonString += chunk; });
        wclResponse.on('end', () => {
          console.timeEnd('wcl');

          if (wclResponse.statusCode === 200) {
            console.log('Request success!');
            cache.set(requestUrl, jsonString, 7200);
          } else {
            console.error('Status:', wclResponse.statusCode);
          }

          // Clone WCL response
          res.setHeader('Content-Type', wclResponse.headers['content-type']);
          res.status(wclResponse.statusCode);
          res.send(jsonString);

          console.timeEnd('request');
        });
      })
      .on('error', (err) => {
        console.error('Error:', err);
        res.sendStatus(500);
      });
  }
};
