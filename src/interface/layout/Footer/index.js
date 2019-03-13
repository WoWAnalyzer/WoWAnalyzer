import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Tooltip, { TooltipElement } from 'common/Tooltip';
import DiscordLogo from 'interface/icons/DiscordTiny';
import GithubLogo from 'interface/icons/GitHubMarkSmall';
import PatreonIcon from 'interface/icons/PatreonTiny';
import { hasPremium } from 'interface/selectors/user';
import Logo from 'interface/images/logo.svg';
import Ad from 'interface/common/Ad';

import './style.scss';

class Footer extends React.PureComponent {
  static propTypes = {
    premium: PropTypes.bool,
  };

  render() {
    const { premium } = this.props;

    return (
      <footer>
        <div className="container text-center">
          <div>
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
                <a href="https://www.patreon.com/join/wowanalyzer">
                  <PatreonIcon />
                </a>
              </Tooltip>
            </div>
            <br />

            <div className="attribution">
              Log data from <a href="https://www.warcraftlogs.com">Warcaft Logs</a>.{' '}
              <TooltipElement
                content={(
                  <>
                    Icon creators:<br />

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
                      <li>duration by Bohdan Burmich</li>
                      <li>link by arjuazka</li>
                    </ul>
                  </>
                )}
              >Icons by the <a href="https://thenounproject.com">Noun Project</a>.</TooltipElement><br />
              World of Warcraft and related artwork is copyright of Blizzard Entertainment, Inc.<br />
              This is a fan site and we are not affiliated.
            </div>
          </div>
          {premium === false && (
            <div>
              <Ad
                data-ad-slot="3815063023" // Footer
              />
            </div>
          )}
        </div>
      </footer>
    );
  }
}

const mapStateToProps = state => ({
  premium: hasPremium(state),
});

export default connect(mapStateToProps)(Footer);
