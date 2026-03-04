import {
  COMBUSTION_END_BUFFER,
  FIRE_DIRECT_DAMAGE_SPELLS,
  SharedCode,
} from 'analysis/retail/mage/shared';
import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';
import TALENTS from 'common/TALENTS/mage';
import HIT_TYPES from 'game/HIT_TYPES';
import { highlightInefficientCast } from 'interface/report/Results/Timeline/Casts';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  HasTarget,
  CastEvent,
  DamageEvent,
  ApplyBuffEvent,
  RemoveBuffEvent,
  GetRelatedEvent,
  EventType,
} from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import {
  QualitativePerformance,
  evaluateQualitativePerformanceByThreshold,
} from 'parser/ui/QualitativePerformance';
import { encodeTargetString } from 'parser/shared/modules/Enemies';
import SpellUsable from 'parser/shared/modules/SpellUsable';

export default class HotStreak extends Analyzer {
  static dependencies = {
    sharedCode: SharedCode,
    spellUsable: SpellUsable,
  };
  protected sharedCode!: SharedCode;
  protected spellUsable!: SpellUsable;

  hasFirestarter: boolean = this.selectedCombatant.hasTalent(TALENTS.FIRESTARTER_TALENT);
  hasScorch: boolean = this.selectedCombatant.hasTalent(TALENTS.SCORCH_TALENT);
  hasPyromaniac: boolean = this.selectedCombatant.hasTalent(TALENTS.PYROMANIAC_TALENT);

  hotStreaks: HotStreakProc[] = [];
  wasted: DamageEvent[] = [];

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.HOT_STREAK),
      this.onHotStreakRemoved,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(FIRE_DIRECT_DAMAGE_SPELLS),
      this.damageEvents,
    );
  }

  onHotStreakRemoved(event: RemoveBuffEvent) {
    const buffApply: ApplyBuffEvent | undefined = GetRelatedEvent(event, EventType.ApplyBuff);
    const spender: CastEvent | undefined = GetRelatedEvent(event, 'consume');
    const damage: DamageEvent | undefined = GetRelatedEvent(event, EventType.Damage);
    const precast: CastEvent | undefined = GetRelatedEvent(event, 'precast');
    const targetHealth = damage && this.sharedCode.getTargetHealth(damage);

    let buff: Spell[] = [];
    if (this.hasScorch && targetHealth && targetHealth < 0.3) {
      buff.push(TALENTS.SCORCH_TALENT);
    } else if (this.hasFirestarter && targetHealth && targetHealth > 0.9) {
      buff.push(TALENTS.FIRESTARTER_TALENT);
    } else if (
      this.selectedCombatant.hasBuff(
        TALENTS.COMBUSTION_TALENT.id,
        event.timestamp - COMBUSTION_END_BUFFER,
      )
    ) {
      buff.push(TALENTS.COMBUSTION_TALENT);
    } else if (this.selectedCombatant.hasBuff(SPELLS.HYPERTHERMIA_BUFF.id)) {
      buff.push(SPELLS.HYPERTHERMIA_BUFF);
    }

    this.hotStreaks.push({
      apply: buffApply,
      remove: event,
      spender: spender,
      expired: !spender,
      blastCharges: this.spellUsable.chargesAvailable(SPELLS.FIRE_BLAST.id),
      activeBuffs: buff,
      wastedCrits:
        this.wasted.filter(
          (w) => buffApply && w.timestamp > buffApply.timestamp && w.timestamp < event.timestamp,
        ) || [],
      precast: precast,
      buffUptime: (buffApply && event.timestamp - buffApply.timestamp) || 0,
    });
  }

  damageEvents(event: DamageEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.HOT_STREAK.id) || event.hitType !== HIT_TYPES.CRIT) {
      return;
    }
    const cast: CastEvent | undefined = GetRelatedEvent(event, EventType.Cast);
    const hadPyromaniac =
      this.selectedCombatant.hasBuff(TALENTS.PYROMANIAC_TALENT.id) ||
      this.selectedCombatant.hasBuff(TALENTS.PYROMANIAC_TALENT.id, event.timestamp - 250);
    if (cast && HasTarget(cast) && !hadPyromaniac) {
      const castTarget = encodeTargetString(cast.targetID, cast.targetInstance);
      const damageTarget = encodeTargetString(event.targetID, event.targetInstance);
      castTarget === damageTarget && this.wasted.push(event);

      const tooltip =
        'This cast crit while you already had Hot Streak and could have contributed towards your next Heating Up or Hot Streak. To avoid this, make sure you use your Hot Streak procs as soon as possible.';
      highlightInefficientCast(cast, tooltip);
    }
  }

  get totalHotStreaks() {
    return this.hotStreaks.length;
  }

  get expiredProcs() {
    return this.hotStreaks.filter((hs) => hs.expired).length;
  }

  get wastedCrits() {
    let wasted = 0;
    this.hotStreaks.forEach((w) => (wasted += w.wastedCrits.length));
    return wasted;
  }

  get wastedCritsPerformance(): QualitativePerformance {
    return evaluateQualitativePerformanceByThreshold({
      actual: this.wastedCrits,
      isLessThanOrEqual: {
        perfect: 0,
        good: 0.5 * (this.owner.fightDuration / 60000),
        ok: 1 * (this.owner.fightDuration / 60000),
      },
    });
  }

  get expiredProcsPerformance(): QualitativePerformance {
    return evaluateQualitativePerformanceByThreshold({
      actual: this.expiredProcs,
      isLessThanOrEqual: {
        perfect: 0,
        good: 0.5 * (this.owner.fightDuration / 60000),
        ok: 1 * (this.owner.fightDuration / 60000),
      },
    });
  }
}

export interface HotStreakProc {
  apply?: ApplyBuffEvent;
  remove: RemoveBuffEvent;
  spender?: CastEvent;
  expired: boolean;
  blastCharges: number;
  activeBuffs: Spell[];
  wastedCrits: DamageEvent[];
  precast?: CastEvent;
  buffUptime: number;
}
