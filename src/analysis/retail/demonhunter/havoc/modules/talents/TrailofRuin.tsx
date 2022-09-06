import { formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

/**
 * Example Report: https://www.warcraftlogs.com/reports/RMPgqbz1BxpG9X8H/#fight=2&source=10
 */

class TrailofRuin extends Analyzer {
  damage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.TRAIL_OF_RUIN_TALENT.id);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.TRAIL_OF_RUIN_DAMAGE),
      this.trailOfRuinDot,
    );
  }

  trailOfRuinDot(event: DamageEvent) {
    this.damage += event.amount;
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={`${formatThousands(this.damage)} Total damage`}
      >
        <BoringSpellValueText spellId={SPELLS.TRAIL_OF_RUIN_TALENT.id}>
          {this.owner.formatItemDamageDone(this.damage)}
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default TrailofRuin;
