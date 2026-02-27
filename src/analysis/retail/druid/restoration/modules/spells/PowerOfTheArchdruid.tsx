import { formatNth, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, CastEvent, RefreshBuffEvent } from 'parser/core/Events';
import { binomialCDF } from 'parser/shared/modules/helpers/Probability';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import HotAttributor from 'analysis/retail/druid/restoration/modules/core/hottracking/HotAttributor';
import { TALENTS_DRUID } from 'common/TALENTS';
import { SpellLink } from 'interface';

const PROC_PROB = 0.6;

/**
 * **Power of the Archdruid**
 * Spec Talent Tier 7
 *
 * Soul of the Forest now causes your next Rejuvenation or Regrowth 
 * to apply to 2 additional allies within 20 yards of the target.
 */
class PowerOfTheArchdruid extends Analyzer {
  static dependencies = {
    hotAttributor: HotAttributor,
  };

  hotAttributor!: HotAttributor;

  procs = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.POWER_OF_THE_ARCHDRUID_TALENT);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.POWER_OF_THE_ARCHDRUID),
      this.onApply,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.POWER_OF_THE_ARCHDRUID),
      this.onApply,
    );
  }


  onApply(event: ApplyBuffEvent | RefreshBuffEvent) {
    if (!event.prepull) {
      this.procs += 1;
    }
  }

  get rejuvsCreated() {
    return this.hotAttributor.powerOfTheArchdruidRejuvAttrib.procs;
  }

  get regrowthsCreated() {
    return this.hotAttributor.powerOfTheArchdruidRegrowthAttrib.procs;
  }

  get rejuvProcHealing() {
    return this.hotAttributor.powerOfTheArchdruidRejuvAttrib.healing;
  }

  get regrowthProcHealing() {
    return this.hotAttributor.powerOfTheArchdruidRegrowthAttrib.healing;
  }

  get totalHealing() {
    return this.rejuvProcHealing + this.regrowthProcHealing;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(7)} // number based on talent row
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            This is the healing attributable to the rejuvenations and regrowths spawned by the Power
            of the Archdruid talent. This amount includes the mastery benefit.
            <ul>
              <li>
                Created <strong>{this.rejuvsCreated}</strong>{' '}
                <SpellLink spell={SPELLS.REJUVENATION} /> HoTs for{' '}
                <strong>{this.owner.formatItemHealingDone(this.rejuvProcHealing)}</strong>
              </li>
              <li>
                Created <strong>{this.regrowthsCreated}</strong>{' '}
                <SpellLink spell={SPELLS.REGROWTH} /> HoTs and Heals for{' '}
                <strong>{this.owner.formatItemHealingDone(this.regrowthProcHealing)}</strong>
              </li>
            </ul>
            <br />
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS_DRUID.POWER_OF_THE_ARCHDRUID_TALENT}>
          <ItemPercentHealingDone amount={this.totalHealing} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default PowerOfTheArchdruid;
