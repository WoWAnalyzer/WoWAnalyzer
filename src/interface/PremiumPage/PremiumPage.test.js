import React from 'react';
import { shallow } from 'enzyme';

import { PremiumPage } from './PremiumPage';

describe('PremiumPage', () => {
  it('matches snapshot when logged out', () => {
    const tree = shallow((
      <PremiumPage />
    ));
    expect(tree).toMatchSnapshot();
  });
  it('matches snapshot when logged in with GitHub', () => {
    const tree = shallow((
      <PremiumPage
        user={{
          name: 'Martijn Hols',
          github: {
            premium: true,
            expires: '2018-07-02T11:48:40.000Z',
          },
        }}
        dateToLocaleString={a => a.toUTCString()}
      />
    ));
    expect(tree).toMatchSnapshot();
  });
  it('matches snapshot when logged in with Patreon', () => {
    const tree = shallow((
      <PremiumPage
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
