import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import { formatPercentage, formatNumber } from 'common/format';
import { calculateAzeriteEffects } from 'common/stats';
import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';

const RAGE_PER_PROC = 10;

const testOfMightStats = traits => Object.values(traits).reduce((obj, rank) => {
    const [strength] = calculateAzeriteEffects(SPELLS.TEST_OF_MIGHT.id, rank);
    obj.strength += strength;
    obj.traits += 1;
    return obj;
}, {
    strength: 0,
    traits: 0,
});

export const STAT_TRACKER = {
    strength: combatant => {
        return testOfMightStats(combatant.traitsBySpellId[SPELLS.TEST_OF_MIGHT.id]).strength;
    },
};

/**
 * Normal:
 * When Colossus Smash expires, your Strength is increased by 29 for every 10 Rage you spent during Colossus Smash. Lasts 12 sec.
 * 
 * Warbreaker:
 * When Warbreaker expires, your Strength is increased by 29 for every 10 Rage you spent during Warbreaker. Lasts 12 sec.
 */

class TestOfMight extends Analyzer {

    static dependencies = {
        enemies: Enemies,
    };

    strength = 0;
    traits = 0;

    proc = 0;
    strengthOnToM = 0;
    totalStrength = 0;
    rageSpendDuringDebuff = 0;

    constructor(...args) {
        super(...args);
        this.active = this.selectedCombatant.hasTrait(SPELLS.TEST_OF_MIGHT.id);
        if(!this.active) return;

        const { strength, traits } = testOfMightStats(this.selectedCombatant.traitsBySpellId[SPELLS.TEST_OF_MIGHT.id]);
        this.strength = strength;
        this.traits = traits;
    }

    on_byPlayer_applybuff(event) {
        if (event.ability.guid !== SPELLS.TEST_OF_MIGHT_BUFF.id) return;
        this.proc += 1;
        
        this.strengthOnToM += this.strength * (this.rageSpendDuringDebuff / RAGE_PER_PROC);
        this.totalStrength += this.strengthOnToM;

        this.rageSpendDuringDebuff = 0;
        this.strengthOnToM = 0;
    }

    on_byPlayer_cast(event) {
        if (!event.classResources ||
            !event.classResources.filter(e => e.type !== RESOURCE_TYPES.RAGE.id) ||
            !event.classResources.find(e => e.type === RESOURCE_TYPES.RAGE.id).cost) {
            return;
        }
        const target = this.enemies.getEntity(event);
        if(target !== null && target.hasBuff(SPELLS.COLOSSUS_SMASH_DEBUFF.id, event.timestamp)) {
            this.rageSpendDuringDebuff += event.classResources.find(e => e.type === RESOURCE_TYPES.RAGE.id).cost / 10;
        }
    }

    get uptime() {
        return this.selectedCombatant.getBuffUptime(SPELLS.TEST_OF_MIGHT_BUFF.id) / this.owner.fightDuration;
    }

    get averageStrength() {
        return (this.totalStrength / this.proc * this.uptime).toFixed(0);
    }

    statistic() {
        return (
          <TraitStatisticBox
            position={STATISTIC_ORDER.OPTIONAL()}
            trait={SPELLS.TEST_OF_MIGHT.id}
            value={(
              <>
                {this.averageStrength} average Strength<br />
              </>
            )}
            tooltip={`Average strength grant on fight duration. <b>Uptime: ${formatPercentage(this.uptime)}%</b>.</br>
                On average ${SPELLS.TEST_OF_MIGHT.name} has granted you <b>${formatNumber(this.totalStrength / this.proc)} strength</b> per proc.</br>
                ${SPELLS.TEST_OF_MIGHT.name} grants a total of <b>${formatNumber(this.totalStrength)} strength</b> (over <b>${this.proc} proc</b>).`}
          />
        );
      }
}

export default TestOfMight;