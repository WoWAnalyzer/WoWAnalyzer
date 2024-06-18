import {
  COMBUSTION_END_BUFFER,
  FIRESTARTER_THRESHOLD,
  SEARING_TOUCH_THRESHOLD,
  FIRE_DIRECT_DAMAGE_SPELLS,
  SharedCode,
} from 'analysis/retail/mage/shared';
import { formatPercentage, formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import HIT_TYPES from 'game/HIT_TYPES';
import { SpellLink } from 'interface';
import { highlightInefficientCast } from 'interface/report/Results/Timeline/Casts';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  EventType,
  HasTarget,
  CastEvent,
  DamageEvent,
  ApplyBuffEvent,
  RemoveBuffEvent,
  FightEndEvent,
  GetRelatedEvent,
  HasRelatedEvent,
} from 'parser/core/Events';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import { encodeTargetString } from 'parser/shared/modules/Enemies';
import EventHistory from 'parser/shared/modules/EventHistory';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { BoxRowEntry } from 'interface/guide/components/PerformanceBoxRow';

class HotStreak extends Analyzer {
  static dependencies = {
    sharedCode: SharedCode,
    eventHistory: EventHistory,
  };
  protected eventHistory!: EventHistory;
  protected sharedCode!: SharedCode;

  hasFirestarter: boolean = this.selectedCombatant.hasTalent(TALENTS.FIRESTARTER_TALENT);
  hasSearingTouch: boolean = this.selectedCombatant.hasTalent(TALENTS.SCORCH_TALENT);
  hasHyperthermia: boolean = this.selectedCombatant.hasTalent(TALENTS.HYPERTHERMIA_TALENT);
  hasPyromaniac: boolean = this.selectedCombatant.hasTalent(TALENTS.PYROMANIAC_TALENT);

  hotStreaks: {
    apply: ApplyBuffEvent | undefined;
    remove: RemoveBuffEvent;
    spender: CastEvent | undefined;
    precast: CastEvent | undefined;
    preCastMissing?: BoxRowEntry;
  }[] = [];
  wasted: { event: DamageEvent; timestamp: number }[] = [];

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
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  onHotStreakApply(event: RemoveBuffEvent) {
    const buffApply: ApplyBuffEvent | undefined = GetRelatedEvent(event, 'BuffApply');
    const spender: CastEvent | undefined = GetRelatedEvent(event, 'SpellCast');
    const precast: CastEvent | undefined = GetRelatedEvent(event, 'PreCast');

    this.hotStreaks.push({
      apply: buffApply,
      remove: event,
      spender: spender,
      precast: precast,
    });
  }

