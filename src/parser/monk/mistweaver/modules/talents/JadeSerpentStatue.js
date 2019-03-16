import React from 'react';
import { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import { formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';

import SPELLS from 'common/SPELLS';

import Analyzer from 'parser/core/Analyzer';
import Combatants from 'parser/shared/modules/Combatants';

class JadeSerpentStatue extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    combatants: Combatants,
  };

  healing = 0;
  overHealing = 0;
  casts = 0;

  soothingMistUptime = 0;
  lastBuffApplyTimestamp = null;
  jssCasting = false;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SUMMON_JADE_SERPENT_STATUE_TALENT.id);
  }

  on_heal(event) {
    if (event.ability.guid === SPELLS.SOOTHING_MIST_STATUE.id) {
      this.healing += (event.amount || 0) + (event.absorbed || 0);
      this.overHealing += event.overheal || 0;
      this.casts += 1;
    }
  }

  on_byPlayerPet_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.SOOTHING_MIST_STATUE.id) {
      return;
    }

    this.lastBuffApplyTimestamp = event.timestamp;
    this.jssCasting = true;
  }

  on_byPlayerPet_removebuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.SOOTHING_MIST_STATUE.id) {
      return;
    }
    
    // Care for buff application before fight.
    if (this.lastBuffApplyTimestamp === null) {
      this.soothingMistUptime += event.timestamp - this.owner.fight.start_time;
      return;
    }

    this.soothingMistUptime += event.timestamp - this.lastBuffApplyTimestamp;
    this.jssCasting = false;
  }

  on_byPlayerPet_refreshbuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.SOOTHING_MIST_STATUE.id) {
      return;
    }
    
    // Care for buff application before fight.
    if (this.lastBuffApplyTimestamp === null) {
      this.soothingMistUptime += event.timestamp - this.owner.fight.start_time;
    } else {
      this.soothingMistUptime += event.timestamp - this.lastBuffApplyTimestamp;
    }

    this.lastBuffApplyTimestamp = event.timestamp;
    this.jssCasting = true;
  }

  on_fightend() {
    if(this.jssCasting) {
      this.soothingMistUptime += this.owner.fight.end_time - this.lastBuffApplyTimestamp;
    }
  }

  get jadeSerpentStatueOverHealing() {
    return (this.overHealing / (this.healing + this.overHealing)).toFixed(4) || 0;
  }

  get jadeSerpentStatueUptime() {
    return this.soothingMistUptime / this.owner.fightDuration;
  }

  get suggestionThresholds() {
    return {
      actual: this.jadeSerpentStatueUptime,
      isLessThan: {
        minor: .85,
        average: .75,
        major: .65,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(
        <>
          You selected <SpellLink id={SPELLS.SUMMON_JADE_SERPENT_STATUE_TALENT.id} /> as your talent. To gain the most value out of this talent you should have it casting on someone as often as possible. The priority should be tanks or any raid member taking heavy damage, such as from a specific DOT or boss mechanic.
        </>
      )
        .icon(SPELLS.SUMMON_JADE_SERPENT_STATUE_TALENT.icon)
        .actual(`${formatPercentage(actual)}% uptime`)
        .recommended(`${formatPercentage(recommended)}% uptime is recommended`);
    });
  }

  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.SUMMON_JADE_SERPENT_STATUE_TALENT.id}
        position={STATISTIC_ORDER.OPTIONAL(25)}
        value={`${formatPercentage(this.jadeSerpentStatueUptime)}`}
        label={(`% Uptime`)}
      />
    );
  }

}

export default JadeSerpentStatue;
