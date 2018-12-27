import querystring from 'querystring';

import { blizzardApiResponseLatencyHistogram } from 'helpers/metrics';
import RequestTimeoutError from 'helpers/request/RequestTimeoutError';
import RequestSocketTimeoutError from 'helpers/request/RequestSocketTimeoutError';
import RequestConnectionResetError from 'helpers/request/RequestConnectionResetError';
import RequestUnknownError from 'helpers/request/RequestUnknownError';

import retryingRequest from './retryingRequest';
import RegionNotSupportedError from './RegionNotSupportedError';

const REGIONS = {
  EU: 'EU',
  US: 'US',
  TW: 'TW',
  KR: 'KR',
};
const HTTP_CODES = {
  UNAUTHORIZED: 401, // access token invalid/expired
  NOT_FOUND: 404,
};

class WowCommunityApi { // TODO: extends ExternalApi that provides a generic _fetch method for third party APIs
  static localeByRegion = {
    [REGIONS.EU]: 'en_US',
    [REGIONS.US]: 'en_US',
    [REGIONS.TW]: 'zh_TW',
    [REGIONS.KR]: 'ko_KR',
  };

  async fetchCharacter(regionCode, realm, name, fields) {
    const region = this._getRegion(regionCode);

    return this._fetchCommunityApi(region, 'character', `${encodeURIComponent(realm)}/${encodeURIComponent(name)}`, {
      fields,
    });
  }
  async fetchItem(id, regionCode = REGIONS.US) {
    const region = this._getRegion(regionCode);

    return this._fetchCommunityApi(region, 'item', encodeURIComponent(id));
  }
  async fetchSpell(id, regionCode = REGIONS.US) {
    const region = this._getRegion(regionCode);

    return this._fetchCommunityApi(region, 'spell', encodeURIComponent(id));
  }

  // region Internals
  _accessTokenByRegion = {};

  _makeUrl(region, endpoint, path, query = {}) {
    return `https://${region.toLowerCase()}.api.blizzard.com/wow/${endpoint}/${path}?${querystring.stringify({
      locale: this.constructor.localeByRegion[region],
      ...query,
    })}`;
  }
  _getRegion(regionCode) {
    const region = REGIONS[regionCode.toUpperCase()];
    if (!region) {
      throw new RegionNotSupportedError();
    }
    return region;
  }
  async _fetchAccessToken(region) {
    if (!this._accessTokenByRegion[region]) {
      const url = `https://${region}.battle.net/oauth/token?grant_type=client_credentials&client_id=${process.env.BATTLE_NET_API_CLIENT_ID}&client_secret=${process.env.BATTLE_NET_API_CLIENT_SECRET}`;

      const tokenRequest = await this._fetch(url, {
        category: 'token',
        region,
      });

      const tokenData = JSON.parse(tokenRequest);
      this._accessTokenByRegion[region] = tokenData.access_token;
    }

    return this._accessTokenByRegion[region];
  }

  async _fetchCommunityApi(region, endpoint, path, query = null) {
    const accessToken = await this._fetchAccessToken(region);
    const url = this._makeUrl(region, endpoint, path, {
      access_token: accessToken,
      ...query,
    });
    const metricLabels = { category: endpoint, region };
    try {
      return await this._fetch(url, metricLabels);
    } catch (err) {
      if (err.statusCode === 401) {
        delete this._accessTokenByRegion[region];
        // We can recursively call ourself because we just deleted the access token so it will just retry that and if that fails then it will actually stop instead of retrying *forever*.
        // This is unless Blizzard's API breaks and starts throwing out 401s for valid keys. Let's hope that won't happen.
        return this._fetchCommunityApi(region, endpoint, path, query);
      }
      throw err;
    }
  }
  _fetch(url, metricLabels) {
    let commitMetric;
    return retryingRequest({
      url,
      headers: {
        'User-Agent': process.env.USER_AGENT,
      },
      gzip: true,
      // we'll be making several requests, so pool connections
      forever: true,
      // ms after which to abort the request, when a character is uncached it's not uncommon to take ~2sec
      timeout: 4000,
      // The Blizzard API isn't very reliable in its HTTP codes, so we're very liberal
      shouldRetry: error => error.statusCode !== HTTP_CODES.NOT_FOUND,
      onBeforeAttempt: () => {
        commitMetric = blizzardApiResponseLatencyHistogram.startTimer(metricLabels);
      },
      onFailedAttempt: async err => {
        if (err instanceof RequestTimeoutError) {
          commitMetric({ statusCode: 'timeout' });
        } else if (err instanceof RequestSocketTimeoutError) {
          commitMetric({ statusCode: 'socket timeout' });
        } else if (err instanceof RequestConnectionResetError) {
          commitMetric({ statusCode: 'connection reset' });
        } else if (err instanceof RequestUnknownError) {
          commitMetric({ statusCode: 'unknown' });
        } else {
          commitMetric({ statusCode: err.statusCode });
        }
      },
      onSuccess: () => {
        commitMetric({ statusCode: 200 });
      },
    });
  }
  // endregion
}

export default new WowCommunityApi();
