import TALENTS from 'common/TALENTS/priest';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, CastEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

// Example Log: /report/PNYB4zgrnR86h7Lc/6-Normal+Zek'voz,+Herald+of+N'zoth/Khadaj
class AngelicFeather extends Analyzer {
  angelicFeatherCasts = 0;
  angelicFeatherEffects = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.ANGELIC_FEATHER_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.ANGELIC_FEATHER_TALENT),
      this.onCast,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(TALENTS.ANGELIC_FEATHER_TALENT),
      this.onApplyBuff,
    );
  }

  onCast(event: CastEvent) {
    this.angelicFeatherCasts += 1;
  }

  onApplyBuff(event: ApplyBuffEvent) {
    this.angelicFeatherEffects += 1;
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(2)}
      >
        <BoringSpellValueText spell={TALENTS.ANGELIC_FEATHER_TALENT}>
          {this.angelicFeatherCasts} Feather(s) cast
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default AngelicFeather;
