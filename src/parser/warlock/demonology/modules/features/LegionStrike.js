import React from 'react';

import Analyzer, { SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatThousands, formatPercentage } from 'common/format';

import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';

import { isPermanentPet } from '../pets/helpers';

class LegionStrike extends Analyzer {
  casts = 0;
  damage = 0;

  constructor(...args) {
    super(...args);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER_PET).spell(SPELLS.FELGUARD_LEGION_STRIKE), this.legionStrikeCast);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET).spell(SPELLS.FELGUARD_LEGION_STRIKE), this.legionStrikeDamage);
  }

  legionStrikeCast(event) {
    // Grimoire: Felguard casts Legion Strike with the same spell ID, only count LS casts from the permanent pet
    if (this._isPermanentPet(event.sourceID)) {
      this.casts += 1;
    }
  }

  legionStrikeDamage(event) {
    if (this._isPermanentPet(event.sourceID)) {
      this.damage += event.amount + (event.absorbed || 0);
    }
  }

  _getPetGuid(id) {
    return this.owner.playerPets.find(pet => pet.id === id).guid;
  }

  _isPermanentPet(id) {
    const guid = this._getPetGuid(id);
    return isPermanentPet(guid);
  }

  get suggestionThresholds() {
    return {
      actual: this.casts,
      isLessThan: {
        minor: 1,
        average: 0,
        major: 0,
      },
      style: 'number',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<>Your Felguard didn't cast <SpellLink id={SPELLS.FELGUARD_LEGION_STRIKE.id} /> at all. Remember to turn on the auto-cast for this ability as it's a great portion of your total damage.</>)
          .icon(SPELLS.FELGUARD_LEGION_STRIKE.icon)
          .actual(`${actual} Legion Strike casts`)
          .recommended(`> ${recommended} casts are recommended`);
      });
  }

  get dps() {
    return this.damage / this.owner.fightDuration * 1000;
  }

  statistic() {
    return (
      <Statistic
        size="small"
        tooltip={`${formatThousands(this.damage)} damage. Counts only main pet's Legion Strike.`}
      >
        <BoringSpellValueText spell={SPELLS.FELGUARD_LEGION_STRIKE}>
          {formatThousands(this.dps)} DPS <small>{formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.damage))} % of total</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default LegionStrike;
