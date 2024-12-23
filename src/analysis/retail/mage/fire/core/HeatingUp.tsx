import { COMBUSTION_END_BUFFER, SharedCode } from 'analysis/retail/mage/shared';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import HIT_TYPES from 'game/HIT_TYPES';
import SpellIcon from 'interface/SpellIcon';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent, GetRelatedEvents, HasTarget } from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import CooldownHistory from 'parser/shared/modules/CooldownHistory';
import { encodeTargetString } from 'parser/shared/modules/Enemies';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

export default class HeatingUp extends Analyzer {
  static dependencies = {
    sharedCode: SharedCode,
    cooldownHistory: CooldownHistory,
    abilityTracker: AbilityTracker,
    spellUsable: SpellUsable,
  };
  protected sharedCode!: SharedCode;
  protected cooldownHistory!: CooldownHistory;
  protected abilityTracker!: AbilityTracker;
  protected spellUsable!: SpellUsable;

  hasFirestarter: boolean = this.selectedCombatant.hasTalent(TALENTS.FIRESTARTER_TALENT);
  hasSearingTouch: boolean = this.selectedCombatant.hasTalent(TALENTS.SCORCH_TALENT);

  heatingUpCrits: HeatingUpCrits[] = [];

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.PHOENIX_FLAMES_TALENT),
      this.castEvent,
    );
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.FIRE_BLAST), this.castEvent);
  }

  castEvent(event: CastEvent) {
    const damage: DamageEvent[] = GetRelatedEvents(event, 'SpellDamage') || [];
    const castTarget = HasTarget(event) && encodeTargetString(event.targetID, event.targetInstance);
    const damageEvent = damage.find((d) => {
      const damageTarget = HasTarget(d) && encodeTargetString(d.targetID, d.targetInstance);
      return castTarget === damageTarget;
    });
    if (!damageEvent || !HasTarget(damageEvent) || damageEvent.hitType !== HIT_TYPES.CRIT) {
      return;
    }

    let buff;
    if (this.hasSearingTouch && damage && this.sharedCode.getTargetHealth(damageEvent)) {
      buff = { active: true, buffId: TALENTS.SCORCH_TALENT.id };
    } else if (this.hasFirestarter && damage && this.sharedCode.getTargetHealth(damageEvent)) {
      buff = { active: true, buffId: TALENTS.FIRESTARTER_TALENT.id };
    } else if (
      this.selectedCombatant.hasBuff(TALENTS.COMBUSTION_TALENT.id) ||
      this.selectedCombatant.hasBuff(
        TALENTS.COMBUSTION_TALENT.id,
        event.timestamp - COMBUSTION_END_BUFFER,
      )
    ) {
      buff = { active: true, buffId: TALENTS.COMBUSTION_TALENT.id };
    } else if (this.selectedCombatant.hasBuff(TALENTS.HYPERTHERMIA_TALENT.id)) {
      buff = { active: true, buffId: TALENTS.HYPERTHERMIA_TALENT.id };
    } else {
      buff = { active: false };
    }

    this.heatingUpCrits.push({
      cast: event,
      damage: damageEvent,
      hasHeatingUp: this.selectedCombatant.hasBuff(SPELLS.HEATING_UP.id),
      hasHotStreak: this.selectedCombatant.hasBuff(SPELLS.HOT_STREAK.id),
      critBuff: buff,
      charges: this.spellUsable.chargesAvailable(event.ability.guid),
      timeTillCapped: this.spellUsable.cooldownRemaining(event.ability.guid),
    });
  }

  get fireBlastsDuringHotStreak() {
    return this.heatingUpCrits.filter(
      (c) => c.cast.ability.guid === SPELLS.FIRE_BLAST.id && c.hasHotStreak,
    ).length;
  }

  get phoenixFlamesDuringHotStreak() {
    return this.heatingUpCrits.filter(
      (c) => c.cast.ability.guid === TALENTS.PHOENIX_FLAMES_TALENT.id && c.hasHotStreak,
    ).length;
  }

  get fireBlastWithoutHeatingUp() {
    return this.heatingUpCrits.filter(
      (c) => c.cast.ability.guid === SPELLS.FIRE_BLAST.id && !c.hasHeatingUp && !c.critBuff.active,
    ).length;
  }

  get fireBlastUtilPercent() {
    return (
      1 - (this.fireBlastWithoutHeatingUp + this.fireBlastsDuringHotStreak) / this.totalFireBlasts
    );
  }

  get phoenixFlamesUtilPercent() {
    return (
      1 -
      this.phoenixFlamesDuringHotStreak /
        this.abilityTracker.getAbility(TALENTS.PHOENIX_FLAMES_TALENT.id).casts
    );
  }

  get totalFireBlasts() {
    return this.heatingUpCrits.filter((c) => c.cast.ability.guid === SPELLS.FIRE_BLAST.id).length;
  }

  get totalWasted() {
    return (
      this.fireBlastWithoutHeatingUp +
      this.fireBlastsDuringHotStreak +
      this.phoenixFlamesDuringHotStreak
    );
  }

  get fireBlastUtilSuggestionThresholds() {
    return {
      actual: this.fireBlastUtilPercent,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.85,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get phoenixFlamesUtilSuggestionThresholds() {
    return {
      actual: this.phoenixFlamesUtilPercent,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.85,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(14)}
        size="flexible"
        tooltip={
          <>
            Outside of Combustion & Firestarter, spells that are guaranteed to crit (like Fire
            Blast) should only be used to convert Heating Up into Hot Streak. While there are minor
            exceptions to this (like if you are about to cap on charges), the goal should be to
            waste as few of these as possible. Additionally, you should never cast Fire Blast or
            Phoenix Flames while Hot Streak is active, as those could have contributed towards your
            next Heating Up/Hot Streak
            <ul>
              <li>Fireblast used without Heating Up: {this.fireBlastWithoutHeatingUp}</li>
              <li>Fireblast used during Hot Streak: {this.fireBlastsDuringHotStreak}</li>
              <li>Phoenix Flames used during Hot Streak: {this.phoenixFlamesDuringHotStreak}</li>
            </ul>
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.HEATING_UP}>
          <>
            <SpellIcon spell={SPELLS.FIRE_BLAST} />{' '}
            {formatPercentage(this.fireBlastUtilSuggestionThresholds.actual, 0)}%{' '}
            <small>Fire Blast Utilization</small>
            <br />
            <SpellIcon spell={TALENTS.PHOENIX_FLAMES_TALENT} />{' '}
            {formatPercentage(this.phoenixFlamesUtilSuggestionThresholds.actual, 0)}%{' '}
            <small>Phoenix Flames Utilization</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export interface HeatingUpCrits {
  cast: CastEvent;
  damage: DamageEvent;
  hasHeatingUp: boolean;
  hasHotStreak: boolean;
  critBuff: { active: boolean; buffId?: number };
  charges: number;
  timeTillCapped: number;
}
