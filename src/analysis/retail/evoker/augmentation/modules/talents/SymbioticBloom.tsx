import fetchWcl from 'common/fetchWclApi';
import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS/evoker';
import TALENTS from 'common/TALENTS/evoker';
import { WCLHealing, WCLHealingTableResponse } from 'common/WCL_TYPES';
import { SpellIcon, SpellLink } from 'interface';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { EventType } from 'parser/core/Events';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import LazyLoadStatisticBox from 'parser/ui/LazyLoadStatisticBox';
import { SYMBIOTIC_HEALING_INCREASE } from '../../constants';

/**
 * Emerald Blossom increases targets' healing received by 3% per rank for 10 sec.
 *
 * Use these logs for testing(m+ log):
 * https://www.warcraftlogs.com/reports/D674brdm8faLzVCq/#fight=4&source=2&type=damage-done
 *
 * Raid with Dream of springs
 * https://www.warcraftlogs.com/reports/2qCQkDV9h8FKLy1r#fight=18&type=summary&source=1
 */
class SymbioticBloom extends Analyzer {
  constructor(options: Options) {
    super(options);
    this.active =
      this.selectedCombatant.hasTalent(TALENTS.SYMBIOTIC_BLOOM_TALENT) ||
      this.selectedCombatant.hasTalent(TALENTS.MOTES_OF_POSSIBILITY_TALENT);
  }
  // This is an approximation. See the reasoning below.
  totalHealingFromSymbioticBloomBuff = 0;

  symbioticBloomHealIncrease = this.selectedCombatant.hasTalent(TALENTS.SYMBIOTIC_BLOOM_TALENT)
    ? SYMBIOTIC_HEALING_INCREASE *
      this.selectedCombatant.getTalentRank(TALENTS.SYMBIOTIC_BLOOM_TALENT)
    : SYMBIOTIC_HEALING_INCREASE * 2;

  get filter() {
    return `
    IN RANGE
      FROM type='${EventType.ApplyBuff}'
          AND ability.id=${SPELLS.SYMBIOTIC_BLOOM_BUFF.id}
          AND source.name='${this.selectedCombatant.name}'
      TO type='${EventType.RemoveBuff}'
          AND ability.id=${SPELLS.SYMBIOTIC_BLOOM_BUFF.id}
          AND source.name='${this.selectedCombatant.name}'
      GROUP BY
        target ON target END`;
  }

  async load() {
    const json = await fetchWcl<WCLHealingTableResponse>(
      `report/tables/healing/${this.owner.report.code}`,
      {
        start: this.owner.fight.start_time,
        end: this.owner.fight.end_time,
        filter: this.filter,
      },
    );
    this.totalHealingFromSymbioticBloomBuff = json.entries.reduce(
      // Because this is a % healing increase and we are unable to parse each healing event individually for its effective healing,
      // we need to do some "approximations" using the total overheal in tandem with the total healing. We do not want to naively
      // assume all healing was fully effective, as this would drastically overweight the power of the buff in situations where a
      // lot of overhealing occurs.
      (healingFromBuff, entry: WCLHealing) =>
        healingFromBuff +
        (entry.total - entry.total / (1 + this.symbioticBloomHealIncrease)) *
          (entry.total / (entry.total + (entry.overheal || 0))),
      0,
    );
  }

  statistic() {
    return (
      <LazyLoadStatisticBox
        loader={this.load.bind(this)}
        icon={<SpellIcon spell={TALENTS.SYMBIOTIC_BLOOM_TALENT} />}
        value={
          <ItemHealingDone
            amount={this.totalHealingFromSymbioticBloomBuff}
            displayPercentage={false}
          />
        }
        label={
          this.selectedCombatant.hasTalent(TALENTS.SYMBIOTIC_BLOOM_TALENT)
            ? 'Symbiotic Bloom Buff Contribution'
            : 'Symbiotic Bloom Buff Contribution (Motes of Possibility)'
        }
        tooltip={
          <>
            <SpellLink spell={TALENTS.SYMBIOTIC_BLOOM_TALENT} /> contributed{' '}
            {formatNumber(this.totalHealingFromSymbioticBloomBuff)} healing.
            <br />
            NOTE: This metric uses an approximation to calculate contribution from the buff due to
            technical limitations.
          </>
        }
      />
    );
  }
}

export default SymbioticBloom;
