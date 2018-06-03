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
  it('matches snapshot when logged in', () => {
    const tree = shallow((
      <Premium
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
});
