import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import ChainHealNormalizer from '../../normalizers/ChainHealNormalizer';
import talents from 'common/TALENTS/shaman';
import UnleashLife from './UnleashLife';
import Events, { BeginCastEvent, CastEvent, HealEvent } from 'parser/core/Events';
import {
  CHAIN_HEAL_TARGETS,
  FLOW_OF_THE_TIDES_INCREASE,
  FLOW_OF_THE_TIDES_TARGET,
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
import { wasRiptideConsumed } from '../../normalizers/CastLinkNormalizer';
import RiptideTracker from '../core/RiptideTracker';

const debug = false;

class FlowOfTheTides extends Analyzer {
  static dependencies = {
    chainHealNormalizer: ChainHealNormalizer,
    unleashLife: UnleashLife,
    riptideTracker: RiptideTracker,
  };

  protected chainHealNormalizer!: ChainHealNormalizer;
  protected unleashLife!: UnleashLife;
  protected riptideTracker!: RiptideTracker;

  maxTargets = CHAIN_HEAL_TARGETS + FLOW_OF_THE_TIDES_TARGET;

  currentCastBuffedByUL: boolean = false;
  ulActive: boolean;
  healing: number = 0;
  bonusHealing: number = 0;
  extraJumps: number = 0;
  missedJumps: number = 0;
  chainHealTarget: number = 0;
  riptideEnd: number = 0;
  lostRiptides: number = 0;
  lostRiptideDuration: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(talents.FLOW_OF_THE_TIDES_TALENT);
    this.ulActive = this.selectedCombatant.hasTalent(talents.UNLEASH_LIFE_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(talents.CHAIN_HEAL_TALENT),
      this.onChainHeal,
    );
    this.addEventListener(
      Events.begincast.by(SELECTED_PLAYER).spell(talents.CHAIN_HEAL_TALENT),
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
    if (!wasRiptideConsumed(event)) {
      return;
    }
    if (this.chainHealTarget === event.targetID) {
      this.lostRiptideDuration += this.riptideEnd - event.timestamp;
    }
    this.lostRiptides += 1;
    let expectedTargetCount = this.maxTargets;
    let index = -1;
    if (this.ulActive && this.unleashLife._isBuffedByUnleashLife(event)) {
      this.currentCastBuffedByUL = true;
      expectedTargetCount = this.maxTargets + 1;
      debug && console.log('UL Chain Heal, Expected Targets: ', expectedTargetCount);
    }
    /** to attribute missed jumps to the right source here we look at array length
     * any length below 4 means base missed, FotT missed and UL missed (if buffed)
     * 4 means base good, FotT missed, UL missed (if buffed)
     * 5 means UL missed (if buffed)
     */
    const orderedChainHeal = this.chainHealNormalizer.normalizeChainHealOrder(event);
    if (orderedChainHeal.length === expectedTargetCount) {
      //happy path - all targets hit
      //this handles 6 and 5 targets hit
      index = orderedChainHeal.length - (this.currentCastBuffedByUL ? 2 : 1);
      this.tallyHealing(index, orderedChainHeal);
      this.extraJumps += 1;
      debug && console.log('Everyone hit, totalhealing: ', this.healing);
      debug && console.log('Extra Jumps: ', this.extraJumps);
    } else if (orderedChainHeal.length < expectedTargetCount) {
      //could be 5 or less
      if (orderedChainHeal.length === this.maxTargets) {
        //5 hits but missed ul jump
        debug &&
          console.log('Expected hits: ', expectedTargetCount, 'but only hit ', this.maxTargets);
        this.extraJumps += 1;
        index = orderedChainHeal.length - 1;
        this.tallyHealing(index, orderedChainHeal);
      } else {
        //missed FotT jump
        this.missedJumps += 1;
        index = -1;
        this.tallyHealing(index, orderedChainHeal);
        debug && console.log('Missed Jumps: ', this.missedJumps);
      }
    }
    this.currentCastBuffedByUL = false;
  }

  private tallyHealing(index: number, events: HealEvent[]) {
    if (index > 0) {
      const extraHit = events.splice(index, 1);
      this.healing += extraHit[0]!.amount;
      debug && console.log('Extra Hit: ', extraHit, index);
    }
    this.bonusHealing += events.reduce(
      (amount, event) => amount + calculateEffectiveHealing(event, FLOW_OF_THE_TIDES_INCREASE),
      0,
    );
  }

  tallyLostRiptideDuration(event: BeginCastEvent) {
    if (!event.castEvent) {
      return;
    }
    if (!event.castEvent.targetIsFriendly) {
      return;
    }
    if (event.isCancelled) {
      return;
    }
    debug && console.log('Begin cast chain heal on: ', event);
    const targetId = event.castEvent.targetID;
    const spellId = talents.RIPTIDE_TALENT.id;
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
        title={<SpellLink id={talents.FLOW_OF_THE_TIDES_TALENT.id} />}
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
                {formatPercentage(FLOW_OF_THE_TIDES_INCREASE)}% increase
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
        <TalentSpellText talent={talents.FLOW_OF_THE_TIDES_TALENT}>
          <ItemHealingDone amount={this.totalHealing} />
          <br />
          {this.buffIcon} {this.missedJumps} <small> missed jumps</small>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default FlowOfTheTides;
