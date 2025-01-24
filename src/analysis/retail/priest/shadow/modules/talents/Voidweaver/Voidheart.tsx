import TALENTS from 'common/TALENTS/priest';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { DamageEvent } from 'parser/core/Events';
import Events from 'parser/core/Events';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

import { VOIDHEART_MULTIPLIER } from '../../../constants';

class Voidheart extends Analyzer {
  damage = 0;
  insanityGained = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.VOIDHEART_TALENT);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
  }

  onDamage(event: DamageEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.SHADOW_PRIEST_VOIDWEAVER_ENTROPIC_RIFT_BUFF)) {
      //console.log(event.ability.name,"Spell of type", event.ability.type)
      //During Entropic Rift, if the ability that caused the damage event is a shadow spell, we have a damage increase.
      //shadow damage is type 32.
      //the multi school spells with shadow should also be increased, but the only one this spec has access to is shadowfrost (48)
      if (event.ability.type === 32 || event.ability.type === 48) {
        this.damage += calculateEffectiveDamage(event, VOIDHEART_MULTIPLIER);
      }
    }
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.HERO_TALENTS} size="flexible">
        <BoringSpellValueText spell={TALENTS.VOIDHEART_TALENT}>
          <div>
            <ItemDamageDone amount={this.damage} />
          </div>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Voidheart;
