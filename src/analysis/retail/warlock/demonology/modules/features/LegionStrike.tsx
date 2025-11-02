import { formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class LegionStrike extends Analyzer {
  get suggestionThresholds() {
    return {
      actual: this.casts,
      isLessThan: {
        minor: 1,
        average: 0,
        major: 0,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  casts = 0;
  damage = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER_PET).spell(SPELLS.FELGUARD_LEGION_STRIKE),
      this.legionStrikeCast,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER_PET).spell(SPELLS.FELGUARD_LEGION_STRIKE),
      this.legionStrikeDamage,
    );
  }

  _isPermanentFelguardEvent(event: CastEvent | DamageEvent) {
    // permanent Felguard doesn't have sourceInstance
    return !event.sourceInstance;
  }

  legionStrikeCast(event: CastEvent) {
    // Grimoire: Felguard casts Legion Strike with the same spell ID, only count LS casts from the permanent pet
    if (this._isPermanentFelguardEvent(event)) {
      this.casts += 1;
    }
  }

  legionStrikeDamage(event: DamageEvent) {
    if (this._isPermanentFelguardEvent(event)) {
      this.damage += event.amount + (event.absorbed || 0);
    }
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.THEORYCRAFT}
        position={STATISTIC_ORDER.UNIMPORTANT(1)}
        size="flexible"
        tooltip={`${formatThousands(this.damage)} damage`}
      >
        <BoringSpellValueText spell={SPELLS.FELGUARD_LEGION_STRIKE}>
          <ItemDamageDone amount={this.damage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default LegionStrike;
