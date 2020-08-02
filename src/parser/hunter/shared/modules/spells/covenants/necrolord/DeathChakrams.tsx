import React from 'react';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Abilities from 'parser/core/modules/Abilities';
import SPELLS from 'common/SPELLS';
import Events, { DamageEvent, EnergizeEvent } from 'parser/core/Events';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import ItemDamageDone from 'interface/ItemDamageDone';

class DeathChakrams extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };

  protected abilities!: Abilities;

  damage: number = 0;
  focusGained: number = 0;
  focusWasted: number = 0;

  constructor(options: any) {
    super(options);
    this.active = true; //TODO: Once we can parse from WCL this should be changed to activate
    if (this.active) {
      options.abilities.add({
        spell: SPELLS.DEATH_CHAKRAM,
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
      this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell([SPELLS.DEATH_CHAKRAM, SPELLS.DEATH_CHAKRAM_SECONDARY]), this.onDamage);
      this.addEventListener(Events.energize.by(SELECTED_PLAYER).spell(SPELLS.DEATH_CHAKRAM_ENERGIZE), this.onEnergize);
    }
  }

  onDamage(event: DamageEvent) {
    this.damage += event.amount + (event.absorbed || 0);
  }

  onEnergize(event: EnergizeEvent) {
    this.focusGained += event.resourceChange;
    this.focusWasted += event.waste;
  }

  statistic() {
    if (this.damage > 0) {
      return (
        <Statistic
          position={STATISTIC_ORDER.OPTIONAL(13)}
          size="flexible"
          category={STATISTIC_CATEGORY.GENERAL}
        >
          <BoringSpellValueText spell={SPELLS.DEATH_CHAKRAM}>
            <>
              <ItemDamageDone amount={this.damage} />
              <br />
              {this.focusGained}/{this.focusWasted + this.focusGained}<small> gained Focus</small>
            </>
          </BoringSpellValueText>
        </Statistic>
      );
    } else {
      return null;
    }
  }
}

export default DeathChakrams;
