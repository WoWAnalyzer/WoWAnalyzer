import React from 'react';

import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import StatTracker from 'parser/shared/modules/StatTracker';
import Statistic from 'parser/ui/Statistic';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import Events, { ApplyDebuffEvent, CastEvent, RefreshDebuffEvent } from 'parser/core/Events';

interface MarkOfTheCrane {
  target: MarkOfTheCraneTarget;
  timestamp: number;
}

interface MarkOfTheCraneTarget {
  id: number;
  instance: number;
}

const isEqual = (a: MarkOfTheCraneTarget, b: MarkOfTheCraneTarget) => a.id === b.id && a.instance === b.instance;

class SpinningCraneKick extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    statTracker: StatTracker,
  };

  protected abilityTracker!: AbilityTracker;
  protected statTracker!: StatTracker;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER | SELECTED_PLAYER_PET).spell(SPELLS.MARK_OF_THE_CRANE),
      this.onMarkApplication,
    );
    this.addEventListener(
      Events.refreshdebuff
        .by(SELECTED_PLAYER | SELECTED_PLAYER_PET)
        .spell(SPELLS.MARK_OF_THE_CRANE),
      this.onMarkRefresh,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER | SELECTED_PLAYER_PET).spell(SPELLS.SPINNING_CRANE_KICK),
      this.onSCKCast,
    );
    this.addEventListener(
      Events.damage
        .by(SELECTED_PLAYER | SELECTED_PLAYER_PET)
        .spell(SPELLS.SPINNING_CRANE_KICK_DAMAGE),
      this.onSCKDamage,
    );
  }

  cycloneStrikesMarks: MarkOfTheCrane[] = [];
  spinningCraneKickHits = 0;
  totalMarksDuringHits = 0;

  // targetInstance is undefined when it's the first one.
  _verifyTargetInstance(targetInstance: number | undefined) {
    return targetInstance === undefined ? 1 : targetInstance;
  }

  onMarkApplication(event: ApplyDebuffEvent) {
    const targetInstance = this._verifyTargetInstance(event.targetInstance);
    const markOfTheCrane: MarkOfTheCrane = {
      target: { id: event.targetID, instance: targetInstance },
      timestamp: event.timestamp,
    };
    this.cycloneStrikesMarks.push(markOfTheCrane);
  }

  onMarkRefresh(event: RefreshDebuffEvent) {
    const targetInstance = this._verifyTargetInstance(event.targetInstance);
    const refreshedMark: MarkOfTheCrane = {
      target: { id: event.targetID, instance: targetInstance },
      timestamp: event.timestamp,
    };
    this.cycloneStrikesMarks.forEach((mark) => {
      if (isEqual(mark.target, refreshedMark.target)) {
        mark.timestamp = refreshedMark.timestamp;
      }
    });
  }

  onSCKCast(event: CastEvent) {
    // Filter out expired targets
    this.cycloneStrikesMarks = this.cycloneStrikesMarks.filter(
      (mark) => event.timestamp - mark.timestamp <= 15000,
    );
    if (this.selectedCombatant.hasBuff(SPELLS.DANCE_OF_CHI_JI_BUFF.id)) {
      event.meta = event.meta || {};
      event.meta.isEnhancedCast = true;
      event.meta.enhancedCastReason = 'This cast was empowered by Dance of Chi-Ji';
    }
  }

  onSCKDamage() {
    this.spinningCraneKickHits += 1;
    this.totalMarksDuringHits += this.cycloneStrikesMarks.length;
  }

  get casts() {
    return this.abilityTracker.getAbility(SPELLS.SPINNING_CRANE_KICK.id).casts;
  }

  get averageEnemiesHit() {
    return this.spinningCraneKickHits / ((this.casts > 0 ? this.casts : 1) * 4);
  }

  get averageMarks() {
    return this.totalMarksDuringHits / this.spinningCraneKickHits;
  }

  statistic() {
    if (this.casts > 0) {
      // Spinning Crane Kick is usually not used outside aoe, so we're avoiding rendering it when it's not used
      return (
        <Statistic
          position={STATISTIC_ORDER.CORE(7)}
          size="flexible"
          tooltip="Spinning Crane Kick hits all nearby enemies 4 times over its duration. Mark of the crane, which increases the damage of your Spinning Crane Kick, is applied by your single target abilities and is capped at 5 targets."
        >
          <BoringSpellValueText spell={SPELLS.SPINNING_CRANE_KICK}>
            {this.averageMarks.toFixed(2)} <small>Average marks</small>
            <br />
            {this.averageEnemiesHit.toFixed(2)} <small>Average enemies hit</small>
          </BoringSpellValueText>
        </Statistic>
      );
    }
    return null;
  }
}

export default SpinningCraneKick;
