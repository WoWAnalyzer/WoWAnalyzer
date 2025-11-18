import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/deathknight';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import { BoolThreshold, ThresholdStyle } from 'parser/core/ParseResults';

class InitialMarrowrendCast extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };

  protected abilities!: Abilities;

  firstMRCast = false;
  firstMRCastWithoutDRW = false;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.MARROWREND_TALENT),
      this.onCast,
    );
  }

  onCast(event: CastEvent) {
    if (this.firstMRCast) {
      return;
    }

    this.firstMRCast = true;
    if (!this.selectedCombatant.hasBuff(SPELLS.DANCING_RUNE_WEAPON_TALENT_BUFF.id)) {
      this.firstMRCastWithoutDRW = true;
    }
  }

  get initialMRThresholds(): BoolThreshold {
    return {
      actual: this.firstMRCastWithoutDRW,
      isEqual: true,
      style: ThresholdStyle.BOOLEAN,
    };
  }
}

export default InitialMarrowrendCast;
