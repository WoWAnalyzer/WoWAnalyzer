import GuildReports from 'interface/GuildReports';
import NavigationBar from 'interface/NavigationBar';
import { useParams } from 'react-router-dom';
import DocumentTitle from 'interface/DocumentTitle';

const GuildPage = () => {
  const { region, realm, name } = useParams();
  const regionDecoded = decodeURI(region?.replace(/\+/g, ' ') ?? '').toUpperCase();
  const realmDecoded = decodeURI(realm?.replace(/\+/g, ' ') ?? '');
  const nameDecoded = decodeURI(name?.replace(/\+/g, ' ') ?? '');

  return (
    <>
      <DocumentTitle title={`${nameDecoded}-${realmDecoded} (${nameDecoded})`} />
      <NavigationBar />
      <GuildReports region={regionDecoded} realm={realmDecoded} name={nameDecoded} />
    </>
  );
};

export default GuildPage;
