import fetchWcl from 'common/fetchWclApi';
import { formatNumber } from 'common/format';
import TALENTS from 'common/TALENTS/priest';
import { WCLHealing, WCLHealingTableResponse } from 'common/WCL_TYPES';
import { SpellIcon } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { EventType } from 'parser/core/Events';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import LazyLoadStatisticBox from 'parser/ui/LazyLoadStatisticBox';
import { GUARDIAN_SPIRIT_HEALING_INCREASE } from '../../constants';

class GuardianSpirit extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };
  // This is an approximation. See the reasoning below.
  totalHealingFromGSBuff = 0;
  protected abilityTracker!: AbilityTracker;

  get totalGSCasts() {
    return this.abilityTracker.getAbility(TALENTS.GUARDIAN_SPIRIT_TALENT.id).casts;
  }

  get filter() {
    return `
    IN RANGE
      FROM type='${EventType.ApplyBuff}'
          AND ability.id=${TALENTS.GUARDIAN_SPIRIT_TALENT.id}
          AND source.name='${this.selectedCombatant.name}'
      TO type='${EventType.RemoveBuff}'
          AND ability.id=${TALENTS.GUARDIAN_SPIRIT_TALENT.id}
          AND source.name='${this.selectedCombatant.name}'
      GROUP BY
        target ON target END`;
  }

  load() {
    return fetchWcl<WCLHealingTableResponse>(`report/tables/healing/${this.owner.report.code}`, {
      start: this.owner.fight.start_time,
      end: this.owner.fight.end_time,
      filter: this.filter,
    }).then((json) => {
      this.totalHealingFromGSBuff = json.entries.reduce(
        // Because this is a % healing increase and we are unable to parse each healing event individually for its effective healing,
        // we need to do some "approximations" using the total overheal in tandem with the total healing. We do not want to naively
        // assume all healing was fully effective, as this would drastically overweight the power of the buff in situations where a
        // lot of overhealing occurs.
        (healingFromBuff, entry: WCLHealing) =>
          healingFromBuff +
          (entry.total - entry.total / (1 + GUARDIAN_SPIRIT_HEALING_INCREASE)) *
            (entry.total / (entry.total + (entry.overheal || 0))),
        0,
      );
    });
  }

  statistic() {
    return (
      <LazyLoadStatisticBox
        loader={this.load.bind(this)}
        icon={<SpellIcon spell={TALENTS.GUARDIAN_SPIRIT_TALENT} />}
        value={<ItemHealingDone amount={this.totalHealingFromGSBuff} />}
        label="Guardian Spirit Buff Contribution"
        tooltip={
          <>
            You casted Guardian Spirit {this.totalGSCasts} times, and it contributed{' '}
            {formatNumber(this.totalHealingFromGSBuff)} healing. This includes healing from other
            healers.
            <br />
            NOTE: This metric uses an approximation to calculate contribution from the buff due to
            technical limitations.
          </>
        }
      />
    );
  }
}

export default GuardianSpirit;
