import React from 'react';

import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import ItemDamageDone from 'interface/others/ItemDamageDone';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import GarroteSnapshot from '../features/GarroteSnapshot';
import StealthCasts from './StealthCasts';

class Subterfuge extends StealthCasts {
  static dependencies = {
    garroteSnapshot: GarroteSnapshot,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SUBTERFUGE_TALENT.id);
  }

  get bonusDamage() {
    return this.garroteSnapshot.bonusDamage;
  }

  get stealthsWithAtleastOneGarrote() {
    let stealthsWithGarrote = 0;
    this.stealthSequences.forEach(sequence => {
      const firstGarroteCast = sequence.find(e => e.ability.guid === SPELLS.GARROTE.id);
      if (firstGarroteCast) {
        stealthsWithGarrote += 1;
      }
    });
    return stealthsWithGarrote;
  }

  get stealthCasts() {
    return this.stealthSequences.length;
  }

  get percentGoodStealthCasts() {
    return (this.stealthsWithAtleastOneGarrote / this.stealthCasts) || 0;
  }

  get suggestionThresholds() {
    return {
      actual: this.percentGoodStealthCasts,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.8,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(<>Your failed to cast atleast one <SpellLink id={SPELLS.GARROTE.id} /> during <SpellLink id={SPELLS.SUBTERFUGE_BUFF.id} /> {this.stealthCasts - this.stealthsWithAtleastOneGarrote} time(s). Make sure to prioritize snapshotting <SpellLink id={SPELLS.GARROTE.id} /> during <SpellLink id={SPELLS.SUBTERFUGE_BUFF.id} />.</>)
        .icon(SPELLS.GARROTE.icon)
        .actual(`${formatPercentage(actual)}% of Subterfuges with atleast one Garrote cast`)
        .recommended(`>${formatPercentage(recommended)}% is recommended`);
    });
  }

  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.SUBTERFUGE_TALENT.id}
        position={STATISTIC_ORDER.OPTIONAL(2)}
        value={<ItemDamageDone amount={this.bonusDamage} />}
        tooltip={`You casted atleast one Garrote during Subterfuge ${this.stealthsWithAtleastOneGarrote} times out of ${this.stealthCasts}.`}
      />
    );
  }

}

export default Subterfuge;
