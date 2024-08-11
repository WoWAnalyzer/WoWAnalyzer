import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, HealEvent } from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import BoringValueText from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

const NUM_TICKS = 3;

class YulonsWhisper extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  healCount: number = 0;
  combatants!: Combatants;
  MTCount: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.YULONS_WHISPER_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.MANA_TEA_CAST), this.onMT);
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.YULONS_WHISPER_HEAL),
      this.onHeal,
    );
  }

  onHeal(event: HealEvent) {
    this.healCount += 1;
  }

  onMT(event: CastEvent) {
    this.MTCount += 1;
  }

  get averageYWCount() {
    return this.healCount / this.MTCount / NUM_TICKS;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(20)}
        size="flexible"
        category={STATISTIC_CATEGORY.THEORYCRAFT}
      >
        <BoringValueText
          label={
            <>
              Average <SpellLink spell={TALENTS_MONK.YULONS_WHISPER_TALENT} /> targets
            </>
          }
        >
          {this.averageYWCount.toFixed(2)}
        </BoringValueText>
      </Statistic>
    );
  }
}

export default YulonsWhisper;
