import React from 'react';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS/index';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import ItemDamageDone from 'interface/ItemDamageDone';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import Events, { ApplyBuffEvent, DamageEvent } from 'parser/core/Events';

const RAMP_INTERVAL = 2000;
const INCREASE_PER_RAMP = 0.01;
const MAX_LONE_WOLF_MODIFIER = 0.10;
const START_LONE_WOLF_MODIFIER = 0;
/**
 * Increases your damage by 10% when you do not have an active pet.
 * After dismissing pet it takes 1 minute to reach full efficiency.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/9Ljy6fh1TtCDHXVB#fight=2&type=auras&source=25&ability=155228
 */
const AFFECTED_SPELLS = [
  SPELLS.AUTO_SHOT,
  SPELLS.MULTISHOT_MM,
  SPELLS.AIMED_SHOT,
  SPELLS.STEADY_SHOT,
  SPELLS.BARRAGE_TALENT,
  SPELLS.A_MURDER_OF_CROWS_DEBUFF,
  SPELLS.CHIMAERA_SHOT_FROST_DAMAGE,
  SPELLS.CHIMAERA_SHOT_NATURE_DAMAGE,
  SPELLS.ARCANE_SHOT,
  SPELLS.BURSTING_SHOT,
  SPELLS.PIERCING_SHOT_TALENT,
  SPELLS.EXPLOSIVE_SHOT_DAMAGE,
  SPELLS.SERPENT_STING_TALENT,
  SPELLS.VOLLEY_DAMAGE,
  SPELLS.RAPID_FIRE,
];

class LoneWolf extends Analyzer {

  damage = 0;
  lwApplicationTimestamp = 0;
  loneWolfModifier = 0;
  lwAppliedOrRemoved = false;

  constructor(options: any) {
    super(options);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.LONE_WOLF_BUFF), this.onLoneWolfApplication);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.LONE_WOLF_BUFF), this.onLoneWolfRemoval);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(AFFECTED_SPELLS), this.onDamage);
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
      this.loneWolfModifier = Math.min(MAX_LONE_WOLF_MODIFIER, Math.floor((((event.timestamp - this.lwApplicationTimestamp) / RAMP_INTERVAL * INCREASE_PER_RAMP) + START_LONE_WOLF_MODIFIER) * 100) / 100);
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
        position={STATISTIC_ORDER.OPTIONAL(13)}
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
