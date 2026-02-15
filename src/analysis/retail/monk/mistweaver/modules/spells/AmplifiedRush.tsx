import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';
import { isFromRenewingMist } from '../../normalizers/CastLinkNormalizer';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import { AMPLIFIED_RUSH_HEALING_BOOST } from '../../constants';
import Statistic from 'parser/ui/Statistic';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

class AmplifiedRush extends Analyzer {
  healing: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.AMPLIFIED_RUSH_TALENT);
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.GUSTS_OF_MISTS),
      this.onHeal,
    );
  }

  onHeal(event: HealEvent) {
    if (isFromRenewingMist(event)) {
      this.healing += calculateEffectiveHealing(event, AMPLIFIED_RUSH_HEALING_BOOST);
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(1)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <TalentSpellText talent={TALENTS_MONK.AMPLIFIED_RUSH_TALENT}>
          <ItemHealingDone amount={this.healing} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default AmplifiedRush;
