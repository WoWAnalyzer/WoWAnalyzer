import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { HealEvent } from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { TALENTS_SHAMAN } from 'common/TALENTS';
import SPELLS from 'common/SPELLS';
import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from 'analysis/retail/shaman/restoration/constants';
import TalentSpellText from 'parser/ui/TalentSpellText';

const UNDERCURRENT_HEALING_INCREASE: number[] = [0, 0.005, 0.01];

class Undercurrent extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  protected combatants!: Combatants;

  healing = 0;
  talentRank = 0;

  constructor(options: Options) {
    super(options);

    this.talentRank = this.selectedCombatant.getTalentRank(TALENTS_SHAMAN.UNDERCURRENT_TALENT);
    this.active = this.talentRank > 0;

    this.addEventListener(
      Events.heal
        .by(SELECTED_PLAYER | SELECTED_PLAYER_PET)
        .spell(ABILITIES_AFFECTED_BY_HEALING_INCREASES),
      this.heal,
    );
  }

  heal(event: HealEvent) {
    const target = this.combatants.players[event.targetID];
    if (!target) {
      return;
    }

    const undercurrentHealIncrease =
      this.selectedCombatant.getBuffStacks(SPELLS.UNDERCURRENT_BUFF.id) *
      UNDERCURRENT_HEALING_INCREASE[this.talentRank];
    this.healing += calculateEffectiveHealing(event, undercurrentHealIncrease);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(20)}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
      >
        <TalentSpellText talent={TALENTS_SHAMAN.UNDERCURRENT_TALENT}>
          <ItemHealingDone amount={this.healing} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default Undercurrent;
