import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, HealEvent } from 'parser/core/Events';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { isFromEssenceFont, isFromSheilunsGift } from '../../normalizers/CastLinkNormalizer';

class SheilunsGift extends Analyzer {
  numCasts: number = 0;
  totalStacks: number = 0;
  totalHealing: number = 0;
  gomHealing: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.SHEILUNS_GIFT_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_MONK.SHEILUNS_GIFT_TALENT),
      this.onCast,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(TALENTS_MONK.SHEILUNS_GIFT_TALENT),
      this.onHeal,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.GUSTS_OF_MISTS),
      this.masterySheilunsGift,
    );
  }

  onCast(event: CastEvent) {
    this.totalStacks += this.selectedCombatant.getBuffStacks(SPELLS.SHEILUN_CLOUD_BUFF.id);
    this.numCasts += 1;
  }

  onHeal(event: HealEvent) {
    this.totalHealing += event.amount;
  }

  masterySheilunsGift(event: HealEvent) {
    if (isFromSheilunsGift(event) && !isFromEssenceFont(event)) {
      this.gomHealing += (event.amount || 0) + (event.absorbed || 0);
    }
  }

  get averageClouds() {
    return this.totalStacks / this.numCasts;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(5)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <TalentSpellText talent={TALENTS_MONK.SHEILUNS_GIFT_TALENT}>
          <ItemHealingDone amount={this.totalHealing} /> <br />
          {this.averageClouds.toFixed(1)} average clouds
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default SheilunsGift;
