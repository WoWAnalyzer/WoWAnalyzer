import React from 'react';
import { Link } from 'react-router-dom';

import { Zerotorescue } from 'CONTRIBUTORS';
import RegularArticle from 'Interface/News/RegularArticle';

import Header from './header.jpg';

export default (
  <RegularArticle title="Improve your performance in the Battle for Azeroth pre-patch" publishedAt="2018-07-18" publishedBy={Zerotorescue}>
    <figure style={{ margin: '-14px -22px' }}>
      <img src={Header} alt="BFA" style={{ width: '100%' }} />
    </figure><br />

    We are proud to go into the Battle for Azeroth pre-patch with <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/issues/1796">most specs</a> updated with full compatibility! For months we've worked hard to prepare for the pre-patch. We have done a ton of research on the beta, scoured through hundreds of reports on <a href="https://www.warcraftlogs.com">Warcraft Logs</a>, and worked in collaboration with many other class experts to bring you the best metrics and suggestions possible to help you improve your performance.<br /><br />

    So use this pre-patch period to get used to the class changes, experiment, analyze your logs, and always keep improving!<br /><br />

    We too are always looking to improve. We'll continue to improve the analysis as we learn more about the new specs and discover new optimal ways to play the game so come back for more analysis and more suggestions. If you are curious about any analysis or suggestions we do or have any suggestions, let us know on <a href="https://wowanalyzer.com/discord">Discord</a>. And check out our new <Link to="/premium">Premium</Link> page if you want to help (we're actively looking for maintainers for several specs).<br /><br />

    Thanks for your support during Legion. We hope you'll stick around for all the cool new things coming in Battle for Azeroth.
  </RegularArticle>
);
