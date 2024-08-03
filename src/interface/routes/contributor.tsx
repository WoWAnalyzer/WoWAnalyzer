import { useParams } from 'react-router-dom';
import DocumentTitle from 'interface/DocumentTitle';

import Details from '../ContributorDetails';

export function Component() {
  const { id } = useParams();
  const contributorId = decodeURI(id?.replace(/\+/g, ' ') ?? '');

  return (
    <div className="container">
      <DocumentTitle title={contributorId} />

      <Details ownPage contributorId={contributorId} />
    </div>
  );
}
