import { Trans } from '@lingui/macro';
import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { EventType, CastEvent } from 'parser/core/Events';
import { When, ThresholdStyle } from 'parser/core/ParseResults';

import StandardChecks from '@wowanalyzer/mage/src/StandardChecks';

class CombustionSpellUsage extends Analyzer {
  static dependencies = {
    standardChecks: StandardChecks,
  };
  protected standardChecks!: StandardChecks;

  get fireballCastsDuringCombustion() {
    const casts: any = this.standardChecks.getEventsDuringBuff(
      SPELLS.COMBUSTION,
      EventType.Cast,
      SPELLS.FIREBALL,
    );

    //If the Begin Cast event was before Combustion started, then disregard it.
    const fireballCasts = casts.filter((e: CastEvent) => {
      const beginCast = this.standardChecks.getEvents(
        EventType.BeginCast,
        1,
        e.timestamp,
        undefined,
        SPELLS.FIREBALL,
      )[0];
      return beginCast
        ? this.selectedCombatant.hasBuff(SPELLS.COMBUSTION.id, beginCast.timestamp)
        : false;
    });
    const tooltip = `This Fireball was cast during Combustion. Since Combustion has a short duration, you are better off using your instant abilities to get as many instant/free Pyroblasts as possible. If you run out of instant abilities, cast Scorch instead since it has a shorter cast time.`;
    fireballCasts && this.standardChecks.highlightInefficientCast(fireballCasts, tooltip);
    return fireballCasts.length;
  }

  get fireballBeginCasts() {
    return this.standardChecks.countEventsDuringBuff(
      SPELLS.COMBUSTION,
      EventType.BeginCast,
      SPELLS.FIREBALL,
    );
  }

  get fireballCastsPerCombustion() {
    return (
      this.fireballCastsDuringCombustion / this.standardChecks.countTotalCasts(SPELLS.COMBUSTION)
    );
  }

  get fireballDuringCombustionThresholds() {
    return {
      actual: this.fireballCastsPerCombustion,
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
          ({this.fireballCastsPerCombustion.toFixed(2)} per Combustion), and completed{' '}
          {this.fireballCastsDuringCombustion} casts, during <SpellLink id={SPELLS.COMBUSTION.id} />
          . Combustion has a short duration, so you are better off using instant abilities like{' '}
          <SpellLink id={SPELLS.FIRE_BLAST.id} /> or <SpellLink id={SPELLS.PHOENIX_FLAMES.id} />. If
          you run out of instant cast abilities, use <SpellLink id={SPELLS.SCORCH.id} /> instead of
          Fireball since it has a shorter cast time.
        </>,
      )
        .icon(SPELLS.COMBUSTION.icon)
        .actual(
          <Trans id="mage.fire.suggestions.combustion.castsPerCombustion">
            {this.fireballCastsPerCombustion.toFixed(2)} Casts Per Combustion
          </Trans>,
        )
        .recommended(`${formatNumber(recommended)} is recommended`),
    );
  }
}
export default CombustionSpellUsage;
