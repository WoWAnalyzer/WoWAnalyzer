import React from 'react';
import { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import { formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';

import SPELLS from 'common/SPELLS';

import Analyzer, { SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
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
    if(!this.active){
      return;
    }

    this.addEventListener(Events.heal.by(SELECTED_PLAYER_PET).spell(SPELLS.SOOTHING_MIST_STATUE), this.jssHeal);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER_PET).spell(SPELLS.SOOTHING_MIST_STATUE), this.jssApplyBuff);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER_PET).spell(SPELLS.SOOTHING_MIST_STATUE), this.jssRemoveBuff);
    this.addEventListener(Events.refreshbuff.by(SELECTED_PLAYER_PET).spell(SPELLS.SOOTHING_MIST_STATUE), this.jssRefreshBuff);
    this.addEventListener(Events.fightend, this.endFight);
  }

  jssHeal(event) {
      this.healing += (event.amount || 0) + (event.absorbed || 0);
      this.overHealing += event.overheal || 0;
      this.casts += 1;
    
  }

  jssApplyBuff(event) {

    this.lastBuffApplyTimestamp = event.timestamp;
    this.jssCasting = true;
  }

  jssRemoveBuff(event) {
    
    // Care for buff application before fight.
    if (this.lastBuffApplyTimestamp === null) {
      this.soothingMistUptime += event.timestamp - this.owner.fight.start_time;
      return;
    }

    this.soothingMistUptime += event.timestamp - this.lastBuffApplyTimestamp;
    this.jssCasting = false;
  }

  jssRefreshBuff(event) {
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

  endFight() {
    if(this.jssCasting) {
      this.soothingMistUptime += this.owner.fight.end_time - this.lastBuffApplyTimestamp;
    }
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
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => suggest(
        <>
          You selected <SpellLink id={SPELLS.SUMMON_JADE_SERPENT_STATUE_TALENT.id} /> as your talent. To gain the most value out of this talent you should have it casting on someone as often as possible. The priority should be tanks or any raid member taking heavy damage, such as from a specific DOT or boss mechanic.
        </>,
      )
        .icon(SPELLS.SUMMON_JADE_SERPENT_STATUE_TALENT.icon)
        .actual(`${formatPercentage(actual)}% uptime`)
        .recommended(`${formatPercentage(recommended)}% uptime is recommended`));
  }

  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.SUMMON_JADE_SERPENT_STATUE_TALENT.id}
        position={STATISTIC_ORDER.OPTIONAL(25)}
        value={`${formatPercentage(this.jadeSerpentStatueUptime)}`}
        label="% Uptime"
      />
    );
  }

}

export default JadeSerpentStatue;
