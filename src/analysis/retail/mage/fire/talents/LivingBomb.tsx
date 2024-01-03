import TALENTS from 'common/TALENTS/mage';
import { formatPercentage } from 'common/format';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, GetRelatedEvents } from 'parser/core/Events';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';

const AOE_THRESHOLD = 5;

class LivingBomb extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };
  protected abilityTracker!: AbilityTracker;

  livingBombs: { timestamp: number; targetsHit: number }[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.LIVING_BOMB_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.LIVING_BOMB_TALENT),
      this.onLivingBomb,
    );
  }

  onLivingBomb(event: CastEvent) {
    const debuffs = GetRelatedEvents(event, 'ExplosionDebuff');
    this.livingBombs.push({
      timestamp: event.timestamp,
      targetsHit: debuffs.length,
    });
  }

  get badCasts() {
    return this.livingBombs.filter((c) => c.targetsHit < AOE_THRESHOLD).length || 0;
  }

  get castUtilization() {
    return 1 - this.badCasts / this.totalCasts;
  }

  get totalCasts() {
    return this.abilityTracker.getAbility(TALENTS.LIVING_BOMB_TALENT.id).casts;
  }

  get livingBombCastThresholds() {
    return {
      actual: this.castUtilization,
      isLessThan: {
        average: 1,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.livingBombCastThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You misused <SpellLink spell={TALENTS.LIVING_BOMB_TALENT} /> {this.badCasts} times.
          Although it is worth it to take the <SpellLink spell={TALENTS.LIVING_BOMB_TALENT} />{' '}
          talent in Single Target, this is only to get to the{' '}
          <SpellLink spell={TALENTS.FIREFALL_TALENT} /> talent. On Single Target there is no benefit
          to casting <SpellLink spell={TALENTS.LIVING_BOMB_TALENT} /> and it is overall considered a
          DPS loss. On AOE fights, you can get a very minor DPS increase from casting{' '}
          <SpellLink spell={TALENTS.LIVING_BOMB_TALENT} /> as filler if it will hit at least{' '}
          {AOE_THRESHOLD} targets.
        </>,
      )
        .icon(TALENTS.LIVING_BOMB_TALENT.icon)
        .actual(`${formatPercentage(actual)}% utilization`)
        .recommended(`${formatPercentage(recommended)}% is recommended`),
    );
  }
}

export default LivingBomb;
