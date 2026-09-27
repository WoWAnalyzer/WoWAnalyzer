import { TALENTS_MONK } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent, GetRelatedEvents, HealEvent } from 'parser/core/Events';
import { calculateEffectiveDamage, calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Statistic from 'parser/ui/Statistic';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { AT_RSK } from '../../normalizers/EventLinks/EventLinkConstants';
import { getCurrentRSKTalentDamage } from '../../constants';
import { YULONS_KNOWLEDGE_RSK_INCREASE } from 'analysis/retail/monk/shared/hero/ConduitOfTheCelestials/constants';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class YulonsKnowledge extends Analyzer {
  damage = 0;
  talent = TALENTS_MONK.YULONS_KNOWLEDGE_TALENT;
  healing = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(this.talent);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(getCurrentRSKTalentDamage(this.selectedCombatant)),
      this.onDamage,
    );
  }

  onDamage(event: DamageEvent) {
    this.damage += calculateEffectiveDamage(event, YULONS_KNOWLEDGE_RSK_INCREASE);
    this.healing += GetRelatedEvents<HealEvent>(event, AT_RSK).reduce(
      (sum, heal) => sum + calculateEffectiveHealing(heal, YULONS_KNOWLEDGE_RSK_INCREASE),
      0,
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(1)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
      >
        <TalentSpellText talent={TALENTS_MONK.YULONS_KNOWLEDGE_TALENT}>
          <div>
            <ItemHealingDone amount={this.healing} />
          </div>
          <div>
            <ItemDamageDone amount={this.damage} />
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default YulonsKnowledge;
