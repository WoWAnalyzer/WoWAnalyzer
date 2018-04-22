import React from 'react';

import PatreonIcon from 'Icons/PatreonTiny';
import GitHubMarkIcon from 'Icons/GitHubMarkLarge';

import PatreonButton from 'Main/PatreonButton';
import GithubButton from 'Main/GithubButton';

import CyclingVideo from './CyclingVideo';

const INITIAL_BACKGROUNDS = [
  '7TqE3VIAU2odkmneHU', // human salute https://giphy.com/gifs/warcraft-video-games-7TqE3VIAU2odkmneHU
  '5kFzxK6ENfjrcoMgt1', // orc salute https://giphy.com/gifs/warcraft-video-games-5kFzxK6ENfjrcoMgt1
  'PoCoePEEB1EC6buvFU', // blood elf salute https://giphy.com/gifs/warcraft-video-games-PoCoePEEB1EC6buvFU
  '8cv2DoGyUClMuCKalT', // human bow https://giphy.com/gifs/warcraft-video-games-8cv2DoGyUClMuCKalT
  'fUZW0LIJhtbDnBtqkX', // orc bow https://giphy.com/gifs/warcraft-video-games-fUZW0LIJhtbDnBtqkX
  '2erqKiXvYpXeGH9XJ5', // gnome bow https://giphy.com/gifs/warcraft-video-games-2erqKiXvYpXeGH9XJ5
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

class Premium extends React.PureComponent {
  render() {
    return (
      <div className="container">
        <div className="row">
          <div className="col-lg-3 col-lg-offset-1 col-sm-4">
            <div className="panel">
              <div className="panel-body" style={{ padding: '0 15px' }}>
                <div
                  className="row image-background"
                  style={{ position: 'relative', paddingTop: 300, paddingBottom: 15 }}
                >
                  <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, pointerEvents: 'none', overflow: 'hidden' }}>
                    <CyclingVideo
                      videos={INITIAL_BACKGROUNDS}
                      style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                    />
                  </div>
                  <div className="col-md-12">
                    <h1>Premium sign in</h1>
                    <div className="description">
                      Sign in with your Patreon or GitHub account.
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-6" style={{ padding: 0 }}>
                    <a
                      href="/login/patreon"
                      className="btn btn-block"
                      style={{ fontSize: '2em', background: '#e6461a', color: '#fff', borderRadius: 0, borderBottomLeftRadius: 3 }}
                    >
                      <PatreonIcon /> Patreon
                    </a>
                  </div>
                  <div className="col-lg-6" style={{ padding: 0 }}>
                    <a
                      href="/login/github"
                      className="btn btn-block"
                      style={{ fontSize: '2em', background: '#fff', color: '#000', borderRadius: 0, borderBottomRightRadius: 3 }}
                    >
                      <GitHubMarkIcon /> GitHub
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-7 col-sm-8">
            <div className="panel">
              <div className="panel-heading">
                <h2>WoWAnalyzer premium</h2>
              </div>
              <div className="panel-body">
                Help out development and get WoWAnalyzer premium in return! An early adopter gets the following rewards:<br />
                <ul>
                  <li>our thanks.</li>
                </ul><br />

                Doesn't that sound awesome?! You too can get premium by helping out development, either by helping fund development on Patreon or by contributing something via a pull request on GitHub.<br /><br />

                <PatreonButton /> <GithubButton />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Premium;
