import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';
import { TALENTS_DRUID } from 'common/TALENTS';
import Events, { HealEvent, RemoveBuffEvent } from 'parser/core/Events';
import { lifebloomSpell } from 'analysis/retail/druid/restoration/constants';
import SPELLS from 'common/SPELLS';
import { encodeEventTargetString } from 'parser/shared/modules/Enemies';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';

const DEBUG = false;

const HOT_BOOST_PER_RANK_PER_STACK = 0.03;
const MAX_STACKS = 15;
const BLOOM_BOOST_PER_RANK = 0.075;

/**
 * **Budding Leaves**
 * Spec Talent
 *
 * Lifebloom's healing is increased by (3 / 6)% each time it heals, up to (45 / 90)%.
 * Also increases Lifebloom's final bloom amount by (7.5 / 15)%.
 * ------------------------------------
 * TODO bugged? on live to cap out at 37/75% - remove this note if they fix it and change numbers if they don't
 */
export default class BuddingLeaves extends Analyzer {
  ranks: number;

  /** Mapping from encoded target ID to number of LB boost stacks they have */
  stacksByTarget: Map<string, number> = new Map<string, number>();

  /** Total healing attributable to this talent */
  totalHealing: number = 0;

  constructor(options: Options) {
    super(options);

    this.ranks = this.selectedCombatant.getTalentRank(TALENTS_DRUID.BUDDING_LEAVES_TALENT);
    this.active = this.ranks > 0;

    // confirmed refresh doesn't reset stacks, so no need to look at refreshes
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(lifebloomSpell(this.selectedCombatant)),
      this.onLbRemove,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(lifebloomSpell(this.selectedCombatant)),
      this.onLbHotHeal,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.LIFEBLOOM_BLOOM_HEAL),
      this.onLbBloomHeal,
    );
  }

  onLbRemove(event: RemoveBuffEvent) {
    // stacks reset when lb falls off
    DEBUG && console.log(`BuddingLeaves stacks fall from ${this.owner.getTargetName(event)}`);
    this.stacksByTarget.set(encodeEventTargetString(event) || '', 0);
  }

  onLbHotHeal(event: HealEvent) {
    // calc boost to current tick based on stacks on target
    const currStacks = this.stacksByTarget.get(encodeEventTargetString(event) || '') || 0;
    DEBUG &&
      console.log(
        `BuddingLeaves tick heal w/ ${currStacks} stacks on ${this.owner.getTargetName(event)}`,
      );
    this.totalHealing += calculateEffectiveHealing(
      event,
      currStacks * this.ranks * HOT_BOOST_PER_RANK_PER_STACK,
    );

    // increment stacks (up to cap)
    const newStacks = Math.min(MAX_STACKS, currStacks + 1);
    this.stacksByTarget.set(encodeEventTargetString(event) || '', newStacks);
  }

  onLbBloomHeal(event: HealEvent) {
    DEBUG && console.log(`BuddingLeaves bloom heal on ${this.owner.getTargetName(event)}`);
    this.totalHealing += calculateEffectiveHealing(event, this.ranks * BLOOM_BOOST_PER_RANK);
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.OPTIONAL(9)} // number based on talent row
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <TalentSpellText talent={TALENTS_DRUID.BUDDING_LEAVES_TALENT}>
          <ItemPercentHealingDone amount={this.totalHealing} />
        </TalentSpellText>
      </Statistic>
    );
  }
}
