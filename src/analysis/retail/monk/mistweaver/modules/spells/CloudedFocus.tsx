import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  CastEvent,
  HealEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import ItemManaGained from 'parser/ui/ItemManaGained';
import Statistic from 'parser/ui/Statistic';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';

const BUFF_AMOUNT_PER_STACK = 0.2;

/**
 * Whenever you cast a vivify or enveloping mist during soothing mist's channel you gain a stack of clouded focus which increases their healing by 20% and descreases their
 * mana cost by 20% as well. You can have up to 3 stack but you lose all the stacks when you stop channeling soothing mist.
 */
class CloudedFocus extends Analyzer {
  manaSaved: number = 0;
  healingDone: number = 0;

  stacks: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.CLOUDED_FOCUS_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.CLOUDED_FOCUS_BUFF),
      this.applybuff,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.CLOUDED_FOCUS_BUFF),
      this.applyBuffStack,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.CLOUDED_FOCUS_BUFF),
      this.removeBuff,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell([SPELLS.VIVIFY, TALENTS_MONK.ENVELOPING_MIST_TALENT]),
      this.calculateManaEffect,
    );
    this.addEventListener(
      Events.heal
        .by(SELECTED_PLAYER)
        .spell([SPELLS.VIVIFY, TALENTS_MONK.ENVELOPING_MIST_TALENT, SPELLS.ENVELOPING_BREATH_HEAL]),
      this.calculateHealingEffect,
    );
  }

  calculateManaEffect(event: CastEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.INNERVATE.id)) {
      return;
    }

    let cost = event.rawResourceCost ? event.rawResourceCost[0] : 0;
    if (this.selectedCombatant.hasBuff(TALENTS_MONK.MANA_TEA_TALENT.id)) {
      cost /= 2;
    }

    this.manaSaved += cost - cost * (1 - this.stacks * BUFF_AMOUNT_PER_STACK);
  }

  calculateHealingEffect(event: HealEvent) {
    this.healingDone += calculateEffectiveHealing(event, this.stacks * BUFF_AMOUNT_PER_STACK);
  }

  applybuff(event: ApplyBuffEvent) {
    this.stacks = 1;
  }

  applyBuffStack(event: ApplyBuffStackEvent) {
    this.stacks = event.stack;
  }

  removeBuff(event: RemoveBuffEvent) {
    this.stacks = 0;
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink id={TALENTS_MONK.CLOUDED_FOCUS_TALENT.id} />}
        value={`${formatPercentage(
          this.owner.getPercentageOfTotalHealingDone(this.healingDone),
        )} %`}
      />
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <TalentSpellText talent={TALENTS_MONK.CLOUDED_FOCUS_TALENT}>
          <ItemHealingDone amount={this.healingDone} />
          <br />
          <ItemManaGained amount={this.manaSaved} useAbbrev />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default CloudedFocus;
