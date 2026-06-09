import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import ChainHealNormalizer from '../../normalizers/ChainHealNormalizer';
import TALENTS from 'common/TALENTS/shaman';
import Events, { CastEvent, HealEvent } from 'parser/core/Events';
import {
  healingIncreases,
  ANCESTRAL_REACH_TARGET,
  CHAIN_HEAL_TARGETS,
} from '../../constants';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import WarningIcon from 'interface/icons/Warning';
import CheckmarkIcon from 'interface/icons/Checkmark';
import { formatNumber, formatPercentage } from 'common/format';
import { SpellLink } from 'interface';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';

const debug = false; //Still needed?

export default class AncestralReachAnalyzer extends Analyzer {
  static dependencies = {
    chainHealNormalizer: ChainHealNormalizer,
  };
  protected chainHealNormalizer!: ChainHealNormalizer;

  maxTargets = CHAIN_HEAL_TARGETS + ANCESTRAL_REACH_TARGET;
  healing = 0;
  bonusHealing = 0;
  extraJumps = 0;
  missedJumps = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.ANCESTRAL_REACH_TALENT);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.CHAIN_HEAL_TALENT),
      this.onChainHeal,
    );
  }

  get buffIcon() {return this.missedJumps > 0 ? <WarningIcon /> : <CheckmarkIcon />;}
  get totalHealing() {return this.bonusHealing + this.healing;}

  onChainHeal(event: CastEvent) {
    const orderedChainHeal = this.chainHealNormalizer.normalizeChainHealOrder(event);
    const relevantHits = orderedChainHeal.slice(0, this.maxTargets);

    if (orderedChainHeal.length >= this.maxTargets) {
      const index = this.maxTargets - 1;
      this.tallyHealing(index, [...relevantHits]);
      this.extraJumps += 1;
    } else {

      this.missedJumps += 1;
      this.tallyHealing(-1, relevantHits);
    }
  }

  private tallyHealing(index: number, events: HealEvent[]) {
    if (index > 0) {
      const extraHit = events.splice(index, 1);
      this.healing += extraHit[0]!.amount;
      debug && console.log('Extra Hit: ', extraHit, index);
    }
    this.bonusHealing += events.reduce(
      (amount, event) =>
        amount + calculateEffectiveHealing(event, healingIncreases.ANCESTRAL_REACH_INCREASE),
      0,
    );
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink spell={TALENTS.ANCESTRAL_REACH_TALENT} />}
        value={`${formatPercentage(
          this.owner.getPercentageOfTotalHealingDone(this.totalHealing),
        )} %`}
      />
    );
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(10)}
        size="flexible"
        tooltip={
          <>
            <strong>{formatNumber(this.totalHealing)}</strong> total healing
            <ul>
              <li>
                <strong>{formatNumber(this.healing)}</strong> healing from extra jumps (
                {this.extraJumps})
              </li>
              <li>
                <strong>{formatNumber(this.bonusHealing)}</strong> extra healing from the{' '}
                {formatPercentage(healingIncreases.ANCESTRAL_REACH_INCREASE)}% increase
              </li>
            </ul>
          </>
        }
      >
        <TalentSpellText talent={TALENTS.ANCESTRAL_REACH_TALENT}>
          <ItemHealingDone amount={this.totalHealing} />
          <br />
          {this.buffIcon} {this.missedJumps} <small> missed jumps</small>
        </TalentSpellText>
      </Statistic>
    );
  }
}
