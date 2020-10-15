import React from 'react';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Abilities from 'parser/core/modules/Abilities';
import SPELLS from 'common/SPELLS';
import Events, { DamageEvent } from 'parser/core/Events';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import COVENANTS from 'game/shadowlands/COVENANTS';
import ItemDamageDone from 'interface/ItemDamageDone';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';

class Flagellation extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };
  damage: number = 0;
  lashDamage: number = 0;
  protected abilities!: Abilities;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasCovenant(COVENANTS.VENTHYR.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.FLAGELLATION), this.onDamage);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.FLAGELLATION_LASH), this.onLashDamage);
  }

  onDamage(event: DamageEvent) {
    this.damage += event.amount + (event.absorbed || 0);
  }

  onLashDamage(event: DamageEvent) {
    this.damage += event.amount + (event.absorbed || 0);
    this.lashDamage += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
      >
        <BoringSpellValueText spell={SPELLS.FLAGELLATION}>
          <>
            <ItemDamageDone amount={this.damage} />
            <ItemDamageDone amount={this.lashDamage} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Flagellation;
