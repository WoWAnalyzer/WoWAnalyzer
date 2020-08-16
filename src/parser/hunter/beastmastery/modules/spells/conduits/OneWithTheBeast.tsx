import Analyzer, { SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import { ONE_WITH_THE_BEAST_DAMAGE_INCREASE } from 'parser/hunter/beastmastery/constants';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import ItemDamageDone from 'interface/ItemDamageDone';
import React from 'react';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';

/**
 * Bestial Wrath increases all damage you and your pet deal by X%.
 *
 * Example log
 *
 */
class OneWithTheBeast extends Analyzer {

  conduitRank: number = 0;
  addedDamage: number = 0;

  constructor(options: any) {
    super(options);
    this.active = false;
    if (!this.active) {
      return;
    }

    this.conduitRank = 1; //TODO: Find out the proper way of parsing conduit ranks

    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onGenericDamage);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET), this.onGenericDamage);
  }

  onGenericDamage(event: DamageEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.BESTIAL_WRATH.id)) {
      return;
    }
    this.addedDamage += calculateEffectiveDamage(event, ONE_WITH_THE_BEAST_DAMAGE_INCREASE[this.conduitRank]);
  }


  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
      >
        <BoringSpellValueText spell={SPELLS.ONE_WITH_THE_BEAST_CONDUIT}>
          <>
            <ItemDamageDone amount={this.addedDamage} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }

}

export default OneWithTheBeast;
