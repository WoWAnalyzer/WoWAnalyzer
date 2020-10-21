import React from 'react';

import { Zerotorescue } from 'CONTRIBUTORS';
import RegularArticle from 'interface/news/RegularArticle';

import Hacktoberfest from './hacktoberfest.png';

// prettier-ignore
export default (
  <RegularArticle title="Hacktoberfest" publishedAt="2020-10-02" publishedBy={Zerotorescue}>
    <img src={Hacktoberfest} alt="Hacktoberfest" /><br /><br />

    Hacktoberfest is open to everyone once again! Join the event by contributing to WoWAnalyzer with four pull requests (PRs) and pick a limited edition T-shirt or plant a tree. Other open source projects count as well. Everyone is welcome, whether you’re a developer, student learning to code, event host, or company of any size.<br /><br />

    There are a lot of things that need to be done for Shadowlands support to be added to WoWAnalyzer. Examples of very welcome contributions are: updating the abilities config for specs, updating existing spell-specific modules with new spell changes, adding new modules for new spells, adding support for covenant abilities, adding support for log based Stat Values, etc. Here is an example list of things that need to be done for optimal Shadowlands support: <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/issues/3663">https://github.com/WoWAnalyzer/WoWAnalyzer/issues/3663</a><br /><br />

    If you’re interested in something less WoW-specific, we’re also in the process of converting the project to TypeScript. Just pick a random JS file and convert it to TS to contribute.<br /><br />

    Shadowlands progress and contributions should go to the <code>shadowlands</code> branch for now. We will deploy that to wowanalyzer.com the 13th of October.<br /><br />

    If you have any questions, please don’t hesitate to ask in this channel! If you’re new to Open Source, WoWAnalyzer is a great place to start. Many first-time contributors have come before you. (ps. I can’t thank you guys enough for helping WoWAnalyzer help everyone help themselves)<br /><br />

    Read more about the event here: <a href="https://hacktoberfest.digitalocean.com/">https://hacktoberfest.digitalocean.com/</a><br /><br />

    To find out how to make contribute something to this project, please read the readme here: <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/blob/master/README.md">https://github.com/WoWAnalyzer/WoWAnalyzer/blob/master/README.md</a>
  </RegularArticle>
);
