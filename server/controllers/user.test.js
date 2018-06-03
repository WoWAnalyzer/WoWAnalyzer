import Express from 'express';
import requireAuthenticated from 'helpers/requireAuthenticated';

import './user';

describe('controllers/user', () => {
  let rootPath;
  let action;
  beforeEach(() => {
    rootPath = Express.__paths['/'];
    action = rootPath.action;
  });
  it('listens to /', () => {
    expect(rootPath).toBeTruthy();
  });
  it('requires authentication', () => {
    expect(rootPath.middleware).toContain(requireAuthenticated);
  });
  it('passes along user info', async () => {
    const response = {
      json: jest.fn(),
    };
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
    const response = {
      json: jest.fn(),
    };
    await action({
      user: {
        data: {},
      },
    }, response);
    expect(response.json).toHaveBeenCalledTimes(1);
    expect(response.json.mock.calls[0][0].premium).toBeFalsy();
  });
  it('recognizes premium by Patreon pledges', async () => {
    const response = {
      json: jest.fn(),
    };
    await action({
      user: {
        data: {
          patreon: {
            pledgeAmount: 100,
          },
        },
      },
    }, response);
    expect(response.json).toHaveBeenCalledTimes(1);
    expect(response.json.mock.calls[0][0].premium).toBeTruthy();
  });
});
