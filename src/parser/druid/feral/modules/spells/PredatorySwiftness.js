import React from 'react';
import SPELLS from 'common/SPELLS';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import Statistic from 'interface/statistics/Statistic';
import { formatPercentage } from 'common/format';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';

const debug = false;

const PREDATORY_SWIFTNESS_BUFF_DURATION = 12000;
const EXPIRE_WINDOW = 100;
const IGNORE_DOUBLE_GAIN_WINDOW = 100;
const POTENTIAL_SPENDERS = [
  SPELLS.REGROWTH,
  SPELLS.ENTANGLING_ROOTS,
];

/**
 * Using a finishing move has a 20% chance per combo point to give the buff "Predatory Swiftness"
 * which makes the next Regrowth or Entangling Roots instant cast and usable in cat form.
 */
class PredatorySwiftness extends Analyzer {
  get wasted() {
    return this.expired + this.overwritten + this.remainAfterFight;
  }

  get wastedFraction() {
    return this.wasted / this.generated;
  }

  hasSwiftness = false;
  generated = 0;
  used = 0;
  expired = 0;
  remainAfterFight = 0;
  overwritten = 0;
  /**
   * The combat log sometimes reports the player gaining Predatory Swiftness twice from a single finisher.
   * Avoid this by tracking time of last gain event.
   */
  timeLastGain = null;

  constructor(options) {
    super(options);
    this.addEventListener(Events.fightend, this.onFightend);
    this.addEventListener(Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.PREDATORY_SWIFTNESS), this.onApplyBuff);
    this.addEventListener(Events.refreshbuff.to(SELECTED_PLAYER).spell(SPELLS.PREDATORY_SWIFTNESS), this.onRefreshBuff);
    this.addEventListener(Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.PREDATORY_SWIFTNESS), this.onRemoveBuff);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(POTENTIAL_SPENDERS), this.onCast);
  }

  onFightend() {
    if (this.hasSwiftness) {
      debug && console.log(`${this.owner.formatTimestamp(this.owner.fight.end_time, 3)} fight ended with a Predatory Swiftness buff unused.`);
      this.remainAfterFight = 1;
    }

    if (debug && this.generated !== (this.used + this.expired + this.remainAfterFight + this.overwritten)) {
      console.warn(`Not all Predatory Swiftness charges accounted for. Generated: ${this.generated}, used: ${this.used}, expired: ${this.expired}, remainAfterFight: ${this.remainAfterFight}, overwritten: ${this.overwritten}`);
    }
  }

  onApplyBuff(event) {
    debug && console.log(`${this.owner.formatTimestamp(event.timestamp, 3)} gained Predatory Swiftness`);
    this.hasSwiftness = true;
    this.generated += 1;
    this.timeLastGain = event.timestamp;
    this.expireTime = event.timestamp + PREDATORY_SWIFTNESS_BUFF_DURATION;
  }

  onRefreshBuff(event) {
    if (Math.abs(event.timestamp - this.timeLastGain) < IGNORE_DOUBLE_GAIN_WINDOW) {
      return;
    }
    debug && console.log(`${this.owner.formatTimestamp(event.timestamp, 3)} gained Predatory Swiftness, overwriting existing`);
    this.hasSwiftness = true;
    this.generated += 1;
    this.overwritten += 1;
    this.timeLastGain = event.timestamp;
    // buff duration not affected by pandemic
    this.expireTime = event.timestamp + PREDATORY_SWIFTNESS_BUFF_DURATION;
  }

  onRemoveBuff(event) {
    if (!this.hasSwiftness || !this.expireTime ||
      Math.abs(this.expireTime - event.timestamp) > EXPIRE_WINDOW) {
      return;
    }
    debug && console.log(`${this.owner.formatTimestamp(event.timestamp, 3)} Predatory Swiftness expired, unused`);
    this.expired += 1;
    this.hasSwiftness = false;
    this.expireTime = null;
  }

  onCast(event) {
    if (!this.hasSwiftness) {
      return;
    }
    debug && console.log(`${this.owner.formatTimestamp(event.timestamp, 3)} Predatory Swiftness used`);
    this.used += 1;
    this.hasSwiftness = false;
    this.expireTime = null;
  }

  statistic() {
    return (
      <Statistic
        tooltip={(
          <>
            You used <strong>{this.used}</strong> out of <strong>{this.generated}</strong> Predatory Swiftness buffs to instant-cast Regrowth or Entangling Roots. <br />
            <ul>
              <li>The buff was allowed to expire <strong>{this.expired}</strong> time{this.expired !== 1 ? 's' : ''}.</li>
              <li>You used another finisher while the buff was still active and overwrote it <strong>{this.overwritten}</strong> time{this.overwritten !== 1 ? 's' : ''}.</li>
              <li>You had <strong>{this.remainAfterFight}</strong> remaining unused at the end of the fight.</li>
            </ul>
          </>
        )}
        size="flexible"
        position={STATISTIC_ORDER.OPTIONAL(5)}
      >
        <BoringSpellValueText spell={SPELLS.PREDATORY_SWIFTNESS}>
          <>
            {formatPercentage(1 - this.wastedFraction)}% <small>buffs used</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default PredatorySwiftness;
