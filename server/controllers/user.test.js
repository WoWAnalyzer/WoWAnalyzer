import Express from 'express';
import requireAuthenticated from 'helpers/requireAuthenticated';

import './user';

jest.mock('helpers/patreon');
jest.mock('helpers/github');

describe('controllers/user', () => {
  let rootPath;
  let action;
  let response;
  beforeEach(() => {
    rootPath = Express.__paths['/'];
    action = rootPath.action;
    response = {
      json: jest.fn(),
    };
  });
  it('listens to /', () => {
    expect(rootPath).toBeTruthy();
  });
  it('requires authentication', () => {
    expect(rootPath.middleware).toContain(requireAuthenticated);
  });
  it('passes along user info', async () => {
    await action({
      user: {
        data: {
          name: 'Peter',
          avatar: 'http://example.com',
        },
      },
    }, response);
    expect(response.json).toHaveBeenCalledTimes(1);
    expect(response.json.mock.calls[0][0].name).toEqual('Peter');
    expect(response.json.mock.calls[0][0].avatar).toEqual('http://example.com');
  });
  it('is a regular user by default', async () => {
    await action({
      user: {
        data: {},
      },
    }, response);
    expect(response.json).toHaveBeenCalledTimes(1);
    expect(response.json.mock.calls[0][0].premium).toBeFalsy();
  });

  describe('patreon', () => {
    function createRequest(pledge, updatedAt = new Date()) {
      // Default to not refreshing
      return {
        user: {
          data: {
            patreon: {
              pledgeAmount: pledge,
              updatedAt: updatedAt,
            },
          },
        },
      };
    }

    it('recognizes Premium by pledge', async () => {
      await action(createRequest(100), response);
      expect(response.json).toHaveBeenCalledTimes(1);
      expect(response.json.mock.calls[0][0].premium).toBeTruthy();
    });
    it('reveals the platform that gave Premium', async () => {
      await action(createRequest(new Date()), response);
      expect(response.json).toHaveBeenCalledTimes(1);
      expect(response.json.mock.calls[0][0].patreon.premium).toBeTruthy();
    });
    it('doesn\'t give Premium when logged in but not pledged', async () => {
      await action(createRequest(null), response);
      expect(response.json).toHaveBeenCalledTimes(1);
      expect(response.json.mock.calls[0][0].premium).toBeFalsy();
    });
    describe('refreshing', () => {
      beforeEach(() => {
        jest.resetAllMocks();
      });
      it('refreshes status when the data is old', async () => {
        // the data is super old; force refresh
        await action(createRequest(100, new Date(2017, 1, 1)), response);

        const patreonHelpers = require('helpers/patreon');
        expect(patreonHelpers.refreshPatreonProfile).toHaveBeenCalledTimes(1);
      });
      it('doesn\'t refresh when the data is fresh', async () => {
        await action(createRequest(100, new Date()), response);

        const patreonHelpers = require('helpers/patreon');
        expect(patreonHelpers.refreshPatreonProfile).not.toHaveBeenCalled();
      });
      it('returns Premium status based on the refreshed data', async () => {
        const patreonHelpers = require('helpers/patreon');
        // Pledged -> unpledged
        patreonHelpers.refreshPatreonProfile = jest.fn(user => {
          user.data.patreon.pledgeAmount = null;
          user.data.patreon.updatedAt = new Date();
        });
        await action(createRequest(100, new Date(2017, 1, 1)), response);

        expect(response.json).toHaveBeenCalledTimes(1);
        expect(response.json.mock.calls[0][0].premium).toBeFalsy();

        response.json.mockReset();

        // Unpledged -> pledged
        patreonHelpers.refreshPatreonProfile = jest.fn(user => {
          user.data.patreon.pledgeAmount = 100;
          user.data.patreon.updatedAt = new Date();
        });
        await action(createRequest(null, new Date(2017, 1, 1)), response);

        expect(response.json).toHaveBeenCalledTimes(1);
        expect(response.json.mock.calls[0][0].premium).toBeTruthy();
      });
    });
  });

  describe('github', () => {
    function createRequest(lastContribution, updatedAt = new Date()) {
      // Default to not refreshing
      return {
        user: {
          data: {
            github: {
              lastContribution,
              updatedAt: updatedAt,
            },
          },
        },
      };
    }

    it('recognizes Premium by contribution', async () => {
      await action(createRequest(new Date()), response);
      expect(response.json).toHaveBeenCalledTimes(1);
      expect(response.json.mock.calls[0][0].premium).toBeTruthy();
    });
    it('reveals the platform that gave Premium', async () => {
      await action(createRequest(new Date()), response);
      expect(response.json).toHaveBeenCalledTimes(1);
      expect(response.json.mock.calls[0][0].github.premium).toBeTruthy();
    });
    it('reveals the expiry date', async () => {
      await action(createRequest(new Date(2018, 5, 10, 11, 20, 15, 0)), response);
      expect(response.json).toHaveBeenCalledTimes(1);
      // This test will fail when the GitHub premium duration is changed, will have to be updated simultaneously.
      expect(JSON.stringify(response.json.mock.calls[0][0].github.expires)).toBe('"2018-07-10T09:20:15.000Z"');
    });
    it('doesn\'t give Premium when logged in but not pledged', async () => {
      await action(createRequest(null), response);
      expect(response.json).toHaveBeenCalledTimes(1);
      expect(response.json.mock.calls[0][0].premium).toBeFalsy();
    });
    describe('refreshing', () => {
      beforeEach(() => {
        jest.resetAllMocks();
      });
      it('refreshes status when the data is old', async () => {
        // the data is super old; force refresh
        await action(createRequest(100, new Date(2017, 1, 1)), response);

        const githubHelpers = require('helpers/github');
        expect(githubHelpers.refreshGitHubLastContribution).toHaveBeenCalledTimes(1);
      });
      it('doesn\'t refresh when the data is fresh', async () => {
        await action(createRequest(100, new Date()), response);

        const githubHelpers = require('helpers/github');
        expect(githubHelpers.refreshGitHubLastContribution).not.toHaveBeenCalled();
      });
      it('returns Premium status based on the refreshed data', async () => {
        const githubHelpers = require('helpers/github');
        // No contribution -> contributed
        githubHelpers.refreshGitHubLastContribution = jest.fn(user => {
          user.data.github.lastContribution = null;
          user.data.github.updatedAt = new Date();
        });
        await action(createRequest(new Date(), new Date(2017, 1, 1)), response);

        expect(response.json).toHaveBeenCalledTimes(1);
        expect(response.json.mock.calls[0][0].premium).toBeFalsy();

        response.json.mockReset();

        // Contributed -> no contribution
        githubHelpers.refreshGitHubLastContribution = jest.fn(user => {
          user.data.github.lastContribution = new Date();
          user.data.github.updatedAt = new Date();
        });
        await action(createRequest(null, new Date(2017, 1, 1)), response);

        expect(response.json).toHaveBeenCalledTimes(1);
        expect(response.json.mock.calls[0][0].premium).toBeTruthy();
      });
    });
  });
});
