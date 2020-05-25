import React from 'react';

import Analyzer from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS/index';
import SpellLink from 'common/SpellLink';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import ItemDamageDone from 'interface/ItemDamageDone';
import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import ApplyBuff from '../../../../shared/normalizers/ApplyBuff';
import { ApplyBuffEvent, DamageEvent, RemoveBuffEvent } from '../../../../core/Events';

const RAMP_INTERVAL = 6000;
const INCREASE_PER_RAMP = 0.01;
const MAX_LONE_WOLF_MODIFIER = 0.10;
const START_LONE_WOLF_MODIFIER = 0.01;
/**
 * Increases your damage by 10% when you do not have an active pet.
 * After dismissing pet it takes 1 minute to reach full efficiency.
 *
 * Example log: https://www.warcraftlogs.com/reports/v6nrtTxNKGDmYJXy#fight=16&type=auras&source=6
 */
const AFFECTED_SPELLS = [
  SPELLS.AUTO_SHOT.id,
  SPELLS.MULTISHOT_MM.id,
  SPELLS.AIMED_SHOT.id,
  SPELLS.STEADY_SHOT.id,
  SPELLS.BARRAGE_TALENT.id,
  SPELLS.A_MURDER_OF_CROWS_DEBUFF.id,
  SPELLS.CHIMAERA_SHOT_FROST_DAMAGE.id,
  SPELLS.CHIMAERA_SHOT_NATURE_DAMAGE.id,
  SPELLS.ARCANE_SHOT.id,
  SPELLS.BURSTING_SHOT.id,
  SPELLS.PIERCING_SHOT_TALENT.id,
  SPELLS.EXPLOSIVE_SHOT_DAMAGE.id,
  SPELLS.SERPENT_STING_TALENT.id,
  SPELLS.VOLLEY_DAMAGE.id,
  SPELLS.RAPID_FIRE.id,
];

class LoneWolf extends Analyzer {

  damage = 0;
  lwApplicationTimestamp = 0;
  loneWolfModifier = 0;
  lwAppliedOrRemoved = false;

  constructor(options: any) {
    super(options);
    this.active = this.owner.playerPets.length === 0;
  }

  on_byPlayer_applybuff(event: ApplyBuffEvent) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.LONE_WOLF_BUFF.id) {
      return;
    }
    this.lwApplicationTimestamp = event.timestamp;
    this.lwAppliedOrRemoved = true;
  }

  on_byPlayer_removebuff(event: RemoveBuffEvent) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.LONE_WOLF_BUFF.id) {
      return;
    }
    this.loneWolfModifier = 0;
    this.lwAppliedOrRemoved = true;
  }

  on_byPlayer_damage(event: DamageEvent) {
    if (this.lwAppliedOrRemoved && !this.selectedCombatant.hasBuff(SPELLS.LONE_WOLF_BUFF.id)) {
      return;
    }
    if (!AFFECTED_SPELLS.includes(event.ability.guid)) {
      return;
    }
    if (this.lwApplicationTimestamp > 0) {
      this.loneWolfModifier = Math.min(MAX_LONE_WOLF_MODIFIER, Math.floor((((event.timestamp - this.lwApplicationTimestamp) / RAMP_INTERVAL * INCREASE_PER_RAMP) + START_LONE_WOLF_MODIFIER) * 100) / 100);
    } else {
      this.loneWolfModifier = MAX_LONE_WOLF_MODIFIER;
    }
    this.damage += calculateEffectiveDamage(event, this.loneWolfModifier);
  }

  on_fightend() {
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
