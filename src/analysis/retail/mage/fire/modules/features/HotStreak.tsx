import { Trans } from '@lingui/macro';
import {
  COMBUSTION_END_BUFFER,
  FIRESTARTER_THRESHOLD,
  SEARING_TOUCH_THRESHOLD,
  FIRE_DIRECT_DAMAGE_SPELLS,
  StandardChecks,
} from 'analysis/retail/mage/shared';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import HIT_TYPES from 'game/HIT_TYPES';
import { SpellLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { EventType, HasTarget } from 'parser/core/Events';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import { encodeTargetString } from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

const PROC_BUFFER = 200;

class HotStreak extends Analyzer {
  static dependencies = {
    standardChecks: StandardChecks,
  };
  protected standardChecks!: StandardChecks;

  hasPyroclasm: boolean = this.selectedCombatant.hasTalent(SPELLS.PYROCLASM_TALENT.id);
  hasFirestarter: boolean = this.selectedCombatant.hasTalent(SPELLS.FIRESTARTER_TALENT.id);
  hasSearingTouch: boolean = this.selectedCombatant.hasTalent(SPELLS.SEARING_TOUCH_TALENT.id);
  hasFirestorm: boolean = this.selectedCombatant.hasLegendary(SPELLS.FIRESTORM);
  hasPyromaniac: boolean = this.selectedCombatant.hasTalent(SPELLS.PYROMANIAC_TALENT.id);

  expiredProcs = () =>
    this.standardChecks.countExpiredProcs(SPELLS.HOT_STREAK, [
      SPELLS.PYROBLAST,
      SPELLS.FLAMESTRIKE,
    ]);

  // prettier-ignore
  missingHotStreakPreCast = () => {
    let hotStreakRemovals = this.standardChecks.getEvents(true, EventType.RemoveBuff, SPELLS.HOT_STREAK);
    hotStreakRemovals = hotStreakRemovals.filter(hs => !this.standardChecks.checkPreCast(hs, SPELLS.FIREBALL));

    //If Combustion or Firestorm was active, filter it out
    hotStreakRemovals = hotStreakRemovals.filter(hs => {
      const combustionActive = this.selectedCombatant.hasBuff(SPELLS.COMBUSTION.id, hs.timestamp);
      const firestormActive = this.selectedCombatant.hasBuff(SPELLS.FIRESTORM_BUFF.id, hs.timestamp);
      return (!this.hasFirestorm || !firestormActive) && (!combustionActive)
    });

    //If Combustion ended less than 3 seconds ago, filter it out
    hotStreakRemovals = hotStreakRemovals.filter(hs => {
      const combustionEnded = this.standardChecks.getEvents(true, EventType.RemoveBuff, SPELLS.COMBUSTION, 1, hs.timestamp)[0];
      return !combustionEnded || hs.timestamp - combustionEnded.timestamp > COMBUSTION_END_BUFFER;
    })

    //If Firestarter or Searing Touch was active, filter it out
    hotStreakRemovals = hotStreakRemovals.filter(hs => {
      const targetHealth = this.standardChecks.getTargetHealth(hs);
      if (this.hasFirestarter) {
        return targetHealth && targetHealth < FIRESTARTER_THRESHOLD;
      } else if (this.hasSearingTouch) {
        return targetHealth && targetHealth > SEARING_TOUCH_THRESHOLD;
      } else {
        return true;
      }
    });

    //If Pyroclasm was removed within 200ms of the Hot Streak being removed then they probably precast a hard cast Pyroblast, so filter it out
    hotStreakRemovals = hotStreakRemovals.filter(hs => {
      const pyroclasmRemoved = this.standardChecks.getEvents(true, EventType.RemoveBuff, SPELLS.PYROCLASM_BUFF, 1, hs.timestamp, PROC_BUFFER);
      return !this.hasPyroclasm || !pyroclasmRemoved;
    })
    return hotStreakRemovals.length
  }

  // prettier-ignore
  wastedCrits = () => {
    let events = this.standardChecks.getEventsByBuff(true, SPELLS.HOT_STREAK, EventType.Damage, FIRE_DIRECT_DAMAGE_SPELLS);

    //Filter it out if they were using their Hot Streak at the exact same time that Scorch was cast.
    //There is a small grace period and Scorch has no travel time, so this makes it look like the Scorch cast was wasted when it wasnt.
    events = events.filter(e => !e.ability.guid === SPELLS.SCORCH.id || this.selectedCombatant.hasBuff(SPELLS.HOT_STREAK.id, e.timestamp + 50));

    //Filter out anything that isnt a Crit
    events = events.filter(e => e.hitType === HIT_TYPES.CRIT);

    //Filter out Phoenix Flames cleaves
    events = events.filter(e => {
      const cast = this.standardChecks.getEvents(true, EventType.Cast, SPELLS[e.ability.guid], 1, e.timestamp, 5000)[0];
      if (cast && HasTarget(cast)) {
        const castTarget = encodeTargetString(cast.targetID, cast.targetInstance);
        return castTarget === encodeTargetString(e.targetID, e.targetInstance);
      }
      return true;
    });

    //If the player got a Pyromaniac proc, then dont count it as a wasted proc because there is nothing they could have done to prevent the crit from being wasted.
    events = events.filter((e) => {
      const pyromaniacProc = this.standardChecks.getEvents(true, EventType.RemoveBuff, SPELLS.HOT_STREAK, 1, e.timestamp, 250)[0];
      return !this.hasPyromaniac || !pyromaniacProc;
    });

    //Highlight Timeline
    events.forEach((e) => {
      const cast = this.standardChecks.getEvents(true, EventType.Cast, SPELLS[e.ability.guid], 1, e.timestamp, 5000)[0];
      const tooltip = 'This cast crit while you already had Hot Streak and could have contributed towards your next Heating Up or Hot Streak. To avoid this, make sure you use your Hot Streak procs as soon as possible.';
      cast && this.standardChecks.highlightInefficientCast(cast, tooltip);
    });
    return events.length;
  };

  get totalHotStreakProcs() {
    return this.standardChecks.countEvents(EventType.ApplyBuff, SPELLS.HOT_STREAK);
  }

  get hotStreakUtilizationThresholds() {
    return {
      actual: 1 - this.expiredProcs() / this.totalHotStreakProcs || 0,
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
      actual:
        1 -
        this.missingHotStreakPreCast() /
          this.standardChecks.countEvents(EventType.ApplyBuff, SPELLS.HOT_STREAK),
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
          You allowed {formatPercentage(this.expiredProcs() / this.totalHotStreakProcs)}% of your{' '}
          <SpellLink id={SPELLS.HOT_STREAK.id} /> procs to expire. Try to use your procs as soon as
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
          When <SpellLink id={SPELLS.COMBUSTION.id} /> is not active
          {this.hasFirestarter ? ' and the target is below 90% health' : ''}{' '}
          {this.hasSearingTouch ? ' and the target is over 30% health' : ''},{' '}
          <SpellLink id={SPELLS.HOT_STREAK.id} /> procs should be used immediately after casting{' '}
          <SpellLink id={SPELLS.FIREBALL.id} />{' '}
          {this.hasPyroclasm ? (
            <>
              {' '}
              or after using a <SpellLink id={SPELLS.PYROCLASM_TALENT.id} /> proc{' '}
            </>
          ) : (
            ''
          )}
          . This way, if one of the two abilities crit you will gain a new{' '}
          <SpellLink id={SPELLS.HEATING_UP.id} /> proc, and if both crit you will get a new{' '}
          <SpellLink id={SPELLS.HOT_STREAK.id} /> proc. You failed to do this{' '}
          {this.missingHotStreakPreCast()} times. If you have a{' '}
          <SpellLink id={SPELLS.HOT_STREAK.id} /> proc and need to move, you can hold the proc and
          cast <SpellLink id={SPELLS.SCORCH.id} /> once or twice until you are able to stop and cast{' '}
          <SpellLink id={SPELLS.FIREBALL.id} /> or you can use your procs while you move.
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
          while <SpellLink id={SPELLS.HOT_STREAK.id} /> was active. This is a waste since those
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
            hard cast Fireball
            {this.hasPyroclasm ? ' (or Pyroblast if you have a Pyroclasm proc)' : ''} just before
            using your Hot Streak proc unless you are guaranteed to crit via Firestarter, Searing
            Touch, or Combustion. This way if one of the two spells crit you will get a new Heating
            Up proc, and if both spells crit then you will get a new Hot Streak proc.
            <br />
            <ul>
              <li>Total procs - {this.totalHotStreakProcs}</li>
              <li>Used procs - {this.totalHotStreakProcs - this.expiredProcs()}</li>
              <li>Expired procs - {this.expiredProcs()}</li>
              <li>Procs used without a Fireball - {this.missingHotStreakPreCast()}</li>
            </ul>
          </>
        }
      >
        <BoringSpellValueText spellId={SPELLS.HOT_STREAK.id}>
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
