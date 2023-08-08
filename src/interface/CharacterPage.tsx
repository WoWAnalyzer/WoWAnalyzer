import NavigationBar from 'interface/NavigationBar';
import { useParams } from 'react-router-dom';
import DocumentTitle from 'interface/DocumentTitle';

import CharacterParses from './CharacterParses';
import ClassicParses from 'interface/classic/CharacterParses';
import { usePageView } from './useGoogleAnalytics';

const CharacterPage = () => {
  const { classic, region, realm, name } = useParams();
  const regionDecoded = decodeURI(region?.replace(/\+/g, ' ') ?? '').toUpperCase();
  const realmDecoded = decodeURI(realm?.replace(/\+/g, ' ') ?? '');
  const nameDecoded = decodeURI(name?.replace(/\+/g, ' ') ?? '');
  usePageView('CharacterPage');

  if (classic) {
    return (
      <>
        <DocumentTitle title={`${nameDecoded}-${realmDecoded} (${regionDecoded})`} />

        <NavigationBar />

        <ClassicParses region={regionDecoded} realm={realmDecoded} name={nameDecoded} />
      </>
    );
  } else {
    return (
      <>
        <DocumentTitle title={`${nameDecoded}-${realmDecoded} (${regionDecoded})`} />

        <NavigationBar />

        <CharacterParses region={regionDecoded} realm={realmDecoded} name={nameDecoded} />
      </>
    );
  }
};

export default CharacterPage;
