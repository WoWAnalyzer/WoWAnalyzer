import { Trans } from '@lingui/macro';
import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import { highlightInefficientCast } from 'interface/report/Results/Timeline/Casts';
import Analyzer from 'parser/core/Analyzer';
import { EventType, CastEvent } from 'parser/core/Events';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import EventHistory from 'parser/shared/modules/EventHistory';

class CombustionSpellUsage extends Analyzer {
  static dependencies = {
    eventHistory: EventHistory,
  };
  protected eventHistory!: EventHistory;

  // prettier-ignore
  fireballCastsDuringCombustion = () => {
    
    const casts = this.eventHistory.getEventsWithBuff(TALENTS.COMBUSTION_TALENT, EventType.Cast, SPELLS.FIREBALL);

    //If the Begin Cast event was before Combustion started, then disregard it.
    const fireballCasts = casts.filter((e: CastEvent) => {
      const beginCast = this.eventHistory.getEvents(EventType.BeginCast, { searchBackwards: true, spell: SPELLS.FIREBALL, count: 1, startTimestamp: e.timestamp })[0];
      return beginCast ? this.selectedCombatant.hasBuff(TALENTS.COMBUSTION_TALENT.id, beginCast.timestamp) : false;
    });
    const tooltip = `This Fireball was cast during Combustion. Since Combustion has a short duration, you are better off using your instant abilities to get as many instant/free Pyroblasts as possible. If you run out of instant abilities, cast Scorch instead since it has a shorter cast time.`;
    fireballCasts && highlightInefficientCast(fireballCasts, tooltip);
    return fireballCasts.length;
  }

  get fireballBeginCasts() {
    return (
      this.eventHistory.getEventsWithBuff(
        TALENTS.COMBUSTION_TALENT,
        EventType.BeginCast,
        SPELLS.FIREBALL,
      ).length || 0
    );
  }

  get fireballDuringCombustionThresholds() {
    return {
      actual:
        this.fireballCastsDuringCombustion() /
          this.eventHistory.getEvents(EventType.Cast, {
            searchBackwards: true,
            spell: TALENTS.COMBUSTION_TALENT,
          }).length || 0,
      isGreaterThan: {
        minor: 0,
        average: 0.5,
        major: 1,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  suggestions(when: When) {
    when(this.fireballDuringCombustionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You started to cast <SpellLink id={SPELLS.FIREBALL.id} /> {this.fireballBeginCasts} times
          ({this.fireballDuringCombustionThresholds.actual.toFixed(2)} per Combustion), and
          completed {this.fireballCastsDuringCombustion} casts, during{' '}
          <SpellLink id={TALENTS.COMBUSTION_TALENT.id} />. Combustion has a short duration, so you
          are better off using instant abilities like <SpellLink id={SPELLS.FIRE_BLAST.id} /> or{' '}
          <SpellLink id={TALENTS.PHOENIX_FLAMES_TALENT.id} />. If you run out of instant cast
          abilities, use <SpellLink id={SPELLS.SCORCH.id} /> instead of Fireball since it has a
          shorter cast time.
        </>,
      )
        .icon(TALENTS.COMBUSTION_TALENT.icon)
        .actual(
          <Trans id="mage.fire.suggestions.combustion.castsPerCombustion">
            {this.fireballDuringCombustionThresholds.actual.toFixed(2)} Casts Per Combustion
          </Trans>,
        )
        .recommended(`${formatNumber(recommended)} is recommended`),
    );
  }
}
export default CombustionSpellUsage;
