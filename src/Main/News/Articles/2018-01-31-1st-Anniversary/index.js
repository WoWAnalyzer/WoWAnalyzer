import React from 'react';
import PropTypes from 'prop-types';

import * as CONTRIBUTORS from 'CONTRIBUTORS';
import SpellLink from 'common/SpellLink';
import ItemLink from 'common/ItemLink';
import ItemIcon from 'common/ItemIcon';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import SPECS from 'common/SPECS';
import Wrapper from 'common/Wrapper';
import RegularArticle from 'Main/News/RegularArticle';
import Contributor from 'Main/Contributor';
import DiscordButton from 'Main/DiscordButton';
import DiscordLogo from 'Main/Images/Discord-Logo+Wordmark-White.svg';
import AntorusImage from 'Raids/AntorusTheBurningThrone/Images/antorus.jpg';

import Timeline from './Timeline';
import Item from './TimelineItem';
import Image from './TimelineItemImage';

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
import SubtletyRogue from './SubtletyRogue.png';
import GuardianDruid from './GuardianDruid.png';
import EnhancementShaman from './EnhancementShaman.png';
import VengeanceDemonHunter from './VengeanceDemonHunter.png';
import EventsTab from './EventsTab.png';
import AfflictionWarlock from './AfflictionWarlock.png';
import BrewmasterMonk from './BrewmasterMonk.png';
import ShadowPriest from './ShadowPriest.png';
import BalanceDruid from './BalanceDruid.png';
import FeralDruid from './FeralDruid.png';
import DestructionWarlock from './DestructionWarlock.png';
import BloodDeathKnight from './BloodDeathKnight.png';
import HavocDemonHunter from './HavocDemonHunter.png';
import MarksmanshipHunter from './MarksmanshipHunter.png';
import RetributionPaladin from './RetributionPaladin.png';
import DemonologyWarlock from './DemonologyWarlock.png';
import ProtectionWarrior from './ProtectionWarrior.png';
import FrostMage from './FrostMage.png';
import FireMage from './FireMage.png';
import ArmsWarrior from './ArmsWarrior.png';
import UnholyDeathKnight from './UnholyDeathKnight.png';
import BeastMasteryHunter from './BeastMasteryHunter.png';
import FrostDeathKnight from './FrostDeathKnight.png';
import ProtectionPaladin from './ProtectionPaladin.png';
import FuryWarrior from './FuryWarrior.png';
import SurvivalHunter from './SurvivalHunter.png';
import DiscordBotGif from '../2017-10-21-DiscordBot/discord-bot.gif';
import HolyShockAvailableSuggestion from './HolyShockAvailableSuggestion.png';
import FirstPR from './FirstPR.png';
import LegendaryItemLevelSuggestion from './LegendaryItemLevelSuggestion.png';
import DistanceMoved20 from './DistanceMoved2.0.png';
import LightOfDawnSpellTimeline from './LightOfDawnSpellTimeline.png';
import SpellTimeline from './SpellTimeline.png';
import Documentation from './Documentation.gif';
import ChangelogTab from './ChangelogTab.png';
import LegendaryCountChecker from './LegendaryCountChecker.png';
import NotActivelyMaintainedBox from './NotActivelyMaintainedBox.png';
import Frontpage20 from './Frontpage2.0.png';
import StatsOnPull from './StatsOnPull.png';
import AssassinationRogue from './AssassinationRogue.png';
import HolyPaladinChecklist from './HolyPaladinChecklist.png';
import HolyPaladinChecklistRule from './HolyPaladinChecklistRule.png';
import ChecklistResultsLayout from './ChecklistResultsLayout.png';
import DeathTracker from './DeathTracker.png';
import CastingTime from './CastingTime.png';
import GearTab from './GearTab.png';
import WoWAnalyzerPartyHat from './WoWAnalyzerPartyHat.png';

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
        <Item title="A new layout" date="4 Feb">
          As the project was getting a lot of attention in the Holy Paladin community, the layout was cleaned up a bit and a player breakdown was added. This layout stayed largely the same for a couple of months.<br /><br />

          <Image source={v020} description="Holy Paladin mastery effectiveness calculator v0.2.0" /><br />

          With the mantra <a href="https://en.wikipedia.org/wiki/Release_early,_release_often">release early, release often</a> in mind the project quickly went through a lot of minor versions during this month. Among other things the need for users to enter their own WCL API key was removed, URL routing was added (so you can directly link to a log) and a <SpellLink id={SPELLS.RULE_OF_LAW_TALENT.id} icon /> uptime display (which improves a Holy Paladin's mastery effectiveness so was related) was added.
        </Item>

        <Item title={<Wrapper>Analyzing the first item: <ItemIcon id={ITEMS.DRAPE_OF_SHAME.id} /> Drape of Shame</Wrapper>} date="18 Mar">
          In March a statistic that broadened the scope of project was added as it wasn't just related to a Holy Paladin's mastery effectiveness; the <ItemLink id={ITEMS.DRAPE_OF_SHAME.id} icon /> healing contribution statistic. For the first time this statistic gave insight into the exact value of <ItemLink id={ITEMS.DRAPE_OF_SHAME.id} icon />.<br /><br />

          <Image source={v031} description="Holy Paladin mastery effectiveness calculator v0.3.1 statistics at 18 Mar 2017" /><br />

          The implementation of <ItemLink id={ITEMS.DRAPE_OF_SHAME.id} icon /> included a large part of the work needed for adding items, so it was possible to quickly add statistics for the similar legendaries <ItemLink id={ITEMS.ILTERENDI_CROWN_JEWEL_OF_SILVERMOON.id} icon /> and <ItemLink id={ITEMS.VELENS_FUTURE_SIGHT.id} icon /> in the next few days.
        </Item>

        <Item title="Feeding other tools with new cast behavior statistics" date="25 Mar">
          At the time Holy Paladins used a spreadsheet that I maintained to calculate their stat weights since healers can't be simmed. In an attempt to make filling the required fields easier and more accurate, I decided to add the required <b>cast behavior</b> statistics. This was the most important non-trivial information required that was used in the spreadsheet. This addition opened the door to showing more ability based statistics.<br /><br />

          <Image source={HolyPaladinMasteryCalculatorV09} description="The new cast ratios display (Holy Paladin mastery effectiveness calculator v0.9 at 25 Mar 2017)" />
        </Item>

        <Item title="A big rewrite and a new name: Holy Paladin Analyzer" date="26 Mar">
          The project was growing rapidly and that didn't seem to be going to stop anytime soon. Due to the organic growth of the project the codebase had kind of gotten... a mess. So it was time for spring cleaning!<br /><br />

          I rewrote pretty much every part of the codebase so that it would become easier to maintain and extend. The idea was to make every statistic a standalone module that completely isolates the analysis logic, and there would be a central "mission control center" that would take care of <i>rendering</i> the information in the proper way. This modular approach turned out to work really well and is still largely in place today. We did end up removing the central "mission control center" much later and instead now also include the rendering in each module to completely isolate separate modules.<br /><br />

          Accompanying this big rewrite was a name change and a version bump to <b>Holy Paladin Analyzer v1.0</b>. It only made sense since the scope has grown beyond just calculating mastery effectiveness.
        </Item>

        <Item title="Always Be Casting" date="4 Apr">
          Another important part of the Holy Paladin spreadsheet was downtime as this has a big impact on spell and mana usage. In the past I had already made a spreadsheet to estimate this based on total casts done and fight duration, but this didn't have the accuracy the analyzer could provide.<br /><br />

          <Image source={HolyPaladinAnalyzerV141} description="Holy Paladin Analyzer v1.4.1: new downtime statistic at 4 Apr 2017" />
        </Item>

        <Item title="And yet another layout rework" date="7 Apr">
          I usually start disliking things I designed myself in less than 2 days, and the project had been stuck with this basic layout for over 2 months so it was time to redo it once again. Inspired by <a href="http://akveo.com/blur-admin/#/dashboard">Blur Admin</a> I designed a new layout that was the basis for what we have today (disclaimer: I'm not a graphic designer).<br /><br />

          <Image source={HolyPaladinAnalyzerV20} description="Holy Paladin Analyzer v2.0: a new look at 7 Apr 2017" wide /><br />

          Over the next few months this layout has been updated left and right to improve it. Things like the red border on top of panels, added icons and color coding to panels to make them easier to scan, etc.
        </Item>

        <Item title="Check your cast efficiency with the Cast Efficiency panel" date="11 Apr">
          A Holy Paladin's most efficient spells are those that have a cooldown on them. This makes it very important to cast spells with cooldowns on them regularly for optimal performance. This led to the <b>Cast Efficiency</b> feature that was added showing the actual casts and an estimated max possible casts. The <i>Can be improved</i> indicator in this panel was the first step towards showing gameplay <i>suggestions</i>, something I had been thinking about doing for a long time.<br /><br />

          <Image source={HolyPaladinAnalyzerV24} description="The initial cast efficiency panel (Holy Paladin Analyzer v2.4 at 11 Apr 2017)" /><br />

          With cast efficiency implemented, the Holy Paladin Analyzer now calculated the biggest part of the important metrics for Holy Paladins.
        </Item>

        <Item title="Helping people help themselves with suggestions" date="14 Apr">
          With the biggest part of the analysis required for Holy Paladins implemented, it finally meant I could implement the <b>suggestions</b> panel I wanted to do. The first version looked like this:<br /><br />

          <Image source={HolyPaladinAnalyzerV30Suggestions} description="The first suggestions (Holy Paladin Analyzer v3.0 at 14 Apr 2017)" wide /><br />

          The introduction of suggestions shifted the focus of the project a fair bit. In the past the focus was on showing hard to calculate metrics for helping theorycrafting, comparing items and improving data for other tools. After the introduction of suggestions the primary focus became more about helping the player improve his own performance. Calculating useful metrics for other purposes is still a goal but it is no longer the primary focus.<br /><br />

          The focus of the project was later solidified in a <a href="https://github.com/WoWAnalyzer/WoWAnalyzer#vision">Vision</a> section of the readme of the project.
        </Item>

        <Item title="Mana graph" date="19 Apr">
          A good rule of thumb when learning to manage your mana is to try to match your mana level with the boss's health pool. The mana tab was added to make it easy to see this.<br /><br />

          <Image source={ManaTab} description="The mana tab for Elisande" />
        </Item>

        <Item title="The launch of WoWAnalyzer.com 🎉" date="13 May">
          At 11 May 2017 I decided on the name to use, purchased the <b>WoWAnalyzer.com</b> domain and started work on support for multiple specs in a single project. By 13 May 2017 I had finished implementing support for multiple spec analyzers. I rebranded the project to WoWAnalyzer and officially launched WoWAnalyzer.com at 13 May 2017.<br /><br />

          <Image source={WoWAnalyzerV10} description="Going through all parts of the Holy Paladin section of WoWAnalyzer v1.0 at 13 May 2017" />
        </Item>

        <Item title="Restoration Druid 🍂" date="15 May">
          <SpecIcon spec={SPECS.RESTORATION_DRUID} />
          At 6 May 2017 <Contributor {...CONTRIBUTORS.blazyb} /> reached out about creating an analyzer for <span className="Druid">Restoration Druid</span>. I talking him through it for a bit and he shared a lot feedback during the process. His feedback helped a lot to rewrite even more of the codebase to make it easier for others to work with and to make it more natural to implement different specs. After talking with <Contributor {...CONTRIBUTORS.blazyb} /> about the future of the project a lot I decided that the best approach would be to launch a single website for multiple specs with it selecting the spec analyzer needed.<br /><br />

          Meanwhile <Contributor {...CONTRIBUTORS.blazyb} /> worked on the <b>Resto Druid Analyzer</b> and ran an extensive private beta test. The Resto Druid Analyzer was finally publicly released at 15 May 2017. Due to the amount of work involved in moving it into the shared project, it was initially released as a standalone "fork". The Resto Druid Analyzer was fully merged into the WoWAnalyzer project at 21 May 2017.<br /><br />

          <Image source={RestoDruidAnalyzerV10} description="Resto Druid Analyzer v1.0 at 15 May 2017" /><br />

          Other contributions to this spec:<br /><br />

          <Contributor {...CONTRIBUTORS.greatman} /> contributored the initial Dreamwalker statistic.<br />
          <Contributor {...CONTRIBUTORS.rubensayshi} /> introduced the concept of fixing bugs in Blizzard's combatlogs by re-ordering events. This concept evolved to "Events Normalizers" that we use today for fixing all sorts of weird combatlog bugs. He also improved a couple of features of the Resto Druid analyzer.<br />
          <Contributor {...CONTRIBUTORS.sref} /> has done a lot of work on the Restoration Druid implementation and has added and improved a large part of the spec implementation.
        </Item>

        <Item title="Discipline Priest" date="19 May">
          <SpecIcon spec={SPECS.DISCIPLINE_PRIEST} />
          At 31 March 2017 <b>Josh</b> (aka MethodJosh) contacted me about putting the code under an open license so that he could use parts for Disc Priest analysis. This led to a license that allows usage in non-commercial open source projects which was later replaced with the more formal <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/blob/master/LICENSE">AGPL</a> license that we still use today.<br /><br />

          Around the start of May I started thinking and talking about possibly adding support for another spec. I wanted to do this to continue growing the project and experience adding a new spec myself (after all the changes) and refine any rough edges I would run into. I got to talking with <b>Josh</b> again and he showed me a lot of research material that would help a lot in adding analysis for the spec. So I decided to start working on adding support for <b>Discipline Priest</b>. The first version of the Discipline Priest was added at 14 May 2017, and it was in a good state by 19 May 2017.<br /><br />

          <Image source={WoWAnalyzerV109} description="Discipline Priest (WoWAnalyzer v1.1.0 at 20 May 2017)" />
          <br />

          This spec had a lot of people contributing code: <Contributor {...CONTRIBUTORS.Zerotorescue} />, <Contributor {...CONTRIBUTORS.Reglitch} />, <Contributor {...CONTRIBUTORS.nutspanther} />, <Contributor {...CONTRIBUTORS.Oratio} />, <Contributor {...CONTRIBUTORS.Gao} />, <Contributor {...CONTRIBUTORS.hassebewlen} />, and <Contributor {...CONTRIBUTORS.milesoldenburg} />.
        </Item>

        <Item title="The first PR by an outside contributor!" date="19 May">
          Getting the first PR was very exciting! It meant someone else was interested enough in my project to dedicate time and effort towards improving it. <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/pull/22">Our first PR</a> was created by <Contributor {...CONTRIBUTORS.Reglitch} /> at 19 May 2017. In it he contributed an "editorconfig" file: "Fairly self explanatory, enforces consistency when multiple devs are working on the project.". It was merged a day later.<br /><br />

          <Image source={FirstPR} description="The first PR" /><br />

          <Contributor {...CONTRIBUTORS.Reglitch} /> has done a lot more work since then, primarily on the Discipline Priest implementation. He is now a part of the WoWAnalyzer admin team.
        </Item>

        <Item title="Cooldowns overview" date="20 May">
          The cooldowns tab was added to give easy insight into important cooldown usages, spells cast during them and the resulting throughput, all in one simple view.<br /><br />

          <Image source={WoWAnalyzerV11} description="The cooldown overview shows all spell casts during a cooldown, when expanded it shows the time delay of each spell to reveal inefficient cooldown usages." />
        </Item>

        <Item title="A wild Discord server appeared!" date="24 May">
          Since the start of the project I had been using the <kbd>#holy</kbd> channel of the <a href="https://discordapp.com/invite/hammerofwrath">Hammer of Wrath</a> Discord server to discuss changes and receive feedback. I didn't want to make another Discord server since I wanted to avoid moving Holy Paladin specific analysis discussions and questions away from the HoW server. At the same time it was often difficult discussing more technical aspects in this channel.<br /><br />

          While <Contributor {...CONTRIBUTORS.blazyb} /> was working on developing the Resto Druid Analyzer he used a Discord server for feedback, updates, questions and requests. Seeing how well this worked led to making the shared <a href="https://discord.gg/AxphPxU">WoWAnalyzer Discord server</a> that we use today.<br /><br />

          <Image source={DiscordChannels} description="The public channels available today." />
          <br />

          If you're interested in learning more about the development of WoWAnalyzer, have any sort of feedback or just want to talk with us come join!<br />

          <DiscordButton />
        </Item>

        <Item title="Mistweaver Monk" date="25 May">
          <SpecIcon spec={SPECS.MISTWEAVER_MONK} />
          <span className="Monk">Mistweaver Monk</span> support was <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/pull/33">first proposed</a> by <Contributor {...CONTRIBUTORS.Anomoly} /> at 23 May 2017, and merged to WoWAnalyzer.com after a short review process a day later. His reasoning for getting involved:<br /><br />

          <blockquote>
            I was looking at a way to help out and extend support for the CheckMyWoW site, which at the time was the only analysis site I was aware of. I built a list of suggestions and features to potentially work on with that site, but this was just around the time Zerotorescue had started to extend and open up WoWAnalyzer to other specs. I figured this was a great opportunity to both get involved in something WoW related, help my fellow Mistweavers and also learn some JavaScript / React in the process!
          </blockquote>

          <Image source={WoWAnalyzerV111} description="WoWAnalyzer v1.1.1: initial Mistweaver support" />
        </Item>

        <Item title="Restoration Shaman" date="28 May">
          <SpecIcon spec={SPECS.RESTORATION_SHAMAN} />
          Original support for Restoration Shaman was <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/pull/39">added</a> by <Contributor {...CONTRIBUTORS.Versaya} />. He worked on this for a long time to make it into a big part of what it is today.<br /><br />

          <Image source={RestoShaman} description="Initial Restoration Shaman" /><br />

          <Contributor {...CONTRIBUTORS.Versaya} /> also added the unique <b>feeding</b> tab. This shows the healing done by spells that feed into <SpellLink id={SPELLS.CLOUDBURST_TOTEM_TALENT.id} icon /> while it was up.<br /><br />

          <Image source={RestoShamanFeeding} description="The feeding tab" /><br />

          The spec had contributions from a couple of other contributors. <Contributor {...CONTRIBUTORS.aryu} /> added the very interesting <SpellLink id={SPELLS.ANCESTRAL_VIGOR_TALENT.id} /> metric that shows amount of lives saved. <Contributor {...CONTRIBUTORS.Anomoly} /> migrated the spec to the new WoWAnalyzer version so that it would become easier to maintain and added T21 2 set and 4 set. <Contributor {...CONTRIBUTORS.Hartra344} /> later took over as maintainer of the spec and implemented the checklist as well as a bunch of other features.
        </Item>

        <Item title="Continuous deployment (and our first server)" date="2 Jun">
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

          <Contributor {...CONTRIBUTORS.strel} /> guided me through setting up most of this initially; we wouldn't have this amazing setup without his help. Since the initial setup we have made some improvements, we will give more insight into our full setup in a future article.
        </Item>

        <Item title="Elemental Shaman" date="4 Jun">
          <SpecIcon spec={SPECS.ELEMENTAL_SHAMAN} />
          The initial version of Elemental Shaman was added by <Contributor {...CONTRIBUTORS.fasib} />. This included cast efficiency, the cooldown tab only included <SpellLink id={SPELLS.ASCENDANCE_TALENT_ELEMENTAL.id} icon /> (if specced) and <SpellLink id={SPELLS.STORMKEEPER.id} icon />, and introduced two new things: a procs tab and a Maelstrom tab.<br /><br />

          <Image source={ElementalShamanCastEfficiency} description="Elemental Shaman cast efficiency" /><br />

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
          </div>
          <br />

          <Contributor {...CONTRIBUTORS.janvavra} /> <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/pull/469">contributed a couple of simple fixes</a> for Elemental Shamans using <SpellLink id={SPELLS.STORM_ELEMENTAL_TALENT.id} icon />. <Contributor {...CONTRIBUTORS.HawkCorrigan} /> migrated Elemental Shaman's code to a new version of WoWAnalyzer and implemented a bunch of things such as T21, <ItemLink id={ITEMS.THE_DECEIVERS_BLOOD_PACT.id} icon /> and others.
        </Item>

        <Item title="Warcraft Logs API proxy" date="15 Jun">
          To get log data we fetch data from the Warcraft Logs API. In the past the app made a direct link to Warcraft Logs API but this had several disadvantages such as revealing our API key, lacking caching, hard to use due to several issues with the API and missing any form of logging.<br /><br />

          At the start of June, Warcraft Logs had introduced strict rate limiting of their API. Because of this restrictive API request limit we had a big fear of hitting the cap and locking users out, especially when report links would be shared in Discord servers and a bunch of users would open the same report at the same time.<br /><br />

          To combat these issue we added a proxy for the Warcraft Logs API on our server. We also added a caching layer to aggressively cache all of our API requests. This considerably reduces the amount of API requests we have to do allowing us to serve a lot more users. This has the added benefit that cached requests are very quick and are even available when Warcraft Logs goes down.
        </Item>

        {/* Not interesting */}
        {/*<Item title="Development tab" date="25 Jun">
          86c6c930dd8a2a606055f47fa0a4793c314e907b

            By <Contributor {...CONTRIBUTORS.Zerotorescue} />

            <Image source={DevelopmentTools} description="The development tab at introduction" />
          </Item>*/}

        <Item title="Holy Priest" date="1 Jul">
          <SpecIcon spec={SPECS.HOLY_PRIEST} />
          Holy Priest support was <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/pull/96">added</a> by <Contributor {...CONTRIBUTORS.enragednuke} />. He says his motivation to add it was mostly a combination of watching <Contributor {...CONTRIBUTORS.Reglitch} /> develop the Discipline Priest module (he was occasionally streaming development at the time) and a want to learn more JavaScript. And he just happened to play a spec not yet supported.<br /><br />

          <Image source={HolyPriest} description="The initial Holy Priest version" /><br />

          <Contributor {...CONTRIBUTORS.Skamer} /> also contributed a couple of things to this spec, such as support for the <SpellLink id={SPELLS.DIVINITY_TALENT.id} icon />.
        </Item>

        <Item title="Low health healing" date="5 Jul">
          Sparked by a discussion in the Holy Paladin Discord about what healers actually save most lives I decided I wanted to make this easier to see. So I create the <b>low health healing</b> tab so display any heals on players below a certain amount of health. The tab is fully configurable to find exactly the kind of data you need to win whatever argument you're having.<br /><br />

          One thing that stands out is <SpellLink id={SPELLS.MARK_OF_THE_ANCIENT_PRIESTESS.id} icon /> shows up in the list a lot. It might be worth reconsidering your neck enchant.<br /><br />

          <Image source={LowHealthHealing} description="Low health healing by a Paladin on Mythic Krosus" />
        </Item>

        <Item title="The WoWAnalyzer browser extension" date="19 Jul">
          <Contributor {...CONTRIBUTORS.aryu} /> created a browser extension to make it easier to analyze your logs directly from Warcraft Logs. The extension adds the WoWAnalyzer logo to your browser toolbar that, when clicked on a valid WCL report, will allow you to analyze it directly with WoWAnalyzer.<br /><br />

          <Image source={ExtensionToolbar} description="The extension adds an icon to your toolbar" />
          <Image source={ExtensionActive} description="Clicking the icon on a valid WCL report will allow you to analyze it with WoWAnalyzer" /><br />

          Want it? Get it for Google Chrome <a href="https://chrome.google.com/webstore/detail/wow-analyzer/dnmgmiogknpdbgfgmolloddhiijkpekd">here</a> and the link for Firefox was lost.
        </Item>

        <Item title="Windwalker Monk" date="23 Jul">
          <SpecIcon spec={SPECS.WINDWALKER_MONK} />
          Initial support for the Windwalker Monk spec was <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/pull/129">added</a> by <Contributor {...CONTRIBUTORS.AttilioLH} />. This included all the bootstrapping but not a lot of analysis.<br /><br />

          <Image source={WindwalkerMonk} description="The initial version of the Windwalker Monk" /><br />

          <Contributor {...CONTRIBUTORS.mwwscott0} /> made a PR to add a bit more but decided not to go through with it. <Contributor {...CONTRIBUTORS.Anomoly} /> <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/pull/381">added</a> a couple of things to provide better basic support before <Contributor {...CONTRIBUTORS.Juko8} /> took over contributorship at 10 October 2017 and contributed most of what we have today. Some other minor contributions were done by <Contributor {...CONTRIBUTORS.Coryn} /> who added an <SpellLink id={SPELLS.ENERGIZING_ELIXIR_TALENT.id} icon /> analyzer, and <Contributor {...CONTRIBUTORS.Talby} /> who contributed a few minor miscellaneous improvements.
        </Item>

        <Item title="Guardian Druid 🐻" date="7 Aug">
          <SpecIcon spec={SPECS.GUARDIAN_DRUID} />
          Guardian Druid was the first supported tanking spec. It was originally <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/pull/137">added</a> by <Contributor {...CONTRIBUTORS.WOPR} /> with a bunch of new core tools useful for all tanking specs. Shortly after <Contributor {...CONTRIBUTORS.faide} /> joined the Guardian Druid team adding a lot of useful analysis and cool new features such as the filler spell spam detection among many other things. <Contributor {...CONTRIBUTORS.faide} /> took full ownership of the spec from September so that <Contributor {...CONTRIBUTORS.WOPR} /> would be able to focus on Brewmaster.<br /><br />

          <Image source={GuardianDruid} description="The initial version of the Guardian Druid" />
        </Item>

        <Item title="Subtlety Rogue" date="11 Aug">
          <SpecIcon spec={SPECS.SUBTLETY_ROGUE} />
          <Contributor {...CONTRIBUTORS.zealk} /> added the initial version for this spec. While the first pieces were <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/pull/130">added</a> at 25 July 2017, it wasn't enabled until 11 August.<br /><br />

          <Image source={SubtletyRogue} description="The initial version of the Subtlety Rogue" /><br />

          From 19 November 2017 and onwards <Contributor {...CONTRIBUTORS.tsabo} /> has taken over as the main maintainer of this spec's analysis. He has added <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/pulls?utf8=✓&q=is%3Apr+Rogue">a lot of things</a> since then which is now most of what we have for the spec today.
        </Item>

        <Item title="Enhancement Shaman" date="14 Aug">
          <SpecIcon spec={SPECS.ENHANCEMENT_SHAMAN} />
          Enhancement Shaman support was <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/pull/145">added</a> by <Contributor {...CONTRIBUTORS.Nighteyez07} />. Today's version is quite complete but hasn't received any significant changes since October and does not yet have support for new things such as tier 21 or the checklist. If you know Enhancement well enough, can program or want to learn how to program, and if you have the time and motivation to actually do it then please consider giving it a try! See <a href="https://github.com/WoWAnalyzer/WoWAnalyzer">GitHub</a> or ask in <a href="https://discord.gg/AxphPxU">Discord</a> for more information.<br /><br />

          <Image source={EnhancementShaman} description="The initial version of the Enhancement Shaman" />
        </Item>

        <Item title="Vengeance Demon Hunter" date="14 Aug">
          <SpecIcon spec={SPECS.VENGEANCE_DEMON_HUNTER} />
          Support for this spec was <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/pull/157">added</a> by <Contributor {...CONTRIBUTORS.Mamtooth} />. He has done all of the work on the specific things for this spec. If you compare the screenshot below of the version at the initial release and what we have today you'll see the amazing work that has been done. Of course there are still a few things left to do such as tier 21 and implementing the checklist, but most things are already covered.<br /><br />

          <Image source={VengeanceDemonHunter} description="The initial version of the Vengeance Demon Hunter analyzer" />
        </Item>

        <Item title="A fancy new dependency injection system" date="15 Aug">
          It's probably just me that's still excited about this one. This is technical stuffs you likely won't care about.<br /><br />

          In the past we had a bunch of different ways for modules to talk to each other, but the most common way was to just hardcode a path following hard property names, e.g. <code>this.owner.modules.alwaysBeCasting</code> to get the instance of the Always Be Casting module. This worked pretty well but makes things hard to test, easy to break and makes it hard to see dependencies. After discussion a few possibilities I set out to create a <a href="https://en.wikipedia.org/wiki/Dependency_injection">dependency injection system</a>.<br /><br />

          It's actually a rather simple system. <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/commit/e6d3f186c819028da2796dffe3f9d0c55e7fda41#diff-f8311e439dcf107ce5cad2b9c9e57204">This commit</a> shows what changed; instead of hardcoding the direct path to the dependency, we can now request an instance of a class in a static <i>dependencies</i> property.<br /><br />

          To add a dependency requirement you add an entry to the <i>dependencies</i> object with as key the name you want it available as, and as value the class you want an instance of. The DI system then figures out which module to grab, being an instance of the class itself or an instance of a class extending that class, and makes it available to the module requesting it under the property with the requested name. The injection part all happens under the hood so the implementer doesn't have to worry about it.<br /><br />

          Another great thing is that <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/commit/e6d3f186c819028da2796dffe3f9d0c55e7fda41#diff-202576169845b67347bc4231e34054ccR116">the code that takes care of this</a> is actually pretty short. Who would have thought?<br /><br />

          This system offers us compile-time checking that dependencies exist (since we need to pass the class we want), and it does not rely on whatever name it has been assigned elsewhere. Pretty sweet right!
        </Item>

        <Item title="A development-only events tab" date="17 Aug">
          Our analysis is based around all events in the combatlog from and to the selected player and his or her pets. To give more insight into what events are logged and what information they contain, a development-only events tab was added. This shows all events that we can use to make analysis easier.<br /><br />

          Since the initial release we've added advanced filters and done other enhancements so that it assists us as well as possible during development. It's not (yet) available publicly because the tab has a few issues with regards to performance and security that are hard to solve.<br /><br />

          <Image source={EventsTab} description="A subsection of the events that we can view" />
        </Item>

        <Item title="Affliction Warlock" date="18 Aug">
          <div className="clearfix">
            <SpecIcon spec={SPECS.AFFLICTION_WARLOCK} />
            <Contributor {...CONTRIBUTORS.Chizu} />'s accounting:
          </div>

          <blockquote>
            Our journey started in July, when my dearest friend and fellow Affliction Warlock <b>Aki</b> found about log analyzers. Firstly she found <a href="http://www.checkmywow.com">Check My Wow</a>, but was disappointed that they didn't support Affliction.<br /><br />

            A little while later in August, she found that CMW added the support, but was kinda lacking in features, and around that time she also found WoWAnalyzer and loved the features and design for Holy Paladin. I was curious about this site myself and when I noticed that it's open source, I decided to crawl through the source code even though I had no experience in ES6 whatsoever.<br /><br />

            It took about a week of silent reading but on August, 16th I made first few Affliction modules and afterwards it went downhill with development. Rest of Affliction modules, support for Destruction and Demonology. I'd like to thank her for showing me this site, if it wasn't for her, none of Warlock specs would probably be here.
          </blockquote>
          <br />

          <Image source={AfflictionWarlock} description="Affliction Warlock's initial release had a bunch of statistics" />
        </Item>

        <Item title="Brewmaster Monk" date="20 Aug">
          <SpecIcon spec={SPECS.BREWMASTER_MONK} />
          After adding support for Guardian Druid, <Contributor {...CONTRIBUTORS.WOPR} /> had gotten the hang of it and started work on Brewmaster Monk. Just like with the Guardian Druid analyzer the first version was pretty comprehensive, adding all sorts of interesting new statistics and even accounting well for all the weird combatlog interactions of <SpellLink id={SPELLS.STAGGER.id} icon />.<br /><br />

          <Image source={BrewmasterMonk} description="Brewmaster as it was on release" /><br />

          <Contributor {...CONTRIBUTORS.WOPR} /> made the analyzer pretty complete before resigning as contributor at the start of September because of not having enough time.<br /><br />

          In December 2017 <Contributor {...CONTRIBUTORS.emallson} /> took over as the primary maintainer of this spec. Initially, he wanted to use WoWAnalyzer as a platform for understanding the difficult-to-manually-analyze effectiveness of the <SpellLink id={SPELLS.STAGGER.id} icon /> and <SpellLink id={SPELLS.IRONSKIN_BREW.id} icon>Ironskin</SpellLink> / <SpellLink id={SPELLS.PURIFYING_BREW.id} icon /> system. New Brewmasters often come to the <code>#brew_questions</code> channel with questions about Brew usage and Stagger, but actual performance on the spec can be very time-intensive both to explain and to analyze. To help address this, he's added statistics and suggestions that help explain why common issues (most often with <SpellLink id={SPELLS.IRONSKIN_BREW.id} icon /> uptime) are occurring.
        </Item>

        <Item title="Shadow Priest" date="27 Aug">
          <div className="clearfix">
            <SpecIcon spec={SPECS.SHADOW_PRIEST} />
            After using the analyzer for Discipline Priest for a while, <Contributor {...CONTRIBUTORS.hassebewlen} /> implemented it for Shadow Priest.<br /><br />
          </div>

          <blockquote>
            I have healed for most of my time in WoW and played priest since WotLK. Legion is the first expansion which I started raiding on a higher level (previous ones were just PvP) and found Shadow to be pretty fun. But when they nerfed <SpellLink id={SPELLS.SURRENDER_TO_MADNESS_TALENT.id} icon />, I went back to healing my fellow teammates and just had Shadow as an offspec.<br /><br />

            When I found out about this project and that it was coded in ES6, I thought it would be a nice side project, learning more about git, working in a project with others while combining an hobby.
          </blockquote>

          <Image source={ShadowPriest} description="Initial version of the Shadow Priest analyzer" /><br />

          <blockquote>
            I implemented the Shadow Priest portion mostly for myself, as I found it tedious to look for what I wanted on Warcraft Logs (so I could more easily bash my fellow SPs in my guild).
            And knowing that others can use it for their own benefit is also great.
          </blockquote>
        </Item>

        <Item title="Character and fight selection pull down menus" date="28 Aug">
          Previously when examining a specific WCL record you must either use the back button or menu item that takes you back a screen to select a different character to analyze against. Then if you would like to change the encounter you have to go back yet again, select the different encounter, then select the character again.<br /><br />

          To improve this <Contributor {...CONTRIBUTORS.fasib} /> <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/pull/200">added</a> the character and fight selection popover menus that we have today.<br /><br />

          <Image source={CharacterAndFightPullDownMenus} description="The character and fight selection popover menus" /><br />

          Later when <Contributor {...CONTRIBUTORS.Zerotorescue} /> glued the navigation bar to the top of the browser viewport he introduced a bug where you could no longer scroll down the list and select the bottom few players. <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/issues/824">This still is an open issue.</a> If you'd like to see it fixed please consider <a href="https://github.com/WoWAnalyzer/WoWAnalyzer">making a pull request</a>!
        </Item>

        <Item title="Balance Druid" date="30 Aug">
          <SpecIcon spec={SPECS.BALANCE_DRUID} />
          <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/pull/210">Added</a> by <Contributor {...CONTRIBUTORS.Iskalla} />, later taken over by <Contributor {...CONTRIBUTORS.Gebuz} />.<br /><br />

          <Image source={BalanceDruid} description="Initial version of the Balance Druid analyzer" />
        </Item>

        <Item title="Destruction Warlock" date="2 Sep">
          <SpecIcon spec={SPECS.DESTRUCTION_WARLOCK} />
          <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/pull/231">Added</a> by <Contributor {...CONTRIBUTORS.Chizu} /> after also doing Affliction Warlock. See Affliction Warlock's bit for his motiviation to start working on WoWAnalyzer.<br /><br />

          <Image source={DestructionWarlock} description="Initial version of the Destruction Warlock analyzer" />
        </Item>

        <Item title="Adding a database" date="4 Sep">
          The initial version of our Warcraft Logs API proxy cache had an in-memory cache that would forget old logs automatically to prevent running out of memory. This didn't give us the max possible cache hit ratio, and we figured a database would be able to permanently store items in its cache. There were also a couple of other features in mind that would require a database.<br /><br />

          To tackle this big project I took a week off from work and implemented the database as a MariaDB container. We connect to it from NodeJS through <a href="http://sequelizejs.com">SequelizeJS</a>. The proxy has been using the database as cache storage for a while now, no other features have been implemented yet.
        </Item>

        <Item title="Feral Druid" date="4 Sep">
          <SpecIcon spec={SPECS.FERAL_DRUID} />
          <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/pull/241">Added</a> by <Contributor {...CONTRIBUTORS.Thieseract} />.<br /><br />

          <Image source={FeralDruid} description="Initial version of the Feral Druid analyzer" />
        </Item>

        <Item title="Marksmanship Hunter" date="5 Sep">
          <SpecIcon spec={SPECS.MARKSMANSHIP_HUNTER} />
          <Contributor {...CONTRIBUTORS.JLassie82} /> <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/pull/253">added</a> initial support for Marksmanship Hunter.<br /><br />

          <Contributor {...CONTRIBUTORS.Putro} /> later became the main maintainer of this spec implementation because he wanted to replace <a href="http://www.checkmywow.com">Check My Wow</a> after it was announced it would no longer be maintained, with a better, prettier and overall more precise product. He has implemented almost everything you see today. This was done while gathering feedback and suggestions from the rest of the Hunter community and the other theorycrafters. It now replaces (or alternately enhances) many manual log-reviews, and provides a lot of information up-front that is relevant to players of all skill levels.<br /><br />

          <Contributor {...CONTRIBUTORS.Blazballs} /> assisted in the Marksmanship module by amongst other things, creating the associated focus tracking chart, which now sees usage in both Beast Mastery and Survival implementations as well.<br /><br />

          <Image source={MarksmanshipHunter} description="Initial version of the Marksmanship Hunter analyzer" />
        </Item>

        <Item title="Blood Death Knight" date="6 Sep">
          <div className="clearfix">
            <SpecIcon spec={SPECS.BLOOD_DEATH_KNIGHT} />
            <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/pull/247">Added</a> by <Contributor {...CONTRIBUTORS.Yajinni} />:
          </div>

          <blockquote>
            so take what you want from this backstory. no idea where to start or what u need. I used to be a pretty hard core raider from BC to WoD. Got burned out and just didnt have the time for it anymore so after a break, new account and new server, i tried the casual life lol Ended up making my own lil casual raiding guild and just helping noobs get better at the game by improving thier game play. After EN in legion i took another break and came back for ToS. Found my guildies had struggled alot while i was gone and i was on the WoW reddit looking for a piece of info to help one of them and saw someone made a reference to wowanalyzer in it. I checked it out and loved the idea of it. All for automation and not doing the same log analysis repeatedly. Work in IT but have no programming experience. beyond a highschool class 15 years ago for a hello world project lol Decided this would be a good way to give back to the game that i have been playing from its start and a good way to make sure my guildies get the support they needed. Pretty much mained blood dks since wraith time so i decided to take it up. Recently got a guildie thats interested in pally tanking, was gonna co help on it. But the 2 people that said they were interested in programing it from the discord basically helped with gathering a couple of spells to add to the abilities list and thats is. Havent heard from them since. Havent had time to do more on the pally tanking even though i would love to. But will get to it once i get the blood dk stuff to good status. there we go.
          </blockquote>
          <br />

          <Image source={BloodDeathKnight} description="Initial version of the Blood Death Knight analyzer" />
        </Item>

        <Item title="Havoc Demon Hunter" date="6 Sep">
          <SpecIcon spec={SPECS.HAVOC_DEMON_HUNTER} />
          <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/pull/262">Added</a> by <Contributor {...CONTRIBUTORS.Mamtooth} />.<br /><br />

          <Image source={HavocDemonHunter} description="Initial version of the Havoc Demon Hunter analyzer" />
        </Item>

        <Item title="Retribution Paladin" date="12 Sep">
          <div className="clearfix">
            <SpecIcon spec={SPECS.RETRIBUTION_PALADIN} />
            Support for Retribution Paladin was <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/pull/293">added</a> by <Contributor {...CONTRIBUTORS.Hewhosmites} />. His motivation for adding it:
          </div>

          <blockquote>
            I was a Holy Paladin main and a frequent user to the site before switching to Retribution. It was kind of disheartening that I wasn't able to get the same data and analysis from the WoW Analyzer with my new spec. I had a little programming knowledge, an average amount of class knowledge, and a lot of free time so I started working on Retribution. Normally when working on hobby projects I tend to lose interest quite quickly but my love of the game and drive to make a useful tool for myself and others has kept me going.
          </blockquote>
          <br />

          <Image source={RetributionPaladin} description="Initial version of the Retribution Paladin analyzer" />
        </Item>

        <Item title="Demonology Warlock" date="17 Sep">
          <SpecIcon spec={SPECS.DEMONOLOGY_WARLOCK} />
          <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/pull/315">Added</a> by <Contributor {...CONTRIBUTORS.Chizu} /> after also doing Affliction and Destruction Warlock analyzers. See Affliction Warlock's bit for his motiviation to start working on WoWAnalyzer.<br /><br />

          <Image source={DemonologyWarlock} description="Initial version of the Demonology Warlock analyzer" />
        </Item>

        <Item title='Added "completeness" ratings' date="20 Sep">
          The analyzer was gaining more and more specs, but the completeness of each spec varied wildly. As a result some specs would be really helpful while others might be inaccurate simply because they needed more work. To avoid users from judging the entire tool by one spec implementation we added spec "completeness" ratings and indicators. These are meant to allow users to gauge the extensiveness and accuracy of a spec's implementation.<br /><br />

          <Image source={CompletenessGreat} description='"Great!" completeness' />
          <Image source={CompletenessNeedsMoreWork} description='"Needs more work" completeness' /><br />

          At the time of writing the following specs are considered Good or Great:<br />
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

          This does not mean these specs are complete as there's always more we can add. It is supposed to mean that they match most common things looked at during manual log reviews and reports on all important class features.
        </Item>

        <Item title="Protection Warrior" date="23 Sep">
          <SpecIcon spec={SPECS.PROTECTION_WARRIOR} />
          <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/pull/363">Added</a> by <Contributor {...CONTRIBUTORS.Salarissia} />.<br /><br />

          <Image source={ProtectionWarrior} description="Initial version of the Protection Warrior analyzer" />
        </Item>

        <Item title="More precise spell cooldown tracking" date="8 Oct">
          The combatlog contains no information about ability cooldowns making it hard to know if an ability was available at a certain point of time. Because this is useful information we created a <i>spell usable</i> module that tracks when a spell was last used and predicts when it goes off cooldown. With this information we can show spell cooldowns on the timeline, and make suggestions when casting something like a filler when a strong ability would have been better, or when you could have used a defensive.<br /><br />

          <Image source={HolyShockAvailableSuggestion} description="One of the new suggestions possible because of this module" />
        </Item>

        <Item title="Fixing combatlog bugs and inconsistencies: buff applications" date="10 Oct">
          Combat logs have a lot of bugs, inconsistencies and other things that make them hard to read. <b>Buff</b> events have many issues, such as spells like <SpellLink id={SPELLS.BLOODLUST.id} icon /> never getting an apply-event, spells that have a 100% uptime never appear and buffs applied before combat appear differently from all other buffs.<br /><br />

          Using information such as buff drop events, refreshes and stack change events we can fix these issues. To do this we <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/pull/478">created</a> a normalizer that fabricates buff applications whenever necessary. This way we have one reliable event to listen to and we can avoid creating a fix for every bugged buff.<br /><br />

          Today we have a couple of event normalizers to fix issues with the combatlog helping us develop quicker and keep code clean.
        </Item>

        <Item title="Frost Mage" date="11 Oct">
          <div className="clearfix">
            <SpecIcon spec={SPECS.FROST_MAGE} />
            <Contributor {...CONTRIBUTORS.Sharrq} /> <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/pull/468">added</a> initial support for Frost Mages. His motivation was as follows:<br /><br />
          </div>

          <blockquote>
            A friend of mine saw the boomkin stuff and was like "Hey Sharrq, check out this awesome site", and i looked at it and was like "oh thats why i havent seen this ... no mage support", and he jokingly said "You should do it!" so i looked at it to see how complicated it was ... and hey presto, mages
          </blockquote>
          <br />

          <Image source={FrostMage} description="Initial version of the Frost Mage analyzer" /><br />

          <Contributor {...CONTRIBUTORS.sref} /> has also done a considerable amount of work on this spec.
        </Item>

        <Item title="Introducing the WoWAnalyzer Discord Bot" date="12 Oct">
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
                by <Contributor {...CONTRIBUTORS.Zerotorescue} />
              </div>
            </div>
            <div className="flex-sub">
              <img src={DiscordBotGif} alt="Bot example gif" style={{ height: 200 }} />
            </div>
          </div>
        </Item>

        <Item title="Checking legendary item levels" date="14 Oct">
          To help you notice legendaries you forgot to upgrade, <Contributor {...CONTRIBUTORS.Fyruna} /> <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/pull/506">added</a> a suggestion for legendaries below the max possible item level.<br /><br />

          <Image source={LegendaryItemLevelSuggestion} description="An example suggestion when an item is not the max item level" wide />
        </Item>

        <Item title="Implemented accurate stat tracking" date="14 Oct">
          <Contributor {...CONTRIBUTORS.sref} /> <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/pull/520">implemented</a> a module for accurate stat rating tracking. This is a utility module intended to track the selected player's current stat rating at any point in the fight.<br /><br />

          We pull the initial stat rating from the combatant information (stats at pull), and track changes using a list of buffs with known stat rating values.<br /><br />

          This information allows us to accurately calculate your current stat values (given all applicable buffs are implemented) which can be used for all sorts of other modules, most notably for accurately calculating stat weights.
        </Item>

        <Item title="Always be moving? 💃🕺" date="15 Oct">
          With the Holy Paladin mastery effectiveness module we learned it's possible to find a player's position and calculate distance. Using a similar technique it's possible to get a high accuracy distance moved statistic. It could indicate ineffective play, probably reveals some fights are more movement intensive than other, but mainly it would for the fun of it.<br /><br />

          <Contributor {...CONTRIBUTORS.Fyruna} /> <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/pull/522">added</a> this distance moved statistic.<br /><br />

          <Image source={DistanceMoved} description="The distance moved statistic shows how many times you walked the distance of Orgrimmar to Uldum during the fight" /><br /><br />

          The initial version was bugged as it included the distance moved of other players. This was <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/issues/551">spotted</a> by <Contributor {...CONTRIBUTORS.Chizu} />. This was quickly <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/commit/f674f68a418d16dbc1612ada2ae43f1c22babae9">fixed</a> by <Contributor {...CONTRIBUTORS.Zerotorescue} />.<br /><br />

          <Contributor {...CONTRIBUTORS.janvavra} /> <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/pull/689">added</a> a <i>time spent moving</i> indicator relative to fight duration. This is meant to be a better indicator of time wasted by movement.<br /><br />

          <Image source={DistanceMoved20} description="The corrected distance moved with time spent moving" />
        </Item>

        <Item title="Fire Mage" date="16 Oct">
          <SpecIcon spec={SPECS.FIRE_MAGE} />
          Initial version was <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/pull/521">added</a> by <Contributor {...CONTRIBUTORS.Fyruna} />. <Contributor {...CONTRIBUTORS.sref} /> added a couple of things. <Contributor {...CONTRIBUTORS.Sharrq} /> added a lot of modules.<br /><br />

          <Image source={FireMage} description="Initial version of the Fire Mage analyzer" />
        </Item>

        <Item title="Arms Warrior" date="20 Oct">
          <SpecIcon spec={SPECS.ARMS_WARRIOR} />
          <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/pull/571">Added</a> by <Contributor {...CONTRIBUTORS.TheBadBossy} />.<br /><br />

          <Image source={ArmsWarrior} description="Initial version of the Arms Warrior analyzer" />
        </Item>

        <Item title="Unholy Death Knight" date="23 Oct">
          <div className="clearfix">
            <SpecIcon spec={SPECS.UNHOLY_DEATH_KNIGHT} />
            <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/pull/602">Added</a> by <Contributor {...CONTRIBUTORS.Khazak} />, his motivation:<br /><br />
          </div>

          <blockquote>
            Raid leader linked WoWAnalyzer in one of our log channels and I noticed that Unholy Death Knight wasn't supported. I read the documentation on how to add support for a spec and it looked pretty easy. I knew a little Javascript and had decent knowledge of my spec so I figured it was something I could do. I got started on Friday evening and by the end of the weekend I had basic support for the spec done.
          </blockquote>
          <br />

          <Image source={UnholyDeathKnight} description="Initial version of the Unholy Death Knight analyzer" />
        </Item>

        <Item title="Added support for healer stat weights" date="24 Oct">
          <Contributor {...CONTRIBUTORS.sref} /> <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/pull/604">added</a> a module to generate stat weights based on what actually happened in a fight. This module generates the players stat weights using the actual logged events. We keep a listing of all the player's healing spells along with which stats those spells scales with, and for each stat a heal scales with we do some simple math to find out how much the last point of that stat healed. We compare the total healing increases of each stat in order to generate weights. The simplicity of this module is pretty brilliant and makes calculating stat weights from logs pretty easy.<br /><br />

          <Contributor {...CONTRIBUTORS.sref} /> wrote a full explanation of the calculation of the Restoration Druid Stat Weights <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/blob/e650befd581620eaf62503e96550f4507ea56450/src/Parser/Druid/Restoration/Modules/Features/StatWeights.js#L14">here</a>.<br /><br />

          <Image source={RestoDruidStatWeights} description="The initial Stat Weights panel" /><br />

          Since the initial version the stat weights module has had several improvements by both <Contributor {...CONTRIBUTORS.sref} /> and <Contributor {...CONTRIBUTORS.Zerotorescue} /> (he also implemented the weights for Holy Paladins).<br /><br />

          The accuracy was improved with several changes to the calculations, the module was changed to make it reasonably easy to implement it in other (healing) specs and finally we changed its name to <i>stat values</i> to better indicate they're not exact stat weights. The name change was done since <i>stat weights</i> usually have opinionated modifiers to account for other factors such as Haste's mana usage. Our <i>stat values</i> are as unopinionated as possible and will require you to account for things such as mana yourself.
        </Item>

        <Item title="Beast Mastery Hunter" date="29 Oct">
          <div className="clearfix">
            <SpecIcon spec={SPECS.BEAST_MASTERY_HUNTER} />
            <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/pull/681">Added</a> by <Contributor {...CONTRIBUTORS.Putro} />. His motivation for adding it:<br /><br />
          </div>

          <blockquote>
            With the Marksmanship module gaining large popularity in the hunter community, requests for getting a Beast-Mastery equivalent grew, and with feedback/suggestions from the community and theorycrafters it’s now in a state where it also can replace (or enhance) many manual log reviews.
          </blockquote>
          <br />

          <Image source={BeastMasteryHunter} description="Initial version of the Beast Mastery Hunter analyzer" />
        </Item>

        <Item title="Frost Death Knight" date="2 Nov">
          <SpecIcon spec={SPECS.FROST_DEATH_KNIGHT} />
          <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/pull/712">Added</a> by <Contributor {...CONTRIBUTORS.Bonebasher} />.<br /><br />

          <Image source={FrostDeathKnight} description="Initial version of the Frost Death Knight analyzer" />
        </Item>

        <Item title="Automatic fight and player selection" date="4 Nov">
          <Contributor {...CONTRIBUTORS.Gao} /> <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/pull/729">improved</a> the report selector to automatically select the fight and player if they were selected in the Warcraft Logs report. This should make analyzing from Warcraft Logs reports a bit quicker.
        </Item>

        <Item title="Spell timelines" date="5 Nov">
          To give better insight into cooldown usage, <Contributor {...CONTRIBUTORS.Zerotorescue} /> <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/pull/740">added</a> a spell timeline that shows when a spell goes on cooldown, how long it was on cooldown and when it became available again. This overview makes it a lot easier to visualize your cast efficiency and understand it.<br /><br />

          <Image source={LightOfDawnSpellTimeline} description="The cooldown timeline of Light of Dawn showing a lot of downtime" wide /><br />

          A few days later <Contributor {...CONTRIBUTORS.Zerotorescue} /> <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/pull/783">added</a> the timeline tab. This serves as an overview of all your spell cooldowns and helps spot moments where you could have cast stronger abilities.<br /><br />

          <Image source={SpellTimeline} description="A timeline of all spells and their cooldowns" wide /><br />

          <Contributor {...CONTRIBUTORS.sref} /> <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/pull/843">added</a> the white indicators that show when a spell gains an extra charge.
        </Item>

        <Item title="Documentation, documentation, documentation" date="5 Nov">
          Writing documentation is a forever on-going process of explaining how our codebase works. Since our codebase has evolved very rapidly over the past year it has been a struggle to write documentation that does not invalidate quickly. This is one of the main reasons we do not write a lot of documentation and recommend looking at other specs for examples instead or asking in Discord.<br /><br />

          But there are still some very important parts of the application that we have written documentation for. We have a <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/tree/master/docs#contributing">getting started</a> guide, and <Contributor {...CONTRIBUTORS.poneria} /> has added very good documentation for our <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/blob/0e9bfb6edfad6d56de0e6076adf82b6af85717a8/docs/a-new-spec.md#add-cast-efficiency"><i>Cast Efficiency</i></a>, <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/blob/0e9bfb6edfad6d56de0e6076adf82b6af85717a8/docs/a-new-spec.md#add-always-be-casting"><i>Always Be Casting</i></a>, <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/blob/0e9bfb6edfad6d56de0e6076adf82b6af85717a8/docs/a-new-spec.md#add-a-total-damage-done--healing-done--damage-taken-statistic"><i>Total healing/damage done/damage taken</i></a> modules and documentation on <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/blob/master/docs/stat-boxes.md">how to create <i>Statistic Boxes</i></a>.<br /><br />

          <Image source={Documentation} description="Documentation" />
        </Item>

        <Item title="Changelog tab" date="6 Nov">
          With this update <Contributor {...CONTRIBUTORS.Zerotorescue} /> <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/pull/747">added</a> a changelog tab to the results page. This has made the changelog for the spec you're looking at easier to find and track.<br /><br />

          <Image source={ChangelogTab} description="The changelog tab, showing 5 recent changes" wide />
        </Item>

        <Item title="Improved error messages" date="8 Nov">
          In an effort to improve the information when an error occurs <Contributor {...CONTRIBUTORS.Zerotorescue} /> reworked most of the error messages to be much more informative and less boring. One such instance is when the API is down due to it being updated, although you'll likely never see that again since our downtime while rolling out updates is now usually no more than a (few) second(s). I guess all that work was for nothing.<br /><br />

          <Image source={ApiIsDown} description="When the API is down for a known reason we explain what is going on and what you can expect" />
        </Item>

        <Item title="Don't forget to equip 2 legendaries" date="10 Nov">
          It's an easy mistakes to make. You're swapping around your gear, equipping different pieces of tier or having a hard time deciding what legendaries to equip and <b>oops</b> you ended up doing a raid without the max possible amount of legendaries equipped.<br /><br />

          Next boss/raid you're good though since <Contributor {...CONTRIBUTORS.Gao} /> <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/pull/780">added</a> a suggestion that detects this and lets you know. Phew!<br /><br />

          <Image source={LegendaryCountChecker} description="Never forget again!" wide />
        </Item>

        <Item title="Protection Paladin" date="11 Nov">
          <SpecIcon spec={SPECS.PROTECTION_PALADIN} />
          <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/pull/781">Added</a> by <Contributor {...CONTRIBUTORS.Yajinni} /> and <Contributor {...CONTRIBUTORS.Noichxd} />.<br /><br />

          <Image source={ProtectionPaladin} description="Initial version of the Protection Paladin analyzer" />
        </Item>

        <Item title="A big info box for specs that aren't maintained" date="12 Nov">
          <Contributor {...CONTRIBUTORS.Zerotorescue} /> <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/pull/785">added</a> a large information box to specs that are not actively maintained. This serves as a warning that the spec's analysis might not be useful and/or accurate and we hope that the rest of the specs that are actually good will not be judged by the accuracy of the incomplete specs.<br /><br />

          We are also hopeful that this warning, with instructions on how to join the project, will motivate new contributors to pick up specs that have no maintainer actively working on it. But even if a spec already has a maintainer, new contributors are <b>always</b> welcome.<br /><br />

          <Image source={NotActivelyMaintainedBox} description="The information box" wide />
        </Item>

        <Item title="Using the time on cooldown for cast efficiency" date="12 Nov">
          <Contributor {...CONTRIBUTORS.sref} /> <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/pull/799">changed</a> the basis for cast efficiency into the time on cooldown as recorded by the <i>spell usable</i> module (the cooldown tracker mentioned earlier). This should increase the accuracy.
        </Item>

        <Item title="Updated for Antorus" date="28 Nov">
          While not every change is listed in this article (see the changelog for smaller changes), this milestone marks the release of the Antorus raid. We've been hard at work to update all the things changed and add support for all the new items and stuff.<br /><br />

          <Image source={AntorusImage} description="Updated for Antorus" />
        </Item>

        <Item title="Frontpage reworked" date="28 Nov">
          <Contributor {...CONTRIBUTORS.Zerotorescue} /> <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/pull/882">released</a> a reworked frontpage.<br /><br />

          <Image source={Frontpage20} description="The new frontpage upon release." />
        </Item>

        <Item title="Stats on pull" date="30 Nov">
          <Contributor {...CONTRIBUTORS.Zerotorescue} /> <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/pull/890">added</a> a much requested feature: a stats on pull panel.<br /><br />

          <Image source={StatsOnPull} description="The new frontpage upon release." />
        </Item>

        <Item title="Google's translation disabled to fix crashes" date="7 Dec">
          While monitoring our error logs we've been noticing a lot of <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/issues/948">weird errors</a> that we could not reproduce. After some investigating <Contributor {...CONTRIBUTORS.Zerotorescue} /> discovered that this was caused by a bug in React 16 (the most important third party library we use) when the app is opened with Google translator (Google Chrome does this automatically if configured). This is not an issue that would be easy for us to fix, and realistically there is nothing we can do about it to prevent crashes.<br /><br />

          We decided that the best course of action would be to <a href="https://github.com/facebook/react/issues/11538#issuecomment-350110297">disable Google's translation</a> so that the app would at least not crash. We realize that some users rely on the translation to use our app and we apologize for any inconvenience this may cause.
        </Item>

        <Item title="Checking your items for proper enchants" date="14 Dec">
          It's easy to overlook simple things like enchants, but it's free throughput that you should get for optimal performance. <Contributor {...CONTRIBUTORS.Khazak} /> <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/pull/974">added</a> a suggestion that checks for missing enchants and one that checks for poor quality enchants.<br /><br />

          <Contributor {...CONTRIBUTORS.Putro} /> also <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/pull/1072">added</a> support for Warlords of Draenor cloak enchants which are regularly used due to the massive power disparity between secondary and primary stats.<br /><br />

          Missing enchants happens to even the best of us.<br /><br />

          <Image source={EnchantChecker} description="The suggestions shown when missing an enchant or using a cheap enchant. It's easy performance!" />
        </Item>

        <Item title="Fury Warrior" date="14 Dec">
          <SpecIcon spec={SPECS.FURY_WARRIOR} />
          <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/pull/982">Added</a> by <Contributor {...CONTRIBUTORS.Maldark} />.<br /><br />

          <Image source={FuryWarrior} description="Initial version of the Fury Warrior analyzer" />
        </Item>

        <Item title="Version 2.0 is here! Check your fights with the all new checklist" date="24 Dec">
          We released version 2.0 of WoWAnalyzer at 24 December. This included the biggest change since the introduction of suggestions: the checklist. The checklist is a much more intuitive way to convey your performance in a fight. Instead of individual (often considered <i>harsh</i>) suggestions, the checklist shows an overview of <i>rules</i> which are marked with a green tick if you sufficiently passed the recommended thresholds for the requirements, and a red cross if your performance was below recommended parameters.<br /><br />

          <Image source={HolyPaladinChecklist} description="A subset of the checklist rules for Holy Paladins." /><br />

          Presenting your gameplay suggestions in such a way should give you a much better overview of what goes into playing your spec well. Checks that you pass will continue to be visible as a way to provide you with positive feedback about things you're doing well (and so you can review them for minor improvements). The rule performance is also less nitpicky than individual suggestions so that we can put more focus on large improvements.<br /><br />

          <Image source={HolyPaladinChecklistRule} description="A single checklist rule with its description and checks." /><br />

          With the introduction of the checklist we have also reworked the results page to present the most important information from top to bottom.<br /><br />

          <Image source={ChecklistResultsLayout} description="The new results page is organized by how commonly info is used." /><br />

          The checklist is available right now for <a href="/report/hNqbFwd7Mx3G1KnZ/18-Mythic+Antoran+High+Command+-+Kill+(6:51)/Taffly">Holy Paladin</a>, <a href="/report/wmfhYRxTpvZyHLdF/1-Mythic+Garothi+Worldbreaker+-+Kill+(4:48)/Hassebewlen">Shadow Priest</a>, <a href="/report/mtjvg4FQ6A8RGz1V/3-Mythic+Garothi+Worldbreaker+-+Kill+(6:18)/Paranema">Restoration Shaman</a>, <a href="/report/wXPNHQqrjmVbafJL/38-Mythic+Garothi+Worldbreaker+-+Kill+(5:05)/Maareczek">Marksmanship Hunter</a>, <a href="/report/2MNkGb36FW1gX8zx/15-Mythic+Imonar+the+Soulhunter+-+Kill+(7:45)/Anom">Mistweaver Monk</a>, <a href="/report/t3wKdDkB7fZqbmWz/1-Normal+Garothi+Worldbreaker+-+Kill+(4:24)/Sref">Frost Mage</a>, <a href="/report/72t9vbcAqdpVRfBQ/12-Mythic+Garothi+Worldbreaker+-+Kill+(6:15)/Maxweii">Unholy Death Knight</a> and <a href="/report/hxzFPBaWLJrG1NQR/24-Heroic+Imonar+the+Soulhunter+-+Kill+(3:38)/Putro">Beast Mastery Hunter</a>. More specs to follow later (at the contributors discretion).
        </Item>

        <Item title="Death tracking" date="28 Dec">
          <Contributor {...CONTRIBUTORS.Sharrq} /> <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/pull/1066">added</a> a module that tracks player deaths and resurrections, calculates the time spent dead, has a suggestion for avoiding damage and recommends using defensives.<br /><br />

          <Image source={DeathTracker} description="The suggestion when you died" wide />
        </Item>

        <Item title="Casting time bar in the spell timeline tab" date="2 Jan">
          While not a major change, this has shown to be incredibly useful for visualizing your downtime. A great bonus is that is greatly helps us to find and fix bugs in the gcd/channel time displays. <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/pull/1050">Added</a> by <Contributor {...CONTRIBUTORS.Zerotorescue} />.<br /><br />

          <Image source={CastingTime} description="The initial casting time bar, the GCD was later separated from channel times to be less misleading" wide />
        </Item>

        <Item title="Nekorsis added a gear tab" date="2 Jan">
          <Contributor {...CONTRIBUTORS.Nekorsis} /> <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/pull/1017">added</a> a gear tab to show what gear you have equipped. Unfortunately the Warcraft Logs API does not provide item names and since we also do not have a complete item database we are unable to show item names.<br /><br />

          <Image source={GearTab} description="The gear tab showing all items equipped" wide />
        </Item>

        <Item title="You're looking at it! Added a news system" date="8 Jan">
          A simple news system to write articles was <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/pull/1154">added</a> by <Contributor {...CONTRIBUTORS.Zerotorescue} />. We'll try to keep you updated about interesting developments.
        </Item>

        <Item title="Know what's the matter with the all new status page" date="15 Jan">
          In order to provide quick status updates when our service is degraded due to an outage or for another reason, we added a <a href="https://status.wowanalyzer.com/">status page</a>. On this status page we can indicate when something is not running optimally and what the cause and impact are.<br /><br />

          <Image source={StatusPage} description="We rely heavily on the data from Warcraft Logs. If it's unavailable we can no longer analyze fights for players that haven't been analyzed before." />
          <br />

          When there's a service degradation we will show an alert on the report selector to inform everyone of potential issues.<br /><br />

          <Image source={OutageAlert} description="When there's something not working optimally we will show a big indicator on the report selection." />
          <br />

          The status page runs on an different server in a different datacenter in a different country. This should ensure that it will be there when the main server is down. In hindsight I'm not sure what the point of that is considering we can all use <a href="https://discord.gg/AxphPxU">Discord</a> anyway, but it's there nonetheless.<br /><br />

          By <Contributor {...CONTRIBUTORS.Zerotorescue} />.
        </Item>

        <Item title="Survival Hunter" date="18 Jan">
          <SpecIcon spec={SPECS.SURVIVAL_HUNTER} />
          With both Beast-Mastery and Marksmanship modules being close to completed, <Contributor {...CONTRIBUTORS.Putro} /> began work on the Survival module in early 2018. It was <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/pull/1202">merged</a> 18 January.<br /><br />

          <Image source={SurvivalHunter} description="Initial version of the Survival Hunter analyzer" />
        </Item>

        <Item title="Assassination Rogue" date="18 Jan">
          <SpecIcon spec={SPECS.ASSASSINATION_ROGUE} />
          <Contributor {...CONTRIBUTORS.tsabo} /> <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/pull/1227">added</a> basic support for the Assassination Rogue spec.<br /><br />

          <Image source={AssassinationRogue} description="Initial version of the Assassination Rogue analyzer" />
        </Item>

        <Item title="First anniversary!" date="31 Jan">
          Thank you soo much for your continued support!<br /><br />

          We'll continue working on making WoWAnalyzer the best place for (automated) analysis. There are a lot of things planned for 2018, we're thinking Battle for Azeroth support for as many specs as possible, layout reworks and other interface improvements, <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/issues">fixing all issues/suggestions</a>, account system with personal customizations, Patreon integration that will support cool new <a href="https://www.patreon.com/wowanalyzer">Patreon-funded</a> features and much more!
        </Item>
      </Wrapper>
    );
  }

  render() {
    return (
      <RegularArticle bodyStyle={{ position: 'relative', overflow: 'hidden' }} {...this.props}>
        <img src={WoWAnalyzerPartyHat} style={{ float: 'right', maxWidth: 200, marginLeft: 15, marginBottom: 15 }} alt="1" />
        WoWAnalyzer turned one! Time flies when you're having fun working hard. We want to use this milestone to look back at the progress we have made during this past year. So much progress has been made!<br /><br />

        The project was started by <Contributor {...CONTRIBUTORS.Zerotorescue} /> (a <span className="Paladin">Holy Paladin</span> theorycrafter) to do additional analysis to help with theorycrafting. Since it took several months before other contributors joined the project, the first half of the recap will be written from his point of view.<br /><br />

        There were a lot more contributors than we could list in the recap below. <b>Thanks to every single person that has helped with this project!</b> Thanks to all <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/graphs/contributors">GitHub contributors</a>, <a href="https://www.patreon.com/wowanalyzer">all of our patrons</a>, everyone that sent us feedback, everyone that helped spread the word, and thank you for your interest! Every single one of you give us the energy we need to spend our free time on this project.<br /><br />

        Over the year we have gathered some interesting statistics:<br /><br />

        <ul style={{ marginBottom: 20 }}>
          <li><b>36</b> specs implemented with <b>16</b> specs marked as being Good or Great</li>
          <li>Nearly <a href="https://github.com/WoWAnalyzer/WoWAnalyzer"><b>7,000 commits</b></a> from over <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/graphs/contributors"><b>60 contributors</b></a></li>
          <li>Over <b>1,500 files</b> with over <b>150,000 lines of code</b></li>
          <li>Peak usage had over <b>145,000 unique visitors</b> and <b>14,000,000 requests</b> in a single month</li>
          <li><a href="https://discord.gg/AxphPxU">Our Discord server</a> has over <b>1,400 members</b></li>
          <li>It usually takes <a href="https://travis-ci.org/WoWAnalyzer/WoWAnalyzer/builds">about <b>6 minutes</b></a> for a code-change to be available on WoWAnalyzer.com</li>
        </ul>

        Continue reading to see the full timeline of the project over the past year.

        <hr style={{ marginBottom: 20 }} />

        <Timeline>
          <Item title="The initial launch" date="31 Jan">
            The 31st of January marked the launch of the first version of WoWAnalyzer, then named the <b>Holy Paladin mastery effectiveness calculator</b>. It was created out of the need to do more complex analysis that would not have be possible with only a simple spreadsheet.<br /><br />

            To understand what the project did back then you need to know that <SpellLink id={SPELLS.MASTERY_LIGHTBRINGER.id} icon>Mastery</SpellLink> causes a Holy Paladin's healing to be increased based on how close she is to the player she's healing. 0-10 yards provides full effectiveness and 10-40 yards decreases the boost to 0% linearly. In order to calculate how effective Mastery is you need to know the distance between the Holy Paladin and her target.<br /><br />

            For a long time it seemed impossible to accurately calculate this based on a log, but after a night of playing with Warcraft Logs' replay function to estimate my Mastery Effectiveness, I realized that it must have access to a player locations to be able to show the replay like it does. After some figuring out I got a proof of concept working, which became the <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/commit/bd7971995fe16d14aec7286765c13c2984c44d76">first commit</a> at <b>31 Jan 2017 00:02 CET</b>. I named project "Holy Paladin mastery effectiveness calculator" at the time because that was all it did.<br /><br />

            <Image source={v001} description="Holy Paladin mastery effectiveness calculator v0.0.1. Do note that at the time WCL throttled the events API to 300 events per API call, so loading a fight took considerably longer back then." />
          </Item>

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
