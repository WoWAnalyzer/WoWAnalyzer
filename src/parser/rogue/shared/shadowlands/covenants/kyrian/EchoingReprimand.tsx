import React from 'react';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Abilities from 'parser/core/modules/Abilities';
import SPELLS from 'common/SPELLS';
import Events, { DamageEvent, EnergizeEvent } from 'parser/core/Events';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import COVENANTS from 'game/shadowlands/COVENANTS';
import ItemDamageDone from 'interface/ItemDamageDone';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import ResourceIcon from 'common/ResourceIcon';

class EchoingReprimand extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };
  damage: number = 0;
  comboPointsGained: number = 0;
  comboPointsWasted: number = 0;
  protected abilities!: Abilities;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasCovenant(COVENANTS.KYRIAN.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.ECHOING_REPRIMAND), this.onDamage);
    this.addEventListener(Events.energize.by(SELECTED_PLAYER).spell(SPELLS.ECHOING_REPRIMAND_ENERGIZE), this.onEnergize);
  }

  onDamage(event: DamageEvent) {
    this.damage += event.amount + (event.absorbed || 0);
  }

  onEnergize(event: EnergizeEvent) {
    if (event.resourceChangeType === RESOURCE_TYPES.COMBO_POINTS.id) {
      this.comboPointsGained += event.resourceChange;
      this.comboPointsWasted += event.waste;
    }
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
      >
        <BoringSpellValueText spell={SPELLS.ECHOING_REPRIMAND}>
          <>
            <ItemDamageDone amount={this.damage} />
            <br />
            <ResourceIcon id={RESOURCE_TYPES.COMBO_POINTS.id} noLink />
            {this.comboPointsGained}/{this.comboPointsWasted + this.comboPointsGained}
            <small> Combo Points gained</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default EchoingReprimand;
