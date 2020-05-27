import React from 'react';

import { calculateAzeriteEffects } from 'common/stats';
import SPELLS from 'common/SPELLS/index';
import SpellLink from 'common/SpellLink';
import AzeritePowerStatistic from 'interface/statistics/AzeritePowerStatistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import Analyzer from 'parser/core/Analyzer';
import StatTracker from 'parser/shared/modules/StatTracker';
import { getIcon } from 'parser/shared/modules/features/STAT';
import { EventType } from 'parser/core/Events';

const archiveOfTheTitansStats = traits => Object.values(traits).reduce((total, rank) => {
  const [stat] = calculateAzeriteEffects(SPELLS.ARCHIVE_OF_THE_TITANS.id, rank);
  return total + stat;
}, 0);

/**
 * Archive of the Titans
 * Your armor gathers and analyzes combat data every 5 sec, increasing your primary stat by 6, stacking up to 20 times.
 * The data decays while out of combat.
 *
 * Enables Reorigination Array within Uldir.
 */
class ArchiveOfTheTitans extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  primaryPerStack = 0;
  currentStacks = 0;
  lastTimestamp = 0;
  totalPrimary = 0;

  constructor(...args){
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.ARCHIVE_OF_THE_TITANS.id);
    if (!this.active) {
      return;
    }

    this.primaryPerStack = archiveOfTheTitansStats(this.selectedCombatant.traitsBySpellId[SPELLS.ARCHIVE_OF_THE_TITANS.id]);

    this.statTracker.add(SPELLS.ARCHIVE_OF_THE_TITANS_BUFF.id, {
      intellect: this.primaryPerStack,
      strength: this.primaryPerStack,
      agility: this.primaryPerStack,
    });
  }

  on_byPlayer_applybuff(event) {
    this.handleBuff(event);
  }

  on_byPlayer_applybuffstack(event) {
    this.handleBuff(event);
  }

  on_byPlayer_removebuff(event) {
    this.handleBuff(event);
  }

  handleBuff(event) {
    if (event.ability.guid !== SPELLS.ARCHIVE_OF_THE_TITANS_BUFF.id) {
      return;
    }

    if (this.currentStacks !== 0 && this.lastTimestamp !== 0) {
      const uptimeOnStack = event.timestamp - this.lastTimestamp;
      this.totalPrimary += this.currentStacks * this.primaryPerStack * uptimeOnStack;
    }

    if (event.type === EventType.RemoveBuff) {
      this.currentStacks = 0;
    } else {
      this.currentStacks = (event.stack || 1);
    }

    this.lastTimestamp = event.timestamp;
  }

  on_fightend() {
    if (this.currentStacks !== 0 && this.lastTimestamp !== 0) {
      const uptimeOnStack = this.owner.fight.end_time - this.lastTimestamp;
      this.totalPrimary += this.currentStacks * this.primaryPerStack * uptimeOnStack;
    }
  }

  get averagePrimaryStat() {
    return (this.totalPrimary / this.owner.fightDuration).toFixed(0);
  }

  // todo: reorigination array
  statistic() {
    const Icon = getIcon(this.selectedCombatant.spec.primaryStat.toLowerCase());
    return (
      <AzeritePowerStatistic size="medium">
        <BoringSpellValueText
          spell={SPELLS.ARCHIVE_OF_THE_TITANS}
        >
          <Icon /> {this.averagePrimaryStat} <small>average {this.selectedCombatant.spec.primaryStat} gained</small><br />
          <small>Enabled the <SpellLink id={SPELLS.REORIGINATION_ARRAY.id} /></small>
        </BoringSpellValueText>
      </AzeritePowerStatistic>
    );
  }
}

export default ArchiveOfTheTitans;
