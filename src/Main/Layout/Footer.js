import React from 'react';

import DiscordButton from '../DiscordButton';
import PatreonButton from '../PatreonButton';
import GithubButton from '../GithubButton';

import './Footer.css';

class Footer extends React.PureComponent {
  render() {
    return (
      <footer>
        <div className="container text-center" style={{ fontSize: '0.8em' }}>
          The log data is provided by the <a href="https://www.warcraftlogs.com">Warcaft Logs</a> API. <dfn
            data-tip={`
              <ul>
                <li>Fingerprint by IconsGhost</li>
                <li>Scroll by jngll</li>
                <li>Delete by johartcamp</li>
                <li>Skull by Royyan Razka</li>
                <li>Heart by Emir Palavan</li>
                <li>armor by Jetro Cabau Quirós</li>
                <li>Checklist by David</li>
                <li>Idea by Anne</li>
                <li>About Document by Deepz</li>
                <li>Stats by Barracuda</li>
                <li>Login by Yaroslav Samoylov</li>
              </ul>
            `}
          >Icons from the <a href="https://thenounproject.com">Noun Project</a>.</dfn><br />
          Most artwork is copyright of Blizzard Entertainment, Inc. This is a fan site and we are not affiliated.<br /><br />

          <DiscordButton />
          <GithubButton style={{ marginLeft: 20 }} />
          <PatreonButton style={{ marginLeft: 20 }} />
        </div>
      </footer>
    );
  }
}

export default Footer;
