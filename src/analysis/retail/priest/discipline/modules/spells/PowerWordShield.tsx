import SPELLS from 'common/SPELLS';
import { TALENTS_PRIEST } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  AbsorbedEvent,
  ApplyBuffEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import StatTracker from 'parser/shared/modules/StatTracker';

const POWER_WORD_SHIELD_DURATION_MS_BASE = 15000;
const ETERNAL_BARRIER_DURATION_MS_BASE = 5000;
const WEAL_AND_WOE_BUFF_PER_STACK = 0.05;
const ETERNAL_BARRIER_INCREASE = 0.2;
const PREVENTATIVE_MEASURES_INCREASE = 0.4;
const INNER_QUIETUS_INCREASE = 0.2;

interface ShieldInfo {
  event: ApplyBuffEvent | RefreshBuffEvent;
  healing: number;
  wealStacks: number | 0;
  eternalBarrierExtensionHealing: number; // Track healing that happens during the extended duration (15-20s)
}

// when removebuff happens, clear out the entry in the map
// if you have an applybuff (or refreshbuff) and there is already an entry in the map for the target, you know that the previous buff has been overwritten by a new apply, so you can immediately expire the old one
//after that, you handle the applybuff/refreshbuff as normal

class PowerWordShield extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  protected statTracker!: StatTracker;

  decayedShields = 0;
  private shieldApplications = new Map<number, ShieldInfo | null>();
  critCount = 0;
  pwsValue = 0;
  wealValue = 0;
  hasWeal = false;
  pwsDuration = 0;
  eternalBarrierValue = 0;
  eternalBarrierExtensionHealing = 0; // Value from the extended duration (15-20s)
  hasEternalBarrier = false;
  innerQuietusValue = 0;
  preventativeMeasuresValue = 0;

  constructor(options: Options) {
    super(options);

    this.hasEternalBarrier = this.selectedCombatant.hasTalent(
      TALENTS_PRIEST.ETERNAL_BARRIER_TALENT,
    );

    this.pwsDuration =
      POWER_WORD_SHIELD_DURATION_MS_BASE +
      this.selectedCombatant.getTalentRank(TALENTS_PRIEST.ETERNAL_BARRIER_TALENT) *
        ETERNAL_BARRIER_DURATION_MS_BASE;

    this.hasWeal = this.selectedCombatant.hasTalent(TALENTS_PRIEST.WEAL_AND_WOE_TALENT);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.POWER_WORD_SHIELD),
      this.onShieldApplication,
    );

    // when Power Word Shield absorbs damage
    this.addEventListener(
      Events.absorbed.by(SELECTED_PLAYER).spell(SPELLS.POWER_WORD_SHIELD),
      this.onPWSAbsorb,
    );

    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.POWER_WORD_SHIELD),
      this.onShieldExpiry,
    );

    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.POWER_WORD_SHIELD),
      this.onShieldRefresh,
    );
  }

  onShieldApplication(event: ApplyBuffEvent | RefreshBuffEvent) {
    if (this.shieldApplications.get(event.targetID)) {
      this.shieldApplications.set(event.targetID, null);
    }

    this.shieldApplications.set(event.targetID, {
      event: event,
      healing: 0,
      wealStacks: this.selectedCombatant.getBuffStacks(SPELLS.WEAL_AND_WOE_BUFF.id),
      eternalBarrierExtensionHealing: 0,
    });
  }

  onShieldExpiry(event: RemoveBuffEvent) {
    this.handleRemovedShield(event);
  }

  onShieldRefresh(event: RefreshBuffEvent) {
    this.handleRemovedShield(event);
    this.onShieldApplication(event);
  }

  handleRemovedShield(event: RefreshBuffEvent | RemoveBuffEvent) {
    const info = this.shieldApplications.get(event.targetID);

    if (
      !info ||
      info.event.timestamp > event.timestamp ||
      info.event.timestamp + this.pwsDuration < event.timestamp
    ) {
      return;
    }

    const initialShieldAmount = info.event.absorb || 0;
    const totalAbsorbed = info.healing;
    const overAbsorb = event.absorb || 0;

    const baseShieldAmount = this.calculateBaseShieldAmount(initialShieldAmount, info);

    if (this.hasEternalBarrier) {
      const ebEffectiveAbsorption = this.calculateEffectiveAbsorption(
        initialShieldAmount,
        baseShieldAmount,
        totalAbsorbed,
        overAbsorb,
        ETERNAL_BARRIER_INCREASE,
      );
      this.eternalBarrierValue += ebEffectiveAbsorption;

      this.eternalBarrierExtensionHealing += info.eternalBarrierExtensionHealing;
    }

    if (
      this.selectedCombatant.hasTalent(TALENTS_PRIEST.WEAL_AND_WOE_TALENT) &&
      info.wealStacks > 0
    ) {
      const wealIncrease = info.wealStacks * WEAL_AND_WOE_BUFF_PER_STACK;
      const wealEffectiveAbsorption = this.calculateEffectiveAbsorption(
        initialShieldAmount,
        baseShieldAmount,
        totalAbsorbed,
        overAbsorb,
        wealIncrease,
      );
      this.wealValue += wealEffectiveAbsorption;
    }

    this.pwsValue += Math.max(
      0,
      totalAbsorbed -
        overAbsorb -
        this.eternalBarrierValue -
        this.wealValue -
        this.innerQuietusValue -
        this.preventativeMeasuresValue,
    );

    this.shieldApplications.set(event.targetID, null);
  }

  private calculateBaseShieldAmount(totalShieldAmount: number, info: ShieldInfo): number {
    let baseAmount = totalShieldAmount;

    if (this.hasEternalBarrier) {
      baseAmount /= 1 + ETERNAL_BARRIER_INCREASE;
    }

    if (this.selectedCombatant.hasTalent(TALENTS_PRIEST.WEAL_AND_WOE_TALENT)) {
      const wealStacks = info.wealStacks;
      if (wealStacks > 0) {
        baseAmount /= 1 + wealStacks * WEAL_AND_WOE_BUFF_PER_STACK;
      }
    }

    if (this.selectedCombatant.hasTalent(TALENTS_PRIEST.PREVENTIVE_MEASURES_TALENT)) {
      baseAmount /= 1 + PREVENTATIVE_MEASURES_INCREASE;
    }

    if (this.selectedCombatant.hasTalent(TALENTS_PRIEST.INNER_QUIETUS_TALENT)) {
      baseAmount /= 1 + INNER_QUIETUS_INCREASE;
    }

    return baseAmount;
  }

  /**
   * Calculates the effective absorption attributable to a specific buff
   * Similar to calculateEffectiveHealing but for shields
   */
  private calculateEffectiveAbsorption(
    totalShieldAmount: number,
    baseShieldAmount: number,
    totalAbsorbed: number,
    overAbsorb: number,
    relativeIncrease: number,
  ): number {
    // calculate the raw amount added by this buff
    const buffedAmount = totalShieldAmount - baseShieldAmount;

    const effectiveAbsorption = Math.max(0, buffedAmount - overAbsorb);

    return Math.min(effectiveAbsorption, totalAbsorbed);
  }

  onPWSAbsorb(event: AbsorbedEvent) {
    const info = this.shieldApplications.get(event.targetID);
    if (
      !info ||
      info.event.timestamp > event.timestamp || // not sure how this happens? fabrication stuff?
      info.event.timestamp + this.pwsDuration < event.timestamp
    ) {
      return;
    }

    // If this absorption happened during the extended duration provided by Eternal Barrier, it gets all attribution for that.
    if (
      this.hasEternalBarrier &&
      event.timestamp > info.event.timestamp + POWER_WORD_SHIELD_DURATION_MS_BASE
    ) {
      info.eternalBarrierExtensionHealing += event.amount;
    } else {
      info.healing += event.amount;
    }
  }
}

export default PowerWordShield;
