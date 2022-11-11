import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { TALENTS_MONK } from 'common/TALENTS';
import SPELLS from 'common/SPELLS';
import Events, { ApplyBuffEvent, HealEvent } from 'parser/core/Events';
import { isFromRapidDiffusion } from '../../normalizers/CastLinkNormalizer';
import HotTrackerMW from '../core/HotTrackerMW';
import MistyPeaks from './MistyPeaks';
import Vivify from './Vivify';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import TalentSpellText from 'parser/ui/TalentSpellText';
import SpellLink from 'interface/SpellLink';
import Combatants from 'parser/shared/modules/Combatants';
import { formatNumber } from 'common/format';

class RapidDiffusion extends Analyzer {
  get rawRemThroughput() {
    return this.remHealing + this.remAbsorbed + this.remOverHealing;
  }
  static dependencies = {
    hotTracker: HotTrackerMW,
    combatants: Combatants,
    mistyPeaks: MistyPeaks,
    vivify: Vivify,
  };
  hotTracker!: HotTrackerMW;
  combatants!: Combatants;
  mistyPeaks!: MistyPeaks;
  vivify!: Vivify;
  remCount: number = 0;
  remHealing: number = 0;
  remAbsorbed: number = 0;
  remOverHealing: number = 0;
  extraMistyPeaksProcs: number = 0;
  extraVivifyCleave: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.RAPID_DIFFUSION_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.RENEWING_MIST_HEAL),
      this.handleReMApply,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.RENEWING_MIST_HEAL),
      this.handleReMHeal,
    );
  }

  handleReMApply(event: ApplyBuffEvent) {
    if (isFromRapidDiffusion(event)) {
      this.remCount += 1;
    }
  }

  handleReMHeal(event: HealEvent) {
    const playerId = event.targetID;
    if (
      !this.hotTracker.hots[playerId] ||
      !this.hotTracker.hots[playerId][SPELLS.RENEWING_MIST_HEAL.id]
    ) {
      return;
    }
    const hot = this.hotTracker.hots[playerId][SPELLS.RENEWING_MIST_HEAL.id];
    if (this.hotTracker.fromRapidDiffusion(hot)) {
      this.remHealing += event.amount || 0;
      this.remAbsorbed += event.absorbed || 0;
      this.remOverHealing += event.overheal || 0;
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>Additional Renewing Mist Total Throughput: {formatNumber(this.rawRemThroughput)}</>
        }
      >
        <TalentSpellText talent={TALENTS_MONK.RAPID_DIFFUSION_TALENT}>
          <ItemHealingDone amount={this.remHealing + this.remAbsorbed} />
          <br />
          <>
            {this.remCount}{' '}
            <small>
              additional <SpellLink id={TALENTS_MONK.RENEWING_MIST_TALENT} />
            </small>
          </>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default RapidDiffusion;
