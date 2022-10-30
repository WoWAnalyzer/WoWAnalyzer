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
const SHIELD_OF_ABSOLUTION_MULTIPLIER_HEALING = 0.3;
const SHIELD_OF_ABSOLUTION_MULTIPLIER_DAMAGE = 1;

type ShieldInfo = {
  event: ApplyBuffEvent | RefreshBuffEvent;
  shieldOfAbsolutionValue: number;
  healing: number;
  crit: boolean;
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

  hasAegis = false;
  decayedShields = 0;
  private shieldApplications: Map<number, ShieldInfo | null> = new Map();
  shieldOfAbsolutionValue = 0;
  critCount = 0;
  pwsValue = 0;
  aegisValue = 0;
  t29pValue = 0;
  has4p = false;

  constructor(options: Options) {
    super(options);

    this.hasAegis = this.selectedCombatant.hasTalent(TALENTS_PRIEST.AEGIS_OF_WRATH_TALENT);

    this.has4p = this.selectedCombatant.has4PieceByTier(TIERS.T29);

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
      crit: this.critCheck(event),
      rapture: this.selectedCombatant.hasBuff(TALENTS_PRIEST.RAPTURE_TALENT.id),
    });
    this.shieldOfAbsolutionValue = 0;
  }

  critCheck(event: ApplyBuffEvent | RefreshBuffEvent) {
    // We need to check if the Shield was a crit, as the 4p value is then doubled in value. It's not possible to tell this from regular events,
    // however when checking for rapture and using the current intellect, we can accurately determine this. The only times this will be inaccurate
    // is when the target has a healing increase which also increases potency of absorbs (there are not many, the main offender is Vampiric blood)

    let baseShield = event.absorb || 0;
    const hasRapture = this.selectedCombatant.hasBuff(TALENTS_PRIEST.RAPTURE_TALENT.id); // Rapture amps the four piece bonus
    baseShield /= hasRapture ? 1.3 : 1;
    baseShield -= this.shieldOfAbsolutionValue;
    const intellect = this.statTracker.currentIntellectRating;
    const crit = baseShield > intellect * 10 ? true : false;
    return crit;
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
    const shieldAmount = info.event.absorb || 0; // the initial amount, from the ApplyBuffEvent/RefreshBuffEvent
    const shieldOfAbsolutionBonus =
      info.shieldOfAbsolutionValue * (info.crit ? 2 : 1) * (info.rapture ? 1.3 : 1);
    const basePowerWordShieldAmount = this.hasAegis
      ? (shieldAmount - shieldOfAbsolutionBonus) / 1.5
      : shieldAmount - shieldOfAbsolutionBonus;
    let totalShielded = info.healing; // this is the amount of healing the shield did
    const didPwsConsume =
      totalShielded - basePowerWordShieldAmount > 0 ? basePowerWordShieldAmount : totalShielded;
    this.pwsValue += didPwsConsume;

    totalShielded -= didPwsConsume;

    const shieldOfAbsolutionValue = (totalShielded: number) =>
      totalShielded >= shieldOfAbsolutionBonus ? shieldOfAbsolutionBonus : totalShielded;

    if (!this.hasAegis) {
      if (totalShielded > 0) {
        // without aegis the shield didn't consume the 4p bonus
        this.t29pValue += shieldOfAbsolutionValue(totalShielded);
        totalShielded -= shieldOfAbsolutionValue(totalShielded);
      }

      this.shieldApplications.set(event.targetID, null);
      return;
    }

    if (totalShielded < shieldOfAbsolutionBonus) {
      this.t29pValue += totalShielded;
      this.aegisValue += totalShielded - shieldOfAbsolutionBonus;
      return;
    }

    this.t29pValue +=
      totalShielded >= shieldOfAbsolutionBonus ? shieldOfAbsolutionBonus : totalShielded;
    totalShielded -=
      totalShielded >= shieldOfAbsolutionBonus ? shieldOfAbsolutionBonus : totalShielded;
    this.aegisValue += totalShielded;

    this.shieldApplications.set(event.targetID, null);
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
