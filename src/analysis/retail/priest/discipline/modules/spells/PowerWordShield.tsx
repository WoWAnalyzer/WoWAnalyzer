import SPELLS from 'common/SPELLS';
import { TALENTS_PRIEST } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  AbsorbedEvent,
  ApplyBuffEvent,
  DamageEvent,
  HealEvent,
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

type ShieldInfo = {
  event: ApplyBuffEvent;
  shieldOfAbsolutionValue: number;
  healing: number;
  crit: boolean;
};

class PowerWordShield extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  protected statTracker!: StatTracker;

  hasAegis = false;
  decayedShields = 0;
  shieldApplications: ShieldInfo[] = [];
  shieldOfAbsolutionValue = 0;
  critCount = 0;
  pwsValue = 0;
  aegisValue = 0;
  t23pValue = 0;

  constructor(options: Options) {
    super(options);

    this.hasAegis = this.selectedCombatant.hasTalent(TALENTS_PRIEST.AEGIS_OF_WRATH_TALENT);

    //

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
  }

  onShieldApplication(event: ApplyBuffEvent) {
    this.shieldApplications.push({
      event: event,
      shieldOfAbsolutionValue: this.shieldOfAbsolutionValue,
      healing: 0,
      crit: this.critCheck(event),
    });
    this.shieldOfAbsolutionValue = 0;
  }

  critCheck(event: ApplyBuffEvent) {
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
    this.shieldApplications.forEach((shieldApplication) => {
      if (
        event.targetID === shieldApplication.event.targetID &&
        event.timestamp > shieldApplication.event.timestamp &&
        shieldApplication.event.timestamp + POWER_WORD_SHIELD_DURATION_MS > event.timestamp
      ) {
        const shieldAmount = shieldApplication.event.absorb || 0; // the initial amount, from the ApplyBuffEvent
        const shieldOfAbsolutionBonus = shieldApplication.crit
          ? shieldApplication.shieldOfAbsolutionValue * 2
          : shieldApplication.shieldOfAbsolutionValue; // the amount the shield was increased by the 4p
        const basePowerWordShieldAmount = (shieldAmount - shieldOfAbsolutionBonus) / 1.5;
        let totalShielded = shieldApplication.healing; // this is the amount of healing the shield did

        this.pwsValue += basePowerWordShieldAmount;
        totalShielded -= basePowerWordShieldAmount;
        this.t23pValue +=
          totalShielded >= shieldOfAbsolutionBonus ? shieldOfAbsolutionBonus : totalShielded;

        if (!this.hasAegis) {
          return;
        }
        if (totalShielded < shieldOfAbsolutionBonus) {
          this.aegisValue += totalShielded - shieldOfAbsolutionBonus;
          return;
        }
        totalShielded -=
          totalShielded >= shieldOfAbsolutionBonus ? shieldOfAbsolutionBonus : totalShielded;
        this.aegisValue += totalShielded;
      }
    });
  }

  onPWSAbsorb(event: AbsorbedEvent) {
    this.shieldApplications.forEach((shieldApplication) => {
      if (
        event.targetID === shieldApplication.event.targetID &&
        event.timestamp > shieldApplication.event.timestamp &&
        shieldApplication.event.timestamp + POWER_WORD_SHIELD_DURATION_MS > event.timestamp
      ) {
        shieldApplication.healing += event.amount;
      }
    });
  }

  onPenanceHeal(event: HealEvent) {
    this.shieldOfAbsolutionValue += event.amount * SHIELD_OF_ABSOLUTION_MULTIPLIER_HEALING;
  }

  onPenanceDamage(event: DamageEvent) {
    this.shieldOfAbsolutionValue += event.amount;
  }

  onPenanceCast() {
    this.shieldOfAbsolutionValue = 0;
  }

  statistic() {
    console.log(this.shieldApplications);
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
      >
        <>
          <BoringSpellValueText spellId={SPELLS.SHIELD_OF_ABSOLUTION_BUFF.id}>
            <ItemHealingDone amount={this.t23pValue} />
          </BoringSpellValueText>
        </>
      </Statistic>
    );
  }
}

export default PowerWordShield;
