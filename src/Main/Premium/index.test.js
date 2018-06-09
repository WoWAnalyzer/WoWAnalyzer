import React from 'react';
import { shallow } from 'enzyme';

import { Premium } from './index';

describe('Premium', () => {
  it('matches snapshot when logged out', () => {
    const tree = shallow((
      <Premium />
    ));
    expect(tree).toMatchSnapshot();
  });
  it('matches snapshot when logged in with GitHub', () => {
    const tree = shallow((
      <Premium
        user={{
          name: 'Martijn Hols',
          github: {
            premium: true,
            expires: '2018-07-02T11:48:40.000Z',
          },
        }}
        dateToLocaleString={a => a.toString()}
      />
    ));
    expect(tree).toMatchSnapshot();
  });
  it('matches snapshot when logged in with Patreon', () => {
    const tree = shallow((
      <Premium
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
