import React from 'react';
import { formatPercentage } from 'common/format';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';

import SPELLS from 'common/SPELLS';

import Analyzer, { Options, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, HealEvent, RefreshBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import { ThresholdStyle, When } from 'parser/core/ParseResults';

import Statistic from 'interface/statistics/Statistic';
import BoringValueText from 'interface/statistics/components/BoringValueText'
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';

import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';


class JadeSerpentStatue extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    combatants: Combatants,
  };

  protected abilityTracker!: AbilityTracker;
  protected combatants!: Combatants;

  healing: number = 0;
  overHealing: number = 0;
  casts: number = 0;

  soothingMistUptime: number = 0;
  lastBuffApplyTimestamp: number = 0;
  jssCasting: boolean = false;

  constructor(options: Options){
    super(options);
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

  jssHeal(event: HealEvent) {
      this.healing += (event.amount || 0) + (event.absorbed || 0);
      this.overHealing += event.overheal || 0;
      this.casts += 1;
    
  }

  jssApplyBuff(event: ApplyBuffEvent) {
    this.lastBuffApplyTimestamp = event.timestamp;
    this.jssCasting = true;
  }

  jssRemoveBuff(event: RemoveBuffEvent) {
    
    // Care for buff application before fight.
    if (this.lastBuffApplyTimestamp === null) {
      this.soothingMistUptime += event.timestamp - this.owner.fight.start_time;
      return;
    }

    this.soothingMistUptime += event.timestamp - this.lastBuffApplyTimestamp;
    this.jssCasting = false;
  }

  jssRefreshBuff(event: RefreshBuffEvent) {
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
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => suggest(
        <>
          You selected <SpellLink id={SPELLS.SUMMON_JADE_SERPENT_STATUE_TALENT.id} /> as your talent. To gain the most value out of this talent you should have it casting on someone as often as possible. The priority should be tanks or any raid member taking heavy damage, such as from a specific DOT or boss mechanic.
        </>,
      )
        .icon(SPELLS.SUMMON_JADE_SERPENT_STATUE_TALENT.icon)
        .actual(`${formatPercentage(actual)}${i18n._(t('monk.mistweaver.jadeSerpentStatue.uptime')`% uptime`)}`)
        .recommended(`${formatPercentage(recommended)}% uptime is recommended`));
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringValueText 
          label={<><SpellIcon id={SPELLS.SUMMON_JADE_SERPENT_STATUE_TALENT.id} /> % Uptime</>}
        >
          <>
            {formatPercentage(this.jadeSerpentStatueUptime)}
          </>
        </BoringValueText>
      </Statistic>
    );
  }

}

export default JadeSerpentStatue;
