import { useRouteMatch } from 'react-router-dom';

import Details from './ContributorDetails';
import { Helmet } from 'react-helmet';

interface MatchParams {
  id: string;
}

const ContributorPage = () => {
  const match = useRouteMatch<MatchParams>('/contributor/:id');
  const contributorId = decodeURI(match?.params.id.replace(/\+/g, ' ') ?? '');

  return (
    <div className="container">
      <Helmet>
        <title>{contributorId}</title>
      </Helmet>

      <Details ownPage contributorId={contributorId} />
    </div>
  );
};

export default ContributorPage;
