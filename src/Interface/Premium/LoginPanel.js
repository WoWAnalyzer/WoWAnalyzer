import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { CSSTransitionGroup } from 'react-transition-group';
import Textfit from 'react-textfit';

import PatreonIcon from 'Interface/Icons/PatreonTiny';
import GitHubMarkIcon from 'Interface/Icons/GitHubMarkLarge';
import LogoutIcon from 'Interface/Icons/Logout';
import CyclingVideo from 'Interface/common/CyclingVideo';

import { logout } from 'Interface/actions/user';
import { getUser } from 'Interface/selectors/user';

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

export class LoginPanel extends React.PureComponent {
  static propTypes = {
    user: PropTypes.shape({
      name: PropTypes.string,
      avatar: PropTypes.string,
      premium: PropTypes.bool,
    }),
    logout: PropTypes.func,
  };

  constructor() {
    super();
    this.handleClickLogout = this.handleClickLogout.bind(this);
  }

  handleClickLogout(e) {
    e.preventDefault();
    this.props.logout();
  }

  renderLoggedIn() {
    const { user } = this.props;

    const hasPremium = user.premium;
    const platform = user.github && user.github.premium ? 'github' : 'patreon';

    return (
      <div className={`logged-in ${platform}`}>
        <div>
          <div className="logo">
            {platform === 'github' && <GitHubMarkIcon style={{ marginTop: 0 }} />}
            {platform === 'patreon' && <PatreonIcon style={{ marginTop: 0 }} />}
          </div>

          <div className="text">
            <h1>
              <Textfit mode="single">
                Hello {user.name}.
              </Textfit>
            </h1>
            {hasPremium ? (
              <div className="description">
                Super thank you for your support! We hope you'll enjoy WoWAnalyzer Premium.
              </div>
            ) : (
              <div className="description">
                You haven't unlocked Premium yet. See the panel to the right for more info.
              </div>
            )}
            <div className="logout">
              <a href="/logout" onClick={this.handleClickLogout}>
                <LogoutIcon /> Logout
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { user } = this.props;

    return (
      <div className="panel" style={{ overflow: 'hidden' }}>
        <div className="panel-body" style={{ padding: '0 15px', position: 'relative' }}>
          <CSSTransitionGroup
            transitionName="logged-in"
            transitionEnterTimeout={1000}
            transitionLeaveTimeout={1000}
          >
            {user && this.renderLoggedIn()}
          </CSSTransitionGroup>

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
                href={`${process.env.REACT_APP_SERVER_BASE}login/patreon`}
                className="btn btn-block patreon-login"
              >
                <PatreonIcon /> Patreon
              </a>
            </div>
            <div className="col-lg-6" style={{ padding: 0 }}>
              <a
                href={`${process.env.REACT_APP_SERVER_BASE}login/github`}
                className="btn btn-block github-login"
              >
                <GitHubMarkIcon /> GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  user: getUser(state),
});
export default connect(mapStateToProps, {
  logout,
})(LoginPanel);
