import React, { Component } from 'react';

import ScrollFilledIcon from 'Icons/ScrollFilled';
import MegaphoneIcon from 'Icons/Megaphone';
import Wrapper from 'common/Wrapper';

import DiscordButton from './DiscordButton';
import ChangelogPanel from './ChangelogPanel';
import MasteryRadiusImage from './Images/mastery-radius.png';
import DiscordBanner from './Images/discord-banner.jpg';
import SpecListing from './SpecListing';
import News from './News';

class Home extends Component {
  render() {
    return (
      <Wrapper>
        <section>
          <div className="container">
            <header>
              <div className="row">
                <div className="col-md-12">
                  <h1><MegaphoneIcon /> Announcements</h1>
                </div>
              </div>
            </header>

            <div className="row">
              <div className="col-lg-4 col-md-5">
                <div className="panel">
                  <div className="panel-heading">
                    <h2>The World of Warcraft Analyzer</h2>
                  </div>
                  <div className="panel-body" style={{ textAlign: 'justify' }}>
                    <img src={MasteryRadiusImage} alt="Mastery radius" className="pull-right" style={{ margin: 15 }} />
                    WoWAnalyzer is a comprehensive tool for analyzing your performance based on important metrics for your spec. You will need a Warcraft Logs report with advanced combat logging enabled to start. Private logs can not be used, if your guild has private logs you will have to <a href="https://www.warcraftlogs.com/help/start/">upload your own logs</a> or change the existing logs to the <i>unlisted</i> privacy option instead.<br /><br />

                    Here are some interesting examples: <a href="/report/hNqbFwd7Mx3G1KnZ/18-Mythic+Antoran+High+Command+-+Kill+(6:51)/Taffly" className="Paladin">Holy Paladin</a>, <a href="/report/wmfhYRxTpvZyHLdF/1-Mythic+Garothi+Worldbreaker+-+Kill+(4:48)/Hassebewlen" className="Priest">Shadow Priest</a>, <a href="/report/mtjvg4FQ6A8RGz1V/3-Mythic+Garothi+Worldbreaker+-+Kill+(6:18)/Paranema" className="Shaman">Restoration Shaman</a>, <a href="/report/wXPNHQqrjmVbafJL/38-Mythic+Garothi+Worldbreaker+-+Kill+(5:05)/Maareczek" className="Hunter">Marksmanship Hunter</a>, <a href="/report/2MNkGb36FW1gX8zx/15-Mythic+Imonar+the+Soulhunter+-+Kill+(7:45)/Anom" className="Monk">Mistweaver Monk</a>, <a href="/report/t3wKdDkB7fZqbmWz/1-Normal+Garothi+Worldbreaker+-+Kill+(4:24)/Sref" className="Mage">Frost Mage</a>, <a href="/report/72t9vbcAqdpVRfBQ/12-Mythic+Garothi+Worldbreaker+-+Kill+(6:15)/Maxweii" className="DeathKnight">Unholy Death Knight</a> and <a href="/report/hxzFPBaWLJrG1NQR/24-Heroic+Imonar+the+Soulhunter+-+Kill+(3:38)/Putro" className="Hunter">Beast Mastery Hunter</a>. Let us know if you want your logs to be featured here.
                    <br /><br />

                    Feature requests and bug reports are welcome! On <a href="https://discord.gg/AxphPxU">Discord</a> or create an issue <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/issues">here</a>.
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
                      WoWAnalyzer is slowly expanding with more things being analyzed every day. We need your help to continue expanding and keep everything accurate. Are you a coder or graphic designer? Check our <a href="https://github.com/WoWAnalyzer/WoWAnalyzer">GitHub project</a> (hint: see <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/labels/help%20wanted" className="gh-label">help wanted</a> and <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/labels/good%20first%20issue" className="gh-label" style={{ backgroundColor: '#5319e7' }}>good first issue</a>, or maybe <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/labels/%24bounty" className="gh-label" style={{ backgroundColor: '#64f235', color: '#000' }}>$bounty</a> interests you) or <a href="https://discord.gg/AxphPxU">Discord</a> to find out how you could contribute.
                    </div>

                    {/* old: https://media.giphy.com/media/l1J3vV5lCmv8qx16M/giphy.gif */}
                    <img src="https://media.giphy.com/media/N56zWre4o5UlO/source.gif" style={{ width: '100%' }} alt="Sharing is caring" />
                  </div>
                </div>
              </div>
              <div className="col-lg-8 col-md-7">
                <News />
              </div>
            </div>
          </div>
        </section>

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
      </Wrapper>
    );
  }
}

export default Home;
