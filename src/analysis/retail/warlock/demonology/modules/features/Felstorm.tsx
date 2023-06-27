import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import { calculateMaxCasts } from 'parser/core/EventCalculateLib';
import Events, { ApplyBuffEvent, CastEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';

const FELSTORM_COOLDOWN = 30;
// when Demonic Strength is cast, then AFTER the cast, Felguard charges at the target, and after he arrives, does the Felstorm
// this delay is so that every Felstorm caused by Demonic Strength accounts for the charge "travel" time
const DEMONIC_STRENGTH_BUFFER = 1500;

class Felstorm extends Analyzer {
  get maxCasts() {
    return Math.ceil(calculateMaxCasts(FELSTORM_COOLDOWN, this.owner.fightDuration));
  }

  get suggestionThresholds() {
    const percentage = this.mainPetFelstormCount / this.maxCasts || 0;
    return {
      actual: percentage,
      isLessThan: {
        minor: 0.9,
        average: 0.8,
        major: 0.7,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  _lastDemonicStrengthCast: number | null = null;
  mainPetFelstormCount = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.DEMONIC_STRENGTH_TALENT),
      this.demonicStrengthCast,
    );
    this.addEventListener(
      Events.applybuff.to(SELECTED_PLAYER_PET).spell(SPELLS.FELSTORM_BUFF),
      this.applyFelstormBuff,
    );
  }

  demonicStrengthCast(event: CastEvent) {
    this._lastDemonicStrengthCast = event.timestamp;
  }

  // works with either direct /cast Felstorm or by using the Command Demon ability (if direct /cast Felstorm, then the player didn't cast it, but this buff gets applied either way)
  applyFelstormBuff(event: ApplyBuffEvent) {
    if (
      this._lastDemonicStrengthCast &&
      event.timestamp <= this._lastDemonicStrengthCast + DEMONIC_STRENGTH_BUFFER
    ) {
      // casting Demonic Strength triggers Felstorm as well, but we care about the pet ability itself, which is on separate cooldown
      return;
    }
    if (!event.sourceInstance) {
      // permanent Felguard doesn't have sourceInstance, while Grimoire: Felguard does (both use Felstorm in the exact same way)
      this.mainPetFelstormCount += 1;
    }
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You should use your Felguard's <SpellLink id={SPELLS.FELSTORM_BUFF.id} /> more often,
          preferably on cooldown.
        </>,
      )
        .icon(SPELLS.FELSTORM_BUFF.icon)
        .actual(
          `${this.mainPetFelstormCount} out of ${this.maxCasts} (${formatPercentage(
            actual,
          )} %) Felstorm casts.`,
        )
        .recommended(`> ${formatPercentage(recommended)} % is recommended`),
    );
  }
}

export default Felstorm;
