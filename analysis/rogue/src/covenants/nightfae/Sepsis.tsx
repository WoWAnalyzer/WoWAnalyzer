import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import COVENANTS from 'game/shadowlands/COVENANTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import React from 'react';

class Sepsis extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };
  damage: number = 0;
  poisonDamage: number = 0;
  protected abilities!: Abilities;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasCovenant(COVENANTS.NIGHT_FAE.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.SEPSIS), this.onDamage);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.SEPSIS_POISON),
      this.onPoisonDamage,
    );
  }

  onDamage(event: DamageEvent) {
    this.damage += event.amount + (event.absorbed || 0);
  }

  onPoisonDamage(event: DamageEvent) {
    this.damage += event.amount + (event.absorbed || 0);
    this.poisonDamage += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <>
        <Statistic
          size="flexible"
          category={STATISTIC_CATEGORY.COVENANTS}
          tooltip={
            <ul>
              <li>{formatNumber(this.damage)} damage done by Sepsis Ability</li>
              <li>{formatNumber(this.poisonDamage)} damage done by Sepsis poison</li>
            </ul>
          }
        >
          <BoringSpellValueText spell={SPELLS.SEPSIS}>
            <ItemDamageDone amount={this.damage + this.poisonDamage} />
          </BoringSpellValueText>
        </Statistic>
      </>
    );
  }
}

export default Sepsis;
