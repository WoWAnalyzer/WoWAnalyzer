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
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.FLAGELLATION),
      this.onDamage,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.FLAGELLATION_LASH),
      this.onLashDamage,
    );
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
      <Statistic size="flexible" category={STATISTIC_CATEGORY.COVENANTS}>
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
