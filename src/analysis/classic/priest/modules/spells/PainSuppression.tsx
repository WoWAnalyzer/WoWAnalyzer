import fetchWcl from 'common/fetchWclApi';
import { formatNumber } from 'common/format';
import { WCLDamageTaken, WCLDamageTakenTableResponse, WCLHealing, WCLHealingTableResponse } from 'common/WCL_TYPES';
import { SpellIcon } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { EventType } from 'parser/core/Events';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import LazyLoadStatisticBox from 'parser/ui/LazyLoadStatisticBox';
import * as SPELLS from '../../SPELLS';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

const PAIN_SUPPRESSION_DAMAGE_REDUCTION = 0.4;

class PainSuppression extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };
  // This is an approximation.
  totalDamageTakenWhileBuffActive = 0;

  protected abilityTracker!: AbilityTracker;

  get totalCasts() {
    return this.abilityTracker.getAbility(SPELLS.PAIN_SUPPRESSION).casts;
  }

  get totalDamageReduced() {
    return this.totalDamageTakenWhileBuffActive / (1 - PAIN_SUPPRESSION_DAMAGE_REDUCTION);
  }

  get filter() {
    return `
    IN RANGE
      FROM type='${EventType.ApplyBuff}'
          AND ability.id=${SPELLS.PAIN_SUPPRESSION}
          AND source.name='${this.selectedCombatant.name}'
      TO type='${EventType.RemoveBuff}'
          AND ability.id=${SPELLS.PAIN_SUPPRESSION}
          AND source.name='${this.selectedCombatant.name}'
      GROUP BY
        target ON target END`;
  }

  load() {
    return fetchWcl<WCLDamageTakenTableResponse>(`report/tables/damage-taken/${this.owner.report.code}`, {
      start: this.owner.fight.start_time,
      end: this.owner.fight.end_time,
      filter: this.filter,
    }).then((json) => {
      this.totalDamageTakenWhileBuffActive = json.entries.reduce(
        (damageTakenWhileBuffActive, entry: WCLDamageTaken) => damageTakenWhileBuffActive + (entry.total || 0),
        0,
      );
    });
  }

  statistic() {
    this.active = this.totalCasts > 0;

    return (
      <LazyLoadStatisticBox
        category={STATISTIC_CATEGORY.TALENTS}
        loader={this.load.bind(this)}
        icon={<SpellIcon id={SPELLS.PAIN_SUPPRESSION} />}
        value={<ItemHealingDone amount={this.totalDamageReduced} />}
        label="Pain Suppression Damage Reduction"
        tooltip={
          <>
            You cast Pain Suppression {this.totalCasts} times.
            {this.totalDamageTakenWhileBuffActive > 0 ? <><br />In total it prevented {formatNumber(this.totalDamageReduced)} damage.<br />
              NOTE: This metric uses an approximation to calculate contribution from the buff due to
              technical limitations.
            </> : null}
          </>
        }
      />
    );
  }
}

export default PainSuppression;