  damageEvents(event: DamageEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.HOT_STREAK.id)) {
      return;
    }
    this.wasted.push({ event: event, timestamp: event.timestamp });
  }

  onFightEnd(event: FightEndEvent) {
    this.analyzeHotStreaks();
  }

  // prettier-ignore
  analyzeHotStreaks = () => {

    //If there is a precast then filter it out. 
    let procs = this.hotStreaks.filter(hs => {
      if (hs.precast) {
        hs.preCastMissing = { value: QualitativePerformance.Good, tooltip: `Precast ${hs.precast?.ability.name} Found` }  
      }
      return !hs.preCastMissing;
    })

    //If Combustion was active, filter it out
    procs = procs.filter(hs => {
      const combustionActive = this.selectedCombatant.hasBuff(TALENTS.COMBUSTION_TALENT.id, hs.remove.timestamp);
      if (combustionActive) {
        hs.preCastMissing = { value: QualitativePerformance.Good, tooltip: `Combustion Active`}
      }
      return !hs.preCastMissing;
    });

    //If Hyperthermia was active, filter it out
    procs = procs.filter(hs => {
      const hyperthermiaActive = this.selectedCombatant.hasBuff(SPELLS.HYPERTHERMIA_BUFF.id, hs.remove.timestamp);
      if (this.hasHyperthermia && hyperthermiaActive) {
        hs.preCastMissing = { value: QualitativePerformance.Good, tooltip: `Hyperthermia Active` }
      }
      return !hs.preCastMissing;
    })

    //If Combustion ended less than 3 seconds ago, filter it out
    procs = procs.filter(hs => {
      const combustionEnded = this.eventHistory.getEvents(EventType.RemoveBuff, { spell: TALENTS.COMBUSTION_TALENT, count: 1, startTimestamp: hs.remove.timestamp })[0];
      if (combustionEnded && hs.remove.timestamp - combustionEnded.timestamp < COMBUSTION_END_BUFFER) {
        hs.preCastMissing = { value: QualitativePerformance.Good, tooltip: `Combustion Ended Recently` }
      }
      return !hs.preCastMissing;
    })

    //If Firestarter or Searing Touch was active, filter it out
    procs = procs.filter(hs => {
      const spenderDamage = hs.spender && GetRelatedEvent(hs.spender, 'SpellDamage');
      if (!spenderDamage) {
        return true;
      }
      const targetHealth = this.sharedCode.getTargetHealth(spenderDamage);
      if (this.hasFirestarter && targetHealth && targetHealth > FIRESTARTER_THRESHOLD) {
        hs.preCastMissing = { value: QualitativePerformance.Good, tooltip: `Firestarter Active` }
      }
      
      if (this.hasSearingTouch && targetHealth && targetHealth < SEARING_TOUCH_THRESHOLD) {
        hs.preCastMissing = { value: QualitativePerformance.Good, tooltip: `Searing Touch Active` }
      }
      return !hs.preCastMissing;
    });

    //If the proc expired, mark it failed on the guide but dont filter it out
    procs.forEach(hs => {
      if (!hs.spender) {
        hs.preCastMissing = { value: QualitativePerformance.Fail, tooltip: `Proc Expired` }
      }
      return !hs.preCastMissing
    })

    //Highlight bad casts on timeline
    const timelineTooltip = `This Pyroblast was cast using Hot Streak, but did not have a Fireball pre-cast in front of it.`
    procs.forEach(hs => {
      hs.preCastMissing = { value: QualitativePerformance.Fail, tooltip: `No Precast Found` }
      hs.spender && highlightInefficientCast(hs.spender, timelineTooltip)
    })

    return procs.length
  }

  // prettier-ignore
  wastedCrits = () => {
    //Filter it out if they were using their Hot Streak at the exact same time that Scorch was cast.
    //There is a small grace period and Scorch has no travel time, so this makes it look like the Scorch cast was wasted when it wasnt.
    let events = this.wasted.filter(e => e.event.ability.guid !== SPELLS.SCORCH.id || this.selectedCombatant.hasBuff(SPELLS.HOT_STREAK.id, e.timestamp + 50));

    //Filter out anything that isnt a Crit
    events = events.filter(e => e.event.hitType === HIT_TYPES.CRIT);

    //Filter out Phoenix Flames cleaves
    events = events.filter(e => {
      if (!HasRelatedEvent(e.event, 'SpellCast')) {
        return false;
      }
      const cast = GetRelatedEvent(e.event, 'SpellCast')
      if (cast && HasTarget(cast)) {
        const castTarget = encodeTargetString(cast.targetID, cast.targetInstance);
        const damageTarget = encodeTargetString(e.event.targetID, e.event.targetInstance);
        return castTarget === damageTarget;
      }
      return true;
    });

    //If the player got a Pyromaniac proc, then dont count it as a wasted proc because there is nothing they could have done to prevent the crit from being wasted.
    events = events.filter((e) => {
      const pyromaniacProc = this.eventHistory.getEvents(EventType.RemoveBuff, { spell: SPELLS.HOT_STREAK, count: 1, startTimestamp: e.event.timestamp, duration: 250 })[0];
      return !this.hasPyromaniac || !pyromaniacProc;
    });

    //Highlight Timeline
    events.forEach((e) => {
      const cast = this.eventHistory.getEvents(EventType.Cast, { spell: SPELLS[e.event.ability.guid], count: 1, startTimestamp: e.event.timestamp, duration: 5000 })[0];
      const tooltip = 'This cast crit while you already had Hot Streak and could have contributed towards your next Heating Up or Hot Streak. To avoid this, make sure you use your Hot Streak procs as soon as possible.';
      cast && highlightInefficientCast(cast, tooltip);
    });
    return events.length;
  };

  expiredProcs = () => {
    const expired = this.hotStreaks.filter((hs) => !hs.spender);
    return expired.length || 0;
  };

  get missingPreCasts() {
    const missingPreCasts = this.hotStreaks.filter(
      (hs) => hs.preCastMissing?.value === QualitativePerformance.Fail,
    );
    return missingPreCasts.length;
  }

  get badUses() {
    return this.expiredProcs() + this.missingPreCasts;
  }

  get badUsePercent() {
    return 1 - this.badUses / this.totalHotStreaks;
  }

  get totalHotStreaks() {
    return this.hotStreaks.length;
  }

  get hotStreakUtilizationThresholds() {
    return {
      actual: 1 - this.expiredProcs() / this.totalHotStreaks || 0,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.8,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get castBeforeHotStreakThresholds() {
    return {
      actual: 1 - this.missingPreCasts / this.totalHotStreaks,
      isLessThan: {
        minor: 0.85,
        average: 0.75,
        major: 0.65,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get wastedCritsThresholds() {
    return {
      actual: this.wastedCrits() / (this.owner.fightDuration / 60000),
      isGreaterThan: {
        minor: 0,
        average: 1,
        major: 3,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  suggestions(when: When) {
    when(this.hotStreakUtilizationThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You allowed {formatPercentage(this.expiredProcs() / this.totalHotStreaks)}% of your{' '}
          <SpellLink spell={SPELLS.HOT_STREAK} /> procs to expire. Try to use your procs as soon as
          possible to avoid this.
        </>,
      )
        .icon(SPELLS.HOT_STREAK.icon)
        .actual(`${formatPercentage(this.hotStreakUtilizationThresholds.actual)}% expired`)
        .recommended(`<${formatPercentage(recommended)}% is recommended`),
    );
    when(this.castBeforeHotStreakThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          When <SpellLink spell={TALENTS.COMBUSTION_TALENT} /> is not active
          {this.hasFirestarter ? ' and the target is below 90% health' : ''}{' '}
          {this.hasSearingTouch ? ' and the target is over 30% health' : ''},{' '}
          <SpellLink spell={SPELLS.HOT_STREAK} /> procs should be used immediately after casting{' '}
          <SpellLink spell={SPELLS.FIREBALL} /> . This way, if one of the two abilities crit you
          will gain a new <SpellLink spell={SPELLS.HEATING_UP} /> proc, and if both crit you will
          get a new <SpellLink spell={SPELLS.HOT_STREAK} /> proc. You failed to do this{' '}
          {this.missingPreCasts} times. If you have a <SpellLink spell={SPELLS.HOT_STREAK} /> proc
          and need to move, you can hold the proc and cast <SpellLink spell={SPELLS.SCORCH} /> once
          or twice until you are able to stop and cast <SpellLink spell={SPELLS.FIREBALL} /> or you
          can use your procs while you move.
        </>,
      )
        .icon(SPELLS.HOT_STREAK.icon)
        .actual(`${formatPercentage(this.castBeforeHotStreakThresholds.actual)}% Utilization`)
        .recommended(`${formatPercentage(recommended)}% is recommended`),
    );
    when(this.wastedCritsThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You crit with {formatNumber(this.wastedCrits())} (
          {formatNumber(this.wastedCritsThresholds.actual)} Per Minute) direct damage abilities
          while <SpellLink spell={SPELLS.HOT_STREAK} /> was active. This is a waste since those
          crits could have contibuted towards your next Hot Streak. Try to use your procs as soon as
          possible to avoid this.
        </>,
      )
        .icon(SPELLS.HOT_STREAK.icon)
        .actual(`${formatNumber(this.wastedCrits())} crits wasted`)
        .recommended(`${formatNumber(recommended)} is recommended`),
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(15)}
        size="flexible"
        tooltip={
          <>
            Hot Streak is a big part of your rotation and therefore it is important that you use all
            the procs that you get and avoid letting them expire. <br />
            <br />
            Additionally, to maximize your chance of getting Heating Up/Hot Streak procs, you should
            hard cast Fireball just before using your Hot Streak proc unless you are guaranteed to
            crit via Firestarter, Searing Touch, or Combustion. This way if one of the two spells
            crit you will get a new Heating Up proc, and if both spells crit then you will get a new
            Hot Streak proc.
            <br />
            <ul>
              <li>Total procs - {this.totalHotStreaks}</li>
              <li>Used procs - {this.totalHotStreaks - this.expiredProcs()}</li>
              <li>Expired procs - {this.expiredProcs()}</li>
              <li>Procs used without a Fireball - {this.missingPreCasts}</li>
            </ul>
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.HOT_STREAK}>
          <>
            {formatPercentage(this.hotStreakUtilizationThresholds.actual, 0)}%{' '}
            <small>Proc Utilization</small>
            <br />
            {formatPercentage(this.castBeforeHotStreakThresholds.actual, 0)}%{' '}
            <small>Procs used alongside Fireball</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default HotStreak;
