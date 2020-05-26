import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import Statistic from 'interface/statistics/Statistic';
import { calculateAzeriteEffects } from 'common/stats';
import { formatNumber } from 'common/format';
import SpellLink from 'common/SpellLink';
import { EnergizeEvent } from 'parser/core/Events';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';

const focusedFireStats = (traits: number[]) => Object.values(traits).reduce((obj, rank) => {
  const [damage] = calculateAzeriteEffects(SPELLS.FOCUSED_FIRE.id, rank);
  obj.damage += damage;
  return obj;
}, {
  damage: 0,
});

/** Focused Fire
 * Rapid Fire deals an additional 5903.1765 damage over its duration, and each shot has a 30% chance to generate 2 additional Focus.
 *
 * Example log: https://www.warcraftlogs.com/reports/CMFw3NLR6dHbXcJ2#fight=1&type=damage-done
 */

const TICKS_PER_CAST = 10;
//Streamline increases amount of ticks by 20%, as it increases the duration by 20%
const STREAMLINE_TICK_INCREASE = 0.2;

class FocusedFire extends Analyzer {

  focusGained = 0;
  focusWasted = 0;
  damagePotential = 0;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTrait(SPELLS.FOCUSED_FIRE.id);
    if (!this.active) {
      return;
    }
    const { damage } = focusedFireStats(this.selectedCombatant.traitsBySpellId[SPELLS.FOCUSED_FIRE.id]);
    if (this.selectedCombatant.hasTalent(SPELLS.STREAMLINE_TALENT.id)) {
      this.damagePotential = damage * (TICKS_PER_CAST * (1 + STREAMLINE_TICK_INCREASE));
    } else {
      this.damagePotential = damage * TICKS_PER_CAST;
    }
  }

  on_byPlayer_energize(event: EnergizeEvent) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.FOCUSED_FIRE_FOCUS.id) {
      return;
    }
    this.focusGained += event.resourceChange;
    this.focusWasted += event.waste;
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.AZERITE_POWERS}
      >
        <BoringSpellValueText spell={SPELLS.FOCUSED_FIRE}>
          <>
            {this.focusGained}/{this.focusWasted + this.focusGained}<small> gained Focus</small>
            <br />
            <small>Up to</small> {formatNumber(this.damagePotential)} <small> damage per <SpellLink id={SPELLS.RAPID_FIRE.id} /></small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }

}

export default FocusedFire;
