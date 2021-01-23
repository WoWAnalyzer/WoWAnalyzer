import React from 'react';
import { shallow } from 'enzyme';

import { Dummy } from 'CONTRIBUTORS';

import ContributorDetails from './ContributorDetails';

describe('ContributorDetails', () => {
  it('matches snapshot', () => {
    const tree = shallow((
      <ContributorDetails
        contributorId={Dummy.nickname}
      />
    ));
    expect(tree).toMatchSnapshot();
  });
});
