import React from 'react';

import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import StatTracker from 'parser/shared/modules/StatTracker';
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText/index';
import { STATISTIC_ORDER } from 'interface/others/StatisticBox';

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
      } else {
        this.markoftheCraneStacks++;
      }
      i++;
    }
    if (this.selectedCombatant.hasBuff(SPELLS.DANCE_OF_CHIJI_BUFF.id)) {
      event.meta = event.meta || {};
      event.meta.isEnhancedCast = true;
      event.meta.enhancedCastReason = 'This cast was empowered by Dance of Chi-Ji';
      return;
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
  get casts() {
    return this.abilityTracker.getAbility(SPELLS.SPINNING_CRANE_KICK.id).casts;
  }

  get averageHits() {
    return this.spinningCraneKickHits / (this.casts > 0 ? this.casts : 1);
  }

  get averageMarks() {
    return this.totalMarksDuringHits / (this.casts > 0 ? this.casts : 1);
  }

  statistic() {
    if (this.casts > 0) {
      // Spinning Crane Kick is usually not used outside aoe, so we're avoiding rendering it when it's not used
      return (
        <Statistic
          position={STATISTIC_ORDER.CORE(5)}
          size="flexible"
          tooltip="Spinning Crane Kick hits all nearby enemies 4 times over its duration. Mark of the crane, which increases the damage of your Spinning Crane Kick, is applied by your single target abilities and is capped at 5 targets."
        >
          <BoringSpellValueText spell={SPELLS.SPINNING_CRANE_KICK}>
            {(this.averageMarks).toFixed(2)} <small>Average marks</small><br />
            {(this.averageHits).toFixed(2)} <small>Average hits</small>
          </BoringSpellValueText>
        </Statistic>
      );
    }
    return null;
  }
}

export default SpinningCraneKick;
