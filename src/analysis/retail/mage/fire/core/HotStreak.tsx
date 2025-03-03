import {
  COMBUSTION_END_BUFFER,
  FIRE_DIRECT_DAMAGE_SPELLS,
  SharedCode,
} from 'analysis/retail/mage/shared';
import SPELLS from 'common/SPELLS';
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
} from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
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
  hasSearingTouch: boolean = this.selectedCombatant.hasTalent(TALENTS.SCORCH_TALENT);
  hasHyperthermia: boolean = this.selectedCombatant.hasTalent(TALENTS.HYPERTHERMIA_TALENT);
  hasPyromaniac: boolean = this.selectedCombatant.hasTalent(TALENTS.PYROMANIAC_TALENT);

  hotStreaks: HotStreakProc[] = [];
  wasted: DamageEvent[] = [];

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.HOT_STREAK),
      this.onHotStreakApply,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(FIRE_DIRECT_DAMAGE_SPELLS),
      this.damageEvents,
    );
  }

  onHotStreakApply(event: RemoveBuffEvent) {
    const buffApply: ApplyBuffEvent | undefined = GetRelatedEvent(event, 'BuffApply');
    const spender: CastEvent | undefined = GetRelatedEvent(event, 'SpellCast');
    const damage: DamageEvent | undefined = GetRelatedEvent(event, 'SpellDamage');
    const precast: CastEvent | undefined = GetRelatedEvent(event, 'PreCast');

    let buff;
    if (this.hasSearingTouch && damage && this.sharedCode.getTargetHealth(damage)) {
      buff = { active: true, buffId: TALENTS.SCORCH_TALENT.id };
    } else if (this.hasFirestarter && damage && this.sharedCode.getTargetHealth(damage)) {
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

    this.hotStreaks.push({
      apply: buffApply,
      remove: event,
      spender: spender,
      expired: !spender,
      blastCharges: this.spellUsable.chargesAvailable(SPELLS.FIRE_BLAST.id),
      phoenixCharges: this.spellUsable.chargesAvailable(TALENTS.PHOENIX_FLAMES_TALENT.id),
      critBuff: buff,
      wastedCrits:
        this.wasted.filter(
          (w) => buffApply && w.timestamp > buffApply.timestamp && w.timestamp < event.timestamp,
        ) || [],
      precast: precast,
    });
  }

  damageEvents(event: DamageEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.HOT_STREAK.id) || event.hitType !== HIT_TYPES.CRIT) {
      return;
    }
    const cast: CastEvent | undefined = GetRelatedEvent(event, 'SpellCast');
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

  get wastedCritsThresholds() {
    return {
      actual: this.wastedCrits / (this.owner.fightDuration / 60000),
      isGreaterThan: {
        minor: 0,
        average: 1,
        major: 3,
      },
      style: ThresholdStyle.NUMBER,
    };
  }
}

export interface HotStreakProc {
  apply?: ApplyBuffEvent;
  remove: RemoveBuffEvent;
  spender?: CastEvent;
  expired: boolean;
  blastCharges: number;
  phoenixCharges: number;
  critBuff: { active: boolean; buffId?: number };
  wastedCrits: DamageEvent[];
  precast?: CastEvent;
}
