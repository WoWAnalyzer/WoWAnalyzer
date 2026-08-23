import { Trans } from '@lingui/react/macro';
import ChangelogPanel from 'interface/ChangelogPanel';
import DocumentTitle from 'interface/DocumentTitle';
import GithubButton from 'interface/GitHubButton';
import MasteryRadiusImage from 'interface/images/mastery-radius.png';
import Panel from 'interface/Panel';
import PatreonButton from 'interface/PatreonButton';
import { Link } from 'react-router-dom';
import { usePageView } from '../useGoogleAnalytics';

export function Component() {
  usePageView('AboutPage');
  return (
    <>
      <DocumentTitle title="About Localog" />

      <Panel title={<Trans id="interface.aboutPage.title">About Localog</Trans>}>
        <img
          src={MasteryRadiusImage}
          alt="Mastery radius"
          className="pull-right"
          style={{ margin: 15 }}
        />
        <Trans id="interface.aboutPage.about">
          Localog is a local-first tool to help you analyze and improve your World of Warcraft
          raiding performance through various relevant metrics and gameplay suggestions.
          {/* oxlint-disable-next-line wowanalyzer/no-br -- Baseline suppression */}
          <br />
          {/* oxlint-disable-next-line wowanalyzer/no-br -- Baseline suppression */}
          <br />
          We give detailed insight into various things such as cast behavior, buff uptimes,
          downtime, cooldown usage, wasted resources and more. We also give insight into useful and
          interesting statistics such as the (throughput) gain of your talents, trinkets, traits,
          set bonuses, and other special items and effects.
          {/* oxlint-disable-next-line wowanalyzer/no-br -- Baseline suppression */}
          <br />
          {/* oxlint-disable-next-line wowanalyzer/no-br -- Baseline suppression */}
          <br />
          Using all this data we provide automatic gameplay suggestions that analyzes your actual
          behavior in a fight and gives pointers to help you improve your performance.
          {/* oxlint-disable-next-line wowanalyzer/no-br -- Baseline suppression */}
          <br />
          {/* oxlint-disable-next-line wowanalyzer/no-br -- Baseline suppression */}
          <br />
          The analysis is custom for each specialization to focus on the things that are important
          for your spec. It's created by and together with class experts to give you the best
          possible insights.
          {/* oxlint-disable-next-line wowanalyzer/no-br -- Baseline suppression */}
          <br />
          {/* oxlint-disable-next-line wowanalyzer/no-br -- Baseline suppression */}
          <br />
          Using Localog you will find a wealth of information about the mechanics of your spec, your
          actual behavior in fights and the optimal playstyle. Analyze your raids after every raid
          night to continuously improve your performance and become a better player. Whether you're
          a new player learning a spec for the first time or an experienced player looking for
          information to help you min-max, Localog is a great tool to have in your arsenal!
        </Trans>
        {/* oxlint-disable-next-line wowanalyzer/no-br -- Baseline suppression */}
        <br />
        {/* oxlint-disable-next-line wowanalyzer/no-br -- Baseline suppression */}
        <br />
        <Trans id="interface.aboutPage.howToUse">
          Wondering how to use Localog? Upload a local advanced combat-log file in your browser, or
          see the{' '}
          <a href="https://www.wowhead.com/how-to-use-wowanalyzer">
            <img src="img/wowhead-tiny.png" style={{ height: '1em' }} alt="Wowhead" /> Wowhead guide
          </a>
          . Upload a local combat log from the <Link to="/local-import">local import</Link> page to
          begin an analysis.
        </Trans>
        {/* oxlint-disable-next-line wowanalyzer/no-br -- Baseline suppression */}
        <br />
        {/* oxlint-disable-next-line wowanalyzer/no-br -- Baseline suppression */}
        <br />
        <p>
          Localog is based on the open-source{' '}
          <a href="https://github.com/WoWAnalyzer/WoWAnalyzer">WoWAnalyzer</a> project. Its analysis
          and class-specific recommendations build on the work of the WoWAnalyzer maintainers and
          contributors.
        </p>
        <GithubButton /> <PatreonButton />
      </Panel>
      {/* oxlint-disable-next-line wowanalyzer/no-br -- Baseline suppression */}
      <br />

      <ChangelogPanel />
    </>
  );
}
