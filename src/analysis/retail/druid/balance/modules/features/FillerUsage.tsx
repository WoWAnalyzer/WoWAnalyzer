import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import { hardcastTargetsHit } from '../../normalizers/CastLinkNormalizer';

// minimum targets Starfire must hit for it to be worth to cast in lunar eclipse/CA
export const STARFIRE_TARGETS_TO_STARFIRE_DURING_CDS = 2;
// minimum targets Starfire must hit for it to be worth to enter Lunar Eclipse
export const STARFIRE_TARGETS_TO_ENTER_SOLAR = 3;

const MINOR_THRESHOLD = 0;
const AVERAGE_THRESHOLD = 0.05;
const MAJOR_THRESHOLD = 0.1;

class FillerUsage extends Analyzer {
  totalFillerCasts: number = 0;
  badFillerCasts: number = 0;

  constructor(options: Options) {
    super(options);

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.STARFIRE), this.onStarfire);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.WRATH_MOONKIN),
      this.onWrath,
    );
  }

  onStarfire(event: CastEvent) {
    this.totalFillerCasts += 1;
    if (
      !(
        this.selectedCombatant.hasBuff(SPELLS.ECLIPSE_LUNAR.id) ||
        this.selectedCombatant.hasBuff(SPELLS.ECLIPSE_SOLAR.id)
      ) &&
      hardcastTargetsHit(event) > STARFIRE_TARGETS_TO_ENTER_SOLAR
    ) {
      this.badFillerCasts += 1;
      event.meta = event.meta || {};
      event.meta.isInefficientCast = true;
      event.meta.inefficientCastReason = `You should enter Solar Eclipse only when Starfire can hit more than ${STARFIRE_TARGETS_TO_ENTER_SOLAR} targets.`;
    }
    if (
      (this.selectedCombatant.hasBuff(SPELLS.ECLIPSE_SOLAR.id) &&
        !this.selectedCombatant.hasBuff(SPELLS.ECLIPSE_LUNAR.id)) ||
      (this.selectedCombatant.hasBuff(SPELLS.ECLIPSE_SOLAR.id) &&
        this.selectedCombatant.hasBuff(SPELLS.ECLIPSE_LUNAR.id) &&
        hardcastTargetsHit(event) < STARFIRE_TARGETS_TO_STARFIRE_DURING_CDS &&
        !this.selectedCombatant.hasBuff(SPELLS.WARRIOR_OF_ELUNE.id))
    ) {
      this.badFillerCasts += 1;
      event.meta = event.meta || {};
      event.meta.isInefficientCast = true;
      event.meta.inefficientCastReason = `You should never cast Starfire during Solar Eclipse and when it hits ${STARFIRE_TARGETS_TO_STARFIRE_DURING_CDS} or less targets during cooldowns.`;
    }
  }

  // TODO: Make more accurate by counting active targets
  onWrath(event: CastEvent) {
    this.totalFillerCasts += 1;
    if (
      this.selectedCombatant.hasBuff(SPELLS.ECLIPSE_LUNAR.id) &&
      !this.selectedCombatant.hasBuff(SPELLS.ECLIPSE_SOLAR.id)
    ) {
      event.meta = event.meta || {};
      event.meta.isInefficientCast = true;
      event.meta.inefficientCastReason = `You should never cast Wrath in Lunar Eclipse unless you are about to enter CA/Inc on single target.`;
    }
  }

  get percentBadFillers() {
    return this.badFillerCasts / this.totalFillerCasts || 0;
  }

  get percentGoodFillers() {
    return 1 - this.percentBadFillers;
  }

  get suggestionThresholds() {
    return {
      actual: this.percentBadFillers,
      isGreaterThan: {
        minor: MINOR_THRESHOLD,
        average: AVERAGE_THRESHOLD,
        major: MAJOR_THRESHOLD,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get goodCastSuggestionThresholds() {
    return {
      actual: this.percentGoodFillers,
      isLessThan: {
        minor: 1 - MINOR_THRESHOLD,
        average: 1 - AVERAGE_THRESHOLD,
        major: 1 - MAJOR_THRESHOLD,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You cast the wrong filler spell {this.badFillerCasts} times -{' '}
          {formatPercentage(actual, 1)}% of total filler casts. You should cast{' '}
          <SpellLink spell={SPELLS.WRATH_MOONKIN} /> during and after{' '}
          <SpellLink spell={SPELLS.ECLIPSE_SOLAR} />, and you should cast{' '}
          <SpellLink spell={SPELLS.STARFIRE} /> during and after{' '}
          <SpellLink spell={SPELLS.ECLIPSE_LUNAR} />.
          <br />
        </>,
      )
        .icon(SPELLS.ECLIPSE.icon)
        .actual(
          t({
            id: 'druid.balance.suggestions.filler.efficiency',
            message: `${formatPercentage(actual, 1)}% wrong filler spell casts`,
          }),
        )
        .recommended(`none are recommended`),
    );
  }
}

export default FillerUsage;
