import React from 'react';

import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import ItemDamageDone from 'interface/ItemDamageDone';
import AverageTargetsHit from 'interface/others/AverageTargetsHit';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import Events, { DamageEvent } from 'parser/core/Events';

/**
 * When you cast Barbed Shot, your pet stomps the ground, dealing [((50% of Attack power)) * (1 + Versatility)] Physical damage to all nearby enemies.
 *
 * Example log without Animal Companion:
 * https://www.warcraftlogs.com/reports/Q9LghKR7ZPnAwFaH#fight=48&type=damage-done&ability=201754&source=280
 *
 * Example log with Animal Companion (on ST, so only 1 avg target hit expected):
 * https://www.warcraftlogs.com/reports/aRZTcf4Gh6n7xmKq#fight=9&type=damage-done&source=10&ability=201754
 *
 */

const AMOUNT_OF_PETS_WITH_AC = 2;
class Stomp extends Analyzer {
  damage = 0;
  hits = 0;
  casts = 0;
  hasAC = false;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.STOMP_TALENT.id);
    this.hasAC = this.selectedCombatant.hasTalent(SPELLS.ANIMAL_COMPANION_TALENT.id);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell([SPELLS.BARBED_SHOT, SPELLS.DIRE_BEAST_TALENT]), () => { this.casts += 1; });
    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET).spell(SPELLS.STOMP_DAMAGE), this.onPetStompDamage);
  }

  onPetStompDamage(event: DamageEvent) {
    this.hits += 1;
    this.damage += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={SPELLS.STOMP_TALENT}>
          <>
            <ItemDamageDone amount={this.damage} /><br />
            <AverageTargetsHit casts={this.casts} hits={this.hasAC ? this.hits/AMOUNT_OF_PETS_WITH_AC : this.hits} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Stomp;
