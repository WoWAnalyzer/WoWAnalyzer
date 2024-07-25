import GuildReports from 'interface/GuildReports';
import NavigationBar from 'interface/NavigationBar';
import { useParams, useSearchParams } from 'react-router-dom';
import DocumentTitle from 'interface/DocumentTitle';

export function Component() {
  const { region, realm, name } = useParams();
  const regionDecoded = decodeURI(region?.replace(/\+/g, ' ') ?? '').toUpperCase();
  const realmDecoded = decodeURI(realm?.replace(/\+/g, ' ') ?? '');
  const nameDecoded = decodeURI(name?.replace(/\+/g, ' ') ?? '');
  const [searchParams] = useSearchParams();
  const game = searchParams.get('game');

  return (
    <>
      <DocumentTitle title={`${nameDecoded}-${realmDecoded} (${nameDecoded})`} />
      <NavigationBar />
      <GuildReports region={regionDecoded} realm={realmDecoded} name={nameDecoded} game={game} />
    </>
  );
}
