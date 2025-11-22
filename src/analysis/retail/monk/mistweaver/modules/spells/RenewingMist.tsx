import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, HealEvent, RemoveBuffEvent } from 'parser/core/Events';
import { isFromRenewingMist } from '../../normalizers/CastLinkNormalizer';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink } from 'interface';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';
import REMGraph from '../features/REMGraph';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import Vivify from './Vivify';

class RenewingMist extends Analyzer {
  static dependencies = {
    remGraph: REMGraph,
    vivify: Vivify,
  };
  currentRenewingMists = 0;
  totalHealing = 0;
  totalOverhealing = 0;
  totalAbsorbs = 0;
  gustsHealing = 0;
  healingHits = 0;
  protected vivify!: Vivify;
  protected remGraph!: REMGraph;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.GUSTS_OF_MISTS),
      this.handleGustsOfMists,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.RENEWING_MIST_HEAL),
      this.handleRenewingMist,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.RENEWING_MIST_HEAL),
      this.onApplyRem,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.RENEWING_MIST_HEAL),
      this.onRemoveRem,
    );
  }

  onApplyRem(event: ApplyBuffEvent) {
    this.currentRenewingMists += 1;
  }

  onRemoveRem(event: RemoveBuffEvent) {
    this.currentRenewingMists -= 1;
  }

  handleGustsOfMists(event: HealEvent) {
    if (isFromRenewingMist(event)) {
      this.gustsHealing += (event.amount || 0) + (event.absorbed || 0);
    }
  }

  handleRenewingMist(event: HealEvent) {
    this.totalHealing += event.amount || 0;
    this.totalOverhealing += event.overheal || 0;
    this.totalAbsorbs += event.absorbed || 0;
    this.healingHits += 1;
  }

  /** Guide subsection describing the proper usage of ReM */
  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <b>
          <SpellLink spell={SPELLS.RENEWING_MIST_CAST} />
        </b>{' '}
        is your primary healing spell. You can use it on any target and it will either stay on the
        target, jump targets if the chosen target has a{' '}
        <SpellLink spell={SPELLS.RENEWING_MIST_CAST} /> and there are players in range, or pandemic
        if there are no players to jump to in range. Using{' '}
        <SpellLink spell={SPELLS.RENEWING_MIST_CAST} /> as much as possible is extremely important
        due to its synergy with <SpellLink spell={SPELLS.VIVIFY} />,{' '}
        <SpellLink spell={TALENTS_MONK.RISING_MIST_TALENT} />,{' '}
        <SpellLink spell={TALENTS_MONK.DANCING_MISTS_TALENT} />, and{' '}
        <SpellLink spell={TALENTS_MONK.MISTY_PEAKS_TALENT} />
      </p>
    );

    const data = (
      <div>
        <RoundedPanel>
          <strong>
            <SpellLink spell={SPELLS.RENEWING_MIST_CAST} /> cast efficiency
          </strong>
          <div className="flex-main chart" style={{ padding: 15 }}>
            {this.subStatistic()}
          </div>
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }

  /** Guide subsection describing the proper usage of Renewing Mist */
  subStatistic() {
    return (
      <CastEfficiencyBar
        spell={SPELLS.RENEWING_MIST_CAST}
        gapHighlightMode={GapHighlight.FullCooldown}
        minimizeIcons
        slimLines
        useThresholds
      />
    );
  }
}

export default RenewingMist;
