import Express from 'express';
import querystring from 'querystring';
import request from 'request-promise-native';
import Sequelize from 'sequelize';
import Raven from 'raven';

import models from '../../models';
import WclApiError from '../../WclApiError';

const WclApiResponse = models.WclApiResponse;
const WCL_MAINTENANCE_STRING = 'Warcraft Logs is down for maintenance';

// This class was a bad idea and needs to be refactored out
class ApiRequestHandler {
  req = null;
  res = null;

  cacheBust = false;
  apiKey = process.env.WCL_API_KEY;

  constructor(req, res) {
    this.req = req;
    this.res = res;
  }

  async handle() {
    const cachedWclApiResponse = await WclApiResponse.findById(this.requestUrl);
    const jsonString = !this.cacheBust && cachedWclApiResponse ? cachedWclApiResponse.content : null;
    if (jsonString) {
      console.log('cache HIT', this.requestUrl);
      cachedWclApiResponse.update({
        numAccesses: cachedWclApiResponse.numAccesses + 1,
        lastAccessedAt: Sequelize.fn('NOW'),
      });
      this.sendJson(jsonString);
    } else {
      console.log('cache MISS', this.requestUrl);
      this.fetchFromWcl(cachedWclApiResponse);
    }
  }

  get requestUrl() {
    return `${this.req.params[0]}?${querystring.stringify(this.req.query)}`;
  }
  async fetchFromWcl(cachedWclApiResponse) {
    const query = Object.assign({}, this.req.query, { api_key: this.apiKey });
    // Don't use `this.req.params[0]` here as this automatically (url)decodes parts, breaking special characters in name!
    const path = `v1${this.req.path}?${querystring.stringify(query)}`;
    console.log('GET', path);
    try {
      const wclStart = Date.now();
      const jsonString = await request.get({
        url: `https://www.warcraftlogs.com/${path}`,
        headers: {
          'User-Agent': 'WoWAnalyzer.com API',
        },
        gzip: true, // using gzip is 80% quicker
        forever: true, // we'll be making several requests, so pool connections
      });
      const wclResponseTime = Date.now() - wclStart;

      // WCL maintenance mode returns 200 http code :(
      if (jsonString.includes(WCL_MAINTENANCE_STRING)) {
        throw new WclApiError(WCL_MAINTENANCE_STRING, 503);
      }
      // WCL has a tendency to throw non-JSON errors with a 200 HTTP exception, this ensures they're not accepted and cached.
      // Decoding JSON takes a long time, grabbing the first character is near instant and has high accuracy.
      const firstCharacter = jsonString.substr(0, 1);
      if (firstCharacter !== '{' && firstCharacter !== '[') {
        throw new WclApiError('Corrupt Warcraft Logs API response received', 500);
      }

      if (cachedWclApiResponse) {
        cachedWclApiResponse.update({
          content: jsonString,
          wclResponseTime,
          numAccesses: cachedWclApiResponse.numAccesses + 1,
          lastAccessedAt: Sequelize.fn('NOW'),
        });
      } else {
        WclApiResponse.create({
          url: this.requestUrl,
          content: jsonString,
          wclResponseTime,
        });
      }

      this.sendJson(jsonString);
      console.log('Finished', 'wcl:', wclResponseTime, 'ms');
    } catch (error) {
      // if this is a `request` error, `error` contains the plain JSON while `message` also has the statusCode so is polluted.
      const message = error.error || error.message;
      console.error(`WCL Error (${error.statusCode}): ${message}`);
      if (error.statusCode !== 400) {
        // Ignore "This report does not exist or is private."
        Raven.installed && Raven.captureException(error);
      }
      if (error.statusCode >= 400 && error.statusCode < 600) {
        this.res.status(error.statusCode);
        this.sendJson({
          error: 'WCL API error',
          message,
        });
        return;
      }
      console.error(error);
      this.res.status(500);
      this.sendJson({
        error: 'A server error occured',
        message: error.message,
      });
    }
  }

  sendJson(json) {
    this.res.setHeader('Content-Type', 'application/json; charset=utf-8');
    this.res.send(json);
  }
}

const router = Express.Router();
router.get('/*', (req, res) => {
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
});

export default router;
