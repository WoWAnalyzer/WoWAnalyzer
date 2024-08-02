import NavigationBar from 'interface/NavigationBar';
import { useParams, useSearchParams } from 'react-router-dom';
import DocumentTitle from 'interface/DocumentTitle';

import CharacterParses from 'src/interface/CharacterParses';
import { usePageView } from 'src/interface/useGoogleAnalytics';

export function Component() {
  const { region, realm, name } = useParams();
  const regionDecoded = decodeURI(region?.replace(/\+/g, ' ') ?? '').toUpperCase();
  const realmDecoded = decodeURI(realm?.replace(/\+/g, ' ') ?? '');
  const nameDecoded = decodeURI(name?.replace(/\+/g, ' ') ?? '');
  const [searchParams] = useSearchParams();
  const game = searchParams.get('game');
  usePageView('CharacterPage');
  return (
    <>
      <DocumentTitle title={`${nameDecoded}-${realmDecoded} (${regionDecoded})`} />

      <NavigationBar />

      <CharacterParses region={regionDecoded} realm={realmDecoded} name={nameDecoded} game={game} />
    </>
  );
}
