import { formatThousands } from 'common/format';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { TALENTS_PALADIN } from 'common/TALENTS';
import SPELLS from 'common/SPELLS';
import ItemHealingDone from 'parser/ui/ItemHealingDone';

export default class Lightbearer extends Analyzer {
  healing = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_PALADIN.LIGHTBEARER_TALENT);

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.LIGHTBEARER_HEAL),
      this.lightBearerHealing,
    );
  }

  lightBearerHealing(event: HealEvent) {
    this.healing += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={`${formatThousands(this.healing)} Total healing`}
      >
        <TalentSpellText talent={TALENTS_PALADIN.LIGHTBEARER_TALENT}>
          <ItemHealingDone amount={this.healing} />
        </TalentSpellText>
      </Statistic>
    );
  }
}
