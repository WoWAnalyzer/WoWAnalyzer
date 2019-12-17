import React from 'react';
import { shallow } from 'enzyme';

import { PremiumLoginPanel } from './PremiumLoginPanel';

describe('PremiumLoginPanel', () => {
  it('matches snapshot when logged out', () => {
    const tree = shallow((
      <PremiumLoginPanel />
    ));
    expect(tree).toMatchSnapshot();
  });
  it('matches snapshot when logged in with GitHub', () => {
    const tree = shallow((
      <PremiumLoginPanel
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
      <PremiumLoginPanel
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
