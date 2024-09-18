import { Trans } from '@lingui/macro';
import VERSIONS from 'game/VERSIONS';
import Config from 'parser/Config';
import { WCLFight } from 'parser/core/Fight';
import { PlayerInfo } from 'parser/core/Player';
import Report from 'parser/core/Report';
import { useLingui } from '@lingui/react';

import SupportCheckerIssue from './SupportCheckerIssue';

interface Props {
  report: Report;
  fight: WCLFight;
  config: Config;
  player: PlayerInfo;
  onContinueAnyway: () => void;
}

const SupportCheckerSpecOutOfDate = ({ config, ...others }: Props) => {
  const { i18n } = useLingui();

  const gameVersion = VERSIONS[config.branch];
  const specName = config.spec.specName ? i18n._(config.spec.specName) : null;
  const className = i18n._(config.spec.className);
  console.log('SupportCheckerSpecOutOfDate', { specName, className });

  return (
    <SupportCheckerIssue
      title={
        <Trans id="interface.report.supportChecker.outdated">
          This spec has not been updated for patch {gameVersion}
        </Trans>
      }
      config={config}
      testId="spec-not-updated-for-patch"
      {...others}
    >
      <Trans id="interface.report.supportChecker.specNotSupportedDetails">
        Sorry, this spec hasn't been updated for the latest patch so we're afraid it might be
        outdated and potentially mislead. We recommend reading the{' '}
        <a href="https://www.wowhead.com/guides/classes">
          <img src="/img/wowhead-tiny.png" style={{ height: '1em' }} alt="Wowhead" /> Wowhead
        </a>{' '}
        and <a href="https://www.icy-veins.com/wow/class-guides">Icy Veins</a> guides to gain more
        knowledge about your spec and use this to analyze yourself. You can also try asking for help
        in a <a href="https://www.reddit.com/r/wow/wiki/discord">class Discord</a>.
        <br />
        <br />
        We have no ETA for an update to {specName} {i18n._(config.spec.className)}. We rely on
        volunteer contributors to maintain spec analysis, and seeing as {specName}{' '}
        {i18n._(config.spec.className)} is out of date, it may be that nobody is currently
        maintaining it. If you are interested or know someone who might be interested helping people
        help themselves, check out <a href="https://github.com/WoWAnalyzer/WoWAnalyzer">GitHub</a>{' '}
        or <a href="https://wowanalyzer.com/discord">Discord</a> for more information.
      </Trans>
    </SupportCheckerIssue>
  );
};

export default SupportCheckerSpecOutOfDate;
