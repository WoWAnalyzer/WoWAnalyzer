import React from 'react';

import DocumentTitle from 'interface/DocumentTitle';

import Details from './ContributorDetails';

interface Props {
  contributorId: string;
}

const ContributorPage = ({ contributorId, ...others }: Props) => (
  <div className="container">
    <DocumentTitle title={contributorId} />

    <Details ownPage contributorId={contributorId} {...others} />
  </div>
);

export default ContributorPage;
