import React from 'react';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Abilities from 'parser/core/modules/Abilities';
import SPELLS from 'common/SPELLS';
import Events from 'parser/core/Events';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';

//TODO: Figure out crit attribution %
class ResonatingArrow extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };

  protected abilities!: Abilities;

  casts: number = 0;
  debuffs: number = 0;

  constructor(options: any) {
    super(options);
    this.active = true; //TODO: Once we can parse from WCL this should be changed to activate
    if (this.active) {
      options.abilities.add({
        spell: SPELLS.RESONATING_ARROW,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 60,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      });
    }
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.RESONATING_ARROW), this.onCast);
    this.addEventListener(Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.RESONATING_ARROW_DEBUFF), this.onDebuff);
  }

  onCast() {
    this.casts += 1;
  }

  onDebuff() {
    this.debuffs += 1;
  }

  statistic() {
    if (this.casts + this.debuffs > 0) {
      return (
        <Statistic
          position={STATISTIC_ORDER.OPTIONAL(13)}
          size="flexible"
          category={STATISTIC_CATEGORY.GENERAL}
        >
          <BoringSpellValueText spell={SPELLS.RESONATING_ARROW}>
            <>
              {this.debuffs} <small> targets affected</small>
            </>
          </BoringSpellValueText>
        </Statistic>
      );
    } else {
      return null;
    }
  }

}

export default ResonatingArrow;
