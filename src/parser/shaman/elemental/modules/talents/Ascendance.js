import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatNumber, formatPercentage } from 'common/format';

import Analyzer from 'parser/core/Analyzer';
import EnemyInstances from 'parser/shared/modules/EnemyInstances';

import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';

import Abilities from '../Abilities';

const ASCENDENCE_DURATION = 15000;

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

  numLavaBurstsCast = 0;
  numLightningBoltsCast = 0;
  numOtherCasts = 0;

  badFSAscendence = 0;

  numCasts = {
    [SPELLS.LAVA_BURST.id]: 0,
    [SPELLS.EARTH_SHOCK.id]: 0,
    [SPELLS.ELEMENTAL_BLAST_TALENT.id]: 0,
    others: 0,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.ASCENDANCE_TALENT_ELEMENTAL.id);
  }

  get rawUpdate() {
    return this.selectedCombatant.getBuffUptime(SPELLS.ASCENDANCE_TALENT_ELEMENTAL.id) / this.owner.fightDuration;
  }

  get AscendanceUptime() {
    return this.rawUpdate;
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    const target = this.enemies.getEntity(event);


    if(spellId === SPELLS.ASCENDANCE_TALENT_ELEMENTAL.id) {
      if(target && target.getBuffUptime(SPELLS.FLAME_SHOCK.id) < ASCENDENCE_DURATION){
        this.badFSAscendence++;
      }
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

    if (this.selectedCombatant.hasBuff(SPELLS.ASCENDANCE_TALENT_ELEMENTAL.id, event.timestamp)) {
      const spellId = event.ability.guid;
      if (this.numCasts[spellId] !== undefined) {
        this.numCasts[spellId] += 1;
      } else {
        this.numCasts.others += 1;
      }
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
        value={`${this.numCasts[SPELLS.LAVA_BURST.id]}`}
        label="Lava Burst casts"
        tooltip={tooltip}
      />
    );
  }

  suggestions(when) {
    const abilities = `Lava Burst${this.selectedCombatant.hasTalent(SPELLS.ELEMENTAL_BLAST_TALENT.id) ? `, Elemental Blast ` : ``} and Earth Shock`;
    when(this.numCasts.others).isGreaterThan(0)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span> Maximize your damage during ascendence by not casting weak spells.</span>)
          .icon(SPELLS.ASCENDANCE_TALENT_ELEMENTAL.icon)
          .actual(`${formatNumber(this.numCasts.others)} other casts during Ascendence`)
          .recommended(`Only cast ${abilities} during Ascendence.`)
          .major(recommended+1);
      });
  }

  statisticOrder = STATISTIC_ORDER.OPTIONAL();
}

export default Ascendance;
