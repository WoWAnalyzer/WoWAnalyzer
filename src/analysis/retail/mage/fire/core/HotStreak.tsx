import { Trans } from '@lingui/macro';
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
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  EventType,
  HasTarget,
  CastEvent,
  DamageEvent,
  ApplyBuffEvent,
  RemoveBuffEvent,
  GetRelatedEvent,
  HasRelatedEvent,
} from 'parser/core/Events';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import { encodeTargetString } from 'parser/shared/modules/Enemies';
import EventHistory from 'parser/shared/modules/EventHistory';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class HotStreak extends Analyzer {
  static dependencies = {
    sharedCode: SharedCode,
    eventHistory: EventHistory,
  };
  protected eventHistory!: EventHistory;
  protected sharedCode!: SharedCode;

  hasFirestarter: boolean = this.selectedCombatant.hasTalent(TALENTS.FIRESTARTER_TALENT);
  hasSearingTouch: boolean = this.selectedCombatant.hasTalent(TALENTS.SEARING_TOUCH_TALENT);
  hasHyperthermia: boolean = this.selectedCombatant.hasTalent(TALENTS.HYPERTHERMIA_TALENT);
  hasPyromaniac: boolean = this.selectedCombatant.hasTalent(TALENTS.PYROMANIAC_TALENT);

  hotStreaks: {
    apply: ApplyBuffEvent | undefined;
    remove: RemoveBuffEvent;
    spender: CastEvent | undefined;
    precast: CastEvent | undefined;
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
  }

  onHotStreakApply(event: RemoveBuffEvent) {
    const buffApply: ApplyBuffEvent | undefined = GetRelatedEvent(event, 'BuffApply');
    const spender: CastEvent | undefined = GetRelatedEvent(event, 'SpellCast');
    const precast: CastEvent | undefined = GetRelatedEvent(event, 'PreCast');
    this.hotStreaks[this.hotStreaks.length] = {
      apply: buffApply,
      remove: event,
      spender: spender,
      precast: precast,
    };
  }

  damageEvents(event: DamageEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.HOT_STREAK.id)) {
      return;
    }
    this.wasted[this.wasted.length] = { event: event, timestamp: event.timestamp };
  }

  // prettier-ignore
  missingHotStreakPreCast = () => {
    //If there is a precast then filter it out. 
    let missedCasts = this.hotStreaks.filter(hs => !hs.precast)

    //If Combustion or Hyperthermia was active, filter it out
    missedCasts = missedCasts.filter(hs => {
      const combustionActive = this.selectedCombatant.hasBuff(TALENTS.COMBUSTION_TALENT.id, hs.remove.timestamp);
      const hyperthermiaActive = this.selectedCombatant.hasBuff(SPELLS.HYPERTHERMIA_BUFF.id, hs.remove.timestamp);
      return (!this.hasHyperthermia || !hyperthermiaActive) && (!combustionActive)
    });

    //If Combustion ended less than 3 seconds ago, filter it out
    missedCasts = missedCasts.filter(hs => {
      const combustionEnded = this.eventHistory.getEvents(EventType.RemoveBuff, { spell: TALENTS.COMBUSTION_TALENT, count: 1, startTimestamp: hs.remove.timestamp })[0];
      return !combustionEnded || hs.remove.timestamp - combustionEnded.timestamp > COMBUSTION_END_BUFFER;
    })

    //If Firestarter or Searing Touch was active, filter it out
    missedCasts = missedCasts.filter(hs => {
      const spenderDamage = hs.spender && GetRelatedEvent(hs.spender, 'SpellDamage');
      if (!spenderDamage) {
        return true;
      }
      const targetHealth = this.sharedCode.getTargetHealth(spenderDamage);
      if (this.hasFirestarter) {
        return targetHealth && targetHealth < FIRESTARTER_THRESHOLD;
      } else if (this.hasSearingTouch) {
        return targetHealth && targetHealth > SEARING_TOUCH_THRESHOLD;
      } else {
        return true;
      }
    });

    //Highlight bad casts on timeline
    const tooltip = `This Pyroblast was cast using Hot Streak, but did not have a Fireball pre-cast in front of it.`
    missedCasts.forEach(hs => {
      hs.spender && highlightInefficientCast(hs.spender, tooltip)
    })

    return missedCasts.length
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
    return expired.length;
  };

  totalHotStreaks = () => {
    return this.hotStreaks.length;
  };

  get hotStreakUtilizationThresholds() {
    return {
      actual: 1 - this.expiredProcs() / this.totalHotStreaks() || 0,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.9,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get castBeforeHotStreakThresholds() {
    return {
      actual: 1 - this.missingHotStreakPreCast() / this.totalHotStreaks(),
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
          You allowed {formatPercentage(this.expiredProcs() / this.totalHotStreaks())}% of your{' '}
          <SpellLink spell={SPELLS.HOT_STREAK} /> procs to expire. Try to use your procs as soon as
          possible to avoid this.
        </>,
      )
        .icon(SPELLS.HOT_STREAK.icon)
        .actual(
          <Trans id="mage.fire.suggestions.hotStreak.expired">
            {formatPercentage(this.hotStreakUtilizationThresholds.actual)}% expired
          </Trans>,
        )
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
          {this.missingHotStreakPreCast()} times. If you have a{' '}
          <SpellLink spell={SPELLS.HOT_STREAK} /> proc and need to move, you can hold the proc and
          cast <SpellLink spell={SPELLS.SCORCH} /> once or twice until you are able to stop and cast{' '}
          <SpellLink spell={SPELLS.FIREBALL} /> or you can use your procs while you move.
        </>,
      )
        .icon(SPELLS.HOT_STREAK.icon)
        .actual(
          <Trans id="mage.fire.suggestions.hostStreak.precasts.utilization">
            {formatPercentage(this.castBeforeHotStreakThresholds.actual)}% Utilization
          </Trans>,
        )
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
        .actual(
          <Trans id="mage.fire.suggestions.hotStreak.wastedCrits">
            {formatNumber(this.wastedCrits())} crits wasted
          </Trans>,
        )
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
              <li>Used procs - {this.totalHotStreaks() - this.expiredProcs()}</li>
              <li>Expired procs - {this.expiredProcs()}</li>
              <li>Procs used without a Fireball - {this.missingHotStreakPreCast()}</li>
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
