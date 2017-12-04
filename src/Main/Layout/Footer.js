import React from 'react';

import DiscordButton from '../DiscordButton';
import PatreonButton from '../PatreonButton';
import GithubButton from '../GithubButton';

import './Footer.css';

class Footer extends React.PureComponent {
  render() {
    return (
      <footer>
        <div className="container">
          <div className="row">
            <div className="col-md-7 text-muted">
              The log data is provided by the <a href="https://www.warcraftlogs.com">Warcaft Logs</a> API. <dfn
                data-tip={`
                  <ul>
                    <li>Fingerprint by IconsGhost</li>
                    <li>Scroll by jngll</li>
                    <li>Delete by johartcamp</li>
                    <li>Skull by Royyan Razka</li>
                    <li>Heart by Emir Palavan</li>
                  </ul>
                `}
              >Icons from the <a href="https://thenounproject.com">Noun Project</a>.</dfn><br />
              Most artwork is copyright of Blizzard Entertainment, Inc. This is a fan site and we are not affiliated.
            </div>
            <div className="col-md-5 text-right">
              <DiscordButton />
              <PatreonButton style={{ marginLeft: 20 }} />
              <GithubButton style={{ marginLeft: 20 }} />
            </div>
          </div>
        </div>
      </footer>
    );
  }
}

export default Footer;
