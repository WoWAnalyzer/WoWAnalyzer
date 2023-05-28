import { Trans } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import { SpellLink, TooltipElement } from 'interface';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { ApplyBuffEvent, ApplyBuffStackEvent, CastEvent } from 'parser/core/Events';
import CritEffectBonus from 'parser/shared/modules/helpers/CritEffectBonus';
import StatTracker from 'parser/shared/modules/StatTracker';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { CHAIN_HEAL_COEFFICIENT, HIGH_TIDE_COEFFICIENT } from '../../constants';
import { isBuffedByHighTide } from '../../normalizers/CastLinkNormalizer';
import ChainHealNormalizer from '../../normalizers/ChainHealNormalizer';
import WarningIcon from 'interface/icons/Warning';
import CheckmarkIcon from 'interface/icons/Checkmark';

const bounceReduction = 0.7;
const debug = false;
/**
 * High Tide:
 * Every 100000 mana you spend brings a High Tide, making your next 2 Chain Heals heal for an additional 10% and not reduce with each jump.
 */

/**
 * Logs for testing High Tide buff usage:
 * Double stack log:
 * Buff applied pre-pull:
 */

class HighTide extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
    critEffectBonus: CritEffectBonus,
    chainHealNormalizer: ChainHealNormalizer,
  };

  protected chainHealNormalizer!: ChainHealNormalizer;
  protected statTracker!: StatTracker;
  protected critEffectBonus!: CritEffectBonus;

  totalHealing: number = 0;
  activeBuffs: number = 0;
  buffsApplied: number = 0;
  buffsConsumed: number = 0;

  constructor(options: Options) {
    super(options);
    this.active =
      this.selectedCombatant.hasTalent(TALENTS.HIGH_TIDE_TALENT) &&
      this.selectedCombatant.hasTalent(TALENTS.CHAIN_HEAL_TALENT);

    // these are for tracking high tide efficiency
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.CHAIN_HEAL_TALENT),
      this.onChainHealCast,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.HIGH_TIDE_BUFF),
      this.onHighTideBuff,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.HIGH_TIDE_BUFF),
      this.onHighTideBuff,
    );
  }

  get wastedBuffs() {
    return this.buffsApplied - this.buffsConsumed;
  }

  get buffIcon() {
    return this.wastedBuffs > 0 ? <WarningIcon /> : <CheckmarkIcon />;
  }

  onHighTideBuff(event: ApplyBuffEvent | ApplyBuffStackEvent) {
    this.buffsApplied += 2;
  }

  /**
   * The value of the % increase provided by high tide is variable for each jump
   * Jump reduction can be mathed out with an exponentiation operator on the index of the chain heal array
   * Example: The second hit would be the sp coefficient (2.31) times the reduction coefficient (.7)
   * to the power of the second index in the array .7^(1) = .7, so 1.617
   * We divide the sp coefficient when buffed by high tide (2.31 * 1.1 = 2.541) by the jump's coefficient, then
   * subract 1 for the % increase to be passed into calculateEffectiveHealing
   */
  onChainHealCast(event: CastEvent) {
    if (isBuffedByHighTide(event)) {
      debug &&
        console.log('High Tide Chain heal at ', this.owner.formatTimestamp(event.timestamp), event);
      this.buffsConsumed += 1;
      let FACTOR_CONTRIBUTED_BY_HT_HIT;
      const orderedChainHeal = this.chainHealNormalizer.normalizeChainHealOrder(event);
      orderedChainHeal.forEach((heal, idx) => {
        FACTOR_CONTRIBUTED_BY_HT_HIT =
          HIGH_TIDE_COEFFICIENT / (CHAIN_HEAL_COEFFICIENT * bounceReduction ** idx) - 1;
        this.totalHealing += calculateEffectiveHealing(heal, FACTOR_CONTRIBUTED_BY_HT_HIT);
      });
    }
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink id={TALENTS.HIGH_TIDE_TALENT.id} />}
        value={`${formatPercentage(
          this.owner.getPercentageOfTotalHealingDone(this.totalHealing),
        )} %`}
        valueTooltip={
          <Trans id="shaman.restoration.highTide.statistic.tooltip">
            {this.buffsConsumed} High Tide buff stacks used out of {this.buffsApplied}.
          </Trans>
        }
      />
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(5)}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
      >
        <TalentSpellText talent={TALENTS.HIGH_TIDE_TALENT}>
          <ItemHealingDone amount={this.totalHealing} />
          <br />
          <TooltipElement
            content={
              <>
                The number of <SpellLink id={TALENTS.HIGH_TIDE_TALENT} /> buffs that expired without
                casting <SpellLink id={TALENTS.CHAIN_HEAL_TALENT} /> ({this.wastedBuffs} wasted of{' '}
                {this.buffsApplied} total)
              </>
            }
          >
            {this.buffIcon} {this.wastedBuffs}
            <small> wasted buffs</small>
          </TooltipElement>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default HighTide;
