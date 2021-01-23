import React from 'react';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import AverageTargetsHit from 'parser/ui/AverageTargetsHit';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Events, { DamageEvent } from 'parser/core/Events';

/**
 * A two-headed shot that hits your primary target and another nearby target, dealing 720% Nature damage to one and 720% Frost damage to the other.
 * Generates 10 Focus for each target hit.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/3hpLckCDdjWXqFyT#fight=5&type=damage-done&source=2&ability=-53209
 */
class ChimaeraShot extends Analyzer {

  damage = 0;
  casts = 0;
  hits = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.CHIMAERA_SHOT_TALENT_BEAST_MASTERY.id);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.CHIMAERA_SHOT_TALENT_BEAST_MASTERY), () => {
      this.casts += 1;
    });
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell([SPELLS.CHIMAERA_SHOT_BM_FROST_DAMAGE, SPELLS.CHIMAERA_SHOT_BM_NATURE_DAMAGE]), this.onChimaeraDamage);
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
        <BoringSpellValueText spell={SPELLS.CHIMAERA_SHOT_TALENT_BEAST_MASTERY}>
          <>
            <ItemDamageDone amount={this.damage} />
            <br />
            <AverageTargetsHit casts={this.casts} hits={this.hits} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ChimaeraShot;
