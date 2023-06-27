
import Config from 'parser/Config';
import { WCLFight } from 'parser/core/Fight';
import { PlayerInfo } from 'parser/core/Player';
import Report from 'parser/core/Report';

import SupportCheckerIssue from './SupportCheckerIssue';

interface Props {
  report: Report;
  fight: WCLFight;
  config: Config;
  player: PlayerInfo;
  onContinueAnyway: () => void;
}

const SupportCheckerSpecPartialSupport = ({ config, ...others }: Props) => (
  <SupportCheckerIssue
    title={<>Partial support</>}
    config={config}
    {...others}
  >
    <>
      This spec has received updates for the latest patch but it is still missing important elements
      needed to provide you with good and reliable feedback.
      <br />
      <br />
      We recommend reading the{' '}
      <a href="https://www.wowhead.com/class-guides">
        <img src="/img/wowhead-tiny.png" style={{ height: '1em' }} alt="Wowhead" /> Wowhead
      </a>{' '}
      and <a href="https://www.icy-veins.com/wow/class-guides">Icy Veins</a> guides to gain more
      knowledge about your spec and use this when analyzing yourself. You can also try asking for
      help in a <a href="https://www.reddit.com/r/wow/wiki/discord">class Discord</a>.
      <br />
      <br />
      We do not know when {config.spec.specName} {config.spec.className} will have full support. It
      may take a while to fully support a spec, so please be patient. If you are interested or know
      someone who might be interested helping people help themselves, check out{' '}
      <a href="https://github.com/WoWAnalyzer/WoWAnalyzer">GitHub</a> or{' '}
      <a href="https://wowanalyzer.com/discord">Discord</a> for more information.
    </>
  </SupportCheckerIssue>
);

export default SupportCheckerSpecPartialSupport;
