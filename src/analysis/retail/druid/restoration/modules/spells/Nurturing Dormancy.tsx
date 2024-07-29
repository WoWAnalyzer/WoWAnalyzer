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

const EXTENSION_AMOUNT = 2_000;
const REJUV_MAX = 30_000;
const MAX_PROCS = 2;

/**
 * **Nurturing Dormancy**
 * Spec Talent
 *
 * When your Rejuvenation heals a full health target, its duration is increased by 2 sec, up to a
 * maximum total increase of 4 sec per cast. Cannot extend duration past 30 sec.
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
        // 'cannot extend past 30s' only applies to this talent - other effects can push it past
        let timeRemainingOnRejuv = 0; // if there's a problem getting rejuv duration, assume no cap
        if (
          this.hotTracker.hots[event.targetID] &&
          this.hotTracker.hots[event.targetID][event.ability.guid]
        ) {
          timeRemainingOnRejuv =
            this.hotTracker.hots[event.targetID][event.ability.guid].end - event.timestamp;
        }
        // extend the full amount if it won't take over the cap, nothing if already over the cap,
        // and partial amount if taking exactly to the cap
        const extensionAmount = Math.max(
          Math.min(EXTENSION_AMOUNT, REJUV_MAX - timeRemainingOnRejuv),
          0,
        );
        if (extensionAmount > 0) {
          this.hotTracker.addExtension(
            this.attribution,
            extensionAmount,
            event.targetID,
            event.ability.guid,
          );
        }
        // even if there's no extension due to cap, a usage is still consumed
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
            This is the healing due to <SpellLink spell={TALENTS_DRUID.NURTURING_DORMANCY_TALENT} />{' '}
            rejuv extensions. Over the course of the encounter, rejuvs were extended a total of{' '}
            <strong>{(this.attribution.totalExtension / 1000).toFixed(1)}s</strong>.
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS_DRUID.NURTURING_DORMANCY_TALENT}>
          <ItemPercentHealingDone amount={this.attribution.healing} />
          <br />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default NurturingDormancy;
