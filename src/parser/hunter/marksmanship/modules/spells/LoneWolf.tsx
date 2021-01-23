import React from 'react';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Events, { ApplyBuffEvent, DamageEvent } from 'parser/core/Events';
import { LONE_WOLF_AFFECTED_SPELLS, LONE_WOLF_INCREASE_PER_RAMP, LONE_WOLF_RAMP_INTERVAL_MS, MAX_LONE_WOLF_MODIFIER, START_LONE_WOLF_MODIFIER } from 'parser/hunter/marksmanship/constants';

/**
 * Increases your damage by 10% when you do not have an active pet.
 * After dismissing pet it takes 20 seconds to reach full efficiency.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/9Ljy6fh1TtCDHXVB#fight=2&type=auras&source=25&ability=155228
 */

class LoneWolf extends Analyzer {

  damage = 0;
  lwApplicationTimestamp = 0;
  loneWolfModifier = 0;
  lwAppliedOrRemoved = false;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.LONE_WOLF_BUFF), this.onLoneWolfApplication);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.LONE_WOLF_BUFF), this.onLoneWolfRemoval);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(LONE_WOLF_AFFECTED_SPELLS), this.onDamage);
    this.addEventListener(Events.fightend, this.deactivateIfNoDamage);
  }

  onLoneWolfApplication(event: ApplyBuffEvent) {
    this.lwApplicationTimestamp = event.timestamp;
    this.lwAppliedOrRemoved = true;
  }

  onLoneWolfRemoval() {
    this.loneWolfModifier = 0;
    this.lwAppliedOrRemoved = true;
  }

  onDamage(event: DamageEvent) {
    if (this.lwAppliedOrRemoved && !this.selectedCombatant.hasBuff(SPELLS.LONE_WOLF_BUFF.id)) {
      return;
    }
    if (this.lwApplicationTimestamp > 0) {
      this.loneWolfModifier = Math.min(MAX_LONE_WOLF_MODIFIER, Math.floor((((event.timestamp - this.lwApplicationTimestamp) / LONE_WOLF_RAMP_INTERVAL_MS * LONE_WOLF_INCREASE_PER_RAMP) + START_LONE_WOLF_MODIFIER) * 100) / 100);
    } else {
      this.loneWolfModifier = MAX_LONE_WOLF_MODIFIER;
    }
    this.damage += calculateEffectiveDamage(event, this.loneWolfModifier);
  }

  deactivateIfNoDamage() {
    if (this.damage === 0) {
      this.active = false;
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(20)}
        size="flexible"
      >
        <BoringSpellValueText spell={SPELLS.LONE_WOLF_BUFF}>
          <>
            <ItemDamageDone amount={this.damage} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default LoneWolf;
