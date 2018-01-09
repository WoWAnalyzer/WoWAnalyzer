import React from 'react';

import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import { getCompletenessColor, getCompletenessExplanation, getCompletenessLabel } from 'common/SPEC_ANALYSIS_COMPLETENESS';
import RegularArticle from 'Main/News/RegularArticle';
import Timeline from './Timeline';

import v001 from './v0.0.1.gif';
import v020 from './v0.2.0.gif';
import SPEC_ANALYSIS_COMPLETENESS from 'common/SPEC_ANALYSIS_COMPLETENESS';

function completeness(completeness) {
  return <dfn data-tip={getCompletenessExplanation(completeness)} style={{ color: getCompletenessColor(completeness) }}>{getCompletenessLabel(completeness)}</dfn>;
}

export default (
  <RegularArticle title="WoWAnalyzer's first anniversary" published="2017-12-24">
    <h1>This is a concept right now, it needs a lot more work. It probably goes too much into detail in some areas, and is missing some other things. Any feedback and help writing would be much appreciated!</h1>

    It has already been a year! Time flies when you're having fun working hard. We want to use this milestone to look back at the progress we have made during this past year.<br /><br />

    In addition to the detailed recap below, here are some other interesting statistics:<br /><br />

    <ul style={{ marginBottom: 20 }}>
      <li><b>34</b> specs implemented with <b>16</b> specs marked as being {completeness(SPEC_ANALYSIS_COMPLETENESS.GOOD)} or {completeness(SPEC_ANALYSIS_COMPLETENESS.GREAT)}</li>
      <li><a href="https://github.com/WoWAnalyzer/WoWAnalyzer" target="_blank" rel="noopener noreferrer"><b>6,378 commits</b></a> from over <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/graphs/contributors" target="_blank" rel="noopener noreferrer"><b>58 contributors</b></a></li>
      <li><b>1.416 files</b> with over <b>141,371 lines of code</b></li>
      <li>Peak usage had over <b>135,000 unique visitors</b> and <b>15,000,000 pageviews</b> in a single month</li>
      <li><a href="https://discord.gg/AxphPxU" target="_blank" rel="noopener noreferrer">Our Discord server</a> has <b>1,210 members</b></li>
      <li>It usually takes <a href="https://travis-ci.org/WoWAnalyzer/WoWAnalyzer/builds" target="_blank" rel="noopener noreferrer">about <b>5 minutes</b></a> for a code-change to be available on WoWAnalyzer.com</li>
    </ul>

    The project was started by <b>Zerotorescue</b>, a <span className="Paladin">Holy Paladin</span> theorycrafter at the time. Since it took several months before other contributors joined the project, the first half of the recap will be written from my point of view.<br /><br />

    <hr style={{ marginBottom: 20 }} />

    <Timeline>
      <div className="panel">
        <div className="date">
          31 Jan
        </div>
        <div className="panel-heading">
          <h2>Launch!</h2>
        </div>
        <div className="panel-body">
          The 31st of January marked the launch of the first version of WoWAnalyzer, then named the <b>Holy Paladin mastery effectiveness calculator</b>. It was created out of the need to do more complex analysis that would not have be possible with only a simple spreadsheet.<br /><br />

          To understand what the project did back then you need to know that <SpellLink id={SPELLS.MASTERY_LIGHTBRINGER.id} icon>Mastery</SpellLink> causes a Holy Paladin's healing to be increased based on how close she is to the player she's healing. 0-10 yards provides full effectiveness and 10-40 yards decreases the boost to 0% linearly. In order to calculate how effective Mastery is you need to know the distance between the Holy Paladin and her target.<br /><br />

          For a long time it seemed impossible to accurately calculate this based on a log, but after a night of playing with Warcraft Logs' replay function to estimate my Mastery Effectiveness, I realized that it must have access to a player locations to be able to show the replay like it does. After some figuring out I got a proof of concept working, which became the <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/commit/bd7971995fe16d14aec7286765c13c2984c44d76" target="_blank" rel="noopener noreferrer">first commit</a> at <b>31 Jan 2017 00:02 CET</b>. I named project "Holy Paladin mastery effectiveness calculator" at the time because that was all it did.

          <figure>
            <img src={v001} alt="v0.0.1" />
            <figcaption>
              Holy Paladin mastery effectiveness calculator v0.0.1. Do note that at the time WCL throttled the events API to 300 events per API call, so loading a fight took considerably longer back then.
            </figcaption>
          </figure>
        </div>
      </div>

      <div className="panel">
        <div className="date">
          4 Feb
        </div>
        <div className="panel-heading">
          <h2>A new layout</h2>
        </div>
        <div className="panel-body">
          As the project was getting a lot of attention in the Holy Paladin community, the layout was cleaned up a bit and a player breakdown was added. I kept this theme for a couple of months, with only minor changes.

          <figure>
            <img src={v020} alt="v0.2.0" />
            <figcaption>
              Holy Paladin mastery effectiveness calculator v0.2.0
            </figcaption>
          </figure>
        </div>
      </div>

      <div className="panel">
        <div className="date">
          18 Mar 2017
        </div>
        <div className="panel-heading">
          <h2>Drape of Shame</h2>
        </div>
        <div className="panel-body">
          I quickly went through a lot of minor versions during this month. I removed the need for users to enter their own WCL API key, added URL routing (so you can directly link to a log) and added a [Rule of Law](http://www.wowhead.com/spell=214202/rule-of-law) uptime display (which improves a Holy Paladin's mastery effectiveness so was related) among other things. In March I added a statistic not related to a Holy Paladin's mastery effectiveness; the [Drape of Shame](http://www.wowhead.com/item=142170/drape-of-shame) healing contribution statistic. For the first time this gave us insight into the exact healing contribution of Drape of Shame.

          ![Holy Paladin mastery effectiveness calculator v0.3.1: the first item](./v0.3.1-small.png)
          Holy Paladin mastery effectiveness calculator v0.3.1 statistics at 18 Mar 2017

          With the majority of the work done, I quickly added statistics for the legendaries Ilterendi, Crown Jewel of Silvermoon and Velen's Future Sight in the following few days. Next I added statistics important to filling in the Holy Paladin stat weights spreadsheet: cast behavior.

          ![Holy Paladin mastery effectiveness calculator v0.9](./v0.9.png)
          Holy Paladin mastery effectiveness calculator v0.9 at 25 Mar 2017

          At 26 Mar 2017 I did a big rewrite of the code in place to make it modular, making it easier to maintain and extend. This modular approach is still in place today. Accompanying this big rewrite was a name change and a version bump to **Holy Paladin Analyzer v1.0**. I spent a few days adding more interesting item statistics; Chain of Thrayn, Prydaz, Obsidian Stone Spaulders and Maraad's Dying Breath before getting to the first version of the downtime statistic ("Always Be Casting").

          ![Holy Paladin Analyzer v1.4.1](./v1.4.1-small.png)
          Holy Paladin Analyzer v1.4.1: new downtime statistic at 4 Apr 2017

          By this time I felt we needed a new layout. Inspired by [Blur Admin](http://akveo.com/blur-admin/#/dashboard) I designed a new layout that was the basis for what we have today (disclaimer: I'm not a graphic designer).

          ![Holy Paladin Analyzer v2.0 new layout](./HolyPaladinAnalyzer-2.0.gif)
          Holy Paladin Analyzer v2.0: a new look at 7 Apr 2017

          Because cast efficiency is very important for a Holy Paladin's performance I added a Cast Efficiency panel showing the actual casts and an estimated max possible casts. The *Can be improved.* indicator in this panel was the first step towards showing gameplay suggestings. I had been thinking about doing *suggestions* for a long time at this point.

          ![Holy Paladin Analyzer v2.4 Cast Efficiency](./HolyPaladinAnalyzer-2.4.png)
          Holy Paladin Analyzer v2.4: cast efficiency at 11 Apr 2017

          With cast efficiency implemented, the Holy Paladin Analyzer now calculated most of the important metrics for Holy Paladins. This meant I could finally implement the *suggestions* panel I wanted to do. The first version looked like this:

          ![Holy Paladin Analyzer v3.0 suggestions](./HolyPaladinAnalyzer-3.0-suggestions.png)
          Holy Paladin Analyzer v3.0: suggestions! at 14 Apr 2017

          I continued to add analysis for items, talents, traits and other metrics to the Holy Paladin Analyzer, and improved existing features. At the same time I rewrote a large part of the codebase to greatly improve the existing code for better extensibility and maintainability. For myself, and to make it easier for anyone else to contribute and maybe even make a version for their own spec.

          At 31 March 2017 **@Josh** contacted me about putting the code under an open license so that he could use parts for Disc Priest analysis. This led to a license that allows usage in non-commercial open source projects which was later replaced with the more formal [AGPL](https://github.com/WoWAnalyzer/WoWAnalyzer/blob/master/LICENSE) license.

          At 6 May 2016 **@blazyb** reached out about creating an analyzer for *Restoration Druids*. His feedback during this process helped a lot to rewrite even more of the codebase to make it easier for others to work with and to make it more natural to implement different specs. After talking with blazyb a lot about the future of the project I decided that the best approach would be to launch a single website for multiple specs with it selecting the spec analyzer needed.

          At 11 May 2017 I purchased the **WoWAnalyzer.com** domain. By 13 May 2017 I had finished implementing support for multiple spec analyzers in one project. The project was rebranded to WoWAnalyzer and wowanalyzer.com was officially launched at 13 May 2017.

          ![WoWAnalyzer v1.0](./WoWAnalyzer-v1.0.gif)
          WoWAnalyzer v1.0 at 13 May 2017

          Meanwhile blazyb worked on the **Resto Druid Analyzer** with an extensive private beta test. The Resto Druid Analyzer was publicly released at 15 May 2017. Due to the amount of work moving it into the shared project it was initially released as a standalone "fork". The Resto Druid Analyzer was fully merged into WoWAnalyzer at 21 May 2017.

          ![Resto Druid Analyzer v1.0](./resto-druid-analyzer-1.0.png)
          Resto Druid Analyzer v1.0 at 15 May 2017

          In order to continue growing the project and experience adding a new spec myself (after all the changes) and refine any rough edges I would run into, I started working on adding support for **Discipline Priest**. The first version of the Discipline Priest was added at 14 May 2017 and further extended in the next days and weeks. I had a lot of help from Josh while doing this.

          ![WoWAnalyzer v1.0.9](./WoWAnalyzer-v1.0.9.gif)
          WoWAnalyzer v1.0.9: Discipline Priest at 19 May 2017

          We received our [first Pull Request](https://github.com/WoWAnalyzer/WoWAnalyzer/pull/22) from **@Reglitch** at 19 May 2017. In it he contributed an "editorconfig" file: `Fairly self explanatory, enforces consistency when multiple devs are working on the project.`. It was merged a day later.

          I added the **Cooldowns** tab at 21 May 2017 to give more insight into cooldown usages, spells cast during them and throughput as a result.

          ![WoWAnalyzer v1.1](./WoWAnalyzer-v1.1.png)
          WoWAnalyzer v1.1 at 21 May 2017

          **Mistweaver Monk** support was [first proposed](https://github.com/WoWAnalyzer/WoWAnalyzer/pull/33) by **@Anomoly** at 23 May 2017, and merged to WoWAnalyzer.com after a short review process a day later.

          ![WoWAnalyzer v1.1.1](./WoWAnalyzer-v1.1.1.gif)
          WoWAnalyzer v1.1.1: initial Mistweaver support at 25 May 2017

          TODO: Go through all 850 PRs to mention everyone that ever contributed anything ever (after first mention only noteworthy contributions)
        </div>
      </div>
    </Timeline>

    ## Contributors

    ## User growth

    ## 2018
  </RegularArticle>
);
