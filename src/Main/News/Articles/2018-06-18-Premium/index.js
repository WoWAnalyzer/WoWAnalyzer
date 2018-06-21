import React from 'react';
import { Link } from 'react-router-dom';

import PremiumIcon from 'Icons/Premium';
import PatreonIcon from 'Icons/Patreon';
import GitHubIcon from 'Icons/GitHub';

import { Zerotorescue } from 'CONTRIBUTORS';
import RegularArticle from 'Main/News/RegularArticle';

export default (
  <RegularArticle title="WoWAnalyzer Premium" publishedAt="2018-06-21" publishedBy={Zerotorescue}>
    Today we're launching <Link to="/premium"><b>WoWAnalyzer Premium</b></Link>! WoWAnalyzer Premium will be our new model to encourage further development of the site. Unlock Premium by helping development and get cool new perks.<br />

    <div className="flex" style={{ maxWidth: 500, margin: '1em auto' }}>
      <div className="flex-sub" style={{ padding: 5 }}>
        <PremiumIcon style={{ float: 'left', fontSize: 80, marginTop: 0, color: '#e45a5a' }} />
      </div>
      <div className="flex-main" style={{ fontSize: 24, padding: '5px 15px', lineHeight: 1.4 }}>
        Help out development to unlock<br />
        <Link to="/premium"><span style={{ color: '#e45a5a', fontWeight: 600 }}>WoWAnalyzer Premium</span></Link>!
      </div>
    </div>

    You can unlock Premium by either making a monetary pledge on <a href="https://www.patreon.com/wowanalyzer">Patreon</a> or by making a contribution on <a href="https://github.com/WoWAnalyzer/WoWAnalyzer">GitHub</a> (code or otherwise).<br /><br />

    <PatreonIcon style={{ fontSize: '2.7em' }} /><br />
    There are several tiers on Patreon unlocking different things, check out our <a href="https://www.patreon.com/wowanalyzer">Patreon</a> page for more information. The first tier will remove ads, the other tiers provide more benefits. In the future we may restrict access to features funded by Patreon behind a certain Premium level.<br /><br />

    Any money generated via Patreon will go back to development. We'll either purchase new tools to make it easier to do things (e.g. servers, <a href="https://sentry.io/">Sentry</a>), or we'll place bounties on tasks that need to be completed via <a href="https://www.bountysource.com/teams/wowanalyzer">Bountysource</a>. Bounties on Bountysource are a way to place a reward on completing a task on GitHub, such as building a new module to analyze a new item or spell.<br /><br />

    <GitHubIcon style={{ fontSize: '2em' }} /><br />
    We're proud to be fully Open Source since day one. As a way to thank contributors and encourage new contributions, any contributions that are merged to the <kbd>master</kbd> branch will earn you a month of full Premium. This can be anything such as a bug fix, a new module, a design or improve&shy;ments to our documentation.<br /><br />

    See our page <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/wiki#contributing">here</a> for more information about how to make a contribution on GitHub. It's important to note that all changes must first be approved in a <i>Pull Request</i> review before it can be merged to the <kbd>master</kbd> branch. Our documentation has more information on this process. One cool thing is once your changes are approved and merged they'll be deployed on the site automatically within 10 minutes.<br /><br />

    <div style={{ fontSize: '1.5em' }}>
      Ready to be a part of us? <Link to="/premium">Click here to go to the new Premium page.</Link>
    </div><br />

    <figure style={{ textAlign: 'center' }}>
      <Link to="/premium">
        <img src="/img/patreon6.jpg" alt="WoWAnalyzer Premium" />
      </Link>
    </figure>
  </RegularArticle>
);
