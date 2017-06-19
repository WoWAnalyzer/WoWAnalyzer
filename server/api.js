const querystring = require('querystring');
const https = require('https');
const zlib = require('zlib');
const Agent = require('agentkeepalive').HttpsAgent;

const cache = require('./cache');

function getCurrentMemoryUsage() {
  const memoryUsage = process.memoryUsage();
  return memoryUsage.rss;
}

const keepAliveAgent = new Agent({
});

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
  const jsonString = !cacheBust && cache.get(requestUrl);
  if (jsonString) {
    console.log('++++++cache hit', requestUrl);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.send(jsonString);
  } else {
    console.log('------cache miss', requestUrl);
    const query = Object.assign({}, req.query, {
      // Allow users to provide their own API key. This is required during development so that other developers don't lock out the production in case they mess something up.
      api_key: req.query.api_key || '97c84db1a100b32a6d5abb763711244e',
    });

    const options = {
      host: 'www.warcraftlogs.com',
      path: `/v1/${req.params[0]}?${querystring.stringify(query)}`,
      headers: {
        'User-Agent': 'WoWAnalyzer.com API',
        'Accept-Encoding': 'gzip', // using gzip is 80% quicker
      },
      agent: keepAliveAgent,
    };
    console.log('GET', options.path);
    const wclStart = Date.now();
    https
      .get(options, (wclResponse) => {
        const gunzip = zlib.createGunzip();
        wclResponse.pipe(gunzip);

        let jsonString = '';
        gunzip
          .on('data', chunk => { jsonString += chunk.toString(); })
          .on('end', () => {
            if (wclResponse.statusCode === 200) {
              cache.set(requestUrl, jsonString);
            } else {
              console.error('Error status:', wclResponse.statusCode);
            }

            // Clone WCL response
            res.setHeader('Content-Type', wclResponse.headers['content-type']);
            res.status(wclResponse.statusCode);
            res.send(jsonString);
            console.log('Finished (memory:', Math.ceil(getCurrentMemoryUsage() / 1024 / 1024), 'MB', 'wcl:', Date.now() - wclStart, 'ms', ')');
          })
          .on('error', (e) => {
            throw e;
          });
      })
      .on('error', (err) => {
        console.error('Error:', err);
        res.sendStatus(500);
      });
  }
};
