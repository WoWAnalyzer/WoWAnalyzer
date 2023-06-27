
import { MS_BUFFER_100 } from 'analysis/retail/mage/shared';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import Enemies from 'parser/shared/modules/Enemies';

class MeteorRune extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    enemies: Enemies,
  };
  protected abilityTracker!: AbilityTracker;
  protected enemies!: Enemies;

  lastRuneCast = 0;
  badMeteor = 0;

  constructor(options: Options) {
    super(options);
    const hasMeteor = this.selectedCombatant.hasTalent(TALENTS.METEOR_TALENT);
    const hasRuneOfPower = this.selectedCombatant.hasTalent(TALENTS.RUNE_OF_POWER_TALENT);
    this.active = hasMeteor && hasRuneOfPower;
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.METEOR_TALENT),
      this.onMeteor,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.RUNE_OF_POWER_TALENT),
      this.onRune,
    );
  }

  onRune(event: CastEvent) {
    this.lastRuneCast = event.timestamp;
  }

  onMeteor(event: CastEvent) {
    if (
      !this.selectedCombatant.hasBuff(SPELLS.RUNE_OF_POWER_BUFF.id) &&
      event.timestamp - this.lastRuneCast > MS_BUFFER_100
    ) {
      this.badMeteor += 1;
    }
  }

  get totalMeteorCasts() {
    return this.abilityTracker.getAbility(TALENTS.METEOR_TALENT.id).casts;
  }

  get meteorUtilization() {
    return 1 - this.badMeteor / this.totalMeteorCasts;
  }

  get meteorUtilSuggestionThresholds() {
    return {
      actual: this.meteorUtilization,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.85,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.meteorUtilSuggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You cast <SpellLink id={TALENTS.METEOR_TALENT.id} /> without{' '}
          <SpellLink id={TALENTS.RUNE_OF_POWER_TALENT.id} /> {this.badMeteor} times. In order to get
          the most out of <SpellLink id={TALENTS.METEOR_TALENT.id} /> you should always cast it
          while being buffed by <SpellLink id={TALENTS.RUNE_OF_POWER_TALENT.id} />.
        </>,
      )
        .icon(TALENTS.METEOR_TALENT.icon)
        .actual(
          <>
            {formatPercentage(this.meteorUtilization)}% Utilization`
          </>,
        )
        .recommended(`<${formatPercentage(recommended)}% is recommended`),
    );
  }
}

export default MeteorRune;
