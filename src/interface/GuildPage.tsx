import DocumentTitle from 'interface/DocumentTitle';
import GuildReports from 'interface/GuildReports';
import NavigationBar from 'interface/NavigationBar';
import React from 'react';

interface GuildPageProps {
  region: string;
  realm: string;
  name: string;
}

const GuildPage = ({ region, realm, name, ...others }: GuildPageProps) => (
  <>
    <DocumentTitle title={`${name}-${realm} (${region})`} />
    <NavigationBar />
    <GuildReports region={region} realm={realm} name={name} {...others} />
  </>
);

export default GuildPage;
