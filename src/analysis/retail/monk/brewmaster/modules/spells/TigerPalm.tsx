import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/monk';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import StatTracker from 'parser/shared/modules/StatTracker';

import SharedBrews from '../core/SharedBrews';

const TIGER_PALM_REDUCTION = 1000;
const FACE_PALM_REDUCTION = 1000;

const FACE_PALM_CHANCE = 0.5;

class TigerPalm extends Analyzer {
  static dependencies = {
    brews: SharedBrews,
    statTracker: StatTracker,
    spellUsable: SpellUsable,
    castEfficiency: CastEfficiency,
  };

  cdr = 0;
  wastedCDR = 0;
  fpCdr = 0;
  wastedFpCdr = 0;

  protected brews!: SharedBrews;
  protected statTracker!: StatTracker;
  protected spellUsable!: SpellUsable;
  protected castEfficiency!: CastEfficiency;

  private hasFp = false;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.TIGER_PALM),
      this.onDamage,
    );

    this.hasFp = this.selectedCombatant.hasTalent(talents.FACE_PALM_TALENT);
  }

  get totalCasts(): number {
    return this.castEfficiency.getCastEfficiencyForSpell(SPELLS.TIGER_PALM)?.casts ?? 0;
  }

  onDamage(event: DamageEvent) {
    const actualReduction = this.brews.reduceCooldown(TIGER_PALM_REDUCTION);
    this.cdr += actualReduction;
    this.wastedCDR += TIGER_PALM_REDUCTION - actualReduction;

    if (this.hasFp) {
      // apply FP CDR. FP is not practically detectable, so we just treat it as proccing exactly the average amount. this works well enough most of the time.
      const avgCdr = FACE_PALM_REDUCTION * FACE_PALM_CHANCE;
      const actualReduction = this.brews.reduceCooldown(avgCdr);
      this.fpCdr += actualReduction;
      this.wastedFpCdr += avgCdr - actualReduction;
    }
  }
}

export default TigerPalm;
