import React from 'react';
import PropTypes from 'prop-types';
import { t, Trans } from '@lingui/macro';
import { connect } from 'react-redux';

import PremiumIcon from 'interface/icons/Premium';
import ViralContentIcon from 'interface/icons/ViralContent';
import WebBannerIcon from 'interface/icons/WebBanner';
import DiscordIcon from 'interface/icons/DiscordTiny';
import PatreonButton from 'interface/common/thirdpartybuttons/Patreon';
import GitHubButton from 'interface/common/thirdpartybuttons/GitHub';
import { TooltipElement } from 'common/Tooltip';
import { logout } from 'interface/actions/user';
import { getUser } from 'interface/selectors/user';
import DocumentTitle from 'interface/DocumentTitle';

import './PremiumPage.scss';

import LoginPanel from '../PremiumLoginPanel';

export class PremiumPage extends React.PureComponent {
  static propTypes = {
    user: PropTypes.oneOfType([
      PropTypes.shape({
        name: PropTypes.string,
        avatar: PropTypes.string,
        premium: PropTypes.bool,
      }),
      PropTypes.bool, // false; logged out
    ]),
    dateToLocaleString: PropTypes.func,
  };
  static defaultProps = {
    // We need to override this in tests to avoid different results in different environments.
    dateToLocaleString: (date) => date.toLocaleString(),
  };

