import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ReactTooltip from 'react-tooltip';

import PremiumIcon from 'interface/icons/Premium';
import ViralContentIcon from 'interface/icons/ViralContent';
import WebBannerIcon from 'interface/icons/WebBanner';
import DiscordIcon from 'interface/icons/DiscordTiny';
import PatreonButton from 'interface/common/thirdpartybuttons/Patreon';
import GitHubButton from 'interface/common/thirdpartybuttons/GitHub';

import { logout } from 'interface/actions/user';
import { getUser } from 'interface/selectors/user';

import './index.css';

import LoginPanel from './LoginPanel';

export class Premium extends React.PureComponent {
  static propTypes = {
    user: PropTypes.shape({
      name: PropTypes.string,
      avatar: PropTypes.string,
      premium: PropTypes.bool,
    }),
    dateToLocaleString: PropTypes.func,
  };
  static defaultProps = {
    // We need to override this in tests to avoid different results in different environments.
    dateToLocaleString: date => date.toLocaleString(),
  };

  componentDidUpdate() {
    ReactTooltip.rebuild();
  }

  render() {
    const { user } = this.props;

    return (
      <div className="row">
        <div className="col-lg-3 col-lg-offset-1 col-md-4 col-sm-5">
          <LoginPanel />
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

                  <GitHubButton />
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
                  <>
                    {' '}because of a recent GitHub contribution (active until {this.props.dateToLocaleString(new Date(user.github.expires))})
                  </>
                )}
                . {user.premium ? 'Awesome!' : 'You can get Premium by becoming a Patron on Patreon or by making a contribution to application on GitHub. Try logging in again if you wish to refresh your status.'}
              </div>
            </div>
          )}
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
