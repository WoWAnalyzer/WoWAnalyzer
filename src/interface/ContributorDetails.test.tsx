import { Dummy } from 'CONTRIBUTORS';
import { render } from '@testing-library/react';

import ContributorDetails from './ContributorDetails';

describe('ContributorDetails', () => {
  it('matches snapshot', () => {
    const { container } = render(<ContributorDetails contributorId={Dummy.nickname} />);
    expect(container).toMatchSnapshot();
  });
});
