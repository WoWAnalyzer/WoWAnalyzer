import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellIcon } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import BoringValue from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { TALENTS_DRUID } from 'common/TALENTS';

const MS_BUFFER = 100;
export const ABUNDANCE_MANA_REDUCTION = 0.05;
const ABUNDANCE_INCREASED_CRIT = 0.05;

/**
 * **Abundance**
 * Spec Talent Tier 4
 *
 * For each Rejuvenation you have active,
 * Regrowth's cost is reduced by 5% and critical effect chance is increased by 5%.
 */
class Abundance extends Analyzer {
  manaSavings: number[] = [];
  critGains: number[] = [];
  stacks: number[] = [];
  manaCasts = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.ABUNDANCE_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.REGROWTH), this.onCast);
  }

  onCast(event: CastEvent) {
    const abundanceBuff = this.selectedCombatant.getBuff(
      SPELLS.ABUNDANCE_BUFF.id,
      event.timestamp,
      MS_BUFFER,
    );
    if (abundanceBuff == null) {
      return;
    }

    if (
      !this.selectedCombatant.hasBuff(SPELLS.CLEARCASTING_BUFF.id) &&
      !this.selectedCombatant.hasBuff(SPELLS.INNERVATE.id)
    ) {
      this.manaSavings.push(
        abundanceBuff.stacks * ABUNDANCE_MANA_REDUCTION > 1
          ? 1
          : abundanceBuff.stacks * ABUNDANCE_MANA_REDUCTION,
      );
      this.manaCasts += 1;
    }

    this.critGains.push(
      abundanceBuff.stacks * ABUNDANCE_INCREASED_CRIT > 1
        ? 1
        : abundanceBuff.stacks * ABUNDANCE_INCREASED_CRIT,
    );
    this.stacks.push(abundanceBuff.stacks);
  }

  statistic() {
    const avgManaSavingsPercent =
      this.manaSavings.reduce(function (a, b) {
        return a + b;
      }, 0) / this.manaSavings.length || 0;
    const avgCritGains =
      this.critGains.reduce(function (a, b) {
        return a + b;
      }, 0) / this.critGains.length || 0;
    const avgStacks =
      this.stacks.reduce(function (a, b) {
        return a + b;
      }, 0) / this.stacks.length || 0;
    const avgManaSaings = SPELLS.REGROWTH.manaCost * avgManaSavingsPercent;

    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(4)} // number based on talent row
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            Average mana reductions gained was {formatPercentage(avgManaSavingsPercent)}% or{' '}
            {formatNumber(avgManaSaings)} mana per cast.
            <br />
            Total mana saved was {(avgManaSaings * this.manaSavings.length).toFixed(0)} <br />
            Average crit gain was {formatPercentage(avgCritGains)}%.
          </>
        }
      >
        <BoringValue
          label={
            <>
              <SpellIcon spell={TALENTS_DRUID.ABUNDANCE_TALENT} /> Average Abundance stacks
            </>
          }
        >
          <>{avgStacks.toFixed(2)}</>
        </BoringValue>
      </Statistic>
    );
  }
}

export default Abundance;
