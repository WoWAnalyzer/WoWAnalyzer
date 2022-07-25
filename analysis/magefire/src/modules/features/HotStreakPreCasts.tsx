import { Trans } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { EventType } from 'parser/core/Events';
import { When, ThresholdStyle } from 'parser/core/ParseResults';

import {
  COMBUSTION_END_BUFFER,
  FIRESTARTER_THRESHOLD,
  SEARING_TOUCH_THRESHOLD,
  StandardChecks,
} from '@wowanalyzer/mage';

const PROC_BUFFER = 200;

class HotStreakPreCasts extends Analyzer {
  static dependencies = {
    standardChecks: StandardChecks,
  };
  protected standardChecks!: StandardChecks;

  hasPyroclasm: boolean = this.selectedCombatant.hasTalent(SPELLS.PYROCLASM_TALENT.id);
  hasFirestarter: boolean = this.selectedCombatant.hasTalent(SPELLS.FIRESTARTER_TALENT.id);
  hasSearingTouch: boolean = this.selectedCombatant.hasTalent(SPELLS.SEARING_TOUCH_TALENT.id);
  hasFirestorm: boolean = this.selectedCombatant.hasLegendary(SPELLS.FIRESTORM);

  // prettier-ignore
  missingHotStreakPreCast = () => {
    let hotStreakRemovals = this.standardChecks.getEvents(true, EventType.RemoveBuff, undefined, undefined, undefined, SPELLS.HOT_STREAK);
    hotStreakRemovals = hotStreakRemovals.filter(hs => !this.standardChecks.checkPreCast(hs, SPELLS.FIREBALL));

    //If Combustion was active, filter it out
    hotStreakRemovals = hotStreakRemovals.filter(hs => !this.selectedCombatant.hasBuff(SPELLS.COMBUSTION.id, hs.timestamp))

    //If Combustion ended less than 3 seconds ago, filter it out
    hotStreakRemovals = hotStreakRemovals.filter(hs => {
      const combustionEnded = this.standardChecks.getEvents(true, EventType.RemoveBuff, 1, hs.timestamp, undefined, SPELLS.COMBUSTION)[0];
      return !combustionEnded || hs.timestamp - combustionEnded.timestamp > COMBUSTION_END_BUFFER;
    })

    //If Firestarter was active, filter it out
    hotStreakRemovals = hotStreakRemovals.filter(hs => {
      const targetHealth = this.standardChecks.getTargetHealth(hs);
      return !this.hasFirestarter || (targetHealth && targetHealth < FIRESTARTER_THRESHOLD);
    });

    //If Searing Touch was active, filter it out
    hotStreakRemovals = hotStreakRemovals.filter(hs => {
      const targetHealth = this.standardChecks.getTargetHealth(hs);
      return !this.hasSearingTouch || (targetHealth && targetHealth > SEARING_TOUCH_THRESHOLD);
    });

    //If Firestorm is active, filter it out
    hotStreakRemovals = hotStreakRemovals.filter(hs => !this.hasFirestarter || !this.selectedCombatant.hasBuff(SPELLS.FIRESTORM_BUFF.id, hs.timestamp))

    //If Pyroclasm was removed within 200ms of the Hot Streak being removed then they probably precast a hard cast Pyroblast, so filter it out
    hotStreakRemovals = hotStreakRemovals.filter(hs => {
      const pyroclasmRemoved = this.standardChecks.getEvents(true, EventType.RemoveBuff, 1, hs.timestamp, PROC_BUFFER, SPELLS.PYROCLASM_BUFF);
      return !this.hasPyroclasm || !pyroclasmRemoved;
    })
    return hotStreakRemovals.length
  }

  get castBeforeHotStreakUtil() {
    return (
      1 -
      this.missingHotStreakPreCast() /
        this.standardChecks.countEvents(EventType.ApplyBuff, SPELLS.HOT_STREAK)
    );
  }

  get castBeforeHotStreakThresholds() {
    return {
      actual: this.castBeforeHotStreakUtil,
      isLessThan: {
        minor: 0.85,
        average: 0.75,
        major: 0.65,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
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
            {formatPercentage(this.castBeforeHotStreakUtil)}% Utilization
          </Trans>,
        )
        .recommended(`${formatPercentage(recommended)}% is recommended`),
    );
  }
}

export default HotStreakPreCasts;
