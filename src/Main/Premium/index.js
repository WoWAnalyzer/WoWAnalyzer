import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ReactTooltip from 'react-tooltip';
import Textfit from 'react-textfit';
import { CSSTransitionGroup } from 'react-transition-group';

import PatreonIcon from 'Icons/PatreonTiny';
import GitHubMarkIcon from 'Icons/GitHubMarkLarge';
import PremiumIcon from 'Icons/Premium';
import ViralContentIcon from 'Icons/ViralContent';
import WebBannerIcon from 'Icons/WebBanner';
import DiscordIcon from 'Icons/DiscordTiny';
import LogoutIcon from 'Icons/Logout';

import { logout } from 'actions/user';
import { getUser } from 'selectors/user';
import PatreonButton from 'Main/PatreonButton';
import GithubButton from 'Main/GithubButton';

import CyclingVideo from './CyclingVideo';
import './index.css';

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

export class Premium extends React.PureComponent {
  static propTypes = {
    user: PropTypes.shape({
      name: PropTypes.string,
      avatar: PropTypes.string,
      premium: PropTypes.bool,
    }),
    dateToLocaleString: PropTypes.func,
    logout: PropTypes.func,
  };
  static defaultProps = {
    // We need to override this in tests to avoid different results in different environments.
    dateToLocaleString: date => date.toLocaleString(),
  };

  constructor() {
    super();
    this.handleClickLogout = this.handleClickLogout.bind(this);
  }

  componentDidUpdate() {
    ReactTooltip.rebuild();
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
      <div className="container">
        <div className="row">
          <div className="col-lg-3 col-lg-offset-1 col-md-4 col-sm-5">
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
          </div>
          <div className="col-lg-7 col-md-8 col-sm-7">
            <div className="panel">
              <div className="panel-heading">
                <h2>WoWAnalyzer premium</h2>
              </div>
              <div className="panel-body">
                <PremiumIcon style={{ fontSize: '6em', float: 'right', color: '#e45a5a', marginTop: 0 }} />
                <div style={{ fontSize: '1.4em', fontWeight: 400 }}>
                  Help out development to unlock <span style={{ color: '#e45a5a', fontWeight: 700 }}>WoWAnalyzer Premium</span>!
                </div>
                <br />

                <div className="row" style={{ marginBottom: 5, marginTop: '2em' }}>
                  <div className="col-md-12 text-center text-muted">
                    How to unlock WoWAnalyzer Premium:
                  </div>
                </div>
                <div className="row flex">
                  <div className="col-md-6" style={{ borderRight: '1px solid #aaa' }}>
                    <h2>Patreon</h2>
                    Help fund further development by becoming a patron on Patreon. Pledge whatever you want!<br /><br />

                    <PatreonButton />
                  </div>
                  <div className="col-md-6">
                    <h2>GitHub</h2>
                    Improve the analysis of a spec or build a new feature to get 1 month of Premium free<dfn data-tip="Only commits that are merged to the master branch are eligible. Your work will have to pass a pull request review before it can be merged.">*</dfn>.<br /><br />

                    <GithubButton />
                  </div>
                </div>

                <div className="row" style={{ marginBottom: 5, marginTop: '2em' }}>
                  <div className="col-md-12 text-center text-muted">
                    WoWAnalyzer Premium unlocks the following things:
                  </div>
                </div>

                <div>
                  <div className="premium-feature flex">
                    <div className="content-middle flex-sub">
                      <ViralContentIcon />
                    </div>
                    <div className="flex-main">
                      <h2>New things</h2>

                      Your contributions will help fund new things for the site, making it even better.<br /><br />

                      We'll post bounties on the best ideas via <a href="https://www.bountysource.com/teams/wowanalyzer">Bountysource</a> as a motivation to get developers to build them.
                    </div>
                  </div>
                  <div className="premium-feature flex">
                    <div className="content-middle flex-sub">
                      <WebBannerIcon />
                    </div>
                    <div className="flex-main">
                      <h2>No ads</h2>

                      We'll remove ads from the platform for you so you can consume our content with less distractions and less clutter.
                    </div>
                  </div>
                  <div className="premium-feature flex">
                    <div className="content-middle flex-sub">
                      <DiscordIcon style={{ color: '#ff8000' }} />
                    </div>
                    <div className="flex-main">
                      <h2>Discord name color</h2>

                      Get a distinct Discord name color befitting your contribution. See Patreon for Patron specific name colors. Serious GitHub contributors get the yellow contributor name color.
                    </div>
                  </div>
                  <div className="premium-feature flex">
                    <div className="content-middle flex-sub">
                      <DiscordIcon />
                    </div>
                    <div className="flex-main">
                      <h2>Access to secret channels on Discord</h2>

                      Get access to special Discord channels to discuss things privately in the sub-community.
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {user && (
              <div className="panel">
                <div className="panel-heading">
                  <h2>You</h2>
                </div>
                <div className="panel-body">
                  Hello {user.name}. Your Premium is currently {user.premium ? <span className="text-success">Active</span> : <span className="text-danger">Inactive</span>}
                  {user.patreon && user.patreon.premium && ' because of your Patreonage'}
                  {user.github && user.github.premium && (
                    <React.Fragment>
                      {' '}because of a recent GitHub contribution (active until {this.props.dateToLocaleString(new Date(user.github.expires))})
                    </React.Fragment>
                  )}
                  . {user.premium ? 'Awesome!' : 'You can get Premium by becoming a Patron on Patreon or by making a contribution to application on GitHub. Try logging in again if you wish to refresh your status.'}
                </div>
              </div>
            )}
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
})(Premium);
