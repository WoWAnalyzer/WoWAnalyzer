import { formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

/**
 * Example Report: https://www.warcraftlogs.com/reports/AZMDnzrG48KJLgP6/#fight=1&source=1
 */

class FelMastery extends Analyzer {
  damage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.FEL_MASTERY_TALENT.id);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.FEL_RUSH_DAMAGE),
      this.felRushExtraDamage,
    );
  }

  //Since fel mastery doubles the damage of fel rush, halfing the damage to get the talent damage part.
  felRushExtraDamage(event: DamageEvent) {
    this.damage += event.amount / 2;
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            {formatThousands(this.damage)} Total damage <br /> <br />
            This shows the extra damage done by Fel Rush due to the Fel Mastery talent.
          </>
        }
      >
        <BoringSpellValueText spellId={SPELLS.FEL_MASTERY_TALENT.id}>
          {this.owner.formatItemDamageDone(this.damage)}
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default FelMastery;
