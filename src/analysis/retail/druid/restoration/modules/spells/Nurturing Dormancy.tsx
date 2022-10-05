import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import HotTrackerRestoDruid from 'analysis/retail/druid/restoration/modules/core/hottracking/HotTrackerRestoDruid';
import HotTracker, { Attribution } from 'parser/shared/modules/HotTracker';
import { Options } from 'parser/core/Module';
import Events, { ApplyBuffEvent, HealEvent, RefreshBuffEvent } from 'parser/core/Events';
import { REJUVENATION_BUFFS } from 'analysis/retail/druid/restoration/constants';
import { TALENTS_DRUID } from 'common/TALENTS';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import { SpellLink } from 'interface';

const EXTENSION_AMOUNT = 2000;
const MAX_PROCS = 3;

/**
 * **Nurturing Dormancy**
 * Spec Talent
 *
 * When your Rejuvenation heals a full health target, its duration is increased by 2 sec, up to a
 * maximum total increase of 6 sec per cast.
 */
class NurturingDormancy extends Analyzer {
  static dependencies = {
    hotTracker: HotTrackerRestoDruid,
  };

  protected hotTracker!: HotTrackerRestoDruid;

  attribution: Attribution = HotTracker.getNewAttribution('Nurturing Dormancy');
  /** Mapping from target and spell ID to the number of times Nurturing Dormancy has procced for
   *  that HoT instance */
  procsFromCastMap: { [targetId: number]: { [spellId: number]: { procs: number } } } = {};

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.NURTURING_DORMANCY_TALENT);

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(REJUVENATION_BUFFS),
      this.onRejuvHeal,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(REJUVENATION_BUFFS),
      this.onRejuvApply,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(REJUVENATION_BUFFS),
      this.onRejuvApply,
    );
  }

  onRejuvHeal(event: HealEvent) {
    if (event.amount === 0 && event.overheal) {
      const procsEntry = this._getEntry(event);
      if (procsEntry.procs < MAX_PROCS) {
        this.hotTracker.addExtension(
          this.attribution,
          EXTENSION_AMOUNT,
          event.targetID,
          event.ability.guid,
        );
        procsEntry.procs += 1;
      }
    }
  }

  onRejuvApply(event: ApplyBuffEvent | RefreshBuffEvent) {
    this._getEntry(event).procs = 0;
  }

  /** Initializes and returns the proc tracker object for this event */
  _getEntry(event: ApplyBuffEvent | RefreshBuffEvent | HealEvent): { procs: number } {
    if (!this.procsFromCastMap[event.targetID]) {
      this.procsFromCastMap[event.targetID] = {};
    }
    if (!this.procsFromCastMap[event.targetID][event.ability.guid]) {
      this.procsFromCastMap[event.targetID][event.ability.guid] = { procs: 0 };
    }
    return this.procsFromCastMap[event.targetID][event.ability.guid];
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(9)} // number based on talent row
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            This is the healing due to <SpellLink id={TALENTS_DRUID.NURTURING_DORMANCY_TALENT.id} />{' '}
            rejuv extensions. Over the course of the encounter, rejuvs were extended a total of{' '}
            <strong>{(this.attribution.totalExtension / 1000).toFixed(1)}s</strong>.
          </>
        }
      >
        <BoringSpellValueText spellId={TALENTS_DRUID.NURTURING_DORMANCY_TALENT.id}>
          <ItemPercentHealingDone amount={this.attribution.healing} />
          <br />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default NurturingDormancy;
