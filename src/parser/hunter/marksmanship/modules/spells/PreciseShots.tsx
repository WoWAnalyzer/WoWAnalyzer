import React from 'react';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/hunter';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import ItemDamageDone from 'interface/ItemDamageDone';
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';

/**
 * Aimed Shot causes your next 1-2 Arcane Shots or Multi-Shots to deal 100% more damage.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/9Ljy6fh1TtCDHXVB#fight=2&type=auras&source=25&ability=260242
 */

const ASSUMED_PROCS = 2; //Logs give no indication whether we gain 1 or 2 stacks - we assume 2 and work from there.
const PRECISE_SHOTS_MODIFIER = 0.75;
const MAX_TRAVEL_TIME = 500;

class PreciseShots extends Analyzer {

  damage = 0;
  buffsActive = 0;
  buffsGained = 0;
  minOverwrittenProcs = 0;
  maxOverwrittenProcs = 0;
  buffedShotInFlight: number | null = null;

  constructor(options: any) {
    super(options);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.PRECISE_SHOTS), this.onPreciseShotsApplication);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.PRECISE_SHOTS), this.onPreciseShotsRemoval);
    this.addEventListener(Events.removebuffstack.by(SELECTED_PLAYER).spell(SPELLS.PRECISE_SHOTS), this.onPreciseShotsStackRemoval);
    this.addEventListener(Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.PRECISE_SHOTS), this.onPreciseShotsStackApplication);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell([SPELLS.ARCANE_SHOT, SPELLS.MULTISHOT_MM]), this.onPreciseCast);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.checkForBuff);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell([SPELLS.ARCANE_SHOT, SPELLS.MULTISHOT_MM]), this.onPreciseDamage);
  }

  onPreciseShotsApplication() {
    this.buffsActive = ASSUMED_PROCS;
  }

  onPreciseShotsRemoval() {
    this.buffsGained += 1;
    this.buffsActive = 0;
  }

  onPreciseShotsStackRemoval() {
    this.buffsGained += 1;
    this.buffsActive -= 1;
  }

  onPreciseShotsStackApplication() {
    this.minOverwrittenProcs += 1;
    this.maxOverwrittenProcs += 2;
    this.buffsActive = ASSUMED_PROCS;
  }

  onPreciseCast(event: CastEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.PRECISE_SHOTS.id)) {
      return;
    }
    this.buffedShotInFlight = event.timestamp;
  }

  onPreciseDamage(event: DamageEvent) {
    this.checkForBuff(event);
    if (!this.buffedShotInFlight) {
      return;
    }
    if (this.buffedShotInFlight < event.timestamp + MAX_TRAVEL_TIME) {
      this.damage += calculateEffectiveDamage(event, PRECISE_SHOTS_MODIFIER);
    }
    if (event.ability.guid === SPELLS.ARCANE_SHOT.id) {
      this.buffedShotInFlight = null;
    }
  }

  checkForBuff(event: DamageEvent) {
    if (!this.buffedShotInFlight) {
      return;
    }
    if (this.buffedShotInFlight > event.timestamp + MAX_TRAVEL_TIME) {
      this.buffedShotInFlight = null;
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(17)}
        size="flexible"
        tooltip={(
          <>
            You wasted between {this.minOverwrittenProcs} and {this.maxOverwrittenProcs} Precise Shots procs by casting Aimed Shot when you already had Precise Shots active
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.PRECISE_SHOTS}>
          <>
            <ItemDamageDone amount={this.damage} /><br />
            {this.buffsGained} <small>buffs used</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default PreciseShots;
