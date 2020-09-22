import React from 'react';

import SPELLS from 'common/SPELLS/index';
import { calculateAzeriteEffects } from 'common/stats';
import Analyzer from 'parser/core/Analyzer';
import { DamageEvent, EnergizeEvent } from 'parser/core/Events';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import ItemDamageDone from 'interface/ItemDamageDone';
import { formatNumber } from 'common/format';

const deathThroesStats = (traits: any) => Object.values(traits).reduce((obj: any, rank) => {
  const [damage] = calculateAzeriteEffects(SPELLS.DEATH_THROES.id, rank);
  obj.damage += damage;
  return obj;
}, {
  damage: 0,
});

/**
 * Death Throes
 * Shadow Word: Pain deals an additional 1424 damage. When an enemy dies while afflicted by your Shadow Word: Pain, you gain 5 Insanity.
 * This is specifically the SHADOW version of PtW. The disc version is different.
 * Example log: /report/kq6T4Rd3v1nmbNHK/3-Heroic+Taloc+-+Kill+(4:46)/17-Budgiechrist
 */
class DeathThroes extends Analyzer {
  damageValue = 0;
  damageDone = 0;
  insanityGained = 0;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTrait(SPELLS.DEATH_THROES.id);
    if (!this.active) {
      return;
    }

    const { damage }: any = deathThroesStats(this.selectedCombatant.traitsBySpellId[SPELLS.DEATH_THROES.id]);
    this.damageValue = damage;
  }

  on_byPlayer_damage(event: DamageEvent) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.SHADOW_WORD_PAIN.id || !event.tick) {
      return;
    }
    this.damageDone += this.damageValue;
  }

  on_byPlayer_energize(event: EnergizeEvent) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.DEATH_THROES_ENERGIZE.id) {
      return;
    }
    this.insanityGained += event.resourceChange;
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.AZERITE_POWERS}
        size="flexible"
        tooltip={(
          <>
            {formatNumber(this.damageDone)} additional damage dealt by {SPELLS.SHADOW_WORD_PAIN.name}<br />
            {formatNumber(this.insanityGained)} additional insanity generated.
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.DEATH_THROES}>
          <>
            <ItemDamageDone amount={this.damageDone} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default DeathThroes;
