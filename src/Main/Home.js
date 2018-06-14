import React from 'react';

import ScrollFilledIcon from 'Icons/ScrollFilled';
import MegaphoneIcon from 'Icons/Megaphone';

import DelayRender from 'common/DelayRender';

import DiscordButton from './DiscordButton';
import ChangelogPanel from './ChangelogPanel';
import DiscordBanner from './Images/discord-banner.jpg';
import SpecListing from './SpecListing';
import News from './News';
import ReportHistory from './ReportHistory';

class Home extends React.PureComponent {
  render() {
    return (
      <DelayRender delay={0} fallback={<div style={{ height: 2000 }} />}>
        <section>
          <div className="container">
            <header>
              <div className="row">
                <div className="col-md-12">
                  <h1 id="Announcements"><MegaphoneIcon /> Announcements</h1>
                </div>
              </div>
            </header>

            <div className="row">
              <div className="col-lg-8 col-md-7">
                <News />
              </div>
              <div className="col-lg-4 col-md-5">
                <div className="panel">
                  <div className="panel-heading">
                    <h2>Recently viewed reports</h2>
                  </div>
                  <div className="panel-body" style={{ padding: 0 }}>
                    <ReportHistory />
                  </div>
                </div>

                <div className="panel">
                  <div className="panel-heading" style={{ padding: 0 }}>
                    <img src={DiscordBanner} alt="Discord" style={{ width: '100%' }} />
                  </div>
                  <div className="panel-body" style={{ textAlign: 'justify' }}>
                    Join us on Discord with any questions, suggestions or for more information about contributing.<br /><br />
                    <DiscordButton />
                  </div>
                </div>

                <div className="panel">
                  <div className="panel-heading">
                    <h2>Help wanted</h2>
                  </div>
                  <div className="panel-body" style={{ textAlign: 'justify', padding: 0, overflow: 'hidden', borderBottomLeftRadius: 5, borderBottomRightRadius: 5 }}>
                    <div style={{ padding: '15px 20px', marginBottom: 5 }}>
                      WoWAnalyzer is rapidly expanding with more things being analyzed every day. We need your help to continue expanding and keep everything accurate. Are you a coder or graphic designer? Check our <a href="https://github.com/WoWAnalyzer/WoWAnalyzer">GitHub project</a> (hint: see <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/labels/help%20wanted" className="gh-label">help wanted</a> and <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/labels/good%20first%20issue" className="gh-label" style={{ backgroundColor: '#5319e7' }}>good first issue</a>, or maybe <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/labels/%24bounty" className="gh-label" style={{ backgroundColor: '#64f235', color: '#000' }}>$bounty</a> interests you) or <a href="https://discord.gg/AxphPxU">Discord</a> to find out how you could contribute.
                    </div>

                    {/* old: https://media.giphy.com/media/l1J3vV5lCmv8qx16M/giphy.gif */}
                    {/*<img src="https://media.giphy.com/media/N56zWre4o5UlO/giphy.gif" style={{ width: '100%' }} alt="Sharing is caring" />*/}
                  </div>
                </div>

                <div className="panel">
                  <div className="panel-heading">
                    <h2>Advertisement</h2>
                  </div>
                  <div className="panel-body" style={{ padding: 0, overflow: 'hidden' }}>
                    <a href="https://www.patreon.com/wowanalyzer">
                      <img src={`/img/patreon${Math.floor(Math.random() * 6 + 1)}.jpg`} alt="Patreon" />
                    </a>
                  </div>
                  <div className="panel-footer" style={{ lineHeight: 1 }}>
                    <a href="mailto:wowanalyzer-ad@martijnhols.nl" className="text-muted">Your ad here?</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <DelayRender delay={0}>
          <SpecListing />

          <section>
            <div className="container">
              <header>
                <div className="row">
                  <div className="col-md-12 text-center">
                    <h1><ScrollFilledIcon /> Changelog</h1>
                  </div>
                </div>
              </header>

              <div className="row">
                <div className="col-md-12">
                  <ChangelogPanel />
                </div>
              </div>
            </div>
          </section>
        </DelayRender>
      </DelayRender>
    );
  }
}

export default Home;
