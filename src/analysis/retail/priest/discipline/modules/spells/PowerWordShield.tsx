import SPELLS from 'common/SPELLS';
import { TALENTS_PRIEST } from 'common/TALENTS';
import { TIERS } from 'game/TIERS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  AbsorbedEvent,
  ApplyBuffEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import StatTracker from 'parser/shared/modules/StatTracker';

const POWER_WORD_SHIELD_DURATION_MS = 15000;
const WEAL_AND_WOE_BUFF_PER_STACK = 0.05;
const AEGIS_OF_WRATH_INCREASE = 0.3;

type ShieldInfo = {
  event: ApplyBuffEvent | RefreshBuffEvent;
  healing: number;
  wealStacks: number | 0;
  rapture: boolean;
};

// when removebuff happens, clear out the entry in the map
// if you have an applybuff (or refreshbuff) and there is already an entry in the map for the target, you know that the previous buff has been overwritten by a new apply, so you can immediately expire the old one
//after that, you handle the applybuff/refreshbuff as normal

class PowerWordShield extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  protected statTracker!: StatTracker;

  decayedShields = 0;
  private shieldApplications: Map<number, ShieldInfo | null> = new Map();
  shieldOfAbsolutionValue = 0;
  critCount = 0;
  pwsValue = 0;
  wealValue = 0;
  aegisOfWrathValue = 0;
  hasVault4p = false;
  hasWeal = false;

  constructor(options: Options) {
    super(options);

    this.hasWeal = this.selectedCombatant.hasTalent(TALENTS_PRIEST.WEAL_AND_WOE_TALENT);

    // This math does not work with the Vault 4p bonus
    this.hasVault4p = this.selectedCombatant.has4PieceByTier(TIERS.DF1);

    this.active = !this.hasVault4p;

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
      rapture: false,
    });
    this.shieldOfAbsolutionValue = 0;
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
      info.event.timestamp + POWER_WORD_SHIELD_DURATION_MS < event.timestamp
    ) {
      return;
    }
    const initialShieldAmount = info.event.absorb || 0; // the initial amount, from the ApplyBuffEvent/

    const wealBonus =
      initialShieldAmount -
      initialShieldAmount / (1 + info.wealStacks * WEAL_AND_WOE_BUFF_PER_STACK);

    const aegisOfWrathBonus =
      initialShieldAmount - initialShieldAmount / (1 + AEGIS_OF_WRATH_INCREASE);

    // the amount that pws absorbed on its own, without buffs
    const basePowerWordShieldAmount = initialShieldAmount - wealBonus - aegisOfWrathBonus;

    let totalShielded = info.healing; // this is the amount of healing the shield did

    // If PWS was completely consumed, then we just attribute the entire base shield to PWS (For crystalline reflection module)
    // Otherwise, just add everything to base PWS (As the shield wasn't consumed enough for any bonus effects to get benefit.)

    const overHeal = event.absorb || 0;

    const didPwsConsume =
      totalShielded - basePowerWordShieldAmount > 0 ? basePowerWordShieldAmount : totalShielded;

    this.pwsValue += didPwsConsume;

    // this is what's left for (As of 05.05.2023) Weal and Woe and Aegis of Wrath
    totalShielded -= didPwsConsume;

    const wealValue = (totalShielded: number) =>
      totalShielded >= wealBonus ? wealBonus : totalShielded;

    let wealIncrease = 0;

    if (totalShielded > 0) {
      wealIncrease = Math.max(0, wealValue(totalShielded) - overHeal);
      this.wealValue += wealIncrease;
      totalShielded -= wealValue(totalShielded);
    }

    if (overHeal === 0) {
      this.aegisOfWrathValue += Math.min(aegisOfWrathBonus, totalShielded);
    }

    this.shieldApplications.set(event.targetID, null);
    return;
  }

  onPWSAbsorb(event: AbsorbedEvent) {
    const info = this.shieldApplications.get(event.targetID);
    if (
      !info ||
      info.event.timestamp > event.timestamp || // not sure how this happens? fabrication stuff?
      info.event.timestamp + POWER_WORD_SHIELD_DURATION_MS < event.timestamp
    ) {
      return;
    }
    info.healing += event.amount;
  }
}

export default PowerWordShield;
