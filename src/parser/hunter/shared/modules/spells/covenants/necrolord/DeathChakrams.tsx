import React from 'react';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Abilities from 'parser/core/modules/Abilities';
import SPELLS from 'common/SPELLS';
import Events, { DamageEvent, EnergizeEvent } from 'parser/core/Events';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import ItemDamageDone from 'interface/ItemDamageDone';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import ResourceIcon from 'common/ResourceIcon';
import COVENANTS from 'game/shadowlands/COVENANTS';

class DeathChakrams extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };

  damage: number = 0;
  focusGained: number = 0;
  focusWasted: number = 0;

  protected abilities!: Abilities;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasCovenant(COVENANTS.NECROLORD.id);

    if (!this.active) {
      return;
    }

    (options.abilities as Abilities).add({
      spell: SPELLS.DEATH_CHAKRAM_INITIAL_AND_AOE,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      cooldown: 45,
      gcd: {
        base: 1500,
      },
      castEfficiency: {
        suggestion: true,
        recommendedEfficiency: 0.9,
      },
    });

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell([SPELLS.DEATH_CHAKRAM_SINGLE_TARGET, SPELLS.DEATH_CHAKRAM_INITIAL_AND_AOE]), this.onDamage);
    this.addEventListener(Events.energize.by(SELECTED_PLAYER).spell(SPELLS.DEATH_CHAKRAM_ENERGIZE), this.onEnergize);
  }

  onDamage(event: DamageEvent) {
    this.damage += event.amount + (event.absorbed || 0);
  }

  onEnergize(event: EnergizeEvent) {
    this.focusGained += event.resourceChange;
    this.focusWasted += event.waste;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE()}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
      >
        <BoringSpellValueText spell={SPELLS.DEATH_CHAKRAM_INITIAL_AND_AOE}>
          <>
            <ItemDamageDone amount={this.damage} />
            <br />
            <ResourceIcon id={RESOURCE_TYPES.FOCUS.id} noLink /> {this.focusGained}/{this.focusWasted + this.focusGained} <small>Focus gained</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default DeathChakrams;
