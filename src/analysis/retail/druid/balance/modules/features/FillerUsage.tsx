import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';

import { cooldownAbility } from '../../constants';
import { hardcastTargetsHit } from '../../normalizers/CastLinkNormalizer';

// minimum targets Starfire must hit for it to be worth to cast in lunar eclipse/CA
export const STARFIRE_TARGETS_FOR_SOLAR = 2;

const MINOR_THRESHOLD = 0;
const AVERAGE_THRESHOLD = 0.05;
const MAJOR_THRESHOLD = 0.1;

const DEBUG = false;

class FillerUsage extends Analyzer {
  totalFillerCasts: number = 0;
  badFillerCasts: number = 0;

  constructor(options: Options) {
    super(options);

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.STARFIRE), this.onStarfire);
  }

  onStarfire(event: CastEvent) {
    this.totalFillerCasts += 1;
    if (
      !(
        this.selectedCombatant.hasBuff(SPELLS.ECLIPSE_LUNAR.id) ||
        this.selectedCombatant.hasBuff(SPELLS.ECLIPSE_SOLAR.id) ||
        cooldownAbility(this.selectedCombatant).id
      ) &&
      hardcastTargetsHit(event) < STARFIRE_TARGETS_FOR_SOLAR
    ) {
      DEBUG && console.log('Bad Starfire @ ' + this.owner.formatTimestamp(event.timestamp));
      this.badFillerCasts += 1;
      event.meta = event.meta || {};
      event.meta.isInefficientCast = true;
      event.meta.inefficientCastReason = `This was the wrong filler for the situation! you should use Wrath when out of eclipse and also in eclipse unless you can hit at least ${STARFIRE_TARGETS_FOR_SOLAR} targets.`;
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
          <br />
          The only exceptions are during{' '}
          <SpellLink spell={cooldownAbility(this.selectedCombatant)} /> you should cast Wrath
          against single targets and Starfire against multiple targets, and when you can hit{' '}
          {STARFIRE_TARGETS_FOR_SOLAR} targets you can cast Starfire event during Solar Eclipse.
          These exception are excluded from this statistic.
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
