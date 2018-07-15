import React from 'react';
import { shallow } from 'enzyme';

import { Dummy } from 'CONTRIBUTORS';

import Details from './Details';

describe('ContributorDetails', () => {
  it('matches snapshot', () => {
    const tree = shallow((
      <Details
        contributorId={Dummy.nickname}
      />
    ));
    expect(tree).toMatchSnapshot();
  });
});
