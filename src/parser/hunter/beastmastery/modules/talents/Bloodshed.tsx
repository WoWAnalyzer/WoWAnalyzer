import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import ItemDamageDone from 'interface/ItemDamageDone';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import { DamageEvent } from 'parser/core/Events';
import { isPermanentPet } from 'parser/warlock/demonology/modules/pets/helpers';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';

/**
 * Command your pet to tear into your target, causing your target to bleed for
 * [Attack power * 0.25 * 6 * 1 * (1 + Versatility) * 1] over 18 sec and
 * increase all damage taken from your pet by 15% for 18 sec.
 */

class Bloodshed extends Analyzer {

  bleedDamage = 0;
  increasedDamage = 0;
  pets: { petName: string, sourceID: number | undefined, damage: number }[] = [];

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.BLOODSHED_TALENT.id);
  }

  on_byPlayer_damage(event: DamageEvent) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.BLOODSHED_DEBUFF.id) {
      return;
    }
    this.bleedDamage += event.amount + (event.absorbed || 0);
  }

  on_byPlayerPet_damage(event: DamageEvent) {
    const foundPet = this.pets.find((pet: { sourceID: number | undefined }) => pet.sourceID ===
      event.sourceID);
    const damage = event.amount + (event.absorbed || 0);
    if (!foundPet) {
      const sourcePet = this.owner.playerPets.find((pet: { id: number | undefined; }) => pet.id ===
        event.sourceID);
      if (!isPermanentPet(sourcePet.guid)) {
        return;
      }
      this.pets.push({
        petName: sourcePet.name,
        sourceID: event.sourceID,
        damage: damage,
      });
    } else {
      foundPet.damage += damage;
    }
  }

  on_fightend() {
    let max = 0;
    this.pets.forEach((pet: { damage: number; petName: string; }) => {
      if (pet.damage > max) {
        max = pet.damage;
        this.increasedDamage = pet.damage;
      }
    });
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={SPELLS.ASPECT_OF_THE_BEAST_TALENT}>
          <>
            <ItemDamageDone amount={this.bleedDamage} /> <small>bleed damage</small>
            <ItemDamageDone amount={this.increasedDamage} /> <small>damage amp</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Bloodshed;
