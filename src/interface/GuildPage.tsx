import GuildReports from 'interface/GuildReports';
import NavigationBar from 'interface/NavigationBar';
import { Helmet } from 'react-helmet';
import { useRouteMatch } from 'react-router-dom';

interface MatchParams {
  region: string;
  realm: string;
  name: string;
}

const GuildPage = () => {
  const match = useRouteMatch<MatchParams>('/guild/:region/:realm/:name');
  const region = decodeURI(match?.params.region.replace(/\+/g, ' ') ?? '').toUpperCase();
  const realm = decodeURI(match?.params.realm.replace(/\+/g, ' ') ?? '');
  const name = decodeURI(match?.params.name.replace(/\+/g, ' ') ?? '');

  return (
    <>
      <Helmet>
        <title>
          {name}-{realm} ({region})
        </title>
      </Helmet>
      <NavigationBar />
      <GuildReports region={region} realm={realm} name={name} />
    </>
  );
};

export default GuildPage;
