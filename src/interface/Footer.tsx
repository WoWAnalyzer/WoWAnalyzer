import GithubLogo from 'interface/icons/GitHubMarkSmall';
import PatreonIcon from 'interface/icons/PatreonTiny';
import Logo from 'interface/images/logo.svg';
import Tooltip, { TooltipElement } from 'interface/Tooltip';
import { Link } from 'react-router-dom';

import './Footer.scss';

const Footer = () => (
  <footer>
    <div className="container text-center">
      <div>
        <Link to="/">
          <img src={Logo} alt="Localog logo" className="wowanalyzer-logo" />
        </Link>

        <h1>Localog</h1>
        <div className="social-links">
          {/* For some reason the tooltip disappears and reappears when mousing over the svg icons (maybe when the cursor leaves filled areas)*/}
          <Tooltip content="GitHub">
            <a href="https://github.com/Topping/WoWAnalyzer">
              <GithubLogo />
            </a>
          </Tooltip>
          <Tooltip content="Support the WoWAnalyzer authors on Patreon">
            <a href="https://www.patreon.com/join/wowanalyzer">
              <PatreonIcon />
            </a>
          </Tooltip>
        </div>
        {/* oxlint-disable-next-line wowanalyzer/no-br -- Baseline suppression */}
        <br />

        <div className="attribution">
          Localog is a local-first fork of{' '}
          <a href="https://github.com/WoWAnalyzer/WoWAnalyzer">WoWAnalyzer</a>.
          {/* oxlint-disable-next-line wowanalyzer/no-br -- Baseline suppression */}
          <br />
          Log data from <a href="https://www.warcraftlogs.com">Warcraft Logs</a>.{' '}
          <TooltipElement
            content={
              <>
                Icon creators:
                {/* oxlint-disable-next-line wowanalyzer/no-br -- Baseline suppression */}
                <br />
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
                  <li>swirl by Gregor Cresnar</li>
                </ul>
              </>
            }
          >
            Icons by the <a href="https://thenounproject.com">Noun Project</a>.
          </TooltipElement>
          {/* oxlint-disable-next-line wowanalyzer/no-br -- Baseline suppression */}
          <br />
          World of Warcraft and related artwork is copyright of Blizzard Entertainment, Inc.
          {/* oxlint-disable-next-line wowanalyzer/no-br -- Baseline suppression */}
          <br />
          This is a fan site and we are not affiliated.
          {/* oxlint-disable-next-line wowanalyzer/no-br -- Baseline suppression */}
          <br />
          <Link to="/">Home</Link> &ndash; <Link to="/privacy">Privacy Policy</Link>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
