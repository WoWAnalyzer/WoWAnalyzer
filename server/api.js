'use strict';

const querystring = require('querystring');
const https = require('https');
const zlib = require('zlib');
const Agent = require('agentkeepalive').HttpsAgent;

const models = require('./models');
const WclApiResponse = models.WclApiResponse;

function getCurrentMemoryUsage() {
  const memoryUsage = process.memoryUsage();
  return memoryUsage.rss;
}

const keepAliveAgent = new Agent({
});

const WCL_MAINTENANCE_STRING = 'Warcraft Logs is down for maintenance';

class ApiController {
  static handle(req, res) {
    const handler = new ApiRequestHandler(req, res);

    // This allows users to cache bust, this is useful when live logging. It stores the result in the regular (uncachebusted) spot so that future requests for the regular request are also updated.
    if (req.query._) {
      console.log('Cache busting...');
      handler.cacheBust = true;
      delete req.query._;
    }

    // Allow users to provide their own API key. This is required during development so that other developers don't lock out the production in case they mess something up.
    if (req.query.api_key) {
      handler.apiKey = req.query.api_key;
      delete req.query.api_key; // don't use a separate cache for different API keys
    }

    // Set header already so that all request, good or bad, have it
    res.setHeader('Access-Control-Allow-Origin', '*');

    handler.handle();
  }
}

class ApiRequestHandler {
  req = null;
  res = null;

  cacheBust = false;
  apiKey = process.env.WCL_API_KEY;

  constructor(req, res) {
    this.req = req;
    this.res = res;
  }

  handle() {
    // const wclApiResponse = await WclApiResponse.findById(this.requestUrl);
    // console.log(wclApiResponse);
    WclApiResponse.findById(this.requestUrl).then(wclApiResponse => {
      const jsonString = !this.cacheBust && wclApiResponse ? wclApiResponse.content : null;
      if (jsonString) {
        this.cacheHit(jsonString);
      } else {
        console.log('cache MISS', this.requestUrl);
        const query = Object.assign({}, this.req.query, { api_key: this.apiKey });

        const options = {
          host: 'www.warcraftlogs.com',
          path: `/v1/${this.req.params[0]}?${querystring.stringify(query)}`,
          headers: {
            'User-Agent': 'WoWAnalyzer.com API',
            'Accept-Encoding': 'gzip', // using gzip is 80% quicker
          },
          agent: keepAliveAgent,
        };
        console.log('GET', options.path);
        const wclStart = Date.now();
        https
          .get(options, wclResponse => {
            if (wclResponse.statusCode >= 500 && wclResponse.statusCode < 600) {
              const msg = 'WCL Error (' + wclResponse.statusCode + '): ' + wclResponse.statusMessage;
              console.error(msg);
              this.res.status(500).send(msg);
              return;
            }

            const gunzip = zlib.createGunzip();
            wclResponse.pipe(gunzip);

            let jsonString = '';
            gunzip
              .on('data', chunk => {
                jsonString += chunk.toString();
              })
              .on('end', () => {
                if (wclResponse.statusCode === 200) {
                  if (jsonString.indexOf(WCL_MAINTENANCE_STRING) !== -1) {
                    console.error(WCL_MAINTENANCE_STRING);
                    this.res.status(500).send(WCL_MAINTENANCE_STRING);
                    return;
                  }

                  WclApiResponse.create({
                    url: requestUrl,
                    content: jsonString,
                    wclResponseTime: Date.now() - wclStart,
                  });
                } else {
                  console.error('Error status:', wclResponse.statusCode);
                }

                // Clone WCL response
                this.res.setHeader('Content-Type', wclResponse.headers['content-type']);
                this.res.status(wclResponse.statusCode);
                this.res.send(jsonString);
                console.log('Finished (memory:', Math.ceil(getCurrentMemoryUsage() / 1024 / 1024), 'MB', 'wcl:', Date.now() - wclStart, 'ms', ')');
              })
              .on('error', (e) => {
                console.error('zlib error: ', e);
                this.res.status(500).send();
              });
          })
          .on('error', (err) => {
            console.error('Error:', err);
            this.res.sendStatus(500);
          });
      }
    });
  }

  get requestUrl() {
    return `${this.req.params[0]}?${querystring.stringify(this.req.query)}`;
  }
  cacheHit(jsonString) {
    console.log('cache HIT', this.requestUrl);
    this.sendJson(jsonString);
  }

  sendJson(json) {
    this.res.setHeader('Content-Type', 'application/json; charset=utf-8');
    this.res.send(json);
  }
}

module.exports = ApiController.handle;
