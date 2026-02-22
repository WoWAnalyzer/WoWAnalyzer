import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/monk';
import { Options } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import StaggerStatistic from '../tools/StaggerAnalyzer';
import { quickSipClear } from '../../normalizers/StaggerClearSourceLinkNormalizer';

export default class QuickSip extends StaggerStatistic {
  constructor(options: Options) {
    super(talents.QUICK_SIP_TALENT, options);

    this.active = this.selectedCombatant.hasTalent(talents.QUICK_SIP_TALENT);

    // we can't see total duration from buff events, so we use applicators for this
    // - Blackout Kick: 3s per cast
    // - Keg Smash: 5s per cast
    // - SCK: 1s per tick that hits at least one enemy
    this.addEventListener(
      Events.damage.spell([
        talents.KEG_SMASH_TALENT,
        SPELLS.SPINNING_CRANE_KICK_DAMAGE,
        SPELLS.BLACKOUT_KICK_BRM,
      ]),
      this.onDamage,
    );
  }

  private onDamage(event: DamageEvent) {
    const clear = quickSipClear.first(event);
    if (!clear) {
      return; // in AoE, not every hit will have a clear.
    }

    const point = this.deps.stagger.getPoolAtTime(event.timestamp);
    // Quick Sip logs the per-tick amount.
    this.removeStagger(event, clear.amount * point.remainingTicks);
  }
}