  render() {
    const { user } = this.props;

    return (
      <>
        <DocumentTitle title="Premium" />
        <div className="premium row">
          <div className="col-md-4 col-sm-5">
            <LoginPanel />
          </div>
          <div className="col-md-8 col-sm-7">
            <div className="panel">
              <div className="panel-heading">
                <h1>
                  <Trans id="interface.premiumPage.premium">WoWAnalyzer premium</Trans>
                </h1>
              </div>
              <div className="panel-body pad">
                <PremiumIcon
                  style={{ fontSize: '6em', float: 'right', color: '#fab700', marginTop: 0 }}
                />
                <div style={{ fontSize: '1.4em', fontWeight: 400 }}>
                  <Trans id="interface.premiumPage.premium.helpout">
                    Help out development and unlock{' '}
                    <span style={{ color: '#fab700', fontWeight: 700 }}>WoWAnalyzer Premium</span>!
                  </Trans>
                </div>

                <div className="row" style={{ marginBottom: 5, marginTop: 60 }}>
                  <div className="col-md-12 text-center text-muted">
                    <Trans id="interface.premiumPage.howToUnlock">
                      How to unlock WoWAnalyzer Premium:
                    </Trans>
                  </div>
                </div>
                <div className="row flex">
                  <div className="col-md-6" style={{ borderRight: '1px solid #aaa' }}>
                    <Trans id="interface.premiumPage.helpPatreon">
                      <h2>Patreon</h2>
                      Help fund further development by becoming a patron on Patreon.
                    </Trans>
                    <br />
                    <br />

                    <PatreonButton />
                  </div>
                  <div className="col-md-6">
                    <Trans id="interface.premiumPage.helpGitHub">
                      <h2>GitHub</h2>
                      Improve the analysis of a spec or build a new feature to get 1 month of
                      Premium free
                      <TooltipElement
                        content={t({
                          id: 'interface.premiumPage.githubTooltip',
                          message: `Only commits that are merged to the main branch are eligible. Your work will have to pass a pull request review before it can be merged.`,
                        })}
                      >
                        *
                      </TooltipElement>
                      .
                    </Trans>
                    <br />
                    <br />

                    <GitHubButton />
                  </div>
                </div>

                <div className="row" style={{ marginTop: 15 }}>
                  <div className="col-md-12 text-center text-muted">
                    <Trans id="interface.premiumPage.loginInstructions">
                      After unlocking Premium, log in using the buttons to the left.
                    </Trans>
                  </div>
                </div>

                <div className="row" style={{ marginBottom: 5, marginTop: 60 }}>
                  <div className="col-md-12 text-center text-muted">
                    <Trans id="interface.premiumPage.unlocks">
                      WoWAnalyzer Premium unlocks the following things:
                    </Trans>
                  </div>
                </div>
                <div>
                  <div className="premium-feature flex">
                    <div className="content-middle flex-sub">
                      <ViralContentIcon />
                    </div>
                    <div className="flex-main">
                      <Trans id="interface.premiumPage.unlocks.new">
                        <h2>New things</h2>
                        <strong>Nothing develops itself.</strong> Your contributions will help fund
                        new things and improvements for the site, making it even better. You will
                        also unlock additional features to help with your analysis.
                      </Trans>
                    </div>
                  </div>
                  <div className="premium-feature flex">
                    <div className="content-middle flex-sub">
                      <ViralContentIcon />
                    </div>
                    <div className="flex-main">
                      <Trans id="interface.premiumPage.unlocks.updates">
                        <h2>Updates for patches</h2>
                        <strong>Updating for patches is a lot of work.</strong> We need to apply all
                        spell changes, add new traits, add support for the new fights, make
                        screenshots, add fight phases, buffs and debuffs, etc. Your contributions
                        make it possible for us to keep specs updated as they're changed in patches.
                      </Trans>
                    </div>
                  </div>
                  <div className="premium-feature flex">
                    <div className="content-middle flex-sub">
                      <WebBannerIcon />
                    </div>
                    <div className="flex-main">
                      <Trans id="interface.premiumPage.unlocks.noAds">
                        <h2>No ads</h2>
                        <strong>Nobody likes them, but we need them.</strong> Any contribution is
                        worth more than the ads, so we'll remove ads from the platform for you so
                        you can consume our content with less distractions and less clutter.
                      </Trans>
                    </div>
                  </div>
                  <div className="premium-feature flex">
                    <div className="content-middle flex-sub">
                      <DiscordIcon style={{ color: '#ff8000' }} />
                    </div>
                    <div className="flex-main">
                      <Trans id="interface.premiumPage.unlocks.discord">
                        <h2>Discord name color</h2>
                        <strong>
                          We'll help anyone, but sometimes we can't avoid favoritism.
                        </strong>{' '}
                        Get a distinct Discord name color befitting your contribution. See Patreon
                        for Patron specific name colors. Serious GitHub contributors get the yellow
                        contributor name color.
                      </Trans>
                    </div>
                  </div>
                  <div className="premium-feature flex">
                    <div className="content-middle flex-sub">
                      <DiscordIcon />
                    </div>
                    <div className="flex-main">
                      <Trans id="interface.premiumPage.unlocks.discordChannels">
                        <h2>Access to secret channels on Discord</h2>
                        <strong>You don't know what you're missing out on.</strong> Get access to
                        special Discord channels to discuss things privately in the sub-community.
                      </Trans>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {user && (
              <div className="panel">
                <div className="panel-heading">
                  <h2>
                    <Trans id="interface.premiumPage.you">You</Trans>
                  </h2>
                </div>
                <div className="panel-body pad">
                  <Trans id="interface.premiumPage.status">
                    Hello {user.name}. Your Premium is currently{' '}
                    {user.premium ? (
                      <span className="text-success">
                        {t({
                          id: 'interface.premiumPage.status.active',
                          message: `Active`,
                        })}
                      </span>
                    ) : (
                      <span className="text-danger">
                        {t({
                          id: 'interface.premiumPage.status.inactive',
                          message: `Inactive`,
                        })}
                      </span>
                    )}{' '}
                    {user.patreon &&
                      user.patreon.premium &&
                      ` ${t({
                        id: 'interface.premiumPage.status.patreon',
                        message: `because of your Patreonage`,
                      })}`}{' '}
                    {user.github &&
                      user.github.premium &&
                      ` ${t({
                        id: 'interface.premiumPage.status.gitHub',
                        message: `because of a recent GitHub contribution (active until ${this.props.dateToLocaleString(
                          new Date(user.github.expires),
                        )})`,
                      })}`}
                    .{' '}
                    {user.premium
                      ? t({
                          id: 'interface.premiumPage.status.userHasPremium',
                          message: `Awesome!`,
                        })
                      : t({
                          id: 'interface.premiumPage.status.getPremium',
                          message: `You can get Premium by becoming a Patron on Patreon or by making a contribution to application on GitHub. Try logging in again if you wish to refresh your status.`,
                        })}
                  </Trans>
                </div>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  user: getUser(state),
});
export default connect(mapStateToProps, {
  logout,
})(PremiumPage);
