import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Analyzer from 'parser/core/Analyzer';
import StatisticsListBox from 'interface/others/StatisticsListBox';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import StatTracker from 'parser/shared/modules/StatTracker';
import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';

class SpinningCraneKick extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    statTracker: StatTracker,
  };

  badCasts = 0;
  markoftheCraneTargets = [];
  lastSpinningCraneKickTick = 0;
  spinningCraneKickHits = 0;
  totalMarksDuringHits = 0;
  markoftheCraneStacks = 0;
  spinningCraneKickDuration = 1500;

  on_byPlayer_applydebuff(event) {
    const spellId = event.ability.guid;
    let targetInstance = event.targetInstance;
    if (spellId !== SPELLS.MARK_OF_THE_CRANE.id) {
      return;
    }
    // The event doesn't specify instance on the first target of that type
    if (targetInstance === undefined) {
      targetInstance = 1;
    }
    const markoftheCraneTarget = { targetID: event.targetID, targetInstance: targetInstance, timestamp: event.timestamp };
    this.markoftheCraneTargets.push(markoftheCraneTarget);
  }

  on_byPlayer_refreshdebuff(event) {
    const spellId = event.ability.guid;
    let targetInstance = event.targetInstance;
    if (spellId !== SPELLS.MARK_OF_THE_CRANE.id) {
      return;
    }
    if (targetInstance === undefined) {
      targetInstance = 1;
    }
    const markoftheCraneTarget = { targetID: event.targetID, targetInstance: targetInstance, timestamp: event.timestamp };
    let i = 0;
    while (i <= this.markoftheCraneTargets.length - 1) {
      if (this.markoftheCraneTargets[i].targetID === markoftheCraneTarget.targetID && this.markoftheCraneTargets[i].targetInstance === markoftheCraneTarget.targetInstance) {
        this.markoftheCraneTargets[i].timestamp = markoftheCraneTarget.timestamp;
      }
      i++;
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.SPINNING_CRANE_KICK.id) {
      return;
    }
    this.markoftheCraneStacks = 0;
    let i = 0;
    while (i < this.markoftheCraneTargets.length) {
      // removing expired targets to avoid looking through huge arrays in logs with a lot of targets
      if (event.timestamp - this.markoftheCraneTargets[i].timestamp > 15000) {
        this.markoftheCraneTargets.splice(i, 1);
      }
      else {
        this.markoftheCraneStacks++;
      }
      i++;
    }
    // Currently only marking casts with lower DPET than Blackout Kick
    // TODO: Expand to also mark targets with lower DPChi than Blackout Kick
    if (this.markoftheCraneStacks <= 1) {
      this.badCasts += 1;
    }
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.SPINNING_CRANE_KICK_DAMAGE.id) {
      return;
    }
    this.spinningCraneKickDuration = 1500 / (1 + this.statTracker.hastePercentage(this.statTracker.currentHasteRating));
    this.spinningCraneKickHits++;
    // Spinning Crane Kick deals damage 4 times over 1.5 seconds (reduced by haste)
    // This makes sure it only counts once per cast and only on casts that hit something
    if (event.timestamp - this.lastSpinningCraneKickTick > this.spinningCraneKickDuration) {
      this.totalMarksDuringHits += this.markoftheCraneStacks;
      this.lastSpinningCraneKickTick = event.timestamp;
    }
  }

  get suggestionThresholds() {
    const badCastsPerMinute = (this.badCasts / this.owner.fightDuration) * 1000 * 60;
    return {
      actual: badCastsPerMinute,
      isGreaterThan: {
        minor: 0,
        average: 1,
        major: 2,
      },
      style: 'number',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion(
      (suggest, actual, recommended) => {
        return suggest(
          <>
            You have ineffecient casts of <SpellLink id={SPELLS.SPINNING_CRANE_KICK.id} />
          </>
        )
          .icon(SPELLS.SPINNING_CRANE_KICK.icon)
          .actual(`${actual} Bad Casts Per Minute`)
          .recommended(`${recommended} Bad Casts are recommended`);
      });
  }

  averageHits() {
    const averageHits = this.spinningCraneKickHits / this.abilityTracker.getAbility(SPELLS.SPINNING_CRANE_KICK.id).casts;
    return (
      <StatisticListBoxItem
        title="Average hits"
        titleTooltip="Spinning Crane Kick hits all nearby enemies 4 times over 1.5 seconds"
        value={averageHits.toFixed(2)}
      />
    );
  }

  averageMarks() {
    const averageMarks = this.totalMarksDuringHits / this.abilityTracker.getAbility(SPELLS.SPINNING_CRANE_KICK.id).casts;
    return (
      <StatisticListBoxItem
        title="Average marks"
        titleTooltip={`You had an average of ${averageMarks.toFixed(2)} Mark of the Crane stacks while hitting enemies with Spinning Crane Kick`}
        value={averageMarks.toFixed(2)}
      />
    );
  }

  badCastsStatistic() {
    return (
      <StatisticListBoxItem
        title="Bad casts"
        titleTooltip="Bad casts is currently only counting casts with lower DPET (Damage Per Execute Time) than Blackout Kick."
        value={this.badCasts}
      />
    );
  }

  statistic() {
    if (this.abilityTracker.getAbility(SPELLS.SPINNING_CRANE_KICK.id).casts > 0) {
      // TODO: Remove this if-statement since rendering should be consistent regardless of cast count OR document why this is an exception
      return (
        <StatisticsListBox
          title={
            <SpellLink id={SPELLS.SPINNING_CRANE_KICK.id} />
          }
          style={{ minHeight: 150 }}
        >
          {this.averageMarks()}
          {this.averageHits()}
          {this.badCastsStatistic()}
        </StatisticsListBox>
      );
    }
    return null;
  }
}

export default SpinningCraneKick;
