import React from 'react';

import DiscordLogo from 'Icons/DiscordTiny';
import GithubLogo from 'Icons/GitHubMarkSmall';
import PatreonIcon from 'Icons/PatreonTiny';

import './style.css';

class Footer extends React.PureComponent {
  render() {
    return (
      <footer>
        <div className="container text-center">
          <a href="/">
            <img src="/favicon.png" alt="Logo" className="wowanalyzer-logo" />
          </a>

          <h1>
            Be a part of us
          </h1>
          <div className="social-links">
            <a href="/discord" data-tip="Discord">
              <DiscordLogo />
            </a>
            <a href="/github" data-tip="GitHub">
              <GithubLogo />
            </a>
            <a href="/patreon" data-tip="Patreon">
              <PatreonIcon />
            </a>
          </div><br />

          <div
            style={{
              opacity: 0.5,
              fontSize: '0.8em',
              fontWeight: 400,
              marginTop: '1em',
            }}
          >
            Log data from <a href="https://www.warcraftlogs.com">Warcaft Logs</a>. <dfn
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
                </ul>
              `}
            >Icons by the <a href="https://thenounproject.com">Noun Project</a>.</dfn><br />
            World of Warcraft and related artwork is copyright of Blizzard Entertainment, Inc.<br />
            This is a fan site and we are not affiliated.
          </div>
        </div>
      </footer>
    );
  }
}

export default Footer;
