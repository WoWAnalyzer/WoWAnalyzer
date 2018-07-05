import React from 'react';
import { shallow } from 'enzyme';

import { LoginPanel } from './LoginPanel';

describe('Premium/LoginPanel', () => {
  it('matches snapshot when logged out', () => {
    const tree = shallow((
      <LoginPanel />
    ));
    expect(tree).toMatchSnapshot();
  });
  it('matches snapshot when logged in with GitHub', () => {
    const tree = shallow((
      <LoginPanel
        user={{
          name: 'Martijn Hols',
          github: {
            premium: true,
            expires: '2018-07-02T11:48:40.000Z',
          },
        }}
      />
    ));
    expect(tree).toMatchSnapshot();
  });
  it('matches snapshot when logged in with Patreon', () => {
    const tree = shallow((
      <LoginPanel
        user={{
          name: 'Martijn Hols',
          patreon: {
            premium: true,
          },
        }}
      />
    ));
    expect(tree).toMatchSnapshot();
  });
});
