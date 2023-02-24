import SPELLS from 'common/SPELLS';
import { TALENTS_PRIEST } from 'common/TALENTS';
import { TIERS } from 'game/TIERS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  AbsorbedEvent,
  ApplyBuffEvent,
  DamageEvent,
  HealEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import StatTracker from 'parser/shared/modules/StatTracker';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

const POWER_WORD_SHIELD_DURATION_MS = 15000;
const SHIELD_OF_ABSOLUTION_MULTIPLIER_HEALING = 0.18;
const SHIELD_OF_ABSOLUTION_MULTIPLIER_DAMAGE = 0.6;

type ShieldInfo = {
  event: ApplyBuffEvent | RefreshBuffEvent;
  shieldOfAbsolutionValue: number;
  healing: number;
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
  t29pValue = 0;
  wealValue = 0;
  has4p = false;
  hasWeal = false;

  constructor(options: Options) {
    super(options);

    this.hasWeal = this.selectedCombatant.hasTalent(TALENTS_PRIEST.WEAL_AND_WOE_TALENT);
    this.has4p = this.selectedCombatant.has4PieceByTier(TIERS.T29);

    this.active = !this.selectedCombatant.hasTalent(TALENTS_PRIEST.AEGIS_OF_WRATH_TALENT);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.POWER_WORD_SHIELD),
      this.onShieldApplication,
    );

    // when Power Word Shield absorbs damage
    this.addEventListener(
      Events.absorbed.by(SELECTED_PLAYER).spell(SPELLS.POWER_WORD_SHIELD),
      this.onPWSAbsorb,
    );

    // these will determine value to amount of the 4p buff
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.PENANCE_HEAL),
      this.onPenanceHeal,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.PENANCE),
      this.onPenanceDamage,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.PENANCE_CAST),
      this.onPenanceCast,
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
      shieldOfAbsolutionValue: this.shieldOfAbsolutionValue,
      healing: 0,
      rapture: this.selectedCombatant.hasBuff(TALENTS_PRIEST.RAPTURE_TALENT.id),
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
    const shieldAmount = info.event.absorb || 0; // the initial amount, from the ApplyBuffEvent/

    // The bonus from the 4p is multiplied by rapture on shield application if it was up.
    const shieldOfAbsolutionBonus = info.shieldOfAbsolutionValue * (info.rapture ? 1.4 : 1);

    const basePowerWordShieldAmount = shieldAmount - shieldOfAbsolutionBonus;
    let totalShielded = info.healing; // this is the amount of healing the shield did

    // If PWS was completely consumed, then we just attribute the entire base shield to PWS (For crystalline reflection module)
    // Otherwise, just add everything to base PWS (As the shield wasn't consumed enough for any bonus effects to get benefit.)
    const didPwsConsume =
      totalShielded - basePowerWordShieldAmount > 0 ? basePowerWordShieldAmount : totalShielded;
    this.pwsValue += didPwsConsume;

    // this is what's left for (As of 24.02.2024) Weal and Woe and 4p bonus
    totalShielded -= didPwsConsume;

    const shieldOfAbsolutionValue = (totalShielded: number) =>
      totalShielded >= shieldOfAbsolutionBonus ? shieldOfAbsolutionBonus : totalShielded;

    if (totalShielded > 0) {
      // without aegis the shield didn't consume the 4p bonus
      this.t29pValue += shieldOfAbsolutionValue(totalShielded);
      totalShielded -= shieldOfAbsolutionValue(totalShielded);
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

  onPenanceHeal(event: HealEvent) {
    this.shieldOfAbsolutionValue +=
      (event.amount + (event.overheal || 0)) * SHIELD_OF_ABSOLUTION_MULTIPLIER_HEALING;
  }

  onPenanceDamage(event: DamageEvent) {
    this.shieldOfAbsolutionValue += event.amount * SHIELD_OF_ABSOLUTION_MULTIPLIER_DAMAGE;
  }

  onPenanceCast() {
    this.shieldOfAbsolutionValue = 0;
  }

  statistic() {
    if (!this.has4p) {
      return;
    }

    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
      >
        <>
          <BoringSpellValueText spellId={SPELLS.SHIELD_OF_ABSOLUTION_BUFF.id}>
            <ItemHealingDone amount={this.t29pValue} />
          </BoringSpellValueText>
        </>
      </Statistic>
    );
  }
}

export default PowerWordShield;
