import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';

import SPELLS from 'common/SPELLS';
import { formatPercentage, formatThousands } from 'common/format';
import SpellLink from 'common/SpellLink';

import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';

/**
 * Whirlwind deals 10% increased damage, and Slams your primary target.
 */

const WHIRLWIND_DAMAGE_BONUS = 0.1;

// TODO : Add Slam cast by Fervor of Battle to dps.
// (Slam that the player didn't cast)
class FervorOfBattle extends Analyzer {
    
    bonusDamage = 0;

    constructor(...args) {
        super(...args);
        this.active = this.selectedCombatant.hasTalent(SPELLS.FERVOR_OF_BATTLE_TALENT.id);
        if (!this.active) return;
    }

    on_byPlayer_damage(event) {
        if (event.ability.guid !== SPELLS.WHIRLWIND_DAMAGE_1.id) return;
        this.bonusDamage += calculateEffectiveDamage(event, WHIRLWIND_DAMAGE_BONUS);
    }

    get dps() {
        return this.bonusDamage / this.owner.fightDuration * 1000;
    }
    
    subStatistic() {
        return (
          <StatisticListBoxItem
            title={<><SpellLink id={SPELLS.FERVOR_OF_BATTLE_TALENT.id} /> bonus damages</>}
            value={`${formatThousands(this.dps)} DPS`}
            valueTooltip={`Your Fervor of Battle contributed ${formatThousands(this.bonusDamage)} total damage (${formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.bonusDamage))} %).<br /><br />Note: This only accounts for the passive 10% increased damage of Whirlwind.`}
          />
        );
    }
}

export default FervorOfBattle;