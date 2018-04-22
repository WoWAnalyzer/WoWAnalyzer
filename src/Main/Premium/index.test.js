import React from 'react';
import { shallow } from 'enzyme';

import Premium from './index';

describe('Premium', () => {
  it('matches snapshot', () => {
    const tree = shallow((
      <Premium />
    ));
    expect(tree).toMatchSnapshot();
  });
});
