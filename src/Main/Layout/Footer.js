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
            <div className="col-md-7">
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
