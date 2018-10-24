import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';

import SPELLS from 'common/SPELLS';
import { formatPercentage, formatThousands } from 'common/format';
import SpellLink from 'common/SpellLink';

import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';

/**
 * Smash the ground and shatter the armor of all enemies within 8 yds, 
 * dealing [ 150% of Attack Power ] Physical damage and increasing damage 
 * you deal to them by 30% for 10 sec.
 */

const WARBREAKER_BONUS_DAMAGES = 0.3;

class Warbreaker extends Analyzer {

    static dependencies = {
        enemies: Enemies,
    };

    constructor(...args) {
        super(...args);
        this.active = this.selectedCombatant.hasTalent(SPELLS.WARBREAKER_TALENT.id);
    }

    totalDamages = 0;

    on_byPlayer_damage(event) {
        if (event.targetIsFriendly) {
            return;
        }
        if (event.ability.guid === SPELLS.WARBREAKER_TALENT.id) {
            this.totalDamages += (event.amount || 0) + (event.absorbed || 0);
        }
        const target = this.enemies.getEntity(event);
        if (target !== null && target.hasBuff(SPELLS.COLOSSUS_SMASH_DEBUFF.id, event.timestamp)) {
            this.totalDamages += calculateEffectiveDamage(event, WARBREAKER_BONUS_DAMAGES);
        }
    }

    get dps() {
        return this.totalDamages / this.owner.fightDuration * 1000;
    }

    subStatistic() {
        return (
          <StatisticListBoxItem
            title={<><SpellLink id={SPELLS.WARBREAKER_TALENT.id} /> bonus damage</>}
            value={`${formatThousands(this.dps)} DPS`}
            valueTooltip={`Your Warbreaker contributed ${formatThousands(this.totalDamages)} total damage (${formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.totalDamages))} %).<br />This accounts for the damage dealt by Warbreaker and the 30% increased damage from Colossus Smash debuff.`}
          />
        );
    }
}

export default Warbreaker;