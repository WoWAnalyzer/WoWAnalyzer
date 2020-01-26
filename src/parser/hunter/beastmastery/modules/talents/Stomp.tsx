import React from 'react';

import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import ItemDamageDone from 'interface/ItemDamageDone';
import AverageTargetsHit from 'interface/others/AverageTargetsHit';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText
  from 'interface/statistics/components/BoringSpellValueText';
import { CastEvent, DamageEvent } from '../../../../core/Events';

/**
 * When you cast Barbed Shot, your pet stomps the ground, dealing [((50% of
 * Attack power)) * (1 + Versatility)] Physical damage to all nearby enemies.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/yg6PFb8NKz71MRWY#fight=20&type=damage-done
 */

class Stomp extends Analyzer {
  damage = 0;
  hits = 0;
  casts = 0;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.STOMP_TALENT.id);
  }

  on_byPlayer_cast(event: CastEvent) {
    const spellId = event.ability.guid;
    if (spellId !==
      SPELLS.BARBED_SHOT.id &&
      spellId !==
      SPELLS.DIRE_BEAST_TALENT.id) {
      return;
    }
    this.casts += 1;
  }

  on_byPlayerPet_damage(event: DamageEvent) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.STOMP_DAMAGE.id) {
      return;
    }
    this.hits += 1;
    this.damage += event.amount +
      (
        event.absorbed || 0
      );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={'TALENTS'}
      >
        <BoringSpellValueText spell={SPELLS.STOMP_TALENT}>
          <>
            <ItemDamageDone amount={this.damage} /><br />
            <AverageTargetsHit casts={this.casts} hits={this.hits} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Stomp;
