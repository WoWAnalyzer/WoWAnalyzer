import React from 'react';

import DiscordLogo from 'Main/Images/Discord-Logo+Wordmark-White.svg';
import RegularArticle from 'Main/News/RegularArticle';

import DiscordBotGif from './discord-bot.gif';

// noinspection RequiredAttributes

export default {
  date: new Date('2017-12-24'),
  title: 'The WoWAnalyzer Discord bot',
  full: (
    <RegularArticle bodyStyle={{ padding: 0, overflow: 'hidden', borderBottomLeftRadius: 5, borderBottomRightRadius: 5 }}>
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
    </RegularArticle>
  ),
};
