import TALENTS from 'common/TALENTS/priest';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { DamageEvent } from 'parser/core/Events';
import Events from 'parser/core/Events';
import {
  calculateEffectiveDamageFromCritIncrease,
  calculateEffectiveDamageFromCritDamageIncrease,
} from 'parser/core/EventCalculateLib';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import StatTracker from 'parser/shared/modules/StatTracker';
import HIT_TYPES from 'game/HIT_TYPES';

import { PHANTOM_MENACE_CRITDAMAGE_PER_RANK } from '../../constants';
import { PHANTOM_MENACE_CRITCHANCE_PER_RANK } from '../../constants';

class PhantomMenace extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };
  protected statTracker!: StatTracker;

  damage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.PHANTOM_MENACE_TALENT);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.SHADOWY_APPARITION_DAMAGE),
      this.onSADamage,
    );
  }

  onSADamage(event: DamageEvent) {
    if (event.hitType === HIT_TYPES.CRIT) {
      this.damage += calculateEffectiveDamageFromCritIncrease(
        event,
        this.statTracker.currentCritPercentage,
        PHANTOM_MENACE_CRITCHANCE_PER_RANK,
      );

      this.damage += calculateEffectiveDamageFromCritDamageIncrease(
        event,
        PHANTOM_MENACE_CRITDAMAGE_PER_RANK,
      );
    }
  }

  subStatistic() {
    return (
      <BoringSpellValueText spell={TALENTS.PHANTOM_MENACE_TALENT}>
        <div>
          <ItemDamageDone amount={this.damage} />
        </div>
      </BoringSpellValueText>
    );
  }
}

export default PhantomMenace;
