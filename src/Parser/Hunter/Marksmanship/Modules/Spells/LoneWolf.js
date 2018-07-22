import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';

import SPELLS from 'common/SPELLS/index';
import SpellLink from "common/SpellLink";
import getDamageBonus from 'Parser/Hunter/Shared/Modules/getDamageBonus';
import ItemDamageDone from 'Interface/Others/ItemDamageDone';

const RAMP_INTERVAL = 6000;
const INCREASE_PER_RAMP = 0.01;
const MAX_LONE_WOLF_MODIFIER = 0.10;
/**
 * Increases your damage by 10% when you do not have an active pet.
 *
 * After dismissing pet it takes 1 minute to reach full efficiency
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
  SPELLS.EXPLOSIVE_SHOT_DETONATION.id,
  SPELLS.SERPENT_STING_TALENT.id,
  SPELLS.VOLLEY_DAMAGE.id,
  SPELLS.RAPID_FIRE.id,
];

class LoneWolf extends Analyzer {
  damage = 0;
  dismissPetTimestamp = 0;
  loneWolfModifier = 0;

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.DISMISS_PET.id) {
      return;
    }
    this.dismissPetTimestamp = event.timestamp;
  }
  on_byPlayer_damage(event) {
    if (!this.selectedCombatant.hasBuff(SPELLS.LONE_WOLF_BUFF.id)) {
      return;
    }
    if (!AFFECTED_SPELLS.includes(event.ability.guid)) {
      return;
    }
    this.loneWolfModifier = Math.min(MAX_LONE_WOLF_MODIFIER, Math.floor((event.timestamp - this.dismissPetTimestamp) / RAMP_INTERVAL * INCREASE_PER_RAMP));
    this.damage += getDamageBonus(event, this.loneWolfModifier);
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
