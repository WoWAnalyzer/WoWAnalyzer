import React from 'react';

import DocumentTitle from 'interface/DocumentTitle';
import NavigationBar from 'interface/NavigationBar';

import CharacterParses from './CharacterParses';

interface CharacterPageProps {
  region: string;
  realm: string;
  name: string;
}

const CharacterPage = ({
  region,
  realm,
  name,
  ...others
}: CharacterPageProps) => (
  <>
    <DocumentTitle title={`${name}-${realm} (${region})`} />

    <NavigationBar />

    <CharacterParses region={region} realm={realm} name={name} {...others} />
  </>
);

export default CharacterPage;
