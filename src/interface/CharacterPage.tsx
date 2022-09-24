import DocumentTitle from 'interface/DocumentTitle';
import NavigationBar from 'interface/NavigationBar';

import CharacterParses from './CharacterParses';
import { Region } from 'common/regions';

interface CharacterPageProps {
  region: Region;
  realm: string;
  name: string;
}

const CharacterPage = ({ region, realm, name, ...others }: CharacterPageProps) => (
  <>
    <DocumentTitle title={`${name}-${realm} (${region})`} />

    <NavigationBar />

    <CharacterParses region={region} realm={realm} name={name} {...others} />
  </>
);

export default CharacterPage;
