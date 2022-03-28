import { Trans } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import COVENANTS from 'game/shadowlands/COVENANTS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, RemoveBuffEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';

import { ARCANE_BLAST_PER_RADIANT_SPARK } from '@wowanalyzer/mage';

const debug = false;

class RadiantSpark extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };
  protected abilityTracker!: AbilityTracker;

  hasHarmonicEcho: boolean;

  arcaneBlastCasts = 0;
  badRadiantSpark = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasCovenant(COVENANTS.KYRIAN.id);
    this.hasHarmonicEcho = this.selectedCombatant.hasLegendary(SPELLS.HARMONIC_ECHO);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.ARCANE_BLAST),
      this.onArcaneBlastCast,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.RADIANT_SPARK),
      this.onRadiantSparkRemoved,
    );
  }

  onArcaneBlastCast(event: CastEvent) {
    //If Radiant Spark is not active, then we do not need to check the Arcane Blast cast.
    if (!this.selectedCombatant.hasBuff(SPELLS.RADIANT_SPARK.id)) {
      return;
    }

    this.arcaneBlastCasts += 1;
  }

  onRadiantSparkRemoved(event: RemoveBuffEvent) {
    //Confirm whether 5 Arcane Blast casts (4 with Harmonic Echo) were cast during Radiant Spark
    const arcaneBlastCountThreshold = this.hasHarmonicEcho
      ? ARCANE_BLAST_PER_RADIANT_SPARK - 1
      : ARCANE_BLAST_PER_RADIANT_SPARK;
    if (this.arcaneBlastCasts < arcaneBlastCountThreshold) {
      debug &&
        this.log(
          'Not enough Arcane Blast casts during Radiant Spark - Casted ' +
            this.arcaneBlastCasts +
            ', expected ' +
            arcaneBlastCountThreshold,
        );
      this.badRadiantSpark += 1;
    }
    this.arcaneBlastCasts = 0;
  }

  get radiantSparkUtilization() {
    return 1 - this.badRadiantSpark / this.abilityTracker.getAbility(SPELLS.RADIANT_SPARK.id).casts;
  }

  get radiantSparkUsageThresholds() {
    return {
      actual: this.radiantSparkUtilization,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.8,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.radiantSparkUsageThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You did not cast <SpellLink id={SPELLS.ARCANE_BLAST.id} /> enough during{' '}
          <SpellLink id={SPELLS.RADIANT_SPARK.id} /> {this.badRadiantSpark} times. Because{' '}
          <SpellLink id={SPELLS.ARCANE_BLAST.id} /> hits very hard at 4{' '}
          <SpellLink id={SPELLS.ARCANE_CHARGE.id} />
          s, you should use the damage buff from <SpellLink id={SPELLS.RADIANT_SPARK.id} /> to
          increase their damage even further. So, you should ensure that you are getting{' '}
          {ARCANE_BLAST_PER_RADIANT_SPARK} ({ARCANE_BLAST_PER_RADIANT_SPARK - 1} with{' '}
          <SpellLink id={SPELLS.HARMONIC_ECHO.id} />) <SpellLink id={SPELLS.ARCANE_BLAST.id} />{' '}
          casts in before <SpellLink id={SPELLS.RADIANT_SPARK.id} /> ends.
        </>,
      )
        .icon(SPELLS.RADIANT_SPARK.icon)
        .actual(
          <Trans id="mage.arcane.suggestions.radiantSpark.utilization">
            {formatPercentage(this.radiantSparkUtilization)}% Utilization
          </Trans>,
        )
        .recommended(`${formatPercentage(recommended)}% is recommended`),
    );
  }
}

export default RadiantSpark;
