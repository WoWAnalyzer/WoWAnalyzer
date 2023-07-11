import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, RemoveBuffEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import { getHitCount } from '../normalizers/CastLinkNormalizer';

const CAST_SPELLS = [
  SPELLS.ARCANE_BLAST,
  SPELLS.ARCANE_EXPLOSION,
  TALENTS.ARCANE_ORB_TALENT,
  TALENTS.ARCANE_BARRAGE_TALENT,
  TALENTS.ARCANE_SURGE_TALENT,
];
const AOE_TARGET_THRESHOLD = 3;
const debug = false;

/*
 Radiant Spark - 10.0.5

 What does Radiant Spark Do:
  - Hits the target
  - Puts a DoT on the target
  - Builds up to 4 stacks of increasing damage

 How to use Radiant Spark:
 - Cast Rune of Power
 - Cast Radiant Spark
 - Cast 3 Arcane Blasts
 - Cast Arcane Surge if available or another Arcane Blast if on cooldown.

 Harmonic Echo just makes damage spread to nearby adds. We dont care about it for checking rules.

*/

class RadiantSpark extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };
  protected abilityTracker!: AbilityTracker;

  arcaneBlastCasts = 0;
  arcaneSurgeCasts = 0;
  aoeCasts = 0;

  hasRuneOfPowerBuff = true;

  badRadiantSpark = 0;
  badRadiantSparkBecauseOfRune = 0;
  badRadiantSparkBecauseDidntUseFourSpells = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.RADIANT_SPARK_TALENT);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(CAST_SPELLS), this.onCast);
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(TALENTS.RADIANT_SPARK_TALENT),
      this.onRadiantSparkRemoved,
    );
  }

  finishRampPhase = () => {
    this.arcaneBlastCasts = 0;
    this.arcaneSurgeCasts = 0;
    this.aoeCasts = 0;
    this.hasRuneOfPowerBuff = true;
  };

  onCast(event: CastEvent) {
    //If Radiant Spark is not active, then we do not need to check the Arcane Blast cast.
    if (!this.selectedCombatant.hasBuff(TALENTS.RADIANT_SPARK_TALENT.id)) {
      return;
    }

    const spellId = event.ability.guid;

    if (spellId === SPELLS.ARCANE_BLAST.id) {
      this.arcaneBlastCasts += 1;
    } else if (spellId === TALENTS.ARCANE_SURGE_TALENT.id) {
      this.arcaneSurgeCasts += 1;
    } else if (getHitCount(event) >= AOE_TARGET_THRESHOLD) {
      this.aoeCasts += 1;
    }
  }

  onRadiantSparkRemoved(event: RemoveBuffEvent) {
    /* All Cases - Must have Rune of Power Buff */
    /* Case 1 - Burn Phase. Need to cast 3 Blasts + Surge */
    /* Case 2 - Mini Burn. No AS. Need to cast 4 Blasts */

    let wasBadRadiantSpark = false;

    if (!this.hasRuneOfPowerBuff) {
      debug && this.log('You are not standing in Rune of Power when doing a Radiant Spark Ramp.');

      wasBadRadiantSpark = true;
      this.badRadiantSparkBecauseOfRune += 1;
    }

    if (this.arcaneSurgeCasts === 1 && this.arcaneBlastCasts < 3) {
      debug &&
        this.log(
          'You didnt cast 3 Arcane Blasts before Arcane Surge during the Radiant Spark Ramp. Casted ' +
            this.arcaneBlastCasts +
            ', expected 3',
        );

      wasBadRadiantSpark = true;
      this.badRadiantSparkBecauseDidntUseFourSpells += 1;
    } else if (this.arcaneSurgeCasts === 0 && this.arcaneBlastCasts < 4) {
      debug &&
        this.log(
          'You didnt cast 4 Arcane Blasts during the Radiant Spark Ramp. Casted ' +
            this.arcaneBlastCasts +
            ', expected 4',
        );

      wasBadRadiantSpark = true;
      this.badRadiantSparkBecauseDidntUseFourSpells += 1;
    }

    if (wasBadRadiantSpark) {
      this.badRadiantSpark += 1;
    }

    this.finishRampPhase();
  }

  get radiantSparkUtilization() {
    return (
      1 -
      this.badRadiantSpark / this.abilityTracker.getAbility(TALENTS.RADIANT_SPARK_TALENT.id).casts
    );
  }

  get radiantSparkWithRuneOfPowerUtilisation() {
    return (
      1 -
      this.badRadiantSparkBecauseOfRune /
        this.abilityTracker.getAbility(TALENTS.RADIANT_SPARK_TALENT.id).casts
    );
  }

  get radiantSparkBonusStacksUtilisation() {
    return (
      1 -
      this.badRadiantSparkBecauseDidntUseFourSpells /
        this.abilityTracker.getAbility(TALENTS.RADIANT_SPARK_TALENT.id).casts
    );
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

  get runeOfPowerWithSparkThresholds() {
    return {
      actual: this.radiantSparkWithRuneOfPowerUtilisation,
      isLessThan: {
        minor: 1,
        average: 1,
        major: 1,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get radiantSparkBonusStacksThresholds() {
    return {
      actual: this.radiantSparkBonusStacksUtilisation,
      isLessThan: {
        minor: 1,
        average: 1,
        major: 1,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  /* WHAT CAN GO WRONG WITH RADIANT SPARK
   - You cast it and dont consume the 4 stacks - IF YOU ARE NOT DEBUFFED WITH 376105 then you didnt use all the bonus damage
   - You dont use it inside Rune of Power
   - You dont use Arcane Surge last if you are using Arcane Surge
  /*

  
  /** What comes up at the bottom as actionable improvements to the player */
  suggestions(when: When) {
    when(this.runeOfPowerWithSparkThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You should be standing inside your Rune of Power for all casts during the Radiant Spark
          ramp.
        </>,
      )
        .icon(TALENTS.RADIANT_SPARK_TALENT.icon)
        .actual(
          <>
            {formatPercentage(this.radiantSparkWithRuneOfPowerUtilisation, 0)}% of Radiant Spark
            Ramps were standing in Rune of Power.
          </>,
        )
        .recommended(`${formatPercentage(recommended)}% is recommended`),
    );
    when(this.radiantSparkBonusStacksThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You should use all 4 Radiant Spark bonus damage stacks by casting damaging spells during
          Radiant Spark.
        </>,
      )
        .icon(TALENTS.RADIANT_SPARK_TALENT.icon)
        .actual(
          <>
            {formatPercentage(this.radiantSparkBonusStacksUtilisation, 0)}% of Radiant Spark Ramps
            consumed all stacks bonus damage.
          </>,
        )
        .recommended(`${formatPercentage(recommended)}% is recommended`),
    );
  }
}

export default RadiantSpark;
