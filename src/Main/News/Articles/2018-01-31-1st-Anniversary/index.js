import React from 'react';
import PropTypes from 'prop-types';

import * as MAINTAINERS from 'MAINTAINERS';
import SpellLink from 'common/SpellLink';
import ItemLink from 'common/ItemLink';
import ItemIcon from 'common/ItemIcon';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import SPECS from 'common/SPECS';
import SPEC_ANALYSIS_COMPLETENESS, { getCompletenessColor, getCompletenessExplanation, getCompletenessLabel } from 'common/SPEC_ANALYSIS_COMPLETENESS';
import Wrapper from 'common/Wrapper';
import RegularArticle from 'Main/News/RegularArticle';
import Maintainer from 'Main/Maintainer';
import DiscordButton from 'Main/DiscordButton';

import Timeline from './Timeline';

import v001 from './v0.0.1.gif';
import v020 from './v0.2.0.gif';
import v031 from './v0.3.1-small.png';
import HolyPaladinMasteryCalculatorV09 from './v0.9-small.png';
import HolyPaladinAnalyzerV141 from './v1.4.1-small.png';
import HolyPaladinAnalyzerV20 from './HolyPaladinAnalyzer-2.0-medium.gif';
import HolyPaladinAnalyzerV24 from './HolyPaladinAnalyzer-2.4.png';
import HolyPaladinAnalyzerV30Suggestions from './HolyPaladinAnalyzer-3.0-suggestions.png';
import RestoDruidAnalyzerV10 from './resto-druid-analyzer-1.0.png';
import WoWAnalyzerV10 from './WoWAnalyzer-v1.0.gif';
import WoWAnalyzerV109 from './WoWAnalyzer-v1.0.9.png';
import CharacterAndFightPullDownMenus from './CharacterAndFightPullDownMenus.gif';
import CompletenessGreat from './Completeness-Great.png';
import CompletenessNeedsMoreWork from './Completeness-Needs-more-work.png';
import DistanceMoved from './DistanceMoved.png';
import RestoDruidStatWeights from './RestoDruidStatWeights.png';
import ApiIsDown from './ApiIsDown.gif';
import EnchantChecker from './EnchantChecker.png';
import WoWAnalyzerV11 from './WoWAnalyzer-v1.1.png';
import StatusPage from './StatusPage.png';
import OutageAlert from './OutageAlert.png';
import DiscordChannels from './DiscordChannels.png';
import WoWAnalyzerV111 from './WoWAnalyzer-v1.1.1.gif';
import GitHubLogo from './GitHub_Logo_White.png';
import TravisCILogo from './TravisCI-Full-Color-light.png';
import DockerLogo from './docker.png';
import ScalewayLogo from './ScalewayLogo.svg';
import CloudflareLogo from './CloudflareLogo.svg';
import ElementalShamanCastEfficiency from './ElementalShamanCastEfficiency.jpg';
import ElementalShamanCooldowns from './ElementalShamanCooldowns.jpg';
import ElementalShamanProcs from './ElementalShamanProcs.jpg';
import ElementalShamanMaelstrom from './ElementalShamanMaelstrom.jpg';
import ManaTab from './ManaTab.PNG';
import RestoShaman from './RestoShaman.png';
import RestoShamanFeeding from './RestoShamanFeeding.png';
import HolyPriest from './HolyPriest.PNG';
import LowHealthHealing from './LowHealthHealing.png';
import ExtensionToolbar from './ExtensionToolbar.jpg';
import ExtensionActive from './ExtensionActive.jpg';
import WindwalkerMonk from './WindwalkerMonk.png';

function completeness(completeness) {
  return <dfn data-tip={getCompletenessExplanation(completeness)} style={{ color: getCompletenessColor(completeness) }}>{getCompletenessLabel(completeness)}</dfn>;
}
const SpecIcon = ({ spec }) => (
  <img
    src={`/specs/${spec.className.replace(' ', '')}-${spec.specName.replace(' ', '')}.jpg`}
    alt={`${spec.specName} ${spec.className}`}
    style={{ float: 'left', borderRadius: 5, margin: '5px 10px 10px 0px' }}
  />
);
SpecIcon.propTypes = {
  spec: PropTypes.object.isRequired,
};

/* eslint-disable jsx-a11y/accessible-emoji */

class Article extends React.PureComponent {
  constructor() {
    super();
    this.state = {
      expanded: false,
    };
  }

