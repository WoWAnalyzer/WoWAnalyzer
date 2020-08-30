import React from 'react';

import SPELLS from 'common/SPELLS/index';
import { calculateAzeriteEffects } from 'common/stats';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { DamageEvent, EnergizeEvent } from 'parser/core/Events';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import ItemDamageDone from 'interface/ItemDamageDone';
import Events from 'parser/core/Events';
import { formatNumber } from 'common/format';

const whispersOfTheDamnedStats = (traits: any) => Object.values(traits).reduce((obj: any, rank) => {
  const [damage] = calculateAzeriteEffects(SPELLS.WHISPERS_OF_THE_DAMNED.id, rank);
  obj.damage += damage;
  return obj;
}, {
  damage: 0,
});

const MIND_BLAST_SPELLS = [
  SPELLS.MIND_BLAST,
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

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTrait(SPELLS.WHISPERS_OF_THE_DAMNED.id);
    if (!this.active) {
      return;
    }
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(MIND_BLAST_SPELLS), this.onDamageEvent);
    this.addEventListener(Events.energize.by(SELECTED_PLAYER).spell(SPELLS.WHISPERS_OF_THE_DAMNED_ENERGIZE), this.onEnergizeEvent);


    const { damage }: any = whispersOfTheDamnedStats(this.selectedCombatant.traitsBySpellId[SPELLS.WHISPERS_OF_THE_DAMNED.id]);
    this.damageValue = damage;
  }

  onDamageEvent(event: DamageEvent) {
    this.damageDone += this.damageValue;
  }

  onEnergizeEvent(event: EnergizeEvent) {
    this.insanityGained += event.resourceChange;
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.AZERITE_POWERS}
        size="flexible"
        tooltip={(
          <>
            {formatNumber(this.damageDone)} additional damage dealt by {SPELLS.WHISPERS_OF_THE_DAMNED.name}.<br />
            {formatNumber(this.insanityGained)} additional insanity generated.
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.WHISPERS_OF_THE_DAMNED}>
          <>
            <ItemDamageDone amount={this.damageDone} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default WhispersOfTheDamned;
