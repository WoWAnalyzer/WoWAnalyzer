import React from 'react';

import PatreonIcon from 'Icons/PatreonTiny';
import GitHubMarkIcon from 'Icons/GitHubMarkLarge';

import CyclingVideo from './CyclingVideo';

const INITIAL_BACKGROUNDS = [
  '7TqE3VIAU2odkmneHU', // human salute https://giphy.com/gifs/warcraft-video-games-7TqE3VIAU2odkmneHU
  '2erqKiXvYpXeGH9XJ5', // gnome bow https://giphy.com/gifs/warcraft-video-games-2erqKiXvYpXeGH9XJ5
  '5kFzxK6ENfjrcoMgt1', // orc salute https://giphy.com/gifs/warcraft-video-games-5kFzxK6ENfjrcoMgt1
  'PoCoePEEB1EC6buvFU', // blood elf salute https://giphy.com/gifs/warcraft-video-games-PoCoePEEB1EC6buvFU
].map(code => `https://media.giphy.com/media/${code}/giphy.mp4`);
// const LOGIN_SUCCESSFUL_BACKGROUNDS = [
//   '1AdZe53o36pL2ifJrW', // approve https://giphy.com/gifs/warcraft-video-games-1AdZe53o36pL2ifJrW
//   '12gdy23jcbqdvqID9D', // human cheer https://giphy.com/gifs/warcraft-video-games-12gdy23jcbqdvqID9D
//   '2fRB16C8fbWsHTogzJ', // orc cheer https://giphy.com/gifs/warcraft-video-games-2fRB16C8fbWsHTogzJ
//   '55kiNDmHdIkd2NJ9L1', // ...gnome cheer  https://giphy.com/gifs/warcraft-video-games-55kiNDmHdIkd2NJ9L1
//   'cQ29kUD2CstrP0Cyyz', // blood elf dh cheer https://giphy.com/gifs/warcraft-video-games-cQ29kUD2CstrP0Cyyz
// ];
// const LOGIN_UNSUCCESSFUL_BACKGROUNDS = [
//   '4N1IhWlgeurYEqBpbd', // no https://giphy.com/gifs/warcraft-video-games-4N1IhWlgeurYEqBpbd
//   'fdGbKBJRylAQ3Gj1f8', // please https://giphy.com/gifs/warcraft-video-games-fdGbKBJRylAQ3Gj1f8
//   '1zgvoYwvgm7LnHpYp4', // blood elf dh no https://giphy.com/gifs/warcraft-video-games-1zgvoYwvgm7LnHpYp4
//   '8h0dtWORphvPgH4O20', // orc no https://giphy.com/gifs/warcraft-video-games-8h0dtWORphvPgH4O20
//   '4a4w6CzSj1t2Hl6gYy', // orc please https://giphy.com/gifs/warcraft-video-games-4a4w6CzSj1t2Hl6gYy
// ];

class Login extends React.PureComponent {
  render() {

    return (
      <div className="container">
        <div className="panel" style={{ maxWidth: 350, margin: '0 auto' }}>
          <div className="panel-body" style={{ padding: '0 15px' }}>
            <div
              className="row image-background"
              style={{ position:'relative', paddingTop: 300, paddingBottom: 15 }}
            >
              <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, pointerEvents: 'none', overflow: 'hidden' }}>
                <CyclingVideo
                  videos={INITIAL_BACKGROUNDS}
                  style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                />
              </div>
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
