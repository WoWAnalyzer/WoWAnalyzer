import React from 'react';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import ItemDamageDone from 'interface/ItemDamageDone';
import AverageTargetsHit from 'interface/others/AverageTargetsHit';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import Events, { DamageEvent } from 'parser/core/Events';

/**
 * A two-headed shot that hits your primary target and another nearby target, dealing 720% Nature damage to one and 720% Frost damage to the other.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/3hpLckCDdjWXqFyT#fight=5&type=damage-done&source=2&ability=-53209
 */
class ChimaeraShot extends Analyzer {

  damage = 0;
  casts = 0;
  hits = 0;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.CHIMAERA_SHOT_TALENT.id);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.CHIMAERA_SHOT_TALENT), () => { this.casts += 1; });
    this.addEventListener(Events.damage.by(SELECTED_PLAYER)
      .spell([SPELLS.CHIMAERA_SHOT_FROST_DAMAGE, SPELLS.CHIMAERA_SHOT_NATURE_DAMAGE]), this.onChimaeraDamage);
  }

  onChimaeraDamage(event: DamageEvent) {
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
