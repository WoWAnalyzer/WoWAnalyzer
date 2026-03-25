import { COMBUSTION_END_BUFFER, SharedCode } from 'analysis/retail/mage/shared';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';
import TALENTS from 'common/TALENTS/mage';
import HIT_TYPES from 'game/HIT_TYPES';
import SpellIcon from 'interface/SpellIcon';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import Events, {
  CastEvent,
  DamageEvent,
  EventType,
  GetRelatedEvents,
  HasTarget,
  ApplyBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import { encodeTargetString } from 'parser/shared/modules/Enemies';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import {
  evaluateQualitativePerformanceByThreshold,
  QualitativePerformance,
} from 'parser/ui/QualitativePerformance';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

export default class HeatingUp extends Analyzer {
  static dependencies = {
    sharedCode: SharedCode,
    spellUsable: SpellUsable,
    abilityTracker: AbilityTracker,
  };
  protected sharedCode!: SharedCode;
  protected spellUsable!: SpellUsable;
  protected abilityTracker!: AbilityTracker;

  hasFirestarter: boolean = this.selectedCombatant.hasTalent(TALENTS.FIRESTARTER_TALENT);
  hasScorch: boolean = this.selectedCombatant.hasTalent(TALENTS.SCORCH_TALENT);

  heatingUpCrits: HeatingUpCrits[] = [];
  convertedBuffs: number = 0;
  totalHeatingUp: number = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.FIRE_BLAST), this.castEvent);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.HEATING_UP),
      this.onHeatingUpApplied,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.HEATING_UP),
      this.onHeatingUpRemoved,
    );
  }

  castEvent(event: CastEvent) {
    const damage: DamageEvent[] = GetRelatedEvents(event, EventType.Damage) || [];
    const castTarget = HasTarget(event) && encodeTargetString(event.targetID, event.targetInstance);
    const damageEvent = damage.find((d) => {
      const damageTarget = HasTarget(d) && encodeTargetString(d.targetID, d.targetInstance);
      return castTarget === damageTarget;
    });
    const targetHealth = damageEvent && this.sharedCode.getTargetHealth(damageEvent);
    if (!damageEvent || !HasTarget(damageEvent) || damageEvent.hitType !== HIT_TYPES.CRIT) {
      return;
    }

    let buff: Spell[] = [];
    if (this.hasScorch && targetHealth && targetHealth < 0.3) {
      buff.push(TALENTS.SCORCH_TALENT);
    } else if (this.hasFirestarter && targetHealth && targetHealth > 0.9) {
      buff.push(TALENTS.FIRESTARTER_TALENT);
    } else if (
      this.selectedCombatant.hasBuff(TALENTS.COMBUSTION_TALENT.id) ||
      this.selectedCombatant.hasBuff(
        TALENTS.COMBUSTION_TALENT.id,
        event.timestamp - COMBUSTION_END_BUFFER,
      )
    ) {
      buff.push(TALENTS.COMBUSTION_TALENT);
    } else if (this.selectedCombatant.hasBuff(SPELLS.HYPERTHERMIA_BUFF.id)) {
      buff.push(SPELLS.HYPERTHERMIA_BUFF);
    }

    this.heatingUpCrits.push({
      cast: event,
      damage: damageEvent,
      hasHeatingUp: this.selectedCombatant.hasBuff(SPELLS.HEATING_UP.id),
      hasHotStreak: this.selectedCombatant.hasBuff(SPELLS.HOT_STREAK.id),
      activeBuffs: buff,
      charges: this.spellUsable.chargesAvailable(event.ability.guid),
      timeTillCapped: this.spellUsable.cooldownRemaining(event.ability.guid),
    });
  }

  onHeatingUpApplied(event: ApplyBuffEvent) {
    this.totalHeatingUp += 1;
  }

  onHeatingUpRemoved(event: RemoveBuffEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.HOT_STREAK)) {
      this.convertedBuffs += 1;
    }
  }

  get fireBlastsDuringHotStreak() {
    return this.heatingUpCrits.filter(
      (c) => c.cast.ability.guid === SPELLS.FIRE_BLAST.id && c.hasHotStreak,
    ).length;
  }

  get fireBlastWithoutHeatingUp() {
    return this.heatingUpCrits.filter(
      (c) =>
        c.cast.ability.guid === SPELLS.FIRE_BLAST.id &&
        !c.hasHeatingUp &&
        !c.hasHotStreak &&
        c.activeBuffs.length === 0,
    ).length;
  }

  get fireBlastUtilPercent() {
    return (
      1 -
      (this.fireBlastWithoutHeatingUp + this.fireBlastsDuringHotStreak) /
        this.abilityTracker.getAbility(SPELLS.FIRE_BLAST.id).casts
    );
  }

  get convertedHeatingUpPercent() {
    return this.convertedBuffs / this.totalHeatingUp || 0;
  }

  get totalWasted() {
    return this.fireBlastWithoutHeatingUp + this.fireBlastsDuringHotStreak;
  }

  get fireBlastUtilPerformance(): QualitativePerformance {
    return evaluateQualitativePerformanceByThreshold({
      actual: this.fireBlastUtilPercent,
      isGreaterThanOrEqual: {
        perfect: 0.95,
        good: 0.9,
        ok: 0.8,
      },
    });
  }

  get convertedBuffPerformance(): QualitativePerformance {
    return evaluateQualitativePerformanceByThreshold({
      actual: this.convertedHeatingUpPercent,
      isGreaterThanOrEqual: {
        perfect: 0.9,
        good: 0.8,
        ok: 0.7,
      },
    });
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
            </ul>
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.HEATING_UP}>
          <>
            <SpellIcon spell={SPELLS.FIRE_BLAST} /> {formatPercentage(this.fireBlastUtilPercent, 0)}
            % <small>Fire Blast Utilization</small>
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
  activeBuffs: Spell[];
  charges: number;
  timeTillCapped: number;
}
