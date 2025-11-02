import TALENTS from 'common/TALENTS/mage';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  CastEvent,
  UpdateSpellUsableEvent,
  UpdateSpellUsableType,
} from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
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
}
export default PhoenixFlames;
