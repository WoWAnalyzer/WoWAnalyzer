import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import StatTracker from 'parser/shared/modules/StatTracker';
import { INNER_COMPASS_STAT_INCREASE } from '../constants';

const STANCE_MULTIPLIER = 1 + INNER_COMPASS_STAT_INCREASE;

class InnerCompass extends Analyzer.withDependencies({
  statTracker: StatTracker,
}) {
  talent = TALENTS_MONK.INNER_COMPASS_TALENT;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(this.talent);

    Object.assign(this.deps.statTracker.statMultiplierBuffs, {
      [SPELLS.INNER_COMPASS_CRANE_STANCE.id]: { haste: STANCE_MULTIPLIER },
      [SPELLS.INNER_COMPASS_TIGER_STANCE.id]: { crit: STANCE_MULTIPLIER },
      [SPELLS.INNER_COMPASS_OX_STANCE.id]: { versatility: STANCE_MULTIPLIER },
      [SPELLS.INNER_COMPASS_SERPENT_STANCE.id]: { mastery: STANCE_MULTIPLIER },
    });
  }
}

export default InnerCompass;
