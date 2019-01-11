import React from 'react';

import DiscordLogo from 'interface/icons/DiscordTiny';
import GithubLogo from 'interface/icons/GitHubMarkSmall';
import PatreonIcon from 'interface/icons/PatreonTiny';
import Logo from 'interface/images/logo.svg';
import Tooltip, { TooltipElement } from 'common/Tooltip';

import './style.css';

class Footer extends React.PureComponent {
  render() {
    return (
      <footer>
        <div className="container text-center">
          <a href="/">
            <img src={Logo} alt="Logo" className="wowanalyzer-logo" />
          </a>

          <h1>
            Be a part of us
          </h1>
          <div className="social-links">
            {/* For some reason the tooltip disappears and reappears when mousing over the svg icons (maybe when the cursor leaves filled areas)*/}
            <Tooltip content="Discord">
              <a href="https://wowanalyzer.com/discord">
                <DiscordLogo />
              </a>
            </Tooltip>
            <Tooltip content="GitHub">
              <a href="https://github.com/WoWAnalyzer/WoWAnalyzer">
                <GithubLogo />
              </a>
            </Tooltip>
            <Tooltip content="Patreon">
              <a href="https://www.patreon.com/wowanalyzer">
                <PatreonIcon />
              </a>
            </Tooltip>
          </div><br />

          <div
            style={{
              opacity: 0.5,
              fontSize: '0.8em',
              fontWeight: 400,
              marginTop: '1em',
            }}
          >
            Log data from <a href="https://www.warcraftlogs.com">Warcaft Logs</a>.
            <TooltipElement
              content={(
                <>
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
                    <li>Dropdown by zalhan</li>
                    <li>timeline by Alexander Blagochevsky</li>
                    <li>abilities by sachin modgekar</li>
                    <li>Vision by supalerk laipawat</li>
                    <li>Lightning by Mooms</li>
                    <li>Grid Many Rows by Justin White</li>
                    <li>Info by Gregor Cresnar</li>
                    <li>Plus by Galaxicon</li>
                  </ul>
                </>
              )}
            >Icons by the <a href="https://thenounproject.com">Noun Project</a>.</TooltipElement><br />
            World of Warcraft and related artwork is copyright of Blizzard Entertainment, Inc.<br />
            This is a fan site and we are not affiliated.
          </div>
        </div>
      </footer>
    );
  }
}

export default Footer;
