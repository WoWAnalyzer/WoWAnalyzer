import { defineMessage, Trans } from '@lingui/macro';
import { i18n } from '@lingui/core';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/deathknight';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
  CastEvent,
} from 'parser/core/Events';
import { NumberThreshold, ThresholdStyle, When } from 'parser/core/ParseResults';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { addInefficientCastReason } from 'parser/core/EventMetaLib';

const REFRESH_AT_STACKS = 7;

const REFRESH_AT_SECONDS = 6;
const BS_DURATION = 30;
const MR_GAIN = 3;

class MarrowrendUsage extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  protected abilityTracker!: AbilityTracker;
  /*
    currentBoneShieldBuffer contains the BS stacks caused by the actual MR cast
    since the applyBuffStack event happens before the cast event
  */

  currentBoneShieldStacks = 0;
  currentBoneShieldBuffer = 0;
  lastMarrowrendCast = 0;

  bsStacksWasted = 0;

  refreshMRCasts = 0;
  totalMRCasts = 0;

  badMRCasts = 0;

  refreshAtStacks = REFRESH_AT_STACKS; // contains number for the tooltip for proper MR-usage, not used for calculations

  totalStacksGenerated = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.BONE_SHIELD),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.applybuffstack.to(SELECTED_PLAYER).spell(SPELLS.BONE_SHIELD),
      this.onApplyBuffStack,
    );
    this.addEventListener(
      Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.BONE_SHIELD),
      this.onRemoveBuff,
    );
    this.addEventListener(
      Events.removebuffstack.to(SELECTED_PLAYER).spell(SPELLS.BONE_SHIELD),
      this.onRemoveBuffStack,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.MARROWREND_TALENT),
      this.onCast,
    );
  }

  onApplyBuff(event: ApplyBuffEvent) {
    this.currentBoneShieldBuffer += 1;
  }

  onApplyBuffStack(event: ApplyBuffStackEvent) {
    this.currentBoneShieldBuffer += 1;
    this.currentBoneShieldStacks = event.stack;
  }

  onRemoveBuff(event: RemoveBuffEvent) {
    this.currentBoneShieldStacks = 0;
  }

  onRemoveBuffStack(event: RemoveBuffStackEvent) {
    this.currentBoneShieldBuffer = 0;
    this.currentBoneShieldStacks = event.stack;
  }

  onCast(event: CastEvent) {
    // don't count exterminate casts. you're not really casting MR, you're casting exterminate
    const exterminateCast =
      this.selectedCombatant.hasBuff(SPELLS.EXTERMINATE_BUFF) ||
      this.selectedCombatant.hasBuff(SPELLS.EXTERMINATE_PAINFUL_DEATH_BUFF);
    //don't add to wasted casts if MR casts was at ~6sec left on BS duration
    const durationLeft = BS_DURATION - (event.timestamp - this.lastMarrowrendCast) / 1000;

    if (durationLeft <= REFRESH_AT_SECONDS) {
      this.refreshMRCasts += 1;
    } else if (!exterminateCast) {
      const boneShieldStacks = this.currentBoneShieldStacks - this.currentBoneShieldBuffer;
      let badCast = '';

      if (boneShieldStacks > REFRESH_AT_STACKS) {
        // this was a wasted charge for sure
        const wasted = MR_GAIN - this.currentBoneShieldBuffer;
        this.badMRCasts += 1;
        this.bsStacksWasted += wasted;
        badCast = i18n._(
          defineMessage({
            id: 'deathknight.blood.marrowrendUsage.badCast',
            message: `You made this cast with ${boneShieldStacks} stacks of Bone Shield while it had ${durationLeft.toFixed(
              1,
            )} seconds left, wasting ${wasted} charges.`,
          }),
        );
      }

      if (badCast) {
        addInefficientCastReason(event, badCast);
      }
    }

    this.totalStacksGenerated += this.currentBoneShieldBuffer;
    this.currentBoneShieldBuffer = 0;
    this.lastMarrowrendCast = event.timestamp;
    this.totalMRCasts += 1;
  }

  get totalBoneShieldStacksGenerated() {
    return this.totalStacksGenerated;
  }

  get wastedBoneShieldStacksPercent() {
    return this.bsStacksWasted / (this.totalStacksGenerated + this.bsStacksWasted);
  }

  get marrowrendCasts() {
    return this.totalMRCasts;
  }

  get refreshWithStacks() {
    return this.refreshAtStacks;
  }

  get suggestionThresholds(): NumberThreshold {
    return {
      actual: this.wastedBoneShieldStacksPercent,
      isGreaterThan: {
        minor: 0,
        average: 0.1,
        major: 0.2,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get suggestionThresholdsEfficiency(): NumberThreshold {
    return {
      actual: 1 - this.wastedBoneShieldStacksPercent,
      isLessThan: {
        minor: 1,
        average: 0.9,
        major: 0.8,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <Trans id="deathknight.blood.marrowrendUsage.suggestion.suggestion">
          You casted {this.badMRCasts} Marrowrends with more than {REFRESH_AT_STACKS} stacks of{' '}
          <SpellLink spell={SPELLS.BONE_SHIELD} /> that were not about to expire, wasting{' '}
          {this.bsStacksWasted} stacks.
          <br />
          Cast <SpellLink spell={TALENTS.HEART_STRIKE_TALENT} /> instead if you are at{' '}
          {this.refreshAtStacks} stacks or above.
        </Trans>,
      )
        .icon(TALENTS.MARROWREND_TALENT.icon)
        .actual(
          defineMessage({
            id: 'deathknight.blood.marrowrendUsage.suggestion.actual',
            message: `${formatPercentage(actual)}% wasted ${SPELLS.BONE_SHIELD.name} stacks`,
          }),
        )
        .recommended(
          defineMessage({
            id: 'deathknight.blood.marrowrendUsage.suggestion.recommended',
            message: `${this.bsStacksWasted} stacks wasted, ${this.totalStacksGenerated} stacks generated`,
          }),
        ),
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(3)}
        size="flexible"
        tooltip={
          <Trans id="deathknight.blood.marrowrendUsage.statistic.tooltip">
            {this.refreshMRCasts} casts to refresh Bone Shield, those do not count towards bad
            casts.
            <br />
            {this.badMRCasts} casts with more than {REFRESH_AT_STACKS} stacks of Bone Shield wasting{' '}
            {this.bsStacksWasted} stacks.
            <br />
            <br />
            Avoid casting Marrowrend unless you have {this.refreshAtStacks} or less stacks or if
            Bone Shield has less than 6sec of its duration left.
          </Trans>
        }
      >
        <BoringSpellValueText spell={TALENTS.MARROWREND_TALENT}>
          <Trans id="deathknight.blood.marrowrendUsage.statistic">
            {this.badMRCasts} / {this.totalMRCasts} <small>bad casts</small>
          </Trans>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default MarrowrendUsage;
