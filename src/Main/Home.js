import React, { Component } from 'react';

import Wrapper from 'common/Wrapper';
import ScrollFilledIcon from 'Icons/ScrollFilled';
import MegaphoneIcon from 'Icons/Megaphone';

import ChangelogPanel from './ChangelogPanel';

import MasteryRadiusImage from './Images/mastery-radius.png';
import AntorusImage from './Images/antorus.jpg';

import DiscordLogo from './Images/Discord-Logo+Wordmark-White.svg';
import DiscordBotGif from './Images/discord-bot.gif';
import SpecListing from './SpecListing';
import DiscordButton from 'Main/DiscordButton';

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
              <div className="col-lg-8 col-md-7">
                <div className="panel">
                  <div className="panel-heading">
                    <h2>The World of Warcraft Analyzer</h2>
                  </div>
                  <div className="panel-body">
                    <img src={MasteryRadiusImage} alt="Mastery radius" className="pull-right" style={{ margin: 15 }} />
                    WoW Analyzer is a comprehensive tool for analyzing your performance based on important metrics for your spec. You will need a Warcraft Logs report with advanced combat logging enabled to start. Private logs can not be used, if your guild has private logs you will have to <a href="https://www.warcraftlogs.com/help/start/">upload your own logs</a> or change the existing logs to the <i>unlisted</i> privacy option instead.<br /><br />

                    Here are some interesting examples: <a href="/report/LRchdHVAmWtNQ8Fj/22-Mythic+Harjatan+-+Kill+(5:54)/Zerotorescue" className="Paladin">Holy Paladin</a>, <a href="/report/KbQnkMHZmqWgtXwz/33-Heroic+Krosus+-+Kill+(2:55)/Zerotorescue" className="Priest">Discipline Priest</a> and <a href="/report/dcDkhfMR6nG2XxVr/35-Normal+Gul'dan+-+Kill+(5:56)/Zerotorescue" className="Monk">Brewmaster Monk</a>.
                    {/* Your logs are welcome. Do note they shouldn't be top logs, they're generally not *that* interesting. They're mostly just my logs since I have permission to use those :') */}
                    <br /><br />

                    Feature requests (<dfn data-tip="Provided that you're not using one of Microsoft's browsers.">and bug reports*</dfn>) are welcome! On <a href="https://discord.gg/AxphPxU">Discord</a> or create an issue <a href={'https://github.com/WoWAnalyzer/WoWAnalyzer/issues'}>here</a>.
                  </div>
                </div>

                <div className="panel image-overlay" style={{ backgroundImage: `url(${AntorusImage})`, paddingTop: 350 }}>
                  <div className="panel-body">
                    <div className="row">
                      <div className="col-md-10">
                        <h1>Updated for Antorus</h1>
                        <div className="description">
                          We've been working hard to implement all the new trinkets and tier bonuses available in the new raid <i>Antorus, the Burning Throne</i>. Let us know on <a href="https://discord.gg/AxphPxU">Discord</a> or <a href="https://github.com/WoWAnalyzer/WoWAnalyzer">GitHub</a> if you're still missing anything.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="panel">
                  <div className="panel-heading">
                    <h2>The WoWAnalyzer Discord bot</h2>
                  </div>
                  <div className="panel-body" style={{ padding: 0, overflow: 'hidden', borderBottomLeftRadius: 5, borderBottomRightRadius: 5 }}>
                    <div className="flex wrapable">
                      <div className="flex-main" style={{ padding: '20px 15px', minWidth: 300 }}>
                        <div className="flex">
                          <div className="flex-sub" style={{ padding: 5 }}>
                            <img src="/favicon.png" alt="Logo" style={{ width: 80, float: 'left' }} />
                          </div>
                          <div className="flex-main" style={{ fontSize: 24, padding: '5px 15px', lineHeight: 1.4 }}>
                            Introducing the <b>WoWAnalyzer</b> <img src={DiscordLogo} alt="Discord logo" style={{ height: '2em', marginTop: 3 }} /> bot
                          </div>
                        </div>
                        <div className="text-center">
                          <div style={{ fontSize: 16, margin: '10px 25px 20px 25px' }}>
                            Get users to analyze themselves without lifting a finger (even if they don't read the pins).<br />
                          </div>
                          <div style={{ marginBottom: 7 }}>
                            <a
                              className="btn btn-default btn-lg"
                              style={{ borderRadius: 0 }}
                              href="https://discordapp.com/oauth2/authorize?&client_id=368144406181838861&scope=bot&permissions=3072"
                            >
                              Add to Discord
                            </a>
                          </div>

                          <a href="https://github.com/WoWAnalyzer/DiscordBot#wowanalyzer-discord-bot-">More info</a>
                        </div>
                      </div>
                      <div className="flex-sub">
                        <img src={DiscordBotGif} alt="Bot example gif" style={{ height: 300 }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-4 col-md-5">
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
                <div className="panel">
                  <div className="panel-heading">
                    <h2>Discord</h2>
                  </div>
                  <div className="panel-body" style={{ textAlign: 'justify' }}>
                    Join us on Discord with any questions, suggestions or for more information about contributing.<br /><br />
                    <DiscordButton />
                  </div>
                </div>
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
