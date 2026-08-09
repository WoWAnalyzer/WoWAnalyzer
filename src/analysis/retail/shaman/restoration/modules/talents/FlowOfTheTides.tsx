import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { BeginCastEvent, CastEvent, HealEvent } from 'parser/core/Events';
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
import TALENTS from 'common/TALENTS/shaman';
import { CHAIN_HEAL_TARGETS, healingIncreases, FLOW_OF_THE_TIDES_TARGET } from '../../constants';
import ChainHealNormalizer from '../../normalizers/ChainHealNormalizer';
import { wasRiptideConsumed } from '../../normalizers/EventLinkNormalizer';
import RiptideTracker from '../core/RiptideTracker';

const debug = false;

export default class FlowOfTheTides extends Analyzer {
  static dependencies = {
    chainHealNormalizer: ChainHealNormalizer,
    riptideTracker: RiptideTracker,
  };

  protected chainHealNormalizer!: ChainHealNormalizer;
  protected riptideTracker!: RiptideTracker;

  maxTargets = CHAIN_HEAL_TARGETS + FLOW_OF_THE_TIDES_TARGET;

  healing = 0;
  bonusHealing = 0;
  extraJumps = 0;
  missedJumps = 0;
  riptideEnd = 0;
  lostRiptides = 0;
  lostRiptideDuration = 0;
  healIncrease = 0;
  chainHealTarget = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.FLOW_OF_THE_TIDES_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.CHAIN_HEAL_TALENT),
      this.onChainHeal,
    );
    this.addEventListener(
      Events.begincast.by(SELECTED_PLAYER).spell(TALENTS.CHAIN_HEAL_TALENT),
      this.tallyLostRiptideDuration,
    );
  }

  get buffIcon() {
    return this.missedJumps > 0 ? <WarningIcon /> : <CheckmarkIcon />;
  }
  get totalHealing() {
    return this.bonusHealing + this.healing;
  }

  onChainHeal(event: CastEvent) {
    const orderedChainHeal = this.chainHealNormalizer.normalizeChainHealOrder(event);
    const relevantHits = orderedChainHeal.slice(0, this.maxTargets);
    const riptideConsumed = wasRiptideConsumed(event);
    const healIncrease = riptideConsumed ? healingIncreases.FLOW_OF_THE_TIDES_INCREASE : 0;

    if (riptideConsumed) {
      if (this.chainHealTarget === event.targetID) {
        this.lostRiptideDuration += this.riptideEnd - event.timestamp;
      }
      this.lostRiptides += 1;
    }

    if (orderedChainHeal.length >= this.maxTargets) {
      this.tallyHealing(this.maxTargets - 1, [...relevantHits], healIncrease);
      this.extraJumps += 1;
    } else {
      this.missedJumps += 1;
      this.tallyHealing(-1, relevantHits, healIncrease);
    }
  }

  private tallyHealing(index: number, events: HealEvent[], healIncrease: number) {
    if (index > 0) {
      const extraHit = events.splice(index, 1);
      this.healing += extraHit[0]!.amount;
      debug && console.log('Extra Hit: ', extraHit, index);
    }
    this.bonusHealing += events.reduce(
      (amount, event) => amount + calculateEffectiveHealing(event, healIncrease),
      0,
    );
  }

  tallyLostRiptideDuration(event: BeginCastEvent) {
    if (!event.castEvent || !event.castEvent.targetIsFriendly || event.isCancelled) {
      return;
    }

    debug && console.log('Begin cast chain heal on: ', event);
    const targetId = event.castEvent.targetID;
    const spellId = TALENTS.RIPTIDE_TALENT.id;
    if (targetId) {
      if (!this.riptideTracker.hots[targetId] || !this.riptideTracker.hots[targetId][spellId]) {
        debug && console.log('Consumed riptide not found');
        return;
      }
      const hot = this.riptideTracker.hots[targetId][spellId];
      debug && console.log('Found riptide', hot);
      this.chainHealTarget = targetId;
      this.riptideEnd = hot.end;
    }
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink spell={TALENTS.FLOW_OF_THE_TIDES_TALENT} />}
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
                {formatPercentage(healingIncreases.FLOW_OF_THE_TIDES_INCREASE)}% increase
              </li>
              <li>
                <strong>{formatNumber(this.lostRiptides)}</strong> riptides consumed
              </li>
              <li>
                <strong>{(this.lostRiptideDuration / 1000).toFixed(2)}</strong> seconds of riptide
                lost
              </li>
            </ul>
          </>
        }
      >
        <TalentSpellText talent={TALENTS.FLOW_OF_THE_TIDES_TALENT}>
          <ItemHealingDone amount={this.totalHealing} />
          {/* oxlint-disable-next-line wowanalyzer/no-br -- Baseline suppression */}
          <br />
          {this.buffIcon} {this.missedJumps} <small> missed jumps</small>
        </TalentSpellText>
      </Statistic>
    );
  }
}
