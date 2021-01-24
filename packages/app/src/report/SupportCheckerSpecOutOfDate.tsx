import { Trans } from '@lingui/macro';
import React from 'react';

import Fight from 'parser/core/Fight';
import { Player } from 'parser/core/CombatLogParser';
import Config from 'parser/Config';

import SupportCheckerIssue from './SupportCheckerIssue';

interface Props {
  report: unknown;
  fight: Fight;
  config: Config;
  player: Player;
  onContinueAnyway: () => void;
}

const SupportCheckerSpecOutOfDate = ({ config, ...others }: Props) => (
  <SupportCheckerIssue
    title={
      <Trans id="interface.report.supportChecker.specNotSupported">
        Sorry, this spec is not currently supported
      </Trans>
    }
    config={config}
    {...others}
  >
    <Trans id="interface.report.supportChecker.specNotSupportedDetails">
      This spec hasn't been updated for the latest patch so we're afraid it might be outdated and
      may be misleading. We recommend reading the{' '}
      <a href="https://www.wowhead.com/class-guides">
        <img src="/img/wowhead-tiny.png" style={{ height: '1em' }} alt="Wowhead" /> Wowhead
      </a>{' '}
      and <a href="https://www.icy-veins.com/wow/class-guides">Icy Veins</a> guides to gain more
      knowledge about your spec and use this to analyze yourself. You can also try asking for help
      in a <a href="https://www.reddit.com/r/wow/wiki/discord">class Discord</a>.
      <br />
      <br />
      We have no ETA for support for {config.spec.specName} {config.spec.className}. We rely on
      volunteer contributors to maintain specs, and seeing as {config.spec.specName}{' '}
      {config.spec.className} is out of date, it's likely nobody is currently maintaining it. If you
      are interested or know someone who might be interested helping people help themselves, check
      out <a href="https://github.com/WoWAnalyzer/WoWAnalyzer">GitHub</a> or{' '}
      <a href="https://wowanalyzer.com/discord">Discord</a> for more information.
    </Trans>
  </SupportCheckerIssue>
);

export default SupportCheckerSpecOutOfDate;
