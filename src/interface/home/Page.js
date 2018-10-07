import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Trans, t } from '@lingui/macro';

import ScrollFilledIcon from 'interface/icons/ScrollFilled';
import MegaphoneIcon from 'interface/icons/Megaphone';
import DiscordIcon from 'interface/icons/DiscordTiny';
import GitHubIcon from 'interface/icons/GitHubMarkLarge';
import PatreonIcon from 'interface/icons/PatreonTiny';
import TwitterIcon from 'interface/icons/Twitter';

import { i18n } from 'interface/RootLocalizationProvider';
import DelayRender from 'interface/common/DelayRender';
import { hasPremium } from 'interface/selectors/user';
import SectionDivider from 'interface/home/SectionDivider';
import News from 'interface/news';
import SpecListing from 'interface/home/SpecListing';
import DiscordButton from 'interface/common/thirdpartybuttons/Discord';
import DocumentTitle from 'interface/common/DocumentTitle';
import MasteryRadiusImage from 'interface/images/mastery-radius.png';
import ChangelogPanel from 'interface/home/ChangelogPanel';

import DiscordBanner from './images/discord-banner.jpg';
import ReportHistory from './ReportHistory/Panel';

import './Home.css';

class Home extends React.PureComponent {
  static propTypes = {
    premium: PropTypes.bool,
  };
  static defaultProps = {
    premium: false,
  };

  render() {
    const { premium } = this.props;

    return (
      <div className="container">
        <DocumentTitle /> {/* prettiest is if the Home page has no title at all */}

        <section>
          <header>
            <div className="row">
              <div className="col-md-12">
                <h1 id="Announcements"><MegaphoneIcon /> <Trans>Announcements</Trans></h1>
              </div>
            </div>
          </header>

          <div className="row">
            <div className="col-lg-4 col-md-5">
              <ReportHistory />

              <div className="panel">
                <div className="panel-heading">
                  <h2><Trans>About WoWAnalyzer</Trans></h2>
                </div>
                <div className="panel-body">
                  <img src={MasteryRadiusImage} alt="Mastery radius" className="pull-right" style={{ margin: 15 }} />
                  <Trans>
                    WoWAnalyzer is a tool to help you analyze and improve your World of Warcraft raiding performance through various relevant metrics and gameplay suggestions.<br /><br />

                    We give detailed insight into various things such as cast behavior, buff uptimes, downtime, cooldown usage, wasted resources and more. We also give insight into useful and interesting statistics such as the (throughput) gain of your talents, trinkets, traits, set bonuses, and other special items and effects.<br /><br />

                    Using all this data we provide automatic gameplay suggestions that analyzes your actual behavior in a fight and gives pointers to help you improve your performance.<br /><br />

                    The analysis is custom for each specialization to focus on the things that are important for your spec. It's created by and together with class experts to give you the best possible insights.<br /><br />

                    Using WoWAnalyzer you will find a wealth of information about the mechanics of your spec, your actual behavior in fights and the optimal playstyle. Analyze your raids after every raid night to continuously improve your performance and become a better player. Whether you're a new player learning a spec for the first time or an experienced player looking for information to help you min-max, WoWAnalyzer is a great tool to have in your arsenal!
                  </Trans><br /><br />

                  <Trans>Wondering how to use WoWAnalyzer? See the <a href="https://www.wowhead.com/how-to-use-wowanalyzer"><img src="/img/wowhead-tiny.png" style={{ height: '1em' }} alt="Wowhead" /> Wowhead guide</a>. If you want to see an example report, click on your spec in the <a href="/#Specializations">Specializations</a> list.</Trans>
                </div>
              </div>

              <div className="panel">
                <div className="panel-heading" style={{ padding: 0 }}>
                  <img src={DiscordBanner} alt="Discord" style={{ width: '100%' }} />
                </div>
                <div className="panel-body" style={{ textAlign: 'justify' }}>
                  <Trans>Join us on Discord with any questions, suggestions or for more information about contributing.</Trans><br /><br />
                  <DiscordButton />
                </div>
              </div>

              <div className="panel">
                <div className="panel-heading">
                  <h2><Trans>Help wanted</Trans></h2>
                </div>
                <div className="panel-body" style={{ textAlign: 'justify', padding: 0, overflow: 'hidden', borderBottomLeftRadius: 5, borderBottomRightRadius: 5 }}>
                  <div style={{ padding: '15px 20px', marginBottom: 5 }}>
                    <Trans>WoWAnalyzer is completely open source and relies on contributors to implement spec-specific analysis. You don't need to to do anything special to contribute. See the <a href="https://github.com/WoWAnalyzer/WoWAnalyzer#contributing">contributing guidelines</a> if you want to give it a try.</Trans>
                  </div>

                  <DelayRender delay={250}>
                    <img src="https://media.giphy.com/media/l1J3vV5lCmv8qx16M/giphy.gif" style={{ width: '100%' }} alt={i18n._(t`Sharing is caring`)} />
                  </DelayRender>
                </div>
              </div>

              {!premium && (
                <div className="panel">
                  <div className="panel-heading">
                    <h2><Trans>Advertisement</Trans></h2>
                  </div>
                  <div className="panel-body" style={{ padding: 0, overflow: 'hidden', textAlign: 'center', background: '#222' }}>
                    <a href="https://www.patreon.com/wowanalyzer">
                      <img src="/img/patreon6.jpg" alt={i18n._(t`WoWAnalyzer Premium`)} />
                    </a>
                  </div>
                  <div className="panel-footer" style={{ lineHeight: 1 }}>
                    <a href="mailto:wowanalyzer-ad@martijnhols.nl" className="text-muted"><Trans>Your ad here?</Trans></a>
                  </div>
                </div>
              )}

              <div>
                <a href="https://wowanalyzer.com/discord" target="_blank" rel="noopener noreferrer" className="btn" style={{ fontSize: 24 }}>
                  <DiscordIcon style={{ fontSize: '1.4em', color: '#7289DA' }} /> Discord
                </a><br />
                <a href="https://github.com/WoWAnalyzer/WoWAnalyzer" target="_blank" rel="noopener noreferrer" className="btn" style={{ fontSize: 24 }}>
                  <GitHubIcon style={{ fontSize: '1.4em', color: '#fff' }} /> GitHub
                </a><br />
                <a href="https://www.patreon.com/wowanalyzer" target="_blank" rel="noopener noreferrer" className="btn" style={{ fontSize: 24 }}>
                  <PatreonIcon style={{ fontSize: '1.4em' }} colored /> Patreon
                </a><br />
                <a href="https://www.twitter.com/wowanalyzer" target="_blank" rel="noopener noreferrer" className="btn" style={{ fontSize: 24 }}>
                  <TwitterIcon style={{ fontSize: '1.4em' }} colored /> @WoWAnalyzer
                </a>
              </div>
            </div>
            <div className="col-lg-8 col-md-7">
              <News topAnchor="Announcements" />
            </div>
          </div>
        </section>

        <SectionDivider />

        <SpecListing />

        <SectionDivider />

        <DelayRender delay={200}>
          <section>
            <header>
              <div className="row">
                <div className="col-md-12 text-center">
                  <h1><ScrollFilledIcon /> <Trans>Changelog</Trans></h1>
                </div>
              </div>
            </header>

            <div className="row">
              <div className="col-md-12">
                <ChangelogPanel />
              </div>
            </div>
          </section>
        </DelayRender>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  premium: hasPremium(state),
});

export default connect(
  mapStateToProps
)(Home);
