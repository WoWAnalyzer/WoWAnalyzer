import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import ItemDamageDone from 'interface/others/ItemDamageDone';

/**
 * You and your pet leap to the target and strike it as one, dealing a total of X Physical damage.
 *
 * Generates 30 Focus for you and your pet.
 */

const FLANKING_STRIKE_FOCUS_GAIN = 30;

class FlankingStrike extends Analyzer {

  damage = 0;

  flankingStrikes = [];

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.FLANKING_STRIKE_TALENT.id);
  }

  on_byPlayerPet_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.FLANKING_STRIKE_PET.id) {
      return;
    }
    const damage = event.amount + (event.absorbed || 0);
    const foundPet = this.flankingStrikes.find(pet => pet.sourceID === event.sourceID);
    if (!foundPet) {
      const sourcePet = this.owner.playerPets.find(pet => pet.id === event.sourceID);
      this.flankingStrikes.push({ name: sourcePet.name, sourceID: event.sourceID, damage: damage, effectiveFocus: 0, possibleFocus: 0 });
    } else {
      foundPet.damage += damage;
    }
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.FLANKING_STRIKE_PLAYER.id) {
      return;
    }
    const damage = event.amount + (event.absorbed || 0);
    const foundPlayer = this.flankingStrikes.find(player => player.sourceID === event.sourceID);
    if (!foundPlayer) {
      const player = this.selectedCombatant.owner.player;
      this.flankingStrikes.push({ name: player.name, sourceID: event.sourceID, damage: damage, effectiveFocus: 0, possibleFocus: 0 });
    } else {
      foundPlayer.damage += damage;
    }
  }

  on_byPlayerPet_energize(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.FLANKING_STRIKE_PET.id) {
      return;
    }
    const effectiveFocus = (event.resourceChange - event.waste) || 0;
    const foundPet = this.flankingStrikes.find(pet => pet.sourceID === event.sourceID);
    if (!foundPet) {
      const sourcePet = this.owner.playerPets.find(pet => pet.id === event.sourceID);
      this.flankingStrikes.push({ name: sourcePet.name, sourceID: event.sourceID, damage: 0, effectiveFocus: effectiveFocus, possibleFocus: FLANKING_STRIKE_FOCUS_GAIN });
    } else {
      foundPet.effectiveFocus += effectiveFocus;
      foundPet.possibleFocus += FLANKING_STRIKE_FOCUS_GAIN;
    }
  }

  on_byPlayer_energize(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.FLANKING_STRIKE_PLAYER.id) {
      return;
    }
    const effectiveFocus = (event.resourceChange - event.waste) || 0;
    const foundPlayer = this.flankingStrikes.find(player => player.sourceID === event.sourceID);
    if (!foundPlayer) {
      const player = this.selectedCombatant.owner.player;
      this.flankingStrikes.push({ name: player.name, sourceID: event.sourceID, damage: 0, effectiveFocus: effectiveFocus, possibleFocus: FLANKING_STRIKE_FOCUS_GAIN });
    } else {
      foundPlayer.effectiveFocus += effectiveFocus;
      foundPlayer.possibleFocus += FLANKING_STRIKE_FOCUS_GAIN;
    }
  }

  statistic() {
    const totalDamage = this.flankingStrikes.map(source => source.damage).reduce((total, current) => total + current, 0);
    return (
      <TalentStatisticBox
        talent={SPELLS.FLANKING_STRIKE_TALENT.id}
        value={<ItemDamageDone amount={totalDamage} />}
      >
        <table className="table table-condensed">
          <thead>
            <tr>
              <th>Source</th>
              <th>Damage</th>
              <th>Focus</th>
            </tr>
          </thead>
          <tbody>
            {this.flankingStrikes.map((source, idx) => (
              <tr key={idx}>
                <td>{source.name}</td>
                <td>{<ItemDamageDone amount={source.damage} />}</td>
                <td>{source.effectiveFocus}/{source.possibleFocus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TalentStatisticBox>
    );
  }
}

export default FlankingStrike;
