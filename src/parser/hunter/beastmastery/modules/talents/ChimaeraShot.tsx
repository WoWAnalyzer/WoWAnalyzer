import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import ItemDamageDone from 'interface/ItemDamageDone';
import AverageTargetsHit from 'interface/others/AverageTargetsHit';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText
  from 'interface/statistics/components/BoringSpellValueText';
import { CastEvent, DamageEvent } from '../../../../core/Events';

/**
 * A two-headed shot that hits your primary target and another nearby target,
 * dealing 720% Nature damage to one and 720% Frost damage to the other.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/qZRdFv9Apg74wmMV#fight=3&type=damage-done
 */
class ChimaeraShot extends Analyzer {

  damage = 0;
  casts = 0;
  hits = 0;

  constructor(options: any) {
    super(options);
    this.active
      = this.selectedCombatant.hasTalent(SPELLS.CHIMAERA_SHOT_TALENT.id);
  }

  on_byPlayer_cast(event: CastEvent) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.CHIMAERA_SHOT_TALENT.id) {
      return;
    }
    this.casts += 1;
  }

  on_byPlayer_damage(event: DamageEvent) {
    const spellId = event.ability.guid;
    if (spellId !==
      SPELLS.CHIMAERA_SHOT_FROST_DAMAGE.id &&
      spellId !==
      SPELLS.CHIMAERA_SHOT_NATURE_DAMAGE.id) {
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
        <BoringSpellValueText spell={SPELLS.CHIMAERA_SHOT_TALENT}>
          <>
            <ItemDamageDone amount={this.damage} /> <br />
            <AverageTargetsHit casts={this.casts} hits={this.hits} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ChimaeraShot;
