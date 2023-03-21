import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_EVOKER } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveHealing, calculateOverhealing } from 'parser/core/EventCalculateLib';
import Events, { ApplyBuffStackEvent, HealEvent } from 'parser/core/Events';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { getHealEvents } from '../../normalizers/CastLinkNormalizer';

const INCREASE_PER_STACK = 0.3;

class Ouroboros extends Analyzer {
  effectiveHealing: number = 0;
  overhealing: number = 0;
  totalConsumes: number = 0;
  stacks: number = 0;
  countedTimestamps: Set<number> = new Set<number>();

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_EVOKER.OUROBOROS_TALENT);
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.OUROBOROS_BUFF),
      this.onBuffApply,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.EMERALD_BLOSSOM),
      this.onHealBatch,
    );
  }

  onBuffApply(event: ApplyBuffStackEvent) {
    this.stacks += 1;
  }

  onHealBatch(event: HealEvent) {
    if (this.countedTimestamps.has(event.timestamp)) {
      return;
    }

    const allHealingEvents = getHealEvents(event);
    this.totalConsumes += 1;
    for (let i = 0; i < allHealingEvents.length; i += 1) {
      const ev = allHealingEvents[i];
      this.effectiveHealing += calculateEffectiveHealing(ev, this.stacks * INCREASE_PER_STACK);
      this.overhealing += calculateOverhealing(ev, this.stacks * INCREASE_PER_STACK);
    }
    this.countedTimestamps.add(event.timestamp);
    this.stacks = 0;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(5)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <ul>
            <li>Total effective healing: {formatNumber(this.effectiveHealing)}</li>
            <li>Total overhealing: {formatNumber(this.overhealing)}</li>
          </ul>
        }
      >
        <TalentSpellText talent={TALENTS_EVOKER.OUROBOROS_TALENT}>
          <ItemHealingDone amount={this.effectiveHealing} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default Ouroboros;
