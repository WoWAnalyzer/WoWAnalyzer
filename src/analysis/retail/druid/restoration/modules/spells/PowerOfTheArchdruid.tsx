import { formatOverhealing } from 'analysis/retail/druid/restoration/format';
import { formatNth, formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, RefreshBuffEvent } from 'parser/core/Events';
import { binomialCDF } from 'parser/shared/modules/helpers/Probability';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import HotAttributor, {
  PotaProc,
} from 'analysis/retail/druid/restoration/modules/core/hottracking/HotAttributor';
import { TALENTS_DRUID } from 'common/TALENTS';
import { SpellLink } from 'interface';

const PROC_PROB = 0.6;
const EXPECTED_EXTRAS = 2;
/** Buffer for matching PotA proc timestamps to SotF consumption timestamps */
const BUFFER_MS = 150;

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

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.POWER_OF_THE_ARCHDRUID_TALENT);
  }

  /** Per-proc tracking data from HotAttributor */
  get potaProcs(): PotaProc[] {
    return this.hotAttributor.potaProcs;
  }

  get procs(): number {
    return this.potaProcs.length;
  }

  /** Number of hardcast SotF consumptions where PotA generated fewer than 2 extras */
  get incompleteHardcastProcs(): number {
    return this.potaProcs.filter((p) => p.fromHardcast && p.extrasCount < EXPECTED_EXTRAS).length;
  }

  /** Total number of hardcast PotA procs */
  get totalHardcastProcs(): number {
    return this.potaProcs.filter((p) => p.fromHardcast).length;
  }

  /** Check if a given timestamp corresponds to an incomplete hardcast PotA proc */
  isIncompleteHardcastProcAt(timestamp: number): boolean {
    return this.potaProcs.some(
      (p) =>
        p.fromHardcast &&
        p.extrasCount < EXPECTED_EXTRAS &&
        Math.abs(p.timestamp - timestamp) <= BUFFER_MS,
    );
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

  get totalOverhealing() {
    return (
      this.hotAttributor.powerOfTheArchdruidRejuvAttrib.overheal +
      this.hotAttributor.powerOfTheArchdruidRegrowthAttrib.overheal
    );
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
            <strong>
              Overhealing: {formatOverhealing(this.totalOverhealing, this.totalHealing)}
            </strong>
            <br />
            {this.incompleteHardcastProcs > 0 && (
              <>
                <strong>{this.incompleteHardcastProcs}</strong> of{' '}
                <strong>{this.totalHardcastProcs}</strong> procs created fewer than 2 extra HoTs.
                Make sure allies are within 20 yards of the target. (This does not include any procs
                consumed during Convoke)
              </>
            )}
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
