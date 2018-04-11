import Express from 'express';
import requireAuthenticated from 'helpers/requireAuthenticated';

import './profile';

describe('controllers/profile', () => {
  let root;
  beforeEach(() => {
    root = Express.__paths['/'];
  });
  it('listens to /', () => {
    expect(root).toBeTruthy();
  });
  it('requires authentication', () => {
    expect(root.middleware).toContain(requireAuthenticated);
  });
  it('passes along user info', () => {
    const response = {
      json: jest.fn(),
    };
    root.action({
      user: {
        name: 'Peter',
        avatar: 'http://example.com',
      },
    }, response);
    expect(response.json).toHaveBeenCalledTimes(1);
    expect(response.json.mock.calls[0][0].name).toEqual('Peter');
    expect(response.json.mock.calls[0][0].avatar).toEqual('http://example.com');
  });
  it('is a regular user by default', () => {
    const response = {
      json: jest.fn(),
    };
    root.action({
      user: {},
    }, response);
    expect(response.json).toHaveBeenCalledTimes(1);
    expect(response.json.mock.calls[0][0].premium).toBeFalsy();
  });
  it('recognizes premium by Patreon pledges', () => {
    const response = {
      json: jest.fn(),
    };
    root.action({
      user: {
        patreon: {
          pledgeAmount: 100,
        },
      },
    }, response);
    expect(response.json).toHaveBeenCalledTimes(1);
    expect(response.json.mock.calls[0][0].premium).toBeTruthy();
  });
});
