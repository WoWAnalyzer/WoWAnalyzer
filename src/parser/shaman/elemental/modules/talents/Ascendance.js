import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatNumber, formatPercentage } from 'common/format';

import Analyzer from 'parser/core/Analyzer';
import EnemyInstances from 'parser/shared/modules/EnemyInstances';

import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';

import Abilities from '../Abilities';

const ASCENDANCE_DURATION = 15000 - 1500; //remove the gcd for Ascendence itself because we only check for FS on the first cast after

class Ascendance extends Analyzer {

  static dependencies = {
    abilities: Abilities,
    enemies: EnemyInstances,
  };

  _resolveAbilityGcdField(value) {
    if (typeof value === 'function') {
      return value.call(this.owner, this.selectedCombatant);
    } else {
      return value;
    }
  }

  justEnteredAscendance = false;
  badFSAscendence = 0;
  checkDelay = 0;

  numCasts = {
    [SPELLS.ASCENDANCE_TALENT_ELEMENTAL.id]: 0,
    [SPELLS.LAVA_BURST.id]: 0,
    [SPELLS.EARTH_SHOCK.id]: 0,
    [SPELLS.ELEMENTAL_BLAST_TALENT.id]: 0,
    others: 0,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.ASCENDANCE_TALENT_ELEMENTAL.id);
  }

  get AscendanceUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.ASCENDANCE_TALENT_ELEMENTAL.id) / this.owner.fightDuration;
  }

  get averageLavaBurstCasts() {
    return (this.numCasts[SPELLS.LAVA_BURST.id]/this.numCasts[SPELLS.ASCENDANCE_TALENT_ELEMENTAL.id]) || 0;
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    const target = this.enemies.getEntity(event);


    if(spellId === SPELLS.ASCENDANCE_TALENT_ELEMENTAL.id) {
      this.justEnteredAcendance = true;
      this.numCasts[SPELLS.ASCENDANCE_TALENT_ELEMENTAL.id] += 1;
    }


    const ability = this.abilities.getAbility(spellId);
    if(!ability){
      return;
    }
    if(!this.selectedCombatant.hasBuff(SPELLS.ASCENDANCE_TALENT_ELEMENTAL.id, event.timestamp) || spellId === SPELLS.ASCENDANCE_TALENT_ELEMENTAL.id){
      return;
    }

    const gcd = this._resolveAbilityGcdField(ability.gcd);
    if(!gcd){
      return;
    }

    if(this.justEnteredAscendance){
      if(target){
        this.justEnteredAscendance=false;
        if(!target.hasBuff(SPELLS.FLAME_SHOCK.id, event.timestamp-this.checkDelay) || target.getBuff(SPELLS.FLAME_SHOCK.id, event.timestamp-this.checkDelay).end - event.timestamp < ASCENDANCE_DURATION){
          this.badFSAscendence+=1;
        }
      } else {
        this.checkDelay+=gcd;
      }
    }

    if (this.numCasts[spellId] !== undefined) {
      this.numCasts[spellId] += 1;
    } else {
        this.numCasts.others += 1;
    }
  }

  statistic() {
    let EBtooltip = "";
    if(this.selectedCombatant.hasTalent(SPELLS.ELEMENTAL_BLAST_TALENT.id)) {
      EBtooltip = <li>Elemental Blast: ${this.numCasts[SPELLS.ELEMENTAL_BLAST_TALENT.id]}</li>;
    }
    const tooltip = `With a uptime of: ${formatPercentage(this.AscendanceUptime)} %<br>
        Casts while Ascendance was up:<br>
        <ul>
          <li>Earth Shock: ${this.numCasts[SPELLS.EARTH_SHOCK.id]}</li>
          <li>Lava Burst: ${this.numCasts[SPELLS.LAVA_BURST.id]}</li>
          ${EBtooltip}
          <li>Other Spells: ${this.numCasts.others}</li>
        </ul>
        `;

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.ASCENDANCE_TALENT_ELEMENTAL.id} />}
        value={`~ ${formatNumber(this.averageLavaBurstCasts)}`}
        label="Average Number Of Lava Bursts Per Ascendance"
        tooltip={tooltip}
      />
    );
  }

  get suggestionTresholds() {
    return {
      actual: this.numCasts.others,
      isGreaterThan: {
        major: 1,
      },
      style: 'absolute',
    };
  }

  suggestions(when) {
    const abilities = `Lava Burst${this.selectedCombatant.hasTalent(SPELLS.ELEMENTAL_BLAST_TALENT.id) ? `, Elemental Blast ` : ``} and Earth Shock`;
    when(this.suggestionTresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Maximize your damage during ascendance by only using ${this.abilites}.</span>)
          .icon(SPELLS.ASCENDANCE_TALENT_ELEMENTAL.icon)
          .actual(`${actual} other casts during Ascendence`)
          .recommended(`Only cast ${abilities} during Ascendence.`);
      });
  }

  statisticOrder = STATISTIC_ORDER.OPTIONAL();
}

export default Ascendance;
