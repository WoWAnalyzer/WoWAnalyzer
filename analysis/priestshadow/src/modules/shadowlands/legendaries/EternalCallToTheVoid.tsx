import React from 'react';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import { SELECTED_PLAYER_PET } from 'parser/core/EventFilter';

class EternalCallToTheVoid extends Analyzer {

  damage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasLegendaryByBonusID(SPELLS.ETERNAL_CALL_TO_THE_VOID.bonusID);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET).spell(SPELLS.ETERNAL_CALL_TO_THE_VOID_MIND_FLAY_DAMAGE), this.onDamage);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET).spell(SPELLS.ETERNAL_CALL_TO_THE_VOID_MIND_SEAR_DAMAGE), this.onDamage);
  }

  onDamage(event: DamageEvent) {
    this.damage += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.ITEMS}
        size="flexible"
      >
        <BoringSpellValueText spell={SPELLS.ETERNAL_CALL_TO_THE_VOID}>
          <ItemDamageDone amount={this.damage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default EternalCallToTheVoid;