  renderExpansion() {
    return (
      <Wrapper>
        <div className="panel">
          <div className="date">
            4 Feb
          </div>
          <div className="panel-heading">
            <h2>A new layout</h2>
          </div>
          <div className="panel-body">
            As the project was getting a lot of attention in the Holy Paladin community, the layout was cleaned up a bit and a player breakdown was added. This layout stayed largely the same for a couple of months.<br /><br />

            <figure>
              <img src={v020} alt="v0.2.0" />
              <figcaption>
                Holy Paladin mastery effectiveness calculator v0.2.0
              </figcaption>
            </figure>
            <br />

            With the mantra <a href="https://en.wikipedia.org/wiki/Release_early,_release_often">release early, release often</a> in mind the project quickly went through a lot of minor versions during this month. Among other things the need for users to enter their own WCL API key was removed, URL routing was added (so you can directly link to a log) and a <SpellLink id={SPELLS.RULE_OF_LAW_TALENT.id} icon /> uptime display (which improves a Holy Paladin's mastery effectiveness so was related) was added.
          </div>
        </div>

        <div className="panel">
          <div className="date">
            18 Mar
          </div>
          <div className="panel-heading">
            <h2>Analyzing the first item: <ItemIcon id={ITEMS.DRAPE_OF_SHAME.id} /> Drape of Shame</h2>
          </div>
          <div className="panel-body">
            In March a statistic that broadened the scope of project was added as it wasn't just related to a Holy Paladin's mastery effectiveness; the <ItemLink id={ITEMS.DRAPE_OF_SHAME.id} icon /> healing contribution statistic. For the first time this statistic gave insight into the exact value of <ItemLink id={ITEMS.DRAPE_OF_SHAME.id} icon />.<br /><br />

            <figure>
              <img src={v031} alt="v0.3.1" />
              <figcaption>
                Holy Paladin mastery effectiveness calculator v0.3.1 statistics at 18 Mar 2017
              </figcaption>
            </figure>
            <br />

            The implementation of <ItemLink id={ITEMS.DRAPE_OF_SHAME.id} icon /> included a large part of the work needed for adding items, so it was possible to quickly add statistics for the similar legendaries <ItemLink id={ITEMS.ILTERENDI_CROWN_JEWEL_OF_SILVERMOON.id} icon /> and <ItemLink id={ITEMS.VELENS_FUTURE_SIGHT.id} icon /> in the next few days.
          </div>
        </div>

        <div className="panel">
          <div className="date">
            25 Mar
          </div>
          <div className="panel-heading">
            <h2>Feeding other tools with new cast behavior statistics</h2>
          </div>
          <div className="panel-body">
            At the time Holy Paladins used a spreadsheet that I maintained to calculate their stat weights since healers can't be simmed. In an attempt to make filling the required fields easier and more accurate, I decided to add the required <b>cast behavior</b> statistics. This was the most important non-trivial information required that was used in the spreadsheet. This addition opened the door to showing more ability based statistics.<br /><br />

            <figure>
              <img src={HolyPaladinMasteryCalculatorV09} alt="Holy Paladin mastery effectiveness calculator v0.9" />
              <figcaption>
                The new cast ratios display (Holy Paladin mastery effectiveness calculator v0.9 at 25 Mar 2017)
              </figcaption>
            </figure>
          </div>
        </div>

        <div className="panel">
          <div className="date">
            26 Mar
          </div>
          <div className="panel-heading">
            <h2>A big rewrite and a new name: Holy Paladin Analyzer</h2>
          </div>
          <div className="panel-body">
            The project was growing rapidly and that didn't seem to be going to stop anytime soon. Due to the organic growth of the project the codebase had kind of gotten... a mess. So it was time for spring cleaning!<br /><br />

            I rewrote pretty much every part of the codebase so that it would become easier to maintain and extend. The idea was to make every statistic a standalone module that completely isolates the analysis logic, and there would be a central "mission control center" that would take care of <i>rendering</i> the information in the proper way. This modular approach turned out to work really well and is still largely in place today. We did end up removing the central "mission control center" much later and instead now also include the rendering in each module to completely isolate separate modules.<br /><br />

            Accompanying this big rewrite was a name change and a version bump to <b>Holy Paladin Analyzer v1.0</b>. It only made sense since the scope has grown beyond just calculating mastery effectiveness.
          </div>
        </div>

        <div className="panel">
          <div className="date">
            4 Apr
          </div>
          <div className="panel-heading">
            <h2>Always Be Casting</h2>
          </div>
          <div className="panel-body">
            Another important part of the Holy Paladin spreadsheet was downtime as this has a big impact on spell and mana usage. In the past I had already made a spreadsheet to estimate this based on total casts done and fight duration, but this didn't have the accuracy the analyzer could provide.<br /><br />

            <figure>
              <img src={HolyPaladinAnalyzerV141} alt="Holy Paladin Analyzer v1.4.1" />
              <figcaption>
                Holy Paladin Analyzer v1.4.1: new downtime statistic at 4 Apr 2017
              </figcaption>
            </figure>
          </div>
        </div>

        <div className="panel">
          <div className="date">
            7 Apr
          </div>
          <div className="panel-heading">
            <h2>And yet another layout rework</h2>
          </div>
          <div className="panel-body">
            I usually start disliking things I designed myself in less than 2 days, and the project had been stuck with this basic layout for over 2 months so it was time to redo it once again. Inspired by <a href="http://akveo.com/blur-admin/#/dashboard">Blur Admin</a> I designed a new layout that was the basis for what we have today (disclaimer: I'm not a graphic designer).<br /><br />

            <figure style={{ maxWidth: 800 }}>
              <img src={HolyPaladinAnalyzerV20} alt="Holy Paladin Analyzer v2.0" />
              <figcaption>
                Holy Paladin Analyzer v2.0: a new look at 7 Apr 2017
              </figcaption>
            </figure>
            <br />

            Over the next few months this layout has been updated left and right to improve it. Things like the red border on top of panels, added icons and color coding to panels to make them easier to scan, etc.
          </div>
        </div>

        <div className="panel">
          <div className="date">
            11 Apr
          </div>
          <div className="panel-heading">
            <h2>Check your cast efficiency with the Cast Efficiency panel</h2>
          </div>
          <div className="panel-body">
            A Holy Paladin's most efficient spells are those that have a cooldown on them. This makes it very important to cast spells with cooldowns on them regularly for optimal performance. This led to the <b>Cast Efficiency</b> feature that was added showing the actual casts and an estimated max possible casts. The <i>Can be improved</i> indicator in this panel was the first step towards showing gameplay <i>suggestions</i>, something I had been thinking about doing for a long time.<br /><br />

            <figure>
              <img src={HolyPaladinAnalyzerV24} alt="Holy Paladin Analyzer v2.4" />
              <figcaption>
                The initial cast efficiency panel (Holy Paladin Analyzer v2.4 at 11 Apr 2017)
              </figcaption>
            </figure>
            <br />

            With cast efficiency implemented, the Holy Paladin Analyzer now calculated the biggest part of the important metrics for Holy Paladins.
          </div>
        </div>

        <div className="panel">
          <div className="date">
            14 Apr
          </div>
          <div className="panel-heading">
            <h2>Helping people help themselves with suggestions</h2>
          </div>
          <div className="panel-body">
            With the biggest part of the analysis required for Holy Paladins implemented, it finally meant I could implement the <b>suggestions</b> panel I wanted to do. The first version looked like this:<br /><br />

            <figure style={{ maxWidth: 800 }}>
              <img src={HolyPaladinAnalyzerV30Suggestions} alt="Holy Paladin Analyzer v3.0" />
              <figcaption>
                The first suggestions (Holy Paladin Analyzer v3.0 at 14 Apr 2017)
              </figcaption>
            </figure>
            <br />

            The introduction of suggestions shifted the focus of the project a fair bit. In the past the focus was on showing hard to calculate metrics for helping theorycrafting, comparing items and improving data for other tools. After the introduction of suggestions the primary focus became more about helping the player improve his own performance. Calculating useful metrics for other purposes is still a goal but it is no longer the primary focus.<br /><br />

            The focus of the project was later solidified in a <a href="https://github.com/WoWAnalyzer/WoWAnalyzer#vision">Vision</a> section of the readme of the project.
          </div>
        </div>

        <div className="panel">
          <div className="date">
            19 Apr
          </div>
          <div className="panel-heading">
            <h2>Mana graph</h2>
          </div>
          <div className="panel-body">
            A good rule of thumb when learning to manage your mana is to try to match your mana level with the boss's health pool. The mana tab was added to make it easy to see this.<br /><br />

            <figure>
              <img src={ManaTab} alt="Mana tab" />
              <figcaption>
                The mana tab for Elisande
              </figcaption>
            </figure>
          </div>
        </div>

        <div className="panel">
          <div className="date">
            13 May
          </div>
          <div className="panel-heading">
            <h2>The launch of WoWAnalyzer.com 🎉</h2>
          </div>
          <div className="panel-body">
            At 11 May 2017 I decided on the name to use, purchased the <b>WoWAnalyzer.com</b> domain and started work on support for multiple specs in a single project. By 13 May 2017 I had finished implementing support for multiple spec analyzers. I rebranded the project to WoWAnalyzer and officially launched WoWAnalyzer.com at 13 May 2017.<br /><br />

            <figure>
              <img src={WoWAnalyzerV10} alt="WoWAnalyzer v1.0" />
              <figcaption>
                Going through all parts of the Holy Paladin section of WoWAnalyzer v1.0 at 13 May 2017
              </figcaption>
            </figure>
          </div>
        </div>

        <div className="panel">
          <div className="date">
            15 May
          </div>
          <div className="panel-heading">
            <h2>Restoration Druid 🍂</h2>
          </div>
          <div className="panel-body">
            <SpecIcon spec={SPECS.RESTORATION_DRUID} />
            At 6 May 2017 <Maintainer {...MAINTAINERS.blazyb} /> reached out about creating an analyzer for <span className="Druid">Restoration Druid</span>. I talking him through it for a bit and he shared a lot feedback during the process. His feedback helped a lot to rewrite even more of the codebase to make it easier for others to work with and to make it more natural to implement different specs. After talking with <Maintainer {...MAINTAINERS.blazyb} /> about the future of the project a lot I decided that the best approach would be to launch a single website for multiple specs with it selecting the spec analyzer needed.<br /><br />

            Meanwhile <Maintainer {...MAINTAINERS.blazyb} /> worked on the <b>Resto Druid Analyzer</b> and ran an extensive private beta test. The Resto Druid Analyzer was finally publicly released at 15 May 2017. Due to the amount of work involved in moving it into the shared project, it was initially released as a standalone "fork". The Resto Druid Analyzer was fully merged into the WoWAnalyzer project at 21 May 2017.<br /><br />

            <figure>
              <img src={RestoDruidAnalyzerV10} alt="Resto Druid Analyzer v1.0" />
              <figcaption>
                Resto Druid Analyzer v1.0 at 15 May 2017
              </figcaption>
            </figure>
            <br />

            Other contributions to this spec:<br /><br />

            <Maintainer {...MAINTAINERS.greatman} /> contributored the initial Dreamwalker statistic.<br />
            <Maintainer {...MAINTAINERS.rubensayshi} /> introduced the concept of fixing bugs in Blizzard's combatlogs by re-ordering events. This concept evolved to "Events Normalizers" that we use today for fixing all sorts of weird combatlog bugs. He also improved a couple of features of the Resto Druid analyzer.<br />
            <Maintainer {...MAINTAINERS.sref} /> has done a lot of work on the Restoration Druid implementation and has added and improved a large part of the spec implementation.
          </div>
        </div>

        <div className="panel">
          <div className="date">
            19 May
          </div>
          <div className="panel-heading">
            <h2>Discipline Priest</h2>
          </div>
          <div className="panel-body">
            <SpecIcon spec={SPECS.DISCIPLINE_PRIEST} />
            At 31 March 2017 <b>Josh</b> (aka MethodJosh) contacted me about putting the code under an open license so that he could use parts for Disc Priest analysis. This led to a license that allows usage in non-commercial open source projects which was later replaced with the more formal <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/blob/master/LICENSE">AGPL</a> license that we still use today.<br /><br />

            Around the start of May I started thinking and talking about possibly adding support for another spec. I wanted to do this to continue growing the project and experience adding a new spec myself (after all the changes) and refine any rough edges I would run into. I got to talking with <b>Josh</b> again and he showed me a lot of research material that would help a lot in adding analysis for the spec. So I decided to start working on adding support for <b>Discipline Priest</b>. The first version of the Discipline Priest was added at 14 May 2017, and it was in a good state by 19 May 2017.<br /><br />

            <figure>
              <img src={WoWAnalyzerV109} alt="WoWAnalyzer v1.0.9" />
              <figcaption>
                Discipline Priest (WoWAnalyzer v1.1.0 at 20 May 2017)
              </figcaption>
            </figure>
            <br />

            This spec had a lot of people contributing code: <Maintainer {...MAINTAINERS.Zerotorescue} />, <Maintainer {...MAINTAINERS.Reglitch} />, <Maintainer {...MAINTAINERS.nutspanther} />, <Maintainer {...MAINTAINERS.Oratio} />, <Maintainer {...MAINTAINERS.Gao} />, <Maintainer {...MAINTAINERS.hassebewlen} />, and <Maintainer {...MAINTAINERS.milesoldenburg} />.
          </div>
        </div>

        <div className="panel">
          <div className="date">
            19 May
          </div>
          <div className="panel-heading">
            <h2>The first PR by an outside contributor!</h2>
          </div>
          <div className="panel-body">
            Getting the first PR was very exciting! It meant someone else was interested enough in my project to dedicate time and effort towards improving it. <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/pull/22">Our first PR</a> was created by <Maintainer {...MAINTAINERS.Reglitch} /> at 19 May 2017. In it he contributed an "editorconfig" file: "Fairly self explanatory, enforces consistency when multiple devs are working on the project.". It was merged a day later.<br /><br />

            <Maintainer {...MAINTAINERS.Reglitch} /> has done a lot more work since then, primarily on the Discipline Priest implementation. He is now a part of the WoWAnalyzer admin team.
          </div>
        </div>

        <div className="panel">
          <div className="date">
            20 May
          </div>
          <div className="panel-heading">
            <h2>Cooldowns overview</h2>
          </div>
          <div className="panel-body">
            The cooldowns tab was added to give easy insight into important cooldown usages, spells cast during them and the resulting throughput, all in one simple view.<br /><br />

            <figure>
              <img src={WoWAnalyzerV11} alt="Cooldown tab" />
              <figcaption>
                The cooldown overview shows all spell casts during a cooldown, when expanded it shows the time delay of each spell to reveal inefficient cooldown usages.
              </figcaption>
            </figure>
          </div>
        </div>

        <div className="panel">
          <div className="date">
            24 May
          </div>
          <div className="panel-heading">
            <h2>A wild Discord server appeared!</h2>
          </div>
          <div className="panel-body">
            Since the start of the project I had been using the <kbd>#holy</kbd> channel of the <a href="https://discordapp.com/invite/hammerofwrath">Hammer of Wrath</a> Discord server to discuss changes and receive feedback. I didn't want to make another Discord server since I wanted to avoid moving Holy Paladin specific analysis discussions and questions away from the HoW server. At the same time it was often difficult discussing more technical aspects in this channel.<br /><br />

            While <Maintainer {...MAINTAINERS.blazyb} /> was working on developing the Resto Druid Analyzer he used a Discord server for feedback, updates, questions and requests. Seeing how well this worked led to making the shared <a href="https://discord.gg/AxphPxU">WoWAnalyzer Discord server</a> that we use today.<br /><br />

            <figure>
              <img src={DiscordChannels} alt="Discord channels" />
              <figcaption>
                The public channels available today.
              </figcaption>
            </figure>
            <br />

            If you're interested in learning more about the development of WoWAnalyzer, have any sort of feedback or just want to talk with us come join!<br />

            <DiscordButton />
          </div>
        </div>

        <div className="panel">
          <div className="date">
            25 May
          </div>
          <div className="panel-heading">
            <h2>Mistweaver Monk</h2>
          </div>
          <div className="panel-body">
            <SpecIcon spec={SPECS.MISTWEAVER_MONK} />
            <span className="Monk">Mistweaver Monk</span> support was <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/pull/33">first proposed</a> by <Maintainer {...MAINTAINERS.Anomoly} /> at 23 May 2017, and merged to WoWAnalyzer.com after a short review process a day later. His reasoning for getting involved:<br /><br />

            <blockquote>
              I was looking at a way to help out and extend support for the CheckMyWoW site, which at the time was the only analysis site I was aware of. I built a list of suggestions and features to potentially work on with that site, but this was just around the time Zerotorescue had started to extend and open up WoWAnalyzer to other specs. I figured this was a great opportunity to both get involved in something WoW related, help my fellow Mistweavers and also learn some JavaScript / React in the process!
            </blockquote>

            <figure>
              <img src={WoWAnalyzerV111} alt="WoWAnalyzer v1.1.1: initial Mistweaver support" />
              <figcaption>
                WoWAnalyzer v1.1.1: initial Mistweaver support
              </figcaption>
            </figure>
          </div>
        </div>

        <div className="panel">
          <div className="date">
            28 May
          </div>
          <div className="panel-heading">
            <h2>Restoration Shaman</h2>
          </div>
          <div className="panel-body">
            <SpecIcon spec={SPECS.RESTORATION_SHAMAN} />
            Original support for Restoration Shaman was <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/pull/39">added</a> by <Maintainer {...MAINTAINERS.Versaya} />. He worked on this for a long time to make it into a big part of what it is today.<br /><br />

            <figure>
              <img src={RestoShaman} alt="Initial Restoration Shaman" />
              <figcaption>
                Initial Restoration Shaman
              </figcaption>
            </figure><br />

            <Maintainer {...MAINTAINERS.Versaya} /> also added the unique <b>feeding</b> tab. This shows the healing done by spells that feed into <SpellLink id={SPELLS.CLOUDBURST_TOTEM_TALENT.id} icon /> while it was up.<br /><br />

            <figure>
              <img src={RestoShamanFeeding} alt="Feeding tab" />
              <figcaption>
                The feeding tab
              </figcaption>
            </figure><br />

            The spec had contributions from a couple of other maintainers. <Maintainer {...MAINTAINERS.aryu} /> added the very interesting <SpellLink id={SPELLS.ANCESTRAL_VIGOR_TALENT.id} /> metric that shows amount of lives saved. <Maintainer {...MAINTAINERS.Anomoly} /> migrated the spec to the new WoWAnalyzer version so that it would become easier to maintain and added T21 2 set and 4 set. <Maintainer {...MAINTAINERS.Hartra344} /> later took over as maintainer of the spec and implemented the checklist as well as a bunch of other features.
          </div>
        </div>

        <div className="panel">
          <div className="date">
            2 Jun
          </div>
          <div className="panel-heading">
            <h2>Continuous deployment (and our first server)</h2>
          </div>
          <div className="panel-body">
            <div className="flex wrapable text-center">
              <div className="content-middle">
                <a href="https://github.com/WoWAnalyzer/WoWAnalyzer">
                  <img src={GitHubLogo} style={{ width: 120 }} alt="GitHub" />
                </a>
              </div>
              <div className="content-middle">
                <a href="https://travis-ci.org/WoWAnalyzer/WoWAnalyzer">
                  <img src={TravisCILogo} style={{ width: 120 }} alt="TravisCI" />
                </a>
              </div>
              <div className="content-middle">
                <a href="https://hub.docker.com/r/martijnhols/wowanalyzer/">
                  <img src={DockerLogo} style={{ width: 120 }} alt="Docker" />
                </a>
              </div>
              <div className="content-middle">
                <a href="https://www.scaleway.com/">
                  <img src={ScalewayLogo} style={{ width: 120 }} alt="Scaleway" />
                </a>
              </div>
              <div className="content-middle">
                <a href="https://www.cloudflare.com/">
                  <img src={CloudflareLogo} style={{ width: 120 }} alt="Cloudflare" />
                </a>
              </div>
            </div>
            Up until this point new versions were deployed by manually building the application on a computer and pushing <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/commit/f163fb3764cf91c73b40fc83831ebdc9b5a24bd5">the production optimized build</a> to the repository. We used GitHub pages to provide the application. This was a tedious and slow process for the <a href="https://en.wikipedia.org/wiki/Release_early,_release_often">release early, release often</a> mantra and didn't allow us to run any server-side code.<br /><br />

            To improve this I wanted to setup a server with a <b>continuous deployment</b> approach taking care of the deploys. Continuous deployment means that every change automatically goes through the entire deployment pipeline and gets deployed to production. This is what we implemented.<br /><br />

            Our current deployment pipeline looks like this:
            <ol>
              <li>Changes get pushed to <a href="https://github.com/WoWAnalyzer/WoWAnalyzer">GitHub</a></li>
              <li><a href="https://travis-ci.org/WoWAnalyzer/WoWAnalyzer">TravisCI</a> gets notified and takes about 5 to 6 minutes to
                <ol>
                  <li>fire up a VM,</li>
                  <li>pull the latest code,</li>
                  <li>install all dependencies,</li>
                  <li>run all tests,</li>
                  <li>create a production optimized build,</li>
                  <li>create a new Docker image,</li>
                  <li>and push the Docker image to <a href="https://hub.docker.com/r/martijnhols/wowanalyzer/">Docker Hub</a>.</li>
                </ol>
              </li>
              <li>Docker Cloud gets notified about the new version in Docker Hub and automatically tells the server to stop the old version and start the new version</li>
            </ol><br />

            To host the app we used a dedicated server from <a href="https://www.scaleway.com">Scaleway</a>. They had an easy to install Docker image that made installing it a breeze. We have <a href="https://www.cloudflare.com">CloudFlare</a> sitting in front of the server for the free SSL, as a CDN, DDOS protection and some other things.<br /><br />

            <Maintainer {...MAINTAINERS.strel} /> guided me through setting up most of this initially; we wouldn't have this amazing setup without his help. Since the initial setup we have made some improvements, we will give more insight into our full setup in a future article.
          </div>
        </div>

        <div className="panel">
          <div className="date">
            4 Jun
          </div>
          <div className="panel-heading">
            <h2>Elemental Shaman</h2>
          </div>
          <div className="panel-body">
            <SpecIcon spec={SPECS.ELEMENTAL_SHAMAN} />
            The initial version of Elemental Shaman was added by <Maintainer {...MAINTAINERS.fasib} />. This included cast efficiency, the cooldown tab only included <SpellLink id={SPELLS.ASCENDANCE_TALENT_ELEMENTAL.id} icon /> (if specced) and <SpellLink id={SPELLS.STORMKEEPER.id} icon />, and introduced two new things: a procs tab and a Maelstrom tab.<br /><br />

            <figure>
              <img src={ElementalShamanCastEfficiency} alt="Elemental Shaman cast efficiency" />
              <figcaption>
                Elemental Shaman cast efficiency
              </figcaption>
            </figure><br />

            <div className="row">
              <div className="col-xs-4">
                <a href={ElementalShamanCooldowns}>
                  <img src={ElementalShamanCooldowns} alt="Elemental Shaman cooldowns" style={{ width: '100%' }} />
                </a>
              </div>
              <div className="col-xs-4">
                <a href={ElementalShamanProcs}>
                  <img src={ElementalShamanProcs} alt="Elemental Shaman procs" style={{ width: '100%' }} />
                </a>
              </div>
              <div className="col-xs-4">
                <a href={ElementalShamanMaelstrom}>
                  <img src={ElementalShamanMaelstrom} alt="Elemental Shaman maelstrom" style={{ width: '100%' }} />
                </a>
              </div>
            </div><br />

            <Maintainer {...MAINTAINERS.janvavra} /> <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/pull/469">contributed a couple of simple fixes</a> for Elemental Shamans using <SpellLink id={SPELLS.STORM_ELEMENTAL_TALENT.id} icon />. <Maintainer {...MAINTAINERS.HawkCorrigan} /> migrated Elemental Shaman's code to a new version of WoWAnalyzer and implemented a bunch of things such as T21, <ItemLink id={ITEMS.THE_DECEIVERS_BLOOD_PACT.id} icon /> and others.
          </div>
        </div>

        {/* Not interesting */}
        {/*<div className="panel">
          <div className="date">
            25 Jun
          </div>
          <div className="panel-heading">
            <h2>Development tab</h2>
          </div>
          <div className="panel-body">
            86c6c930dd8a2a606055f47fa0a4793c314e907b

            By <Maintainer {...MAINTAINERS.Zerotorescue} />

            <figure>
              <img src={DevelopmentTools} alt="The development tab" />
              <figcaption>
                The development tab at introduction
              </figcaption>
            </figure>
          </div>
        </div>*/}

        <div className="panel">
          <div className="date">
            1 Jul
          </div>
          <div className="panel-heading">
            <h2>Holy Priest</h2>
          </div>
          <div className="panel-body">
            <SpecIcon spec={SPECS.HOLY_PRIEST} />
            Holy Priest support was <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/pull/96">added</a> by <Maintainer {...MAINTAINERS.enragednuke} />. He says his motivation to add it was mostly a combination of watching <Maintainer {...MAINTAINERS.Reglitch} /> develop the Discipline Priest module (he was occasionally streaming development at the time) and a want to learn more JavaScript. And he just happened to play a spec not yet supported.<br /><br />

            <figure>
              <img src={HolyPriest} alt="The initial Holy Priest version" />
              <figcaption>
                The initial Holy Priest version
              </figcaption>
            </figure><br />

            <Maintainer {...MAINTAINERS.Skamer} /> also contributed a couple of things to this spec, such as support for the <SpellLink id={SPELLS.DIVINITY_TALENT.id} icon />.
          </div>
        </div>

        <div className="panel">
          <div className="date">
            5 Jul
          </div>
          <div className="panel-heading">
            <h2>Low health healing</h2>
          </div>
          <div className="panel-body">
            Sparked by a discussion in the Holy Paladin Discord about what healers actually save most lives I decided I wanted to make this easier to see. So I create the <b>low health healing</b> tab so display any heals on players below a certain amount of health. The tab is fully configurable to find exactly the kind of data you need to win whatever argument you're having.<br /><br />

            One thing that stands out is <SpellLink id={SPELLS.MARK_OF_THE_ANCIENT_PRIESTESS.id} icon /> shows up in the list a lot. It might be worth reconsidering your neck enchant.<br /><br />

            <figure>
              <img src={LowHealthHealing} alt="Low health healing by a Paladin on Mythic Krosus" />
              <figcaption>
                Low health healing by a Paladin on Mythic Krosus
              </figcaption>
            </figure>
          </div>
        </div>

        <div className="panel">
          <div className="date">
            19 Jul
          </div>
          <div className="panel-heading">
            <h2>The WoWAnalyzer browser extension</h2>
          </div>
          <div className="panel-body">
            <Maintainer {...MAINTAINERS.aryu} /> created a browser extension to make it easier to analyze your logs directly from Warcraft Logs. The extension adds the WoWAnalyzer logo to your browser toolbar that, when clicked on a valid WCL report, will allow you to analyze it directly with WoWAnalyzer.<br /><br />

            <figure>
              <img src={ExtensionToolbar} alt="Extension icon" />
              <figcaption>
                The extension adds an icon to your toolbar
              </figcaption>
            </figure>
            <figure>
              <img src={ExtensionActive} alt="Extension active" />
              <figcaption>
                Clicking the icon on a valid WCL report will allow you to analyze it with WoWAnalyzer
              </figcaption>
            </figure><br />

            Want it? Get it for Google Chrome <a href="https://chrome.google.com/webstore/detail/wow-analyzer/dnmgmiogknpdbgfgmolloddhiijkpekd">here</a> and for Firefox here.
          </div>
        </div>

        <div className="panel">
          <div className="date">
            23 Jul
          </div>
          <div className="panel-heading">
            <h2>Windwalker Monk</h2>
          </div>
          <div className="panel-body">
            <SpecIcon spec={SPECS.WINDWALKER_MONK} />
            Initial support for the Windwalker Monk spec was <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/pull/129">added</a> by <Maintainer {...MAINTAINERS.AttilioLH} />. This included all the bootstrapping but not a lot of analysis.<br /><br />

            <figure>
              <img src={WindwalkerMonk} alt="Initial version" />
              <figcaption>
                The initial version of the Windwalker Monk
              </figcaption>
            </figure><br />

            <Maintainer {...MAINTAINERS.mwwscott0} /> made a PR to add a bit more but decided not to go through with it. <Maintainer {...MAINTAINERS.Anomoly} /> <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/pull/381">added</a> a couple of things to provide better basic support before <Maintainer {...MAINTAINERS.Juko8} /> took over maintainership at 10 October 2017 and contributed most of what we have today. Some other minor contributions were done by <Maintainer {...MAINTAINERS.Coryn} /> who added an <SpellLink id={SPELLS.ENERGIZING_ELIXIR_TALENT.id} icon /> analyzer, and <Maintainer {...MAINTAINERS.Talby} /> who contributed a few minor miscellaneous improvements.
          </div>
        </div>

        <div className="panel">
          <div className="date">
            25 Jul
          </div>
          <div className="panel-heading">
            <h2>Subtlety Rogue</h2>
          </div>
          <div className="panel-body">
            <SpecIcon spec={SPECS.SUBTLETY_ROGUE} />
            https://github.com/WoWAnalyzer/WoWAnalyzer/pull/130
            https://github.com/WoWAnalyzer/WoWAnalyzer/pull/830

            Initial version by <Maintainer {...MAINTAINERS.zealk} />
            Most of what is available today by <Maintainer {...MAINTAINERS.tsabo} />
          </div>
        </div>

        <div className="panel">
          <div className="date">
            7 Aug
          </div>
          <div className="panel-heading">
            <h2>Guardian Druid 🐻</h2>
          </div>
          <div className="panel-body">
            <SpecIcon spec={SPECS.GUARDIAN_DRUID} />
            Initial version by <Maintainer {...MAINTAINERS.WOPR} />
            Taken over by <Maintainer {...MAINTAINERS.faide} />
            https://github.com/WoWAnalyzer/WoWAnalyzer/pull/137
          </div>
        </div>

        <div className="panel">
          <div className="date">
            14 Aug
          </div>
          <div className="panel-heading">
            <h2>Enhancement Shaman</h2>
          </div>
          <div className="panel-body">
            <SpecIcon spec={SPECS.ENHANCEMENT_SHAMAN} />
            https://github.com/WoWAnalyzer/WoWAnalyzer/pull/145

            By <Maintainer {...MAINTAINERS.Nighteyez07} />
          </div>
        </div>

        <div className="panel">
          <div className="date">
            14 Aug
          </div>
          <div className="panel-heading">
            <h2>Vengeance Demon Hunter</h2>
          </div>
          <div className="panel-body">
            <SpecIcon spec={SPECS.VENGEANCE_DEMON_HUNTER} />
            https://github.com/WoWAnalyzer/WoWAnalyzer/pull/157

            By <Maintainer {...MAINTAINERS.Mamtooth} />
          </div>
        </div>

        <div className="panel">
          <div className="date">
            15 Aug
          </div>
          <div className="panel-heading">
            <h2>A fancy new dependency injection system</h2>
          </div>
          <div className="panel-body">
            It's probably just me that's still excited about this one. This is technical stuffs you probably won't care about.<br /><br />

            In the past we had a bunch of different ways for modules to talk to each other, but the most common way was to just hardcode a path, e.g. <code>this.owner.modules.alwaysBeCasting</code> to get the instance of the Always Be Casting module. This worked pretty well but makes things hard to test, easy to break and makes it hard to see dependencies. After discussion a few possibilities I set out to create a <a href="https://en.wikipedia.org/wiki/Dependency_injection">dependency injection system</a>.<br /><br />

            It's actually a rather simple system. <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/commit/e6d3f186c819028da2796dffe3f9d0c55e7fda41#diff-f8311e439dcf107ce5cad2b9c9e57204">This commit</a> shows what changed; instead of hardcoding the direct path to the dependency, we can now request an instance of a class in a static <i>dependencies</i> property.<br /><br />

            To add a dependency requirement you add an entry to the <i>dependencies</i> object with as key the name you want it available as, and as value the class you want an instance of. The DI system then figures out which module to grab, being an instance of the class itself or an instance of a class extending that class, and makes it available to the module requesting it under the property with the requested name. The injection part all happens under the hood so the implementer doesn't have to worry about it.<br /><br />

            Another great thing is that <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/commit/e6d3f186c819028da2796dffe3f9d0c55e7fda41#diff-202576169845b67347bc4231e34054ccR116">the code that takes care of this</a> is actually pretty short. Who would have thought?<br /><br />

            This system offers us compile-time checking that dependencies exist (since we need to pass the class we want), and it does not rely on whatever name it has been assigned elsewhere. Pretty sweet right!
          </div>
        </div>

        <div className="panel">
          <div className="date">
            18 Aug
          </div>
          <div className="panel-heading">
            <h2>Affliction Warlock</h2>
          </div>
          <div className="panel-body">
            <SpecIcon spec={SPECS.AFFLICTION_WARLOCK} />
            <Maintainer {...MAINTAINERS.Chizu} />'s accounting: Our journey started in July, when my dearest friend and fellow Affliction Warlock <b>Aki</b> found about log analyzers. Firstly she found <a href="http://www.checkmywow.com">Check My Wow</a>, but was disappointed that they didn't support Affliction. A little while later in August, she found that CMW added the support, but was kinda lacking in features, and around that time she also found WoWAnalyzer and loved the features and design for Holy Paladin. I was curious about this site myself and when I noticed that it's open source, I decided to crawl through the source code even though I had no experience in ES6 whatsoever. It took about a week of silent reading but on August, 16th I made first few Affliction modules and afterwards it went downhill with development. Rest of Affliction modules, support for Destruction and Demonology. I'd like to thank her for showing me this site, if it wasn't for her, none of Warlock specs would probably be here.
          </div>
        </div>

        <div className="panel">
          <div className="date">
            20 Aug
          </div>
          <div className="panel-heading">
            <h2>Brewmaster Monk</h2>
          </div>
          <div className="panel-body">
            <SpecIcon spec={SPECS.BREWMASTER_MONK} />
            https://github.com/WoWAnalyzer/WoWAnalyzer/pull/177

            By <Maintainer {...MAINTAINERS.WOPR} />

            <Maintainer {...MAINTAINERS.emallson} /> later took over as the primary maintainer of this spec and has since done a lot of work.
          </div>
        </div>

        <div className="panel">
          <div className="date">
            27 Aug
          </div>
          <div className="panel-heading">
            <h2>Shadow Priest</h2>
          </div>
          <div className="panel-body">
            <SpecIcon spec={SPECS.SHADOW_PRIEST} />
            https://github.com/WoWAnalyzer/WoWAnalyzer/pull/197

            By <Maintainer {...MAINTAINERS.hassebewlen} />

            No other maintainers
          </div>
        </div>

        <div className="panel">
          <div className="date">
            28 Aug
          </div>
          <div className="panel-heading">
            <h2>Character and fight selection pull down menus</h2>
          </div>
          <div className="panel-body">
            By <Maintainer {...MAINTAINERS.fasib} />
            https://github.com/WoWAnalyzer/WoWAnalyzer/pull/200

            <figure>
              <img src={CharacterAndFightPullDownMenus} alt="Holy Paladin mastery effectiveness calculator v0.9" />
              <figcaption>
                NYI
              </figcaption>
            </figure>

            Later broken by <Maintainer {...MAINTAINERS.Zerotorescue} />
          </div>
        </div>

        <div className="panel">
          <div className="date">
            30 Aug
          </div>
          <div className="panel-heading">
            <h2>Balance Druid</h2>
          </div>
          <div className="panel-body">
            <SpecIcon spec={SPECS.BALANCE_DRUID} />
            https://github.com/WoWAnalyzer/WoWAnalyzer/pull/210

            By <Maintainer {...MAINTAINERS.Iskalla} />

            Later token over by <Maintainer {...MAINTAINERS.Gebuz} />
          </div>
        </div>

        <div className="panel">
          <div className="date">
            2 Sep
          </div>
          <div className="panel-heading">
            <h2>Destruction Warlock</h2>
          </div>
          <div className="panel-body">
            <SpecIcon spec={SPECS.DESTRUCTION_WARLOCK} />
            https://github.com/WoWAnalyzer/WoWAnalyzer/pull/231

            By <Maintainer {...MAINTAINERS.Chizu} />
          </div>
        </div>

        <div className="panel">
          <div className="date">
            4 Sep
          </div>
          <div className="panel-heading">
            <h2>Feral Druid</h2>
          </div>
          <div className="panel-body">
            <SpecIcon spec={SPECS.FERAL_DRUID} />
            https://github.com/WoWAnalyzer/WoWAnalyzer/pull/241

            By <Maintainer {...MAINTAINERS.Thieseract} />
          </div>
        </div>

        <div className="panel">
          <div className="date">
            6 Sep
          </div>
          <div className="panel-heading">
            <h2>Blood Death Knight</h2>
          </div>
          <div className="panel-body">
            <SpecIcon spec={SPECS.BLOOD_DEATH_KNIGHT} />
            https://github.com/WoWAnalyzer/WoWAnalyzer/pull/247

            By <Maintainer {...MAINTAINERS.Yajinni} />
          </div>
        </div>

        <div className="panel">
          <div className="date">
            6 Sep
          </div>
          <div className="panel-heading">
            <h2>Havoc Demon Hunter</h2>
          </div>
          <div className="panel-body">
            <SpecIcon spec={SPECS.HAVOC_DEMON_HUNTER} />
            https://github.com/WoWAnalyzer/WoWAnalyzer/pull/262

            By <Maintainer {...MAINTAINERS.Mamtooth} />
          </div>
        </div>

        <div className="panel">
          <div className="date">
            6 Sep
          </div>
          <div className="panel-heading">
            <h2>Marksmanship Hunter</h2>
          </div>
          <div className="panel-body">
            <SpecIcon spec={SPECS.MARKSMANSHIP_HUNTER} />
            <Maintainer {...MAINTAINERS.JLassie82} /> <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/pull/253">added</a> initial support for Marksmanship Hunter.<br /><br />

            <Maintainer {...MAINTAINERS.Putro} /> later became the main maintainer of this spec implementation because he wanted to replace <a href="http://www.checkmywow.com">Check My Wow</a> after it was announced it would no longer be maintained, with a better, prettier and overall more precise product. He has implemented almost everything you see today. This was done while gathering feedback and suggestions from the rest of the Hunter community and the other theorycrafters. It now replaces (or alternately enhances) many manual log-reviews, and provides a lot of information up-front that is relevant to players of all skill levels.<br /><br />

            <Maintainer {...MAINTAINERS.Blazballs} /> assisted in the Marksmanship module by amongst other things, creating the associated focus tracking chart, which now sees usage in both Beast Mastery and Survival implementations as well.
          </div>
        </div>

        <div className="panel">
          <div className="date">
            12 Sep
          </div>
          <div className="panel-heading">
            <h2>Retribution Paladin</h2>
          </div>
          <div className="panel-body">
            <div className="clearfix">
              <SpecIcon spec={SPECS.RETRIBUTION_PALADIN} />
              Support for Retribution Paladin was added by <Maintainer {...MAINTAINERS.Hewhosmites} />. His motivation for adding it:
            </div>

            <blockquote>
              I was a Holy Paladin main and a frequent user to the site before switching to Retribution. It was kind of disheartening that I wasn't able to get the same data and analysis from the WoW Analyzer with my new spec. I had a little programming knowledge, an average amount of class knowledge, and a lot of free time so I started working on Retribution. Normally when working on hobby projects I tend to lose interest quite quickly but my love of the game and drive to make a useful tool for myself and others has kept me going.
            </blockquote>
          </div>
        </div>

        <div className="panel">
          <div className="date">
            17 Sep
          </div>
          <div className="panel-heading">
            <h2>Demonology Warlock</h2>
          </div>
          <div className="panel-body">
            <SpecIcon spec={SPECS.DEMONOLOGY_WARLOCK} />
            https://github.com/WoWAnalyzer/WoWAnalyzer/pulls?utf8=%E2%9C%93&q=is%3Apr+demonology+

            By <Maintainer {...MAINTAINERS.Chizu} />
          </div>
        </div>

        <div className="panel">
          <div className="date">
            20 Sep
          </div>
          <div className="panel-heading">
            <h2>Added "completeness" ratings</h2>
          </div>
          <div className="panel-body">
            The analyzer was gaining more and more specs, but the completeness of each spec varied wildly. As a result some specs would be really helpful while others might be inaccurate simply because they needed more work. To avoid users from judging the entire tool by one spec implementation we added spec "completeness" ratings and indicators. These are meant to allow users to gauge the extensiveness and accuracy of a spec's implementation.<br /><br />

            <figure>
              <img src={CompletenessGreat} alt="Great completeness" />
              <figcaption>
                "Great!" completeness
              </figcaption>
            </figure>
            <figure>
              <img src={CompletenessNeedsMoreWork} alt="Needs more work completeness" />
              <figcaption>
                "Needs more work" completeness
              </figcaption>
            </figure>
            <br />

            At the time of writing the following specs are considered {completeness(SPEC_ANALYSIS_COMPLETENESS.GOOD)} or {completeness(SPEC_ANALYSIS_COMPLETENESS.GREAT)}:<br />
            <ul>
              <li className="Paladin">Holy Paladin</li>
              <li className="Paladin">Retribution Paladin</li>
              <li className="Monk">Mistweaver Monk</li>
              <li className="Monk">Brewmaster Monk</li>
              <li className="Monk">Windwalker Monk</li>
              <li className="Druid">Balance Druid</li>
              <li className="Druid">Restoration Druid</li>
              <li className="Druid">Guardian Druid</li>
              <li className="Priest">Discipline Priest</li>
              <li className="Priest">Shadow Priest</li>
              <li className="Priest">Holy Priest</li>
              <li className="DemonHunter">Vengeance Demon Hunter</li>
              <li className="Hunter">Beast Mastery Hunter</li>
              <li className="Hunter">Marksmanship Hunter</li>
              <li className="Mage">Frost Mage</li>
              <li className="DeathKnight">Unholy Death Knight</li>
            </ul>
            <br />

            This does not mean these specs are complete as there's always more we can add. It is supposed to mean that they match most common manual log reviews and reports on all important class features.
          </div>
        </div>

        <div className="panel">
          <div className="date">
            22 Sep
          </div>
          <div className="panel-heading">
            <h2>Protection Warrior</h2>
          </div>
          <div className="panel-body">
            <SpecIcon spec={SPECS.PROTECTION_WARRIOR} />
            https://github.com/WoWAnalyzer/WoWAnalyzer/pull/363

            By <Maintainer {...MAINTAINERS.Salarissia} />
          </div>
        </div>

        <div className="panel">
          <div className="date">
            8 Oct
          </div>
          <div className="panel-heading">
            <h2>More precise spell cooldown tracking</h2>
          </div>
          <div className="panel-body">
            https://github.com/WoWAnalyzer/WoWAnalyzer/pull/466

            By <Maintainer {...MAINTAINERS.Salarissia} />
          </div>
        </div>

        <div className="panel">
          <div className="date">
            10 Oct
          </div>
          <div className="panel-heading">
            <h2>Fixing combatlog bugs and inconsistencies: buff applications</h2>
          </div>
          <div className="panel-body">
            Combatlogs are bugged and inconsistent. We added a normalizer to fabricate buff applications to make usage easier and more consistent and fix bugs where an event might be completely missing. The combatlog has bugs where buffs applied prior to the pull may not show up anywhere in the combatlog, this most commonly occurs with Bloodlust. Using information such as buff drop, refresh and stack change events, we can fix these issues.
            https://github.com/WoWAnalyzer/WoWAnalyzer/pull/478
          </div>
        </div>

        <div className="panel">
          <div className="date">
            11 Oct
          </div>
          <div className="panel-heading">
            <h2>Frost Mage</h2>
          </div>
          <div className="panel-body">
            <SpecIcon spec={SPECS.FROST_MAGE} />
            <Maintainer {...MAINTAINERS.Sharrq} /> <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/pull/468">added</a> initial support for Frost Mages. His motivation was as follows:<br /><br />

            <blockquote>
              A friend of mine saw the boomkin stuff and was like "Hey Sharrq, check out this awesome site", and i looked at it and was like "oh thats why i havent seen this ... no mage support", and he jokingly said "You should do it!" so i looked at it to see how complicated it was ... and hey presto, mages
            </blockquote>

            By <Maintainer {...MAINTAINERS.Sharrq} /> and <Maintainer {...MAINTAINERS.sref} />
          </div>
        </div>

        <div className="panel">
          <div className="date">
            14 Oct
          </div>
          <div className="panel-heading">
            <h2>Checking legendary item levels</h2>
          </div>
          <div className="panel-body">
            It's easy to forget those things you need to do just once for a couple of things.
            https://github.com/WoWAnalyzer/WoWAnalyzer/pull/506

            By <Maintainer {...MAINTAINERS.Fyruna} />
          </div>
        </div>

        <div className="panel">
          <div className="date">
            14 Oct
          </div>
          <div className="panel-heading">
            <h2>Implemented accurate stat tracking</h2>
          </div>
          <div className="panel-body">
            This is a utility module intended to track the selected player's current stat rating. We pull initial stat rating from the combatantinfo, and track changes using a list of buffs. Obviously the list is currently quite sparse, and just there for testing. It can be freely added to, similar to the one in Haste.


            https://github.com/WoWAnalyzer/WoWAnalyzer/pull/520

            By <Maintainer {...MAINTAINERS.sref} />
          </div>
        </div>

        <div className="panel">
          <div className="date">
            15 Oct
          </div>
          <div className="panel-heading">
            <h2>Always be moving? 💃🕺</h2>
          </div>
          <div className="panel-body">
            <figure>
              <img src={DistanceMoved} alt="Distance moved" />
              <figcaption>
                The distance moved statistic shows how many times you walked from Orgrimmar to Uldum during the fight
              </figcaption>
            </figure>

            https://github.com/WoWAnalyzer/WoWAnalyzer/pull/522

            By <Maintainer {...MAINTAINERS.Fyruna} />

            janvavra added a <i>time spent moving</i> indicator relative to fight duration https://github.com/WoWAnalyzer/WoWAnalyzer/pull/689
          </div>
        </div>

        <div className="panel">
          <div className="date">
            16 Oct
          </div>
          <div className="panel-heading">
            <h2>Fire Mage</h2>
          </div>
          <div className="panel-body">
            <SpecIcon spec={SPECS.FIRE_MAGE} />
            https://github.com/WoWAnalyzer/WoWAnalyzer/pull/521

            Initial version by <Maintainer {...MAINTAINERS.Fyruna} />
            <Maintainer {...MAINTAINERS.sref} /> added a couple of things
            <Maintainer {...MAINTAINERS.Sharrq} /> added a lot of modules
          </div>
        </div>

        <div className="panel">
          <div className="date">
            20 Oct
          </div>
          <div className="panel-heading">
            <h2>Arms Warrior</h2>
          </div>
          <div className="panel-body">
            <SpecIcon spec={SPECS.ARMS_WARRIOR} />
            https://github.com/WoWAnalyzer/WoWAnalyzer/pull/571

            By <Maintainer {...MAINTAINERS.TheBadBossy} />
          </div>
        </div>

        <div className="panel">
          <div className="date">
            23 Oct
          </div>
          <div className="panel-heading">
            <h2>Unholy Death Knight</h2>
          </div>
          <div className="panel-body">
            <SpecIcon spec={SPECS.UNHOLY_DEATH_KNIGHT} />
            https://github.com/WoWAnalyzer/WoWAnalyzer/pull/602

            By <Maintainer {...MAINTAINERS.Khazak} />
          </div>
        </div>

        <div className="panel">
          <div className="date">
            24 Oct
          </div>
          <div className="panel-heading">
            <h2>Added support for healer stat weights</h2>
          </div>
          <div className="panel-body">
            https://github.com/WoWAnalyzer/WoWAnalyzer/pull/604

            Later renamed to https://github.com/WoWAnalyzer/WoWAnalyzer/pull/700

            <figure>
              <img src={RestoDruidStatWeights} alt="The initial Stat Weights panel" />
              <figcaption>
                The initial Stat Weights panel
              </figcaption>
            </figure>

            Initial support by <Maintainer {...MAINTAINERS.sref} />, generalized and extended a little by <Maintainer {...MAINTAINERS.Zerotorescue} />
          </div>
        </div>

        <div className="panel">
          <div className="date">
            29 Oct
          </div>
          <div className="panel-heading">
            <h2>Beast Mastery Hunter</h2>
          </div>
          <div className="panel-body">
            <SpecIcon spec={SPECS.BEAST_MASTERY_HUNTER} />
            https://github.com/WoWAnalyzer/WoWAnalyzer/pull/681

            By <Maintainer {...MAINTAINERS.Putro} />

            With the Marksmanship module gaining large popularity in the hunter community, requests for getting a Beast-Mastery equivalent grew, and with feedback/suggestions from the community and theorycrafters it’s now in a state where it also can replace (or enhance) many manual log reviews.

          </div>
        </div>

        <div className="panel">
          <div className="date">
            2 Nov
          </div>
          <div className="panel-heading">
            <h2>Frost Death Knight</h2>
          </div>
          <div className="panel-body">
            <SpecIcon spec={SPECS.FROST_DEATH_KNIGHT} />
            https://github.com/WoWAnalyzer/WoWAnalyzer/pull/712

            By <Maintainer {...MAINTAINERS.Bonebasher} />
          </div>
        </div>

        <div className="panel">
          <div className="date">
            4 Nov
          </div>
          <div className="panel-heading">
            <h2>Automatic fight and player selection</h2>
          </div>
          <div className="panel-body">
            https://github.com/WoWAnalyzer/WoWAnalyzer/pull/729

            By <Maintainer {...MAINTAINERS.Gao} />
          </div>
        </div>

        <div className="panel">
          <div className="date">
            5 Nov
          </div>
          <div className="panel-heading">
            <h2>Spell timelines</h2>
          </div>
          <div className="panel-body">
            https://github.com/WoWAnalyzer/WoWAnalyzer/pull/740
            https://github.com/WoWAnalyzer/WoWAnalyzer/pull/783
            https://github.com/WoWAnalyzer/WoWAnalyzer/pull/843

            By <Maintainer {...MAINTAINERS.Zerotorescue} />
          </div>
        </div>

        <div className="panel">
          <div className="date">
            5 Nov
          </div>
          <div className="panel-heading">
            <h2>Documentation, documentation, documentation</h2>
          </div>
          <div className="panel-body">
            Reason for picking this date: https://github.com/WoWAnalyzer/WoWAnalyzer/pull/743
            Subject: all doc improvements recently
            https://github.com/WoWAnalyzer/WoWAnalyzer/pull/748
            https://github.com/WoWAnalyzer/WoWAnalyzer/pull/779
            https://github.com/WoWAnalyzer/WoWAnalyzer/pull/983


            By <Maintainer {...MAINTAINERS.poneria} /> and <Maintainer {...MAINTAINERS.Zerotorescue} />
          </div>
        </div>

        <div className="panel">
          <div className="date">
            6 Nov
          </div>
          <div className="panel-heading">
            <h2>Changelog tab</h2>
          </div>
          <div className="panel-body">
            https://github.com/WoWAnalyzer/WoWAnalyzer/pull/747

            By <Maintainer {...MAINTAINERS.Zerotorescue} />
          </div>
        </div>

        <div className="panel">
          <div className="date">
            8 Nov
          </div>
          <div className="panel-heading">
            <h2>Improved error messages</h2>
          </div>
          <div className="panel-body">
            https://github.com/WoWAnalyzer/WoWAnalyzer/pull/755

            <figure>
              <img src={ApiIsDown} alt="API is down error" />
              <figcaption>
                When the API is down for a known reason we explain what is going on and what you can expect
              </figcaption>
            </figure>

            By <Maintainer {...MAINTAINERS.Zerotorescue} />
          </div>
        </div>

        <div className="panel">
          <div className="date">
            10 Nov
          </div>
          <div className="panel-heading">
            <h2>Checking your legendaries 2.0</h2>
          </div>
          <div className="panel-body">
            https://github.com/WoWAnalyzer/WoWAnalyzer/pull/780

            By <Maintainer {...MAINTAINERS.Gao} />
          </div>
        </div>

        <div className="panel">
          <div className="date">
            11 Nov
          </div>
          <div className="panel-heading">
            <h2>Protection Paladin</h2>
          </div>
          <div className="panel-body">
            <SpecIcon spec={SPECS.PROTECTION_PALADIN} />
            https://github.com/WoWAnalyzer/WoWAnalyzer/pull/781

            By <Maintainer {...MAINTAINERS.Yajinni} /> and <Maintainer {...MAINTAINERS.Noichxd} />
          </div>
        </div>

        <div className="panel">
          <div className="date">
            12 Nov
          </div>
          <div className="panel-heading">
            <h2>A big warning for specs that aren't maintained</h2>
          </div>
          <div className="panel-body">
            https://github.com/WoWAnalyzer/WoWAnalyzer/pull/785

            Mention here that even if a spec is being maintained we are still always looking for more interested people to help us continue extending it
          </div>
        </div>

        <div className="panel">
          <div className="date">
            12 Nov
          </div>
          <div className="panel-heading">
            <h2>Using the time on cooldown for cast efficiency</h2>
          </div>
          <div className="panel-body">
            https://github.com/WoWAnalyzer/WoWAnalyzer/pull/799

            By <Maintainer {...MAINTAINERS.sref} />
          </div>
        </div>

        <div className="panel">
          <div className="date">
            28 Nov
          </div>
          <div className="panel-heading">
            <h2>Updated for Antorus</h2>
          </div>
          <div className="panel-body">
            While not every change is listed in this article (see the changelog for smaller changes), this milestone marks the release of the Antorus raid. We've been hard at work to update all the things changed and add support for all the new items and stuff.
          </div>
        </div>

        <div className="panel">
          <div className="date">
            28 Nov
          </div>
          <div className="panel-heading">
            <h2>Frontpage reworked</h2>
          </div>
          <div className="panel-body">
            https://github.com/WoWAnalyzer/WoWAnalyzer/pull/882

            By <Maintainer {...MAINTAINERS.Zerotorescue} />
          </div>
        </div>

        <div className="panel">
          <div className="date">
            30 Nov
          </div>
          <div className="panel-heading">
            <h2>Stats on pull</h2>
          </div>
          <div className="panel-body">
            https://github.com/WoWAnalyzer/WoWAnalyzer/pull/890

            By <Maintainer {...MAINTAINERS.Zerotorescue} />
          </div>
        </div>

        <div className="panel">
          <div className="date">
            7 Dec
          </div>
          <div className="panel-heading">
            <h2>Google's translation disabled to fix crashes</h2>
          </div>
          <div className="panel-body">
            Bug in React that causes constant crashes
            Realistically nothing we can do to fix it

            https://github.com/WoWAnalyzer/WoWAnalyzer/pull/949

            By <Maintainer {...MAINTAINERS.Zerotorescue} />
          </div>
        </div>

        <div className="panel">
          <div className="date">
            14 Dec
          </div>
          <div className="panel-heading">
            <h2>Checking your items for proper enchants</h2>
          </div>
          <div className="panel-body">
            https://github.com/WoWAnalyzer/WoWAnalyzer/pull/974

            <figure>
              <img src={EnchantChecker} alt="Example suggestions" />
              <figcaption>
                The suggestions shown when missing an enchant or using a cheap enchant. It's easy performance!
              </figcaption>
            </figure>

            By <Maintainer {...MAINTAINERS.Khazak} />
            <Maintainer {...MAINTAINERS.Putro} /> added support for WoD cloak enchants https://github.com/WoWAnalyzer/WoWAnalyzer/pull/1072
          </div>
        </div>

        <div className="panel">
          <div className="date">
            14 Dec
          </div>
          <div className="panel-heading">
            <h2>Fury Warrior</h2>
          </div>
          <div className="panel-body">
            <SpecIcon spec={SPECS.FURY_WARRIOR} />
            https://github.com/WoWAnalyzer/WoWAnalyzer/pull/982

            By <Maintainer {...MAINTAINERS.Maldark} />
          </div>
        </div>

        <div className="panel">
          <div className="date">
            24 Dec
          </div>
          <div className="panel-heading">
            <h2>Version 2.0 is here! Check your fights with the all new checklist</h2>
          </div>
          <div className="panel-body">
            Bug in React that causes constant crashes
            Realistically nothing we can do to fix it

            https://github.com/WoWAnalyzer/WoWAnalyzer/pull/970
            https://www.reddit.com/r/wow/comments/7lvuu7/version_20_of_wowanalyzer_is_live_with_a_big_new/

            By <Maintainer {...MAINTAINERS.Zerotorescue} /> and find everyone that added support
            <Maintainer {...MAINTAINERS.hassebewlen} />: Shadow Priest https://github.com/WoWAnalyzer/WoWAnalyzer/pull/981
            <Maintainer {...MAINTAINERS.Putro} />: Marksmanship Hunter https://github.com/WoWAnalyzer/WoWAnalyzer/pull/999
            <Maintainer {...MAINTAINERS.Putro} />: Beast Mastery Hunter https://github.com/WoWAnalyzer/WoWAnalyzer/pull/1032
            <Maintainer {...MAINTAINERS.Anomoly} />: Mistweaver Monk https://github.com/WoWAnalyzer/WoWAnalyzer/pull/1005
            <Maintainer {...MAINTAINERS.sref} />: Frost Mage https://github.com/WoWAnalyzer/WoWAnalyzer/pull/1006
            <Maintainer {...MAINTAINERS.Hartra344} />: Restoration Shaman https://github.com/WoWAnalyzer/WoWAnalyzer/pull/988
            <Maintainer {...MAINTAINERS.Khazak} />: Unholy Death Knight https://github.com/WoWAnalyzer/WoWAnalyzer/pull/1031
            <Maintainer {...MAINTAINERS.Chizu} />: Affliction Warlock https://github.com/WoWAnalyzer/WoWAnalyzer/pull/1092
            <Maintainer {...MAINTAINERS.Gebuz} />: Balance Druid https://github.com/WoWAnalyzer/WoWAnalyzer/pull/1096
            <Maintainer {...MAINTAINERS.Hewhosmites} />: Retribution Paladin https://github.com/WoWAnalyzer/WoWAnalyzer/pull/1136
          </div>
        </div>

        <div className="panel">
          <div className="date">
            28 Dec
          </div>
          <div className="panel-heading">
            <h2>Death tracking</h2>
          </div>
          <div className="panel-body">
            https://github.com/WoWAnalyzer/WoWAnalyzer/pull/1066

            By <Maintainer {...MAINTAINERS.Sharrq} />
          </div>
        </div>

        <div className="panel">
          <div className="date">
            2 Jan
          </div>
          <div className="panel-heading">
            <h2>Casting time bar in the spell timeline tab</h2>
          </div>
          <div className="panel-body">
            https://github.com/WoWAnalyzer/WoWAnalyzer/pull/1050

            While not a major change, this has shown to be incredibly useful for fixing bugs in the gcd/channel time displays

            By <Maintainer {...MAINTAINERS.Zerotorescue} />
          </div>
        </div>

        <div className="panel">
          <div className="date">
            2 Jan
          </div>
          <div className="panel-heading">
            <h2>Nekorsis added a gear tab</h2>
          </div>
          <div className="panel-body">
            https://github.com/WoWAnalyzer/WoWAnalyzer/pull/1017

            By <Maintainer {...MAINTAINERS.Nekorsis} />
          </div>
        </div>

        <div className="panel">
          <div className="date">
            4 Jan
          </div>
          <div className="panel-heading">
            <h2>A major rework to the abilities config</h2>
          </div>
          <div className="panel-body">
            https://github.com/WoWAnalyzer/WoWAnalyzer/pull/1086

            By <Maintainer {...MAINTAINERS.Zerotorescue} />
          </div>
        </div>

        <div className="panel">
          <div className="date">
            8 Jan
          </div>
          <div className="panel-heading">
            <h2>You're looking at it! Added a news system</h2>
          </div>
          <div className="panel-body">
            https://github.com/WoWAnalyzer/WoWAnalyzer/pull/1154

            By <Maintainer {...MAINTAINERS.Zerotorescue} />
          </div>
        </div>

        <div className="panel">
          <div className="date">
            15 Jan
          </div>
          <div className="panel-heading">
            <h2>Know what's the matter with the all new status page</h2>
          </div>
          <div className="panel-body">
            In order to provide quick status updates when our service is degraded due to an outage or for another reason, we added a <a href="https://status.wowanalyzer.com/">status page</a>. On this status page we can indicate when something is not running optimally and what the cause and impact are.<br /><br />

            <figure>
              <img src={StatusPage} alt="Status page" />
              <figcaption>
                We rely heavily on the data from Warcraft Logs. If it's unavailable we can no longer analyze fights for players that haven't been analyzed before.
              </figcaption>
            </figure>
            <br />

            When there's a service degradation we will show an alert on the report selector to inform everyone of potential issues.<br /><br />

            <figure>
              <img src={OutageAlert} alt="Outage alert in the report selection" />
              <figcaption>
                When there's something not working optimally we will show a big indicator on the report selection.
              </figcaption>
            </figure>
            <br />

            The status page runs on an different server in a different datacenter in a different country. This should ensure that it will be there when the main server is down. In hindsight I'm not sure what the point of that is considering we can all use <a href="https://discord.gg/AxphPxU">Discord</a> anyway, but it's there nonetheless.<br /><br />

            By <Maintainer {...MAINTAINERS.Zerotorescue} />
          </div>
        </div>

        Survival:
        https://github.com/WoWAnalyzer/WoWAnalyzer/pull/1202 Initial version by Putro.
        With both Beast-Mastery and Marksmanship modules being close to completed, Putro began work on the Survival module in early 2018.

        {/* TODO: Go through commits for a second pass since we commited a bunch of interesting thigns directly without PR */}
        {/* TODO: Go through commits for old screenshots */}

        <div className="panel">
          <div className="date">
            10 Jul
          </div>
          <div className="panel-heading">
            <h2>Other contributions</h2>
          </div>
          <div className="panel-body">
            <Maintainer {...MAINTAINERS.aryu} />: Filter kills only fight: https://github.com/WoWAnalyzer/WoWAnalyzer/pull/106
            <Maintainer {...MAINTAINERS.Riglerr} />: Updated Cooldown Tab & components to be able to represent damage as well as healing: https://github.com/WoWAnalyzer/WoWAnalyzer/pull/53
            <Maintainer {...MAINTAINERS.BlokyKappa} />: Fixed main page button alignment
            <Maintainer {...MAINTAINERS.kyleglick} />: https://github.com/WoWAnalyzer/WoWAnalyzer/pull/924
            <Maintainer {...MAINTAINERS.Zeboot} />: Merge magic schools in Damage Taken https://github.com/WoWAnalyzer/WoWAnalyzer/pull/1013
          </div>
        </div>
      </Wrapper>
    );
  }

  render() {
    return (
      <RegularArticle bodyStyle={{ position: 'relative', overflow: 'hidden' }} {...this.props}>
        It has already been a year! Time flies when you're having fun working hard. We want to use this milestone to look back at the progress we have made during this past year. It's a lot of work supporting all specs with sufficiently useful information, but we've made good progress.<br /><br />

        The project was started by <Maintainer {...MAINTAINERS.Zerotorescue} /> (a <span className="Paladin">Holy Paladin</span> theorycrafter) to do additional analysis to help with theorycrafting. Since it took several months before other contributors joined the project, the first half of the recap will be written from my point of view.<br /><br />

        In addition to the detailed recap below, here are some other interesting statistics:<br /><br />

        <ul style={{ marginBottom: 20 }}>
          <li><b>34</b> specs implemented with <b>16</b> specs marked as being {completeness(SPEC_ANALYSIS_COMPLETENESS.GOOD)} or {completeness(SPEC_ANALYSIS_COMPLETENESS.GREAT)}</li>
          <li><a href="https://github.com/WoWAnalyzer/WoWAnalyzer"><b>6,378 commits</b></a> from over <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/graphs/contributors"><b>58 contributors</b></a></li>
          <li><b>1,416 files</b> with over <b>141,371 lines of code</b></li>
          <li>Peak usage had over <b>140,000 unique visitors</b> and <b>13,500,000 requests</b> in a single month</li>
          <li><a href="https://discord.gg/AxphPxU">Our Discord server</a> has over <b>1,200 members</b></li>
          <li>It usually takes <a href="https://travis-ci.org/WoWAnalyzer/WoWAnalyzer/builds">about <b>5 minutes</b></a> for a code-change to be available on WoWAnalyzer.com</li>
        </ul>

        <hr style={{ marginBottom: 20 }} />

        <Timeline>
          <div className="panel">
            <div className="date">
              31 Jan
            </div>
            <div className="panel-heading">
              <h2>The initial launch</h2>
            </div>
            <div className="panel-body">
              The 31st of January marked the launch of the first version of WoWAnalyzer, then named the <b>Holy Paladin mastery effectiveness calculator</b>. It was created out of the need to do more complex analysis that would not have be possible with only a simple spreadsheet.<br /><br />

              To understand what the project did back then you need to know that <SpellLink id={SPELLS.MASTERY_LIGHTBRINGER.id} icon>Mastery</SpellLink> causes a Holy Paladin's healing to be increased based on how close she is to the player she's healing. 0-10 yards provides full effectiveness and 10-40 yards decreases the boost to 0% linearly. In order to calculate how effective Mastery is you need to know the distance between the Holy Paladin and her target.<br /><br />

              For a long time it seemed impossible to accurately calculate this based on a log, but after a night of playing with Warcraft Logs' replay function to estimate my Mastery Effectiveness, I realized that it must have access to a player locations to be able to show the replay like it does. After some figuring out I got a proof of concept working, which became the <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/commit/bd7971995fe16d14aec7286765c13c2984c44d76">first commit</a> at <b>31 Jan 2017 00:02 CET</b>. I named project "Holy Paladin mastery effectiveness calculator" at the time because that was all it did.<br /><br />

              <figure>
                <img src={v001} alt="v0.0.1" />
                <figcaption>
                  Holy Paladin mastery effectiveness calculator v0.0.1. Do note that at the time WCL throttled the events API to 300 events per API call, so loading a fight took considerably longer back then.
                </figcaption>
              </figure>
            </div>
          </div>

          {this.state.expanded && this.renderExpansion()}
        </Timeline>
        {!this.state.expanded && (
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 300,
              background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 90%)',
              textTransform: 'uppercase',
              fontWeight: 'bold',
              fontSize: 22,
              textAlign: 'center',
              display: 'flex',
              alignItems: 'flex-end',
              paddingBottom: 15,
              cursor: 'pointer',
            }}
            onClick={() => {
              this.setState({
                expanded: true,
              });
            }}
          >
            <div style={{ width: '100%' }}>
              Continue reading
            </div>
          </div>
        )}
      </RegularArticle>
    );
  }
}


export default (
  <Article title="WoWAnalyzer's first anniversary" published="2017-12-24" />
);
