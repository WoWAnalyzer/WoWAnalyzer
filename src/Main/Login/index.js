import React from 'react';

import PatreonIcon from 'Icons/PatreonTiny';
import GitHubMarkIcon from 'Icons/GitHubMarkLarge';

const INITIAL_BACKGROUNDS = [
  'https://media.giphy.com/media/7TqE3VIAU2odkmneHU/giphy.gif', // salute https://giphy.com/gifs/warcraft-video-games-7TqE3VIAU2odkmneHU
];

class Login extends React.PureComponent {
  render() {
    const backgroundImage = INITIAL_BACKGROUNDS[Math.floor(Math.random() * INITIAL_BACKGROUNDS.length)];

    return (
      <div className="container">
        <div className="panel" style={{ maxWidth: 350, margin: '0 auto' }}>
          <div className="panel-body" style={{ padding: '0 15px' }}>
            <div
              className="row image-background"
              style={{ backgroundImage: `url(${backgroundImage})`, paddingTop: 300, paddingBottom: 15 }}
            >
              <div className="col-md-12">
                <h1>Login</h1>
                <div className="description">
                  Sign in with your Patreon or GitHub account.
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-6" style={{ padding: 0 }}>
                <a
                  href="/login/patreon"
                  className="btn btn-block"
                  style={{ fontSize: '2em', background: '#e6461a', color: '#fff', borderRadius: 0, borderBottomLeftRadius: 3 }}
                >
                  <PatreonIcon /> Patreon
                </a>
              </div>
              <div className="col-md-6" style={{ padding: 0 }}>
                <a
                  href="/login/github"
                  className="btn btn-block"
                  style={{ fontSize: '2em', background: '#fff', color: '#000', borderRadius: 0, borderBottomRightRadius: 3 }}
                  data-tip="Not yet implemented"
                >
                  <GitHubMarkIcon /> GitHub
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Login;
