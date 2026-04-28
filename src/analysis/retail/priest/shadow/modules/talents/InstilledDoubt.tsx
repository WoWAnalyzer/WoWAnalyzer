import TALENTS from 'common/TALENTS/priest';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { DamageEvent } from 'parser/core/Events';
import Events from 'parser/core/Events';
import {
  calculateEffectiveDamageFromCritIncrease,
  calculateEffectiveDamageFromCritDamageIncrease,
} from 'parser/core/EventCalculateLib';
import StatTracker from 'parser/shared/modules/StatTracker';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import HIT_TYPES from 'game/HIT_TYPES';

import { INSTILLED_DOUBT_CRIT_CHANCE_PER_RANK } from '../../constants';
import { INSTILLED_DOUBT_CRIT_DAMAGE_PER_RANK } from '../../constants';

class InstilledDoubt extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  protected statTracker!: StatTracker;

  damage = 0;
  buffStacks = 0;

  instilledDoubtCritChance =
    INSTILLED_DOUBT_CRIT_CHANCE_PER_RANK *
    this.selectedCombatant.getTalentRank(TALENTS.INSTILLED_DOUBT_TALENT); //increase in crit chance
  instilledDoubtCritDamage =
    INSTILLED_DOUBT_CRIT_DAMAGE_PER_RANK *
    this.selectedCombatant.getTalentRank(TALENTS.INSTILLED_DOUBT_TALENT); //increase in crit damage

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.INSTILLED_DOUBT_TALENT);

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.VAMPIRIC_TOUCH),
      this.onSpell,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.SHADOW_WORD_PAIN),
      this.onSpell,
    );
  }

  onSpell(event: DamageEvent) {
    if (event.hitType === HIT_TYPES.CRIT) {
      //only crit events should be sent to effectiveDamageFromCritIncrease,

      this.damage += calculateEffectiveDamageFromCritIncrease(
        //Extra damage from having extra crit chance
        event,
        this.statTracker.currentCritPercentage,
        this.instilledDoubtCritChance,
      );

      this.damage += calculateEffectiveDamageFromCritDamageIncrease(
        event,
        this.instilledDoubtCritDamage,
      );
    }
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip="This is the damage gained from the critical chance and damage increase"
      >
        <BoringSpellValueText spell={TALENTS.INSTILLED_DOUBT_TALENT}>
          <div>
            <ItemDamageDone amount={this.damage} />
          </div>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default InstilledDoubt;
