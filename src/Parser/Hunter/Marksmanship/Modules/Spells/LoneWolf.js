import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';

import SPELLS from 'common/SPELLS/index';
import SpellLink from "common/SpellLink";
import calculateEffectiveDamage from 'Parser/Core/calculateEffectiveDamage';
import ItemDamageDone from 'Interface/Others/ItemDamageDone';

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
  SPELLS.STEADY_SHOT.id,
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

  constructor(...args) {
    super(...args);
    this.active = true;
  }
  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.LONE_WOLF_BUFF.id) {
      return;
    }
    this.lwApplicationTimestamp = event.timestamp;
  }

  on_byPlayer_damage(event) {
    if (!this.selectedCombatant.hasBuff(SPELLS.LONE_WOLF_BUFF.id)) {
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

  on_finished() { //TODO: WCL is currently having issues with blizzard not reporting LW uptime if it was up through the fight. Possibly check for pet damage, and if none - assume LW was up for the entirety of the fight.
    if (this.damage === 0) {
      this.active = false;
    }
  }

  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.LONE_WOLF_BUFF.id} />
        </div>
        <div className="flex-sub text-right">
          <ItemDamageDone amount={this.damage} />
        </div>
      </div>
    );
  }

}

export default LoneWolf;
