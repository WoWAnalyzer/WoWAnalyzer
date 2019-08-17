import React from 'react';

import SPELLS from 'common/SPELLS/index';
import { calculateAzeriteEffects } from 'common/stats';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import ItemDamageDone from 'interface/others/ItemDamageDone';
import Events from 'parser/core/Events';
import HIT_TYPES from 'game/HIT_TYPES';
import { formatNumber } from 'common/format';

const whispersOfTheDamnedStats = traits => Object.values(traits).reduce((obj, rank) => {
  const [damage] = calculateAzeriteEffects(SPELLS.WHISPERS_OF_THE_DAMNED.id, rank);
  obj.damage += damage;
  return obj;
}, {
  damage: 0,
});

const MIND_BLAST_SPELLS = [
  SPELLS.MIND_BLAST,
  SPELLS.SHADOW_WORD_VOID_TALENT,
];

/**
 * Whispers of the Damned
 * Mind Blast deals 2704 additional damage and generates 20 additional Insanity on critical strikes.
 *
 * Example log: /report/JQNwLbpdtmrzYAGC/5-Mythic+Blackwater+Behemoth+-+Kill+(5:09)/Adoraci
 */
class WhispersOfTheDamned extends Analyzer {
  damageValue = 0;
  damageDone = 0;
  insanityGained = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.WHISPERS_OF_THE_DAMNED.id);
    if (!this.active) {
      return;
    }
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(MIND_BLAST_SPELLS), this.onDamageEvent);
    this.addEventListener(Events.energize.by(SELECTED_PLAYER).spell(SPELLS.WHISPERS_OF_THE_DAMNED_ENERGIZE), this.onEnergizeEvent);


    const { damage } = whispersOfTheDamnedStats(this.selectedCombatant.traitsBySpellId[SPELLS.WHISPERS_OF_THE_DAMNED.id]);
    this.damageValue = damage;
  }

  onDamageEvent(event) {
    this.damageDone += this.damageValue;
  }

  onEnergizeEvent(event) {
    this.insanityGained += event.resourceChange;
  }

  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.WHISPERS_OF_THE_DAMNED.id}
        value={<ItemDamageDone amount={this.damageDone} />}
        tooltip={(
          <>
            {formatNumber(this.damageDone)} additional damage dealt by {SPELLS.WHISPERS_OF_THE_DAMNED.name}.<br />
            {formatNumber(this.insanityGained)} additional insanity generated.
          </>
        )}
      />
    );
  }
}

export default WhispersOfTheDamned;
