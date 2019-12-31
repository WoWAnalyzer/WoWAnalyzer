import React from 'react';
import { Trans } from '@lingui/macro';
import { Link } from 'react-router-dom';

import DocumentTitle from 'interface/DocumentTitle';
import MasteryRadiusImage from 'interface/images/mastery-radius.png';
import ChangelogPanel from 'interface/ChangelogPanel';
import Panel from 'interface/others/Panel';
import DiscordButton from 'interface/common/thirdpartybuttons/Discord';
import GithubButton from 'interface/common/thirdpartybuttons/GitHub';
import PatreonButton from 'interface/common/thirdpartybuttons/Patreon';
import DiscordLogo from 'interface/images/Discord-Logo+Wordmark-White.svg';
import DiscordBotGif from 'articles/2017-10-21-DiscordBot/discord-bot.gif';

const AboutPage = () => (
  <>
    <DocumentTitle title="About WoWAnalyzer" />

    <Panel title="About WoWAnalyzer">
      <img
        src={MasteryRadiusImage}
        alt="Mastery radius"
        className="pull-right"
        style={{ margin: 15 }}
      />
      <Trans>
        WoWAnalyzer is a tool to help you analyze and improve your World of
        Warcraft raiding performance through various relevant metrics and
        gameplay suggestions.
        <br />
        <br />
        We give detailed insight into various things such as cast behavior, buff
        uptimes, downtime, cooldown usage, wasted resources and more. We also
        give insight into useful and interesting statistics such as the
        (throughput) gain of your talents, trinkets, traits, set bonuses, and
        other special items and effects.
        <br />
        <br />
        Using all this data we provide automatic gameplay suggestions that
        analyzes your actual behavior in a fight and gives pointers to help you
        improve your performance.
        <br />
        <br />
        The analysis is custom for each specialization to focus on the things
        that are important for your spec. It's created by and together with
        class experts to give you the best possible insights.
        <br />
        <br />
        Using WoWAnalyzer you will find a wealth of information about the
        mechanics of your spec, your actual behavior in fights and the optimal
        playstyle. Analyze your raids after every raid night to continuously
        improve your performance and become a better player. Whether you're a
        new player learning a spec for the first time or an experienced player
        looking for information to help you min-max, WoWAnalyzer is a great tool
        to have in your arsenal!
      </Trans>
      <br />
      <br />
      <Trans>
        Wondering how to use WoWAnalyzer? See the{' '}
        <a href="https://www.wowhead.com/how-to-use-wowanalyzer">
          <img
            src="/img/wowhead-tiny.png"
            style={{ height: '1em' }}
            alt="Wowhead"
          />{' '}
          Wowhead guide
        </a>
        . If you want to see an example report, click on your spec in the{' '}
        <Link to="/specs">Specializations</Link> list.
      </Trans>
      <br />
      <br />
      <DiscordButton /> <GithubButton /> <PatreonButton />
    </Panel>
    <br />

    <Panel title="The WoWAnalyzer Discord bot">
      <div className="flex wrapable">
        <div
          className="flex-main"
          style={{ padding: '20px 15px', minWidth: 300 }}
        >
          <div className="flex">
            <div className="flex-sub" style={{ padding: 5 }}>
              <img
                src="/favicon.png"
                alt="Logo"
                style={{ width: 80, float: 'left' }}
              />
            </div>
            <div
              className="flex-main"
              style={{ fontSize: 24, padding: '5px 15px', lineHeight: 1.4 }}
            >
              Introducing the <b>WoWAnalyzer</b>{' '}
              <img
                src={DiscordLogo}
                alt="Discord logo"
                style={{ height: '2em', marginTop: 3 }}
              />{' '}
              bot
            </div>
          </div>
          <div className="text-center">
            <div style={{ fontSize: 16, margin: '10px 25px 20px 25px' }}>
              Get users to analyze themselves without lifting a finger (even if
              they don't read the pins).
              <br />
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

            <a href="https://github.com/WoWAnalyzer/DiscordBot#wowanalyzer-discord-bot-">
              More info
            </a>
          </div>
        </div>
        <div className="flex-sub">
          <img
            src={DiscordBotGif}
            alt="Bot example gif"
            style={{ height: 300 }}
          />
        </div>
      </div>
    </Panel>
    <br />

    <ChangelogPanel />
  </>
);

export default AboutPage;
