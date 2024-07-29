import { formatNumber, formatPercentage } from 'common/format';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  CastEvent,
  UpdateSpellUsableEvent,
  UpdateSpellUsableType,
} from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import SpellUsable from 'parser/shared/modules/SpellUsable';

class PhoenixFlames extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };
  protected spellUsable!: SpellUsable;

  chargesCapped = false;
  cappedTimestamp = 0;
  timeSpentCapped = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.UpdateSpellUsable.by(SELECTED_PLAYER).spell(TALENTS.PHOENIX_FLAMES_TALENT),
      this.onCooldownUpdate,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.PHOENIX_FLAMES_TALENT),
      this.onPhoenixCast,
    );
  }

  onCooldownUpdate(event: UpdateSpellUsableEvent) {
    if (event.updateType !== UpdateSpellUsableType.EndCooldown) {
      return;
    }
    this.chargesCapped = true;
    this.cappedTimestamp = event.timestamp;
  }

  onPhoenixCast(event: CastEvent) {
    if (!this.chargesCapped) {
      return;
    }
    this.timeSpentCapped += event.timestamp - this.cappedTimestamp;
    this.chargesCapped = false;
    this.cappedTimestamp = 0;
  }

  get percentCapped() {
    return this.timeSpentCapped / this.owner.fightDuration;
  }

  get cappedSeconds() {
    return this.timeSpentCapped / 1000;
  }

  get phoenixCappedChargesThresholds() {
    return {
      actual: this.percentCapped,
      isGreaterThan: {
        minor: 0.1,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.phoenixCappedChargesThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You spent {formatNumber(this.cappedSeconds)}s ({formatPercentage(this.percentCapped)}% of
          the fight) capped on <SpellLink spell={TALENTS.PHOENIX_FLAMES_TALENT} /> charges. While it
          is important to pool charges for your next <SpellLink spell={TALENTS.COMBUSTION_TALENT} />
          , you should also try to avoid capping on charges whenever possible. To avoid this, you
          should use a charge of <SpellLink spell={TALENTS.PHOENIX_FLAMES_TALENT} /> if you are
          capped or are about to cap on charges.
        </>,
      )
        .icon(TALENTS.PHOENIX_FLAMES_TALENT.icon)
        .actual(`${formatPercentage(actual)}% of fight capped on charges`)
        .recommended(`${formatPercentage(recommended)}% is recommended`),
    );
  }
}
export default PhoenixFlames;
