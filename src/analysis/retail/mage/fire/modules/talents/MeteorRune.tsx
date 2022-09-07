import { Trans } from '@lingui/macro';
import { MS_BUFFER_100 } from 'analysis/retail/mage/shared';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
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
    const hasMeteor = this.selectedCombatant.hasTalent(SPELLS.METEOR_TALENT.id);
    const hasRuneOfPower = this.selectedCombatant.hasTalent(SPELLS.RUNE_OF_POWER_TALENT.id);
    this.active = hasMeteor && hasRuneOfPower;
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.METEOR_TALENT),
      this.onMeteor,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.RUNE_OF_POWER_TALENT),
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
    return this.abilityTracker.getAbility(SPELLS.METEOR_TALENT.id).casts;
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
          You cast <SpellLink id={SPELLS.METEOR_TALENT.id} /> without{' '}
          <SpellLink id={SPELLS.RUNE_OF_POWER_TALENT.id} /> {this.badMeteor} times. In order to get
          the most out of <SpellLink id={SPELLS.METEOR_TALENT.id} /> you should always cast it while
          being buffed by <SpellLink id={SPELLS.RUNE_OF_POWER_TALENT.id} />.
        </>,
      )
        .icon(SPELLS.METEOR_TALENT.icon)
        .actual(
          <Trans id="mage.fire.suggestions.meteor.runeOfPower.utilization">
            {formatPercentage(this.meteorUtilization)}% Utilization`
          </Trans>,
        )
        .recommended(`<${formatPercentage(recommended)}% is recommended`),
    );
  }
}

export default MeteorRune;
